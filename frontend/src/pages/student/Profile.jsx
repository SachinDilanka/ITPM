import { User, Mail, ShieldCheck, Calendar, BookOpen } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { formatDate, getInitials, capitalizeFirst } from '../../utils/helpers';
import { statusBadgeClass } from '../../utils/helpers';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="page-container" style={{ maxWidth: 720 }}>
            <div className="page-header">
                <h1>My Profile</h1>
                <p>Your account information and status</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div
                        style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.75rem', fontWeight: 800, color: '#fff',
                            flexShrink: 0,
                        }}
                    >
                        {getInitials(user?.name)}
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '0.25rem' }}>{user?.name}</h2>
                        <span className={`badge ${user?.isApproved ? 'badge-success' : 'badge-warning'}`}>
                            {user?.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                        <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>
                            {capitalizeFirst(user?.role)}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { icon: User, label: 'Full Name', value: user?.name },
                        { icon: Mail, label: 'Email Address', value: user?.email },
                        { icon: BookOpen, label: 'Role', value: capitalizeFirst(user?.role) },
                        { icon: ShieldCheck, label: 'Account Status', value: user?.isApproved ? 'Active & Approved' : 'Pending Admin Approval' },
                    ].map(({ icon: Icon, label, value }) => (
                        <div
                            key={label}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '1rem', background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                            }}
                        >
                            <Icon size={18} color="var(--primary-light)" />
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>{label}</div>
                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {!user?.isApproved && (
                <div className="alert alert-warning">
                    <ShieldCheck size={16} />
                    <span>Your account is awaiting admin approval. You can browse the platform, but some features may be limited until approved.</span>
                </div>
            )}
        </div>
    );
};

export default Profile;
