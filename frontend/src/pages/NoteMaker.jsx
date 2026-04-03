import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export default function NoteMaker() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl('/api/notes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not save note');
      setSaved(json.data);
    } catch (err) {
      setError(err.message || 'Could not save note');
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    const id = saved.noteId;
    return (
      <div className="dashboard">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Dashboard</Link>
          <span className="breadcrumb__sep">/</span>
          <Link to="/notes">My notes</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Saved</span>
        </nav>

        <section className="card note-success">
          <h1>Note saved</h1>
          <p>Your note is stored on your profile. Use this ID when you connect AI features (summaries, exam questions):</p>
          <p className="note-id-box">
            <code>{String(id)}</code>
          </p>
          <div className="note-success__actions">
            <Link to={`/notes/${id}`} className="btn-primary-link">
              Open note
            </Link>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSaved(null);
                setTitle('');
                setContent('');
              }}
            >
              Write another note
            </button>
            <Link to="/profile" className="link-muted">
              Back to profile
            </Link>
          </div>
        </section>
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
        <span className="breadcrumb__current">New note</span>
      </nav>

      <h1>Create a note</h1>
      <p className="dashboard__hint">
        Write a short note below. It will be saved to your account with a <strong>unique note ID</strong> for future
        AI tools (summary &amp; exam questions).
      </p>

      <section className="card note-editor-card">
        <form onSubmit={handleSubmit} className="note-form">
          {error && <p className="auth-error">{error}</p>}

          <label htmlFor="note-title">Title</label>
          <input
            id="note-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week 3 — Data structures"
            required
            maxLength={200}
          />

          <label htmlFor="note-content">Note</label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your notes here…"
            required
            rows={12}
            className="note-textarea"
          />

          <div className="note-form__actions">
            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save to my profile'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/notes')}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
