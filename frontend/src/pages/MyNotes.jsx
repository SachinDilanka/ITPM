import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export default function MyNotes() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadNotes = useCallback(async () => {
    const res = await fetch(apiUrl('/api/notes'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load notes');
    setNotes(json.data || []);
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        await loadNotes();
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load notes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token) init();
    return () => {
      cancelled = true;
    };
  }, [token, loadNotes]);

  async function handleDelete(noteId, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this note permanently?')) return;
    setDeletingId(noteId);
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
      setDeletingId(null);
    }
  }

  return (
    <div className="dashboard">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Dashboard</Link>
        <span className="breadcrumb__sep">/</span>
        <span className="breadcrumb__current">My notes</span>
      </nav>

      <div className="notes-page-header">
        <h1>My notes</h1>
        <Link to="/notes/new" className="btn-create-note">
          + Create note
        </Link>
      </div>

      <p className="dashboard__hint">
        Each note has a unique ID for AI features. Edit or delete from here or from the note page.
      </p>

      {loading && <p className="page-loading">Loading notes…</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && notes.length === 0 && (
        <section className="card">
          <p>You don&apos;t have any notes yet.</p>
          <Link to="/notes/new" className="btn-primary-link">
            Create your first note
          </Link>
        </section>
      )}

      {!loading && notes.length > 0 && (
        <ul className="notes-list">
          {notes.map((n) => {
            const nid = String(n.noteId);
            return (
              <li key={nid} className="notes-list__item notes-list__item--stacked">
                <Link to={`/notes/${nid}`} className="notes-list__link">
                  <span className="notes-list__title">{n.title}</span>
                  <span className="notes-list__meta">
                    <code className="notes-list__id">{nid}</code>
                    <span className="notes-list__date">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </span>
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
                    disabled={deletingId === nid}
                    onClick={(e) => handleDelete(nid, e)}
                  >
                    {deletingId === nid ? '…' : 'Delete'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
