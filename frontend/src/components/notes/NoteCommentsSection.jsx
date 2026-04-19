import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import {
    getCommentsByNoteIdApi,
    createNoteCommentApi,
    deleteNoteCommentApi,
} from '../../api/commentsApi';
import Button from '../ui/Button';
import { formatDate, getUserMongoId, idsEqual } from '../../utils/helpers';

const MAX_LEN = 1000;

/**
 * Discussion thread for a note (backend: pdfId = note Mongo _id).
 */
const NoteCommentsSection = ({ noteId, noteTitle, user, isAdminView = false }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [draft, setDraft] = useState('');
    const [error, setError] = useState(null);

    const loadComments = useCallback(async () => {
        if (!noteId) return;
        setLoading(true);
        setError(null);
        try {
            const { data: body } = await getCommentsByNoteIdApi(noteId);
            setComments(Array.isArray(body?.data) ? body.data : []);
        } catch (e) {
            setComments([]);
            setError(e.response?.data?.message || e.message || 'Could not load comments.');
        } finally {
            setLoading(false);
        }
    }, [noteId]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const uid = getUserMongoId(user);
    const displayName = user?.name?.trim() || 'Student';

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text || !noteId || !uid) return;
        setSubmitting(true);
        setError(null);
        try {
            const { data: body } = await createNoteCommentApi({
                pdfId: String(noteId),
                userId: String(uid),
                userName: displayName,
                comment: text.slice(0, MAX_LEN),
                pdfTitle: noteTitle || 'Note',
            });
            const created = body?.data;
            if (created) setComments((prev) => [created, ...prev]);
            setDraft('');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Could not post comment.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (comment) => {
        if (!comment?._id) return;
        const canDelete =
            isAdminView ||
            user?.role === 'admin' ||
            idsEqual(String(comment.userId), String(uid));
        if (!canDelete) return;
        if (!window.confirm('Remove this comment?')) return;
        setDeletingId(comment._id);
        setError(null);
        try {
            await deleteNoteCommentApi(comment._id);
            setComments((prev) => prev.filter((c) => c._id !== comment._id));
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Could not delete comment.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <MessageCircle size={22} color="var(--primary-light)" />
                <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Comments</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {loading ? '…' : `${comments.length}`}
                </span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Discuss this note with other students. Be respectful — comments are checked for inappropriate content.
            </p>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {user && uid ? (
                <form onSubmit={handleSubmit} style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" htmlFor="note-comment-input">
                        Add a comment
                    </label>
                    <textarea
                        id="note-comment-input"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value.slice(0, MAX_LEN))}
                        placeholder="Share feedback or ask a question about this note…"
                        rows={3}
                        style={{
                            width: '100%',
                            resize: 'vertical',
                            padding: '0.75rem 0.875rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            outline: 'none',
                            marginBottom: '0.5rem',
                        }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {draft.length}/{MAX_LEN}
                        </span>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={submitting}
                            disabled={!draft.trim()}
                        >
                            <Send size={14} style={{ marginRight: 6 }} />
                            Post comment
                        </Button>
                    </div>
                </form>
            ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                        Log in
                    </Link>{' '}
                    to add a comment.
                </p>
            )}

            {loading ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading comments…</p>
            ) : comments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No comments yet. Start the thread above.</p>
            ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {comments.map((c) => {
                        const canDelete =
                            isAdminView ||
                            user?.role === 'admin' ||
                            (uid && idsEqual(String(c.userId), String(uid)));
                        return (
                            <li
                                key={c._id}
                                style={{
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-surface)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                            {c.userName || 'User'}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                            {c.createdAt ? formatDate(c.createdAt) : ''}
                                        </div>
                                    </div>
                                    {canDelete && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(c)}
                                            disabled={deletingId === c._id}
                                            title="Delete comment"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: deletingId === c._id ? 'wait' : 'pointer',
                                                color: 'var(--danger)',
                                                padding: '0.25rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <p
                                    style={{
                                        margin: '0.65rem 0 0',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.875rem',
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {c.comment}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default NoteCommentsSection;
