import { useState } from 'react';
import { FileText, Download, File, MessageCircle, Star } from 'lucide-react';
import { formatDate, truncateText, statusBadgeClass } from '../../utils/helpers';
import Button from '../ui/Button';
import CommentSection from './CommentSection';

// Backend origin for serving static uploads
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
    .replace('/api', '');

const NoteCard = ({
    note,
    onApprove,
    onReject,
    showActions = false,
    ratingSummary,
    onRate,
    ratingBusy = false,
    currentUserId,
}) => {
    const { _id, title, subject, semester, year, description, uploadedBy, status, createdAt, fileUrl } = note;
    const [showComments, setShowComments] = useState(false);
    const averageRating = Number(ratingSummary?.averageRating || 0);
    const totalRatings = Number(ratingSummary?.totalRatings || 0);
    const userRating = Number(ratingSummary?.userRating || 0);
    const uploaderId = uploadedBy?._id || uploadedBy;
    const isOwnNote = Boolean(currentUserId && String(uploaderId || '') === String(currentUserId || ''));
    const hasRated = userRating > 0;

    return (
        <div className="note-card card-hover">
            <div className="note-card-header">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div
                        style={{
                            width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                            background: 'rgba(108, 99, 255, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <FileText size={18} color="var(--primary-light)" />
                    </div>
                    <div>
                        <div className="note-card-title">{title}</div>
                        <div className="note-card-meta" style={{ marginTop: '0.375rem' }}>
                            {subject && <span className="note-card-tag">{subject}</span>}
                            {semester && <span className="note-card-tag">Sem {semester}</span>}
                            {year && <span className="note-card-tag">Year {year}</span>}
                        </div>
                    </div>
                </div>
                <span className={`badge badge-${statusBadgeClass(status) === 'badge-success' ? 'success' : statusBadgeClass(status) === 'badge-warning' ? 'warning' : statusBadgeClass(status) === 'badge-danger' ? 'danger' : 'default'}`}>
                    {status}
                </span>
            </div>

            {description && (
                <p className="note-card-desc">{truncateText(description, 120)}</p>
            )}

            <div className="note-rating-block">
                <div className="note-rating-summary">
                    <span className="note-rating-average">{averageRating.toFixed(1)}</span>
                    <div className="note-rating-stars-readonly" aria-label={`Average rating ${averageRating.toFixed(1)} out of 5`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={14}
                                className={`note-star ${star <= Math.round(averageRating) ? 'filled' : ''}`}
                            />
                        ))}
                    </div>
                    <span className="note-rating-count">{totalRatings} ratings</span>
                </div>

                <div className="note-rating-actions">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            className={`note-rate-btn ${value <= userRating ? 'active' : ''}`}
                            onClick={() => onRate && onRate(_id, value)}
                            disabled={!onRate || ratingBusy}
                            title={`Rate ${value} star${value > 1 ? 's' : ''}`}
                        >
                            <Star size={14} />
                        </button>
                    ))}
                </div>
                <div className="note-rating-actions-row">
                    {isOwnNote && hasRated && (
                        <span className="note-rating-owner-hint">You rated your own note</span>
                    )}
                    {hasRated && (
                        <button
                            type="button"
                            className="note-unrate-btn"
                            onClick={() => {
                                if (window.confirm('Remove your rating?')) {
                                    onRate && onRate(_id, 0);
                                }
                            }}
                            disabled={ratingBusy}
                            title="Remove your rating"
                        >
                            ✕ Unrate
                        </button>
                    )}
                </div>
            </div>

            {/* File attachment */}
            {fileUrl && (
                <div style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <File size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attachment</span>
                    <a
                        href={`${API_ORIGIN}${fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        style={{
                            marginLeft: 'auto',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: 'var(--primary-light)',
                            textDecoration: 'none',
                            padding: '0.25rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--primary)',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(108,99,255,0.12)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <Download size={13} /> View / Download
                    </a>
                </div>
            )}

            <div className="note-card-footer">
                <div className="note-card-author">
                    <div
                        style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', fontWeight: 700, color: '#fff',
                        }}
                    >
                        {uploadedBy?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span>{uploadedBy?.name || 'Unknown'} · {formatDate(createdAt)}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                        className={`comment-toggle-btn ${showComments ? 'active' : ''}`}
                        onClick={() => setShowComments((prev) => !prev)}
                        title="Comments"
                    >
                        <MessageCircle size={15} />
                        <span>Comments</span>
                    </button>

                    {showActions && (
                        <>
                            {onApprove && (
                                <Button variant="success" size="sm" onClick={() => onApprove(note._id)}>Approve</Button>
                            )}
                            {onReject && (
                                <Button variant="danger" size="sm" onClick={() => onReject(note._id)}>Reject</Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {showComments && (
                <CommentSection noteId={_id} noteTitle={title} />
            )}
        </div>
    );
};

export default NoteCard;
