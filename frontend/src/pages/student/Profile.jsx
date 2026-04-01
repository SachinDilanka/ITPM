import { useRef, useState } from 'react';
import { User, Mail, ShieldCheck, BookOpen, Camera } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getInitials, capitalizeFirst, getMediaUrl } from '../../utils/helpers';
import { uploadAvatarApi } from '../../api/authApi';
import Button from '../../components/ui/Button';

const Profile = () => {
    const { user, patchUser } = useAuth();
    const fileInputRef = useRef(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarError, setAvatarError] = useState(null);

    const avatarSrc = getMediaUrl(user?.avatarUrl);

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        setAvatarError(null);
        setAvatarLoading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const { data } = await uploadAvatarApi(formData);
            patchUser({ avatarUrl: data.avatarUrl || '' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not upload photo. Try a smaller PNG or JPEG.';
            setAvatarError(msg);
        } finally {
            setAvatarLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: 720 }}>
            <div className="page-header">
                <h1>My Profile</h1>
                <p>Your account information and status</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.75rem',
                                fontWeight: 800,
                                color: '#fff',
                                overflow: 'hidden',
                            }}
                        >
                            {avatarSrc ? (
                                <img
                                    src={avatarSrc}
                                    alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                getInitials(user?.name)
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            style={{ display: 'none' }}
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <h2 style={{ marginBottom: '0.25rem' }}>{user?.name}</h2>
                        <span className={`badge ${user?.isApproved ? 'badge-success' : 'badge-warning'}`}>
                            {user?.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                        <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>
                            {capitalizeFirst(user?.role)}
                        </span>
                        <div style={{ marginTop: '0.75rem' }}>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                loading={avatarLoading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Camera size={16} />
                                    {user?.avatarUrl ? 'Change profile photo' : 'Add profile photo'}
                                </span>
                            </Button>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                                PNG, JPEG, or WebP — max 2 MB
                            </p>
                            {avatarError && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--danger, #c0392b)', marginTop: '0.5rem', marginBottom: 0 }}>
                                    {avatarError}
                                </p>
                            )}
                        </div>
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
