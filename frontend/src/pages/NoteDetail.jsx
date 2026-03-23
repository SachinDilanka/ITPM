import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export default function NoteDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(apiUrl(`/api/notes/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Note not found');
        if (!cancelled) setNote(json.data);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load note');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token && id) load();
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  async function handleDelete() {
    if (!window.confirm('Delete this note permanently? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(apiUrl(`/api/notes/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not delete');
      navigate('/notes', { replace: true });
    } catch (e) {
      alert(e.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <p>Loading note…</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="dashboard">
        <p className="auth-error">{error || 'Note not found'}</p>
        <Link to="/notes">← Back to my notes</Link>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Dashboard</Link>
        <span className="breadcrumb__sep">/</span>
        <Link to="/notes">My notes</Link>
        <span className="breadcrumb__sep">/</span>
        <span className="breadcrumb__current">View</span>
      </nav>

      <article className="card note-detail">
        <h1 className="note-detail__title">{note.title}</h1>

        <p className="note-detail__id">
          <strong>Note ID</strong> <code>{String(note.noteId)}</code>
          <span className="note-detail__id-hint"> — use this for AI summary &amp; exam questions</span>
        </p>
        <div className="note-detail__body">{note.content}</div>

        <div className="note-detail__action-bar" role="group" aria-label="Note actions">
          <Link to={`/notes/${id}/edit`} className="btn-note btn-note--edit">
            Edit note
          </Link>
          <button
            type="button"
            className="btn-note btn-note--delete"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete note'}
          </button>
        </div>

        <div className="note-detail__footer">
          <Link to="/notes">← All notes</Link>
          <Link to="/notes/new">Create another</Link>
        </div>
      </article>
    </div>
  );
}
