import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export default function MyNotes() {
  const { token, user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({}); // {noteId: [comments]}
  const [commentsLoadingMap, setCommentsLoadingMap] = useState({}); // {noteId: true/false}
  const [newCommentMap, setNewCommentMap] = useState({}); // {noteId: comment text}
  const [postingCommentMap, setPostingCommentMap] = useState({}); // {noteId: true/false}

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

  // Load comments for a specific note
  async function loadCommentsForNote(noteId) {
    try {
      setCommentsLoadingMap((prev) => ({ ...prev, [noteId]: true }));
      const res = await fetch(apiUrl(`/api/comments/pdf/${noteId}`));
      const json = await res.json();
      if (!res.ok) throw new Error('Failed to load comments');
      setCommentsMap((prev) => ({ ...prev, [noteId]: json.data || [] }));
    } catch (err) {
      console.error(err);
      setCommentsMap((prev) => ({ ...prev, [noteId]: [] }));
    } finally {
      setCommentsLoadingMap((prev) => ({ ...prev, [noteId]: false }));
    }
  }

  // Toggle comments section for a note
  function toggleComments(noteId) {
    if (commentsMap[noteId] !== undefined) {
      // Already loaded, toggle visibility by clearing
      setCommentsMap((prev) => {
        const next = { ...prev };
        delete next[noteId];
        return next;
      });
    } else {
      // Load comments
      loadCommentsForNote(noteId);
    }
  }

  async function handleAddComment(noteId, noteTitle, e) {
    e.preventDefault();
    const commentText = newCommentMap[noteId] || '';
    if (!commentText.trim()) return;

    try {
      setPostingCommentMap((prev) => ({ ...prev, [noteId]: true }));
      const payload = {
        pdfId: noteId,
        userId: user?.id || 'anonymous',
        userName: user?.name || 'Anonymous',
        comment: commentText.trim(),
        pdfTitle: noteTitle || 'Untitled',
      };
      const res = await fetch(apiUrl('/api/comments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not add comment');
      
      // Update comments map with new comment
      setCommentsMap((prev) => ({
        ...prev,
        [noteId]: [json.data, ...(prev[noteId] || [])],
      }));
      
      // Clear input
      setNewCommentMap((prev) => ({ ...prev, [noteId]: '' }));
    } catch (err) {
      alert(err.message || 'Unable to add comment');
    } finally {
      setPostingCommentMap((prev) => ({ ...prev, [noteId]: false }));
    }
  }

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
      setCommentsMap((prev) => {
        const next = { ...prev };
        delete next[noteId];
        return next;
      });
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
        Each note has a unique ID for AI features. Click on comments to see and add feedback on your notes.
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
        <div className="notes-feed">
          {notes.map((n) => {
            const nid = String(n.noteId);
            const isCommentsOpen = commentsMap[nid] !== undefined;
            const noteComments = commentsMap[nid] || [];
            const isLoadingComments = commentsLoadingMap[nid];

            return (
              <article key={nid} className="note-card">
                <div className="note-card__header">
                  <h2 className="note-card__title">{n.title}</h2>
                  <span className="note-card__id">ID: {nid}</span>
                </div>

                <p className="note-card__date">
                  {new Date(n.createdAt).toLocaleString()}
                </p>

                <div className="note-card__content">
                  {n.content}
                </div>

                <div className="note-card__actions">
                  <Link to={`/notes/${nid}`} className="btn-link">
                    View full
                  </Link>
                  <Link to={`/notes/${nid}/edit`} className="btn-note btn-note--edit btn-note--compact">
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
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => toggleComments(nid)}
                  >
                    {isCommentsOpen ? '▼ Hide comments' : '▶ Show comments'}
                  </button>
                </div>

                {isCommentsOpen && (
                  <div className="note-card__comments">
                    {user ? (
                      <form
                        onSubmit={(e) => handleAddComment(nid, n.title, e)}
                        className="comment-form comment-form--inline"
                      >
                        <textarea
                          value={newCommentMap[nid] || ''}
                          onChange={(e) =>
                            setNewCommentMap((prev) => ({
                              ...prev,
                              [nid]: e.target.value,
                            }))
                          }
                          placeholder="Add a comment…"
                          rows={2}
                          className="comment-textarea"
                          maxLength={1000}
                        />
                        <div className="comment-form__actions">
                          <button
                            type="submit"
                            className="auth-submit auth-submit--small"
                            disabled={
                              postingCommentMap[nid] ||
                              !((newCommentMap[nid] || '').trim())
                            }
                          >
                            {postingCommentMap[nid] ? 'Posting…' : 'Post'}
                          </button>
                          <span className="comment-char-count">
                            {(newCommentMap[nid] || '').length}/1000
                          </span>
                        </div>
                      </form>
                    ) : (
                      <p className="auth-hint">
                        <Link to="/login">Log in</Link> to add comments.
                      </p>
                    )}

                    {isLoadingComments && <p className="page-loading">Loading comments…</p>}

                    {!isLoadingComments && noteComments.length === 0 && (
                      <p className="comment-empty">No comments yet.</p>
                    )}

                    {!isLoadingComments && noteComments.length > 0 && (
                      <ul className="comments-list">
                        {noteComments.map((c) => (
                          <li key={c._id} className="comment-item">
                            <div className="comment-header">
                              <strong className="comment-author">{c.userName}</strong>
                              <span className="comment-date">
                                {new Date(c.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="comment-text">{c.comment}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
