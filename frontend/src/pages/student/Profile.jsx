import { User, Mail, ShieldCheck, BookOpen, Star, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { getInitials, capitalizeFirst } from '../../utils/helpers';
import { getMyNotesRatingStatsApi } from '../../api/ratingsApi';

const Profile = () => {
    const { user } = useAuth();
    const [ratingStats, setRatingStats] = useState({ totalRatingsReceived: 0, averageRating: 0, ratedNotesCount: 0 });

    useEffect(() => {
        if (user?.role !== 'student') {
            return;
        }

        let cancelled = false;
        getMyNotesRatingStatsApi()
            .then((res) => {
                if (!cancelled) {
                    setRatingStats(res.data?.data || {});
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setRatingStats({ totalRatingsReceived: 0, averageRating: 0, ratedNotesCount: 0 });
                }
            });

        return () => { cancelled = true; };
    }, [user?.role]);

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
                    ].map((item) => {
                        const IconComp = item.icon;
                        return (
                        <div
                            key={item.label}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '1rem', background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                            }}
                        >
                            <IconComp size={18} color="var(--primary-light)" />
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>{item.label}</div>
                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.value}</div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>

            {user?.role === 'student' && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                        <h3 className="card-title">Your Notes Ratings</h3>
                        <TrendingUp size={18} color="var(--primary)" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div
                                style={{
                                    padding: '1rem', background: 'var(--bg-surface)',
                                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Ratings Received</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    {ratingStats?.totalRatingsReceived || 0}
                                </div>
                            </div>

                            <div
                                style={{
                                    padding: '1rem', background: 'var(--bg-surface)',
                                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                    <Star size={12} /> Average Rating
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)' }}>
                                    {Number(ratingStats?.averageRating || 0).toFixed(1)}/5
                                </div>
                            </div>

                            <div
                                style={{
                                    padding: '1rem', background: 'var(--bg-surface)',
                                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                                    textAlign: 'center', gridColumn: '1 / -1'
                                }}
                            >
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>PDFs with Ratings</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>
                                    {ratingStats?.ratedNotesCount || 0}
                                </div>
                            </div>
                        </div>
                </div>
            )}

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
