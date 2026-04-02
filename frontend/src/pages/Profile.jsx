import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl, assetUrl } from '../config/api';

export default function Profile() {
  const { user, token, logout, loadUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadNotes() {
      if (!token) {
        setNotesLoading(false);
        return;
      }
      try {
        const res = await fetch(apiUrl('/api/notes'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        if (!cancelled) setNotes(json.data || []);
      } catch {
        if (!cancelled) setNotes([]);
      } finally {
        if (!cancelled) setNotesLoading(false);
      }
    }
    loadNotes();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleDeleteNote(noteId, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this note permanently?')) return;
    setDeletingNoteId(noteId);
    try {
      const res = await fetch(apiUrl(`/api/notes/${noteId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not delete');
      setNotes((prev) => prev.filter((n) => String(n.noteId) !== String(noteId)));
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setDeletingNoteId(null);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch(apiUrl('/api/auth/avatar'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');
      await loadUser();
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  const avatarSrc = assetUrl(user?.profilePicture);
  const initials = (user?.name || user?.email || '?')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="dashboard">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Dashboard</Link>
        <span className="breadcrumb__sep" aria-hidden>
          /
        </span>
        <span className="breadcrumb__current">Profile</span>
      </nav>

      <h1>Your profile</h1>

      <section className="card profile-card">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            {avatarSrc ? (
              <img className="profile-avatar" src={avatarSrc} alt="" />
            ) : (
              <div className="profile-avatar profile-avatar--placeholder" aria-hidden>
                {initials}
              </div>
            )}
          </div>
          <div className="profile-meta">
            <p className="profile-name">{user?.name}</p>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-status">
              Status: <span className="profile-badge">Student</span>
            </p>
          </div>
        </div>

        <div className="profile-upload">
          <label className="profile-upload-label">
            {uploading ? 'Uploading…' : 'Change profile picture'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </label>
          <p className="profile-upload-hint">JPEG, PNG, GIF, or WebP — max 2 MB</p>
          {uploadError && <p className="auth-error">{uploadError}</p>}
        </div>

        <ul className="card__list profile-list">
          <li>
            <strong>Name</strong> {user?.name}
          </li>
          <li>
            <strong>Email</strong> {user?.email}
          </li>
          <li>
            <strong>Account type</strong>{' '}
            <span className="profile-role">{user?.role === 'student' ? 'Student' : user?.role}</span>
          </li>
        </ul>

        <p className="profile-footer-links">
          <Link to="/">← Back to dashboard</Link>
        </p>

        <button type="button" className="btn-logout" onClick={logout}>
          Log out
        </button>
      </section>

      <section className="card profile-notes-card">
        <div className="profile-notes-header">
          <h2>Your notes</h2>
          <div className="profile-notes-header__links">
            <Link to="/notes/new" className="btn-create-note">
              + Create note
            </Link>
            <Link to="/notes" className="link-muted">
              All notes
            </Link>
          </div>
        </div>
        {notesLoading && <p className="profile-notes-loading">Loading notes…</p>}
        {!notesLoading && notes.length === 0 && (
          <p className="profile-notes-empty">No notes yet. Create one to get a unique note ID for AI tools.</p>
        )}
        {!notesLoading && notes.length > 0 && (
          <ul className="notes-list notes-list--compact">
            {notes.slice(0, 5).map((n) => {
              const nid = String(n.noteId);
              return (
                <li key={nid} className="notes-list__item notes-list__item--stacked">
                  <Link to={`/notes/${nid}`} className="notes-list__link">
                    <span className="notes-list__title">{n.title}</span>
                    <code className="notes-list__id">{nid}</code>
                  </Link>
                  <div className="notes-list__action-bar" role="group" aria-label="Note actions">
                    <Link
                      to={`/notes/${nid}/edit`}
                      className="btn-note btn-note--edit btn-note--compact"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn-note btn-note--delete btn-note--compact"
                      disabled={deletingNoteId === nid}
                      onClick={(e) => handleDeleteNote(nid, e)}
                    >
                      {deletingNoteId === nid ? '…' : 'Delete'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {!notesLoading && notes.length > 5 && (
          <p className="profile-notes-more">
            <Link to="/notes">Show all {notes.length} notes</Link>
          </p>
        )}
      </section>
    </div>
  );
}
