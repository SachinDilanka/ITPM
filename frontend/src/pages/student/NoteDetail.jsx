import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Download, BookOpen } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getPublicNoteByIdApi } from '../../api/notesApi';
import Spinner from '../../components/ui/Spinner';
import { getMediaUrl, formatDate, statusBadgeClass } from '../../utils/helpers';
import useAuth from '../../hooks/useAuth';

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
        </div>
    );
};

export default NoteDetail;

