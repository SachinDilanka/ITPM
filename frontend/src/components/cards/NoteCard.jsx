import { FileText, User, Eye, Download, File } from 'lucide-react';
import { formatDate, truncateText, statusBadgeClass } from '../../utils/helpers';
import Button from '../ui/Button';

// Backend origin for serving static uploads
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
    .replace('/api', '');

const NoteCard = ({ note, onApprove, onReject, showActions = false }) => {
    const { title, subject, semester, year, description, uploadedBy, status, createdAt, fileUrl } = note;

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

                {showActions && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {onApprove && (
                            <Button variant="success" size="sm" onClick={() => onApprove(note._id)}>Approve</Button>
                        )}
                        {onReject && (
                            <Button variant="danger" size="sm" onClick={() => onReject(note._id)}>Reject</Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteCard;
