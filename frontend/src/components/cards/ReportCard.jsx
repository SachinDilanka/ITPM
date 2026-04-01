import { AlertTriangle, FileText, User, Calendar } from 'lucide-react';
import { formatDate, truncateText } from '../../utils/helpers';
import Button from '../ui/Button';

const ReportCard = ({ report, onApprove, onReject }) => {
    const { title, subject, semester, reportsCount, uploadedBy, createdAt } = report;

    return (
        <div className="card card-hover" style={{ borderLeft: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div
                    style={{
                        width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                        background: 'rgba(239, 68, 68, 0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <AlertTriangle size={20} color="var(--danger)" />
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{title}</h4>
                        <span className="badge badge-danger" style={{ flexShrink: 0 }}>
                            {reportsCount} Reports
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FileText size={13} /> {subject}
                        </span>
                        <span>Sem {semester}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={13} /> {uploadedBy?.name || 'Unknown'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={13} /> {formatDate(createdAt)}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.625rem' }}>
                        {onApprove && (
                            <Button variant="success" size="sm" onClick={() => onApprove(report._id)}>
                                Keep Note
                            </Button>
                        )}
                        {onReject && (
                            <Button variant="danger" size="sm" onClick={() => onReject(report._id)}>
                                Remove
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;
