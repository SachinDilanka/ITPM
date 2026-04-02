import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Edit2, X, Check, MessageCircle } from 'lucide-react';
import { getCommentsByPdfId, createCommentApi, updateCommentApi, deleteCommentApi } from '../../api/commentsApi';
import useAuth from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';

const MAX_COMMENT_LENGTH = 1000;

const validateComment = (text) => {
    if (!text || text.trim() === '') return 'Comment cannot be empty';
    if (text.trim().length < 2) return 'Comment must be at least 2 characters';
    if (text.trim().length > MAX_COMMENT_LENGTH) return `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`;
    return null;
};

const CommentSection = ({ noteId, noteTitle }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editValidationError, setEditValidationError] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!noteId) return;
        let cancelled = false;
        setLoading(true);
        getCommentsByPdfId(noteId)
            .then((res) => {
                if (!cancelled) setComments(res.data?.data || []);
            })
            .catch(() => {
                if (!cancelled) setError('Failed to load comments');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [noteId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validateComment(newComment);
        if (err) {
            setValidationError(err);
            return;
        }
        setValidationError(null);
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                pdfId: noteId,
                userId: user._id,
                userName: user.name,
                comment: newComment.trim(),
                pdfTitle: noteTitle,
            };
            const res = await createCommentApi(payload);
            setComments((prev) => [res.data.data, ...prev]);
            setNewComment('');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to post comment';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await deleteCommentApi(id);
            setComments((prev) => prev.filter((c) => c._id !== id));
        } catch {
            setError('Failed to delete comment');
        }
    };

    const startEdit = (comment) => {
        setEditingId(comment._id);
        setEditText(comment.originalComment || comment.comment);
        setEditValidationError(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
        setEditValidationError(null);
    };

    const handleUpdate = async (id) => {
        const err = validateComment(editText);
        if (err) {
            setEditValidationError(err);
            return;
        }
        setEditValidationError(null);
        try {
            const res = await updateCommentApi(id, { comment: editText.trim() });
            setComments((prev) => prev.map((c) => (c._id === id ? res.data.data : c)));
            cancelEdit();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to update comment';
            setError(msg);
        }
    };

    const handleInputChange = (e) => {
        setNewComment(e.target.value);
        if (validationError) setValidationError(null);
    };

    const handleEditChange = (e) => {
        setEditText(e.target.value);
        if (editValidationError) setEditValidationError(null);
    };

    return (
        <div className="comment-section">
            <div className="comment-section-header">
                <MessageCircle size={16} />
                <span>Comments ({comments.length})</span>
            </div>

            {/* New comment form */}
            {user && (
                <form className="comment-form" onSubmit={handleSubmit}>
                    <div className="comment-input-wrapper">
                        <input
                            ref={inputRef}
                            type="text"
                            className={`comment-input ${validationError ? 'comment-input-error' : ''}`}
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={handleInputChange}
                            maxLength={MAX_COMMENT_LENGTH}
                            disabled={submitting}
                        />
                        <button
                            type="submit"
                            className="comment-send-btn"
                            disabled={submitting || !newComment.trim()}
                            title="Post comment"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    {validationError && <span className="comment-validation-error">{validationError}</span>}
                    {newComment.length > 0 && (
                        <span className="comment-char-count">
                            {newComment.length}/{MAX_COMMENT_LENGTH}
                        </span>
                    )}
                </form>
            )}

            {error && <div className="comment-error">{error}</div>}

            {/* Comments list */}
            {loading ? (
                <p className="comment-loading">Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="comment-empty">No comments yet. Be the first to comment!</p>
            ) : (
                <div className="comment-list">
                    {comments.map((c) => (
                        <div key={c._id} className="comment-item">
                            <div className="comment-item-header">
                                <div className="comment-avatar">
                                    {c.userName?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="comment-meta">
                                    <span className="comment-author">{c.userName}</span>
                                    <span className="comment-date">{formatDate(c.createdAt)}</span>
                                </div>
                                {user && user._id === c.userId && (
                                    <div className="comment-actions">
                                        {editingId !== c._id && (
                                            <>
                                                <button onClick={() => startEdit(c)} className="comment-action-btn" title="Edit">
                                                    <Edit2 size={13} />
                                                </button>
                                                <button onClick={() => handleDelete(c._id)} className="comment-action-btn comment-action-delete" title="Delete">
                                                    <Trash2 size={13} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {editingId === c._id ? (
                                <div className="comment-edit-wrapper">
                                    <input
                                        type="text"
                                        className={`comment-input ${editValidationError ? 'comment-input-error' : ''}`}
                                        value={editText}
                                        onChange={handleEditChange}
                                        maxLength={MAX_COMMENT_LENGTH}
                                        autoFocus
                                    />
                                    {editValidationError && <span className="comment-validation-error">{editValidationError}</span>}
                                    <div className="comment-edit-actions">
                                        <button onClick={() => handleUpdate(c._id)} className="comment-action-btn comment-action-save" title="Save">
                                            <Check size={14} />
                                        </button>
                                        <button onClick={cancelEdit} className="comment-action-btn" title="Cancel">
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="comment-text">{c.comment}</p>
                                    {c.originalComment && c.originalComment !== c.comment && (
                                        <p className="comment-text-original">{c.originalComment}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
