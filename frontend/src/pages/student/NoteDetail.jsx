import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FileText, Download, BookOpen, Sparkles, Flag, Star } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getPublicNoteByIdApi, postNoteAiStudyGuideApi, reportNoteApi } from '../../api/notesApi';
import { getAdminNoteByIdApi } from '../../api/adminApi';
import Spinner from '../../components/ui/Spinner';
import { getMediaUrl, formatDate, statusBadgeClass, getUserMongoId, idsEqual, getNoteUploaderId } from '../../utils/helpers';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import NoteCommentsSection from '../../components/notes/NoteCommentsSection';
import { useNoteRatings } from '../../hooks/useNoteRatings';

const noteStatusLabel = (status) => {
    const s = status?.toLowerCase?.();
    if (s === 'pending') return 'Pending Approval';
    if (s === 'approved') return 'Approved';
    if (s === 'rejected') return 'Rejected';
    return status || 'Unknown';
};

const NoteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const isAdminView = location.pathname.startsWith('/admin/notes/');

    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiResult, setAiResult] = useState(null);

    const [reportOpen, setReportOpen] = useState(false);
    const [reportComment, setReportComment] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);
    const [reportSent, setReportSent] = useState(false);

    const [ratingNote, setRatingNote] = useState(null);
    const { ratingsByNoteId, handleRateNote, ratingLoadingNoteId } = useNoteRatings(ratingNote ? [ratingNote] : []);

    const fetchFn = useMemo(
        () => () => (isAdminView ? getAdminNoteByIdApi(id) : getPublicNoteByIdApi(id)),
        [id, isAdminView]
    );
    const { data, loading, error, execute } = useFetch(fetchFn, false);

    useEffect(() => {
        if (id) execute();
    }, [id, isAdminView, execute]);

    const note = data?.note || data || null;

    useEffect(() => {
        if (note?._id && !isAdminView) {
            setRatingNote(note);
        }
    }, [note?._id, isAdminView]);

    if (loading) {
        return <Spinner message="Loading note..." overlay={false} />;
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="alert alert-error">{error}</div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="page-container">
                <div className="alert alert-info">
                    <BookOpen size={18} /> Note not found
                </div>
            </div>
        );
    }

    const isApproved = note.status === 'approved';
    const isOwnNote = Boolean(user && idsEqual(getUserMongoId(user), getNoteUploaderId(note)));
    const canReportNote = !isAdminView && isApproved && user && !isOwnNote;

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        const text = reportComment.trim();
        if (text.length < 3) {
            setReportError('Please write at least a few words so admins understand the issue.');
            return;
        }
        setReportLoading(true);
        setReportError(null);
        try {
            await reportNoteApi(note._id, { comment: text.slice(0, 2000) });
            setReportSent(true);
            setReportOpen(false);
            setReportComment('');
        } catch (err) {
            setReportError(err.response?.data?.message || err.message || 'Could not submit report.');
        } finally {
            setReportLoading(false);
        }
    };

    const handleAiStudyGuide = async () => {
        if (!note?._id || !isApproved) return;
        setAiLoading(true);
        setAiError(null);
        setAiResult(null);
        try {
            const { data } = await postNoteAiStudyGuideApi(note._id);
            setAiResult(data || null);
        } catch (err) {
            setAiError(err.response?.data?.message || err.message || 'Could not generate study guide.');
        } finally {
            setAiLoading(false);
        }
    };

    const backToManageHref =
        note.status === 'approved'
            ? '/admin/notes?status=approved'
            : note.status === 'pending'
              ? '/admin/notes?status=pending'
              : note.status === 'rejected'
                ? '/admin/notes?status=rejected'
                : '/admin/notes';

    return (
        <div className="page-container" style={{ maxWidth: 820 }}>
            <div className="page-header">
                {isAdminView && (
                    <div style={{ marginBottom: '1rem' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(backToManageHref)}
                        >
                            ← Back to Manage Notes
                        </button>
                    </div>
                )}
                <h1>{note.title}</h1>
                <p>{isAdminView ? 'Review note content and attachment (moderation)' : 'Your uploaded note details'}</p>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <FileText size={18} color="var(--primary-light)" />
                            <div style={{ fontWeight: 700 }}>Note Info</div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {note.subject && <span className="note-card-tag">{note.subject}</span>}
                            {note.semester != null && <span className="note-card-tag">Sem {note.semester}</span>}
                            {note.year != null && <span className="note-card-tag">Year {note.year}</span>}
                        </div>
                    </div>

                    <span className={`badge ${statusBadgeClass(note.status)}`}>
                        {noteStatusLabel(note.status)}
                    </span>
                </div>

                {user &&
                    idsEqual(getUserMongoId(user), getNoteUploaderId(note)) &&
                    (note.status === 'pending' || note.status === 'approved') && (
                    <div style={{ marginTop: '1rem' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(`/student/notes/${note._id}/edit`)}
                        >
                            Edit Note
                        </button>
                    </div>
                )}

                {canReportNote && (
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {reportSent ? (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                You’ve reported this note. Thanks — an admin will review it.
                            </span>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-ghost"
                                style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.35)' }}
                                onClick={() => {
                                    setReportError(null);
                                    setReportOpen(true);
                                }}
                            >
                                <Flag size={16} style={{ marginRight: 6 }} />
                                Report note
                            </button>
                        )}
                    </div>
                )}

                {note.description && (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
                             dangerouslySetInnerHTML={{ __html: note.description }} />
                    </div>
                )}

                {note.fileUrl && (
                    <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <Download size={18} />
                        <a
                            href={getMediaUrl(note.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'var(--primary-light)',
                                fontWeight: 700,
                                textDecoration: 'none',
                                border: '1px solid var(--primary)',
                                padding: '0.5rem 0.85rem',
                                borderRadius: 'var(--radius-sm)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            View / Download Attachment
                        </a>
                    </div>
                )}

                <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div>Created: {note.createdAt ? formatDate(note.createdAt) : 'N/A'}</div>
                    {note.lastEditedAt && <div style={{ marginTop: '0.25rem' }}>Last edited: {formatDate(note.lastEditedAt)}</div>}
                </div>
            </div>

            {isApproved && !isAdminView && user && note._id && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Star size={18} color="var(--primary-light)" />
                        <div style={{ fontWeight: 700 }}>Rate This Note</div>
                    </div>

                    {ratingsByNoteId[note._id] && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, minWidth: '2.5rem' }}>
                                    {ratingsByNoteId[note._id].averageRating.toFixed(1)}
                                </span>
                                <div style={{ display: 'flex', gap: '0.25rem' }} aria-label={`Average rating ${ratingsByNoteId[note._id].averageRating.toFixed(1)} out of 5`}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={14}
                                            style={{
                                                fill: star <= Math.round(ratingsByNoteId[note._id].averageRating) ? 'var(--primary-light)' : 'transparent',
                                                color: 'var(--primary-light)',
                                            }}
                                        />
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {ratingsByNoteId[note._id].totalRatings} {ratingsByNoteId[note._id].totalRatings === 1 ? 'rating' : 'ratings'}
                                </span>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    {ratingsByNoteId[note._id].userRating ? `Your rating: ${ratingsByNoteId[note._id].userRating} star${ratingsByNoteId[note._id].userRating > 1 ? 's' : ''}` : 'You haven\'t rated this note yet'}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handleRateNote(note._id, value)}
                                            disabled={ratingLoadingNoteId === note._id}
                                            style={{
                                                background: value <= (ratingsByNoteId[note._id].userRating || 0) ? 'var(--primary-light)' : 'transparent',
                                                border: '1px solid var(--primary-light)',
                                                color: 'var(--primary-light)',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: ratingLoadingNoteId === note._id ? 0.6 : 1,
                                                transition: 'all 0.2s ease',
                                                fontSize: '0.9rem',
                                            }}
                                            title={`Rate ${value} star${value > 1 ? 's' : ''}`}
                                        >
                                            <Star size={14} fill={value <= (ratingsByNoteId[note._id].userRating || 0) ? 'var(--primary-light)' : 'none'} />
                                        </button>
                                    ))}

                                    {ratingsByNoteId[note._id].userRating > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (window.confirm('Remove your rating from this note?')) {
                                                    handleRateNote(note._id, 0);
                                                }
                                            }}
                                            disabled={ratingLoadingNoteId === note._id}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--danger)',
                                                color: 'var(--danger)',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                marginLeft: '0.5rem',
                                                opacity: ratingLoadingNoteId === note._id ? 0.6 : 1,
                                                transition: 'all 0.2s ease',
                                                fontSize: '0.9rem',
                                            }}
                                            title="Remove your rating"
                                        >
                                            ✕ Unrate
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {(isApproved || isAdminView) && note._id && (
                <NoteCommentsSection
                    noteId={note._id}
                    noteTitle={note.title}
                    user={user}
                    isAdminView={isAdminView}
                />
            )}

            {isApproved && user && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <div className="page-header" style={{ marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} color="var(--primary-light)" />
                            AI study guide
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Bullet summary and 10 practice questions (OpenAI, default model gpt-4o-mini). Uses the note title and description only — not the attachment file.
                        </p>
                    </div>

                    {aiError && (
                        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                            {aiError}
                        </div>
                    )}

                    <Button type="button" variant="secondary" loading={aiLoading} onClick={handleAiStudyGuide}>
                        Generate summary &amp; 10 Q&amp;A
                    </Button>

                    {aiResult && (
                        <div style={{ marginTop: '1.25rem' }}>
                            {Array.isArray(aiResult.summaryBullets) && aiResult.summaryBullets.length > 0 && (
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Summary</div>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                                        {aiResult.summaryBullets.map((b, i) => (
                                            <li key={`${i}-${String(b).slice(0, 24)}`}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {Array.isArray(aiResult.qa) && aiResult.qa.length > 0 && (
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Questions &amp; answers</div>
                                    <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                                        {aiResult.qa.map((item, i) => (
                                            <li key={`${i}-qa`} style={{ marginBottom: '0.85rem' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.question}</div>
                                                <div style={{ marginTop: '0.25rem' }}>{item.answer}</div>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {aiResult.raw && (
                                <pre
                                    style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-surface)',
                                        fontSize: '0.8rem',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    {aiResult.raw}
                                </pre>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NoteDetail;
