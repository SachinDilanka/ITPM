import { Link, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle, Mail, LogOut, RefreshCw } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const steps = [
    { icon: CheckCircle, label: 'Account Created', done: true },
    { icon: Clock, label: 'Pending Admin Review', done: false, active: true },
    { icon: BookOpen, label: 'Access Granted', done: false },
];

const PendingApproval = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                background:
                    'radial-gradient(ellipse at top, rgba(108, 99, 255, 0.12) 0%, transparent 60%),' +
                    'var(--bg-dark)',
            }}
        >
            <div
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '3rem 2.5rem',
                    width: '100%',
                    maxWidth: 500,
                    boxShadow: 'var(--shadow-lg)',
                    textAlign: 'center',
                    animation: 'slideUp 0.4s ease',
                }}
            >
                {/* Animated Clock Icon */}
                <div
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.1))',
                        border: '2px solid rgba(245,158,11,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.75rem',
                        animation: 'pulse 2s infinite',
                    }}
                >
                    <Clock size={36} color="var(--warning)" />
                </div>

                <h1
                    style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        marginBottom: '0.75rem',
                        background: 'linear-gradient(135deg, var(--text-primary), var(--primary-light))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    Approval Pending
                </h1>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    Hi <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'there'}</strong>! Your account has been
                    created successfully. An administrator needs to review and approve your account before you can access
                    the platform.
                </p>

                {/* Progress Steps */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0,
                        marginBottom: '2rem',
                    }}
                >
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: step.done
                                                ? 'rgba(16,185,129,0.2)'
                                                : step.active
                                                    ? 'rgba(245,158,11,0.2)'
                                                    : 'var(--bg-surface)',
                                            border: `2px solid ${step.done ? 'var(--success)' : step.active ? 'var(--warning)' : 'var(--border)'
                                                }`,
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <Icon
                                            size={18}
                                            color={
                                                step.done ? 'var(--success)' : step.active ? 'var(--warning)' : 'var(--text-muted)'
                                            }
                                        />
                                    </div>
                                    <span
                                        style={{
                                            fontSize: '0.7rem',
                                            color: step.done
                                                ? 'var(--success)'
                                                : step.active
                                                    ? 'var(--warning)'
                                                    : 'var(--text-muted)',
                                            fontWeight: step.active ? 600 : 400,
                                            maxWidth: 80,
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div
                                        style={{
                                            width: 60,
                                            height: 2,
                                            background: step.done ? 'var(--success)' : 'var(--border)',
                                            marginBottom: '1.2rem',
                                            flexShrink: 0,
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Info Box */}
                <div
                    style={{
                        background: 'rgba(59,130,246,0.08)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1rem 1.25rem',
                        marginBottom: '2rem',
                        textAlign: 'left',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                    }}
                >
                    <Mail size={18} color="var(--info)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--info)', fontWeight: 600, marginBottom: '0.25rem' }}>
                            What happens next?
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            An admin will review your request and approve your account. Once approved, you can log in and access
                            all study materials. This usually takes less than 24 hours.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        className="btn btn-primary btn-full"
                        onClick={() => window.location.reload()}
                        style={{ justifyContent: 'center' }}
                    >
                        <RefreshCw size={16} /> Check Status
                    </button>
                    <button
                        className="btn btn-ghost btn-full"
                        onClick={handleLogout}
                        style={{ justifyContent: 'center' }}
                    >
                        <LogOut size={16} /> Sign in with a different account
                    </button>
                </div>
            </div>

            {/* Pulse animation */}
            <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(245,158,11,0); }
        }
      `}</style>
        </div>
    );
};

export default PendingApproval;
