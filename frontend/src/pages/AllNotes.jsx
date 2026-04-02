import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

function formatDate(dateValue) {
  if (!dateValue) return 'Unknown date';
  return new Date(dateValue).toLocaleString();
}

function shortText(text, max = 220) {
  const value = String(text || '');
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}...`;
}

export default function AllNotes() {
  const { token, user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Per-note comment form state
  const [openCommentFor, setOpenCommentFor] = useState(null);
  const [formComment, setFormComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Per-note comments view state
  const [noteCommentsMap, setNoteCommentsMap] = useState({}); // { noteId: Comment[] }
  const [loadingCommentsMap, setLoadingCommentsMap] = useState({}); // { noteId: bool }
  const [viewCommentsFor, setViewCommentsFor] = useState(null); // noteId or null

  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        const [notesRes, ratingsRes, commentsRes] = await Promise.all([
          fetch(apiUrl('/api/notes/all'), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(apiUrl('/api/ratings')),
          fetch(apiUrl('/api/comments')),
        ]);

        const [notesJson, ratingsJson, commentsJson] = await Promise.all([
          notesRes.json(),
          ratingsRes.json(),
          commentsRes.json(),
        ]);

        if (!notesRes.ok) throw new Error(notesJson.message || 'Could not load notes feed');

        if (!cancelled) {
          setNotes(Array.isArray(notesJson.data) ? notesJson.data : []);
          setRatings(Array.isArray(ratingsJson.data) ? ratingsJson.data : []);
          setComments(Array.isArray(commentsJson.data) ? commentsJson.data : []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load all notes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (token) loadAll();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const ratingMap = useMemo(() => {
    const grouped = new Map();

    for (const item of ratings) {
      const key = String(item?.pdfId || '');
      if (!key) continue;
      const rating = Number(item?.rating);
      if (!grouped.has(key)) {
        grouped.set(key, { total: 0, sum: 0 });
      }
      if (Number.isFinite(rating)) {
        const bucket = grouped.get(key);
        bucket.total += 1;
        bucket.sum += rating;
      }
    }

    return grouped;
  }, [ratings]);

  const commentCountMap = useMemo(() => {
    const grouped = new Map();

    for (const item of comments) {
      const key = String(item?.pdfId || '');
      if (!key) continue;
      grouped.set(key, (grouped.get(key) || 0) + 1);
    }

    return grouped;
  }, [comments]);

  const totals = useMemo(() => {
    const authors = new Set();
    for (const note of notes) {
      if (note?.authorName) authors.add(note.authorName);
    }

    let ratingsCount = 0;
    for (const item of ratings) {
      if (Number.isFinite(Number(item?.rating))) ratingsCount += 1;
    }

    return {
      notes: notes.length,
      authors: authors.size,
      ratings: ratingsCount,
      comments: comments.length,
    };
  }, [notes, ratings, comments]);

  // ── comment form helpers ──────────────────────────────────
  function openCommentBox(noteId) {
    setOpenCommentFor(noteId);
    setCommentError('');
    setFormComment('');
  }

  function closeCommentBox() {
    setOpenCommentFor(null);
    setCommentError('');
    setFormComment('');
  }

  async function handleSubmitComment(note) {
    const commentText = formComment.trim();

    if (!commentText) {
      setCommentError('Please write your comment first.');
      return;
    }

    if (!user) {
      setCommentError('You must be logged in to comment.');
      return;
    }

    // Prevent self-commenting
    if (note.authorId && user.id && String(note.authorId) === String(user.id)) {
      setCommentError('You cannot comment on your own note.');
      return;
    }

    setSendingComment(true);
    setCommentError('');

    try {
      const res = await fetch(apiUrl('/api/comments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pdfId: String(note.noteId),
          userId: user.email || user.id || 'unknown',
          userName: user.name || user.email || 'Anonymous',
          comment: commentText,
          pdfTitle: note.title || 'Untitled note',
        }),
      });

      const json = await res.json();

      // Surface harmful-word / validation errors from backend  
      if (!res.ok) {
        throw new Error(json.message || 'Could not send comment');
      }

      const newComment = json.data;
      const nid = String(note.noteId);

      // Add to global comments total (for counter chips)
      setComments((prev) => [newComment, ...prev]);

      // Immediately append to per-note view if already open
      setNoteCommentsMap((prev) => ({
        ...prev,
        [nid]: [newComment, ...(prev[nid] || [])],
      }));

      closeCommentBox();

      // Auto-open comments section so the user sees their new comment
      setViewCommentsFor(nid);
    } catch (e) {
      setCommentError(e.message || 'Unable to send comment right now');
    } finally {
      setSendingComment(false);
    }
  }

  // ── per-note comments view helpers ───────────────────────
  async function loadNoteComments(noteId) {
    setLoadingCommentsMap((prev) => ({ ...prev, [noteId]: true }));
    try {
      const res = await fetch(apiUrl(`/api/comments/pdf/${noteId}`));
      const json = await res.json();
      setNoteCommentsMap((prev) => ({
        ...prev,
        [noteId]: Array.isArray(json.data) ? json.data : [],
      }));
    } catch {
      setNoteCommentsMap((prev) => ({ ...prev, [noteId]: [] }));
    } finally {
      setLoadingCommentsMap((prev) => ({ ...prev, [noteId]: false }));
    }
  }

  function toggleViewComments(noteId) {
    if (viewCommentsFor === noteId) {
      setViewCommentsFor(null);
    } else {
      setViewCommentsFor(noteId);
      // Load if not already fetched
      if (!noteCommentsMap[noteId]) {
        loadNoteComments(noteId);
      }
    }
  }

  // ── edit/delete comment helpers ──────────────────────────
  function startEditComment(comment) {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.comment || '');
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditCommentText('');
  }

  async function saveEditComment(commentId, noteId) {
    const trimmed = editCommentText.trim();
    if (!trimmed) return;

    setEditingComment(true);
    try {
      const res = await fetch(apiUrl(`/api/comments/${commentId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: trimmed }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not update comment');

      // Update local state
      setNoteCommentsMap((prev) => ({
        ...prev,
        [noteId]: (prev[noteId] || []).map((c) =>
          c._id === commentId ? { ...c, comment: trimmed } : c
        ),
      }));

      cancelEditComment();
    } catch (e) {
      alert(e.message || 'Failed to update comment');
    } finally {
      setEditingComment(false);
    }
  }

  async function deleteComment(commentId, noteId) {
    if (!window.confirm('Delete this comment?')) return;

    setDeletingCommentId(commentId);
    try {
      const res = await fetch(apiUrl(`/api/comments/${commentId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not delete comment');

      // Remove from local state
      setNoteCommentsMap((prev) => ({
        ...prev,
        [noteId]: (prev[noteId] || []).filter((c) => c._id !== commentId),
      }));

      // Update global comment count
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (e) {
      alert(e.message || 'Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  }

  return (
    <div className="dashboard all-notes-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Dashboard</Link>
        <span className="breadcrumb__sep">/</span>
        <span className="breadcrumb__current">All notes</span>
      </nav>

      <header className="all-notes-hero">
        <p className="all-notes-hero__eyebrow">Bibliotheque publique</p>
        <h1>All Notes Archive</h1>
        <p className="all-notes-hero__sub">
          Browse notes created by all users. Every card is treated as a shareable PDF item in the community feed.
        </p>

        <div className="all-notes-highlights" aria-label="Archive summary">
          <span className="all-notes-pill">{totals.notes} notes</span>
          <span className="all-notes-pill">{totals.authors} authors</span>
          <span className="all-notes-pill">{totals.ratings} ratings</span>
          <span className="all-notes-pill">{totals.comments} comments</span>
        </div>
      </header>

      <p className="all-notes-rule">
        You must be logged in to post comments.
      </p>

      {loading && <p className="page-loading">Loading archive...</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && notes.length === 0 && (
        <section className="card all-notes-empty">
          <h2>Archive is quiet right now</h2>
          <p>No notes published yet. Be the first to create and share one.</p>
          <Link to="/notes/new" className="btn-primary-link">
            Create note
          </Link>
        </section>
      )}

      {!loading && !error && notes.length > 0 && (
        <section className="all-notes-grid" aria-label="All user notes">
          {notes.map((note) => {
            const id = String(note.noteId);
            const ratingInfo = ratingMap.get(id) || { total: 0, sum: 0 };
            const average = ratingInfo.total > 0 ? (ratingInfo.sum / ratingInfo.total).toFixed(1) : '0.0';
            const commentsCount = commentCountMap.get(id) || 0;

            return (
              <article key={id} className="all-notes-card">
                <div className="all-notes-card__top">
                  <p className="all-notes-card__author">By {note.authorName || 'Unknown user'}</p>
                  <span className="all-notes-card__date">{formatDate(note.createdAt)}</span>
                </div>

                <h2 className="all-notes-card__title">{note.title || 'Untitled note'}</h2>
                <p className="all-notes-card__id">PDF ID: {id}</p>

                <p className="all-notes-card__content">{shortText(note.content)}</p>

                <div className="all-notes-card__meta">
                  <span>{average} / 5 rating</span>
                  <span>{ratingInfo.total} ratings</span>
                  <span>{commentsCount} comments</span>
                </div>

                {/* ── Action row ── */}
                <div className="all-notes-card__actions">
                  <button
                    type="button"
                    className="all-notes-comment-btn"
                    onClick={() => openCommentBox(openCommentFor === id ? null : id)}
                  >
                    {openCommentFor === id ? '✕ Close form' : '+ Add comment'}
                  </button>

                  <button
                    type="button"
                    className="all-notes-view-btn"
                    onClick={() => toggleViewComments(id)}
                  >
                    {viewCommentsFor === id
                      ? '▲ Hide comments'
                      : `▼ View comments (${commentsCount})`}
                  </button>
                </div>

                {/* ── Add comment form ── */}
                {openCommentFor === id && (
                  <div className="all-notes-comment-box" role="region" aria-label="Add comment box">
                    <label htmlFor={`comment-text-${id}`}>Comment</label>
                    <textarea
                      id={`comment-text-${id}`}
                      rows={3}
                      maxLength={1000}
                      value={formComment}
                      placeholder="Write your comment..."
                      onChange={(e) => setFormComment(e.target.value)}
                    />

                    {commentError && (
                      <p className="all-notes-comment-error">{commentError}</p>
                    )}

                    <div className="all-notes-comment-actions">
                      <button
                        type="button"
                        className="all-notes-comment-submit"
                        onClick={() => handleSubmitComment(note)}
                        disabled={sendingComment}
                      >
                        {sendingComment ? 'Sending...' : 'Post comment'}
                      </button>
                      <button
                        type="button"
                        className="all-notes-comment-cancel"
                        onClick={closeCommentBox}
                        disabled={sendingComment}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* ── View comments panel ── */}
                {viewCommentsFor === id && (
                  <div className="all-notes-comments-panel">
                    {loadingCommentsMap[id] && (
                      <p className="all-notes-comments-loading">Loading comments…</p>
                    )}

                    {!loadingCommentsMap[id] &&
                      (noteCommentsMap[id] || []).length === 0 && (
                        <p className="all-notes-comments-empty">No comments yet.</p>
                      )}

                    {!loadingCommentsMap[id] &&
                      (noteCommentsMap[id] || []).length > 0 && (
                        <ul className="all-notes-comments-list">
                          {(noteCommentsMap[id] || []).map((c) => {
                            const isOwner = user && (c.userId === user.email || c.userId === user.id);
                            const isEditing = editingCommentId === c._id;

                            return (
                              <li key={c._id} className="all-notes-comment-item">
                                <div className="all-notes-comment-item__header">
                                  <strong className="all-notes-comment-item__author">
                                    {c.userName}
                                  </strong>
                                  <span className="all-notes-comment-item__date">
                                    {formatDate(c.createdAt)}
                                  </span>
                                </div>

                                {isEditing ? (
                                  <div className="all-notes-comment-edit">
                                    <textarea
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      rows={2}
                                      maxLength={1000}
                                      className="all-notes-comment-edit__textarea"
                                    />
                                    <div className="all-notes-comment-edit__actions">
                                      <button
                                        type="button"
                                        className="all-notes-comment-edit__save"
                                        onClick={() => saveEditComment(c._id, id)}
                                        disabled={editingComment}
                                      >
                                        {editingComment ? 'Saving...' : 'Save'}
                                      </button>
                                      <button
                                        type="button"
                                        className="all-notes-comment-edit__cancel"
                                        onClick={cancelEditComment}
                                        disabled={editingComment}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="all-notes-comment-item__text">{c.comment}</p>
                                    {isOwner && (
                                      <div className="all-notes-comment-item__actions">
                                        <button
                                          type="button"
                                          className="all-notes-comment-item__edit"
                                          onClick={() => startEditComment(c)}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          className="all-notes-comment-item__delete"
                                          onClick={() => deleteComment(c._id, id)}
                                          disabled={deletingCommentId === c._id}
                                        >
                                          {deletingCommentId === c._id ? 'Deleting...' : 'Delete'}
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
