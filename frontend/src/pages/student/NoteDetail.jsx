import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Download, BookOpen, Sparkles } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getPublicNoteByIdApi, postNoteAiStudyGuideApi } from '../../api/notesApi';
import Spinner from '../../components/ui/Spinner';
import { getMediaUrl, formatDate, statusBadgeClass } from '../../utils/helpers';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

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
    const { user } = useAuth();

    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiResult, setAiResult] = useState(null);

    const fetchFn = useMemo(() => () => getPublicNoteByIdApi(id), [id]);
    const { data, loading, error } = useFetch(fetchFn, true);

    const note = data?.note || data || null;

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

    return (
        <div className="page-container" style={{ maxWidth: 820 }}>
            <div className="page-header">
                <h1>{note.title}</h1>
                <p>Your uploaded note details</p>
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
                    note?.uploadedBy?._id &&
                    String(user._id) === String(note.uploadedBy._id) &&
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
