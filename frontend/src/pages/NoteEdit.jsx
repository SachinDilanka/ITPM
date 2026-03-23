import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export default function NoteEdit() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(apiUrl(`/api/notes/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Note not found');
        if (!cancelled) {
          setTitle(json.data.title);
          setContent(json.data.content);
        }
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl(`/api/notes/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not update note');
      navigate(`/notes/${id}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not update note');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <p>Loading note…</p>
      </div>
    );
  }

  if (error && !title && !content) {
    return (
      <div className="dashboard">
        <p className="auth-error">{error}</p>
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
        <Link to={`/notes/${id}`}>Note</Link>
        <span className="breadcrumb__sep">/</span>
        <span className="breadcrumb__current">Edit</span>
      </nav>

      <h1>Edit note</h1>
      <p className="dashboard__hint">
        Note ID stays the same after you save: <code>{String(id)}</code>
      </p>

      <section className="card note-editor-card">
        <form onSubmit={handleSubmit} className="note-form">
          {error && <p className="auth-error">{error}</p>}

          <label htmlFor="edit-note-title">Title</label>
          <input
            id="edit-note-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
          />

          <label htmlFor="edit-note-content">Note</label>
          <textarea
            id="edit-note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
            className="note-textarea"
          />

          <div className="note-form__actions">
            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(`/notes/${id}`)}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
