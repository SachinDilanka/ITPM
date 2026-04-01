import { User, Mail, Calendar, ShieldCheck, ShieldOff, RefreshCw } from 'lucide-react';
import { formatDate, getInitials } from '../../utils/helpers';
import Button from '../ui/Button';

const UserCard = ({ user, onApprove, onSuspend, onReactivate }) => {
    const { name, email, role, isApproved, isSuspended, createdAt } = user;

    const getStatus = () => {
        if (isSuspended) return { label: 'Suspended', cls: 'badge-danger' };
        if (isApproved) return { label: 'Active', cls: 'badge-success' };
        return { label: 'Pending', cls: 'badge-warning' };
    };

    const status = getStatus();

    return (
        <div className="card card-hover">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div
                    style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}
                >
                    {getInitials(name)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</h4>
                        <span className={`badge ${status.cls}`}>{status.label}</span>
                    </div>

                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Mail size={12} /> {email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <Calendar size={12} /> Joined {formatDate(createdAt)}
                            <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>{role}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)' }}>
                {!isApproved && !isSuspended && onApprove && (
                    <Button variant="success" size="sm" onClick={() => onApprove(user._id)}>
                        <ShieldCheck size={14} /> Approve
                    </Button>
                )}
                {!isSuspended && isApproved && onSuspend && (
                    <Button variant="danger" size="sm" onClick={() => onSuspend(user._id)}>
                        <ShieldOff size={14} /> Suspend
                    </Button>
                )}
                {isSuspended && onReactivate && (
                    <Button variant="warning" size="sm" onClick={() => onReactivate(user._id)}>
                        <RefreshCw size={14} /> Reactivate
                    </Button>
                )}
            </div>
        </div>
    );
};

export default UserCard;
