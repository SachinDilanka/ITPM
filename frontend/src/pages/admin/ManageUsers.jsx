import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, RefreshCw, Clock, ShieldOff, UserCheck, Search } from 'lucide-react';
import {
    getPendingUsersApi,
    getAllStudentsApi,
    getSuspendedStudentsApi,
    approveUserApi,
    suspendUserApi,
    reactivateUserApi,
} from '../../api/adminApi';
import Spinner from '../../components/ui/Spinner';
import UserCard from '../../components/cards/UserCard';

const TABS = [
    { id: 'pending', label: 'Pending Approvals', icon: Clock },
    { id: 'all', label: 'All Students', icon: Users },
    { id: 'suspended', label: 'Suspended List', icon: ShieldOff },
];

const useTabData = (fetcher) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetcher();
            const users = res?.data?.users || res?.data || [];
            setData(users);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, [fetcher]);

    useEffect(() => { load(); }, [load]);

    return { data, loading, error, reload: load };
};

const ManageUsers = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Pre-fill search from URL param (e.g. from Navbar search)
    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setSearchQuery(q);
            setActiveTab('all'); // switch to All Students so results are visible
        }
    }, [searchParams]);

    const pendingFetcher = useCallback(() => getPendingUsersApi(), []);
    const allFetcher = useCallback(() => getAllStudentsApi(), []);
    const suspendedFetcher = useCallback(() => getSuspendedStudentsApi(), []);

    const pending = useTabData(pendingFetcher);
    const all = useTabData(allFetcher);
    const suspended = useTabData(suspendedFetcher);

    const refreshAll = () => { pending.reload(); all.reload(); suspended.reload(); };

    const handleAction = async (action, userId) => {
        setActionLoading(userId);
        try {
            if (action === 'approve') await approveUserApi(userId);
            if (action === 'suspend') await suspendUserApi(userId);
            if (action === 'reactivate') await reactivateUserApi(userId);
            refreshAll();
        } catch (err) {
            console.error('Action failed:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const tab = { pending, all, suspended }[activeTab];

    // Filter users by search query (name or email)
    const filteredUsers = tab.data.filter((user) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            user.name?.toLowerCase().includes(q) ||
            user.email?.toLowerCase().includes(q)
        );
    });

    const tabCounts = {
        pending: pending.data.length,
        all: all.data.length,
        suspended: suspended.data.length,
    };

    /* ─── empty-state messages per tab ─── */
    const emptyMessages = {
        pending: { title: 'No pending users', sub: 'All student accounts have been reviewed.' },
        all: { title: 'No students found', sub: 'No student accounts registered yet.' },
        suspended: { title: 'No suspended students', sub: 'No accounts are currently suspended.' },
    };

    /* ─── which action buttons to show per tab ─── */
    const actionProps = (tabId) => ({
        onApprove: tabId === 'pending' ? (id) => handleAction('approve', id) : undefined,
        onSuspend: tabId === 'all' ? (id) => handleAction('suspend', id) : undefined,
        onReactivate: tabId === 'suspended' ? (id) => handleAction('reactivate', id) : undefined,
    });

    return (
        <div className="page-container">
            {/* ── Header ── */}
            <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Manage Users</h1>
                    <p>Approve, suspend, or reactivate student accounts</p>
                </div>
                <button className="btn btn-secondary" onClick={refreshAll}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* ── Search Bar ── */}
            <div style={{ position: 'relative', marginBottom: '1.25rem', maxWidth: '400px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                />
            </div>

            {/* ── Tab Bar ── */}
            <div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1.75rem',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '0',
                }}
            >
                {TABS.map(({ id, label, icon: Icon }) => {
                    const isActive = activeTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.625rem 1.125rem',
                                border: 'none',
                                borderBottom: isActive
                                    ? '2px solid var(--primary)'
                                    : '2px solid transparent',
                                background: 'transparent',
                                color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                                fontFamily: 'inherit',
                                fontSize: '0.875rem',
                                fontWeight: isActive ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                marginBottom: '-1px',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Icon size={15} />
                            {label}
                            {tabCounts[id] > 0 && (
                                <span
                                    style={{
                                        background: isActive
                                            ? 'rgba(108,99,255,0.25)'
                                            : 'var(--bg-surface)',
                                        color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '100px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        padding: '0.1rem 0.45rem',
                                    }}
                                >
                                    {tabCounts[id]}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Content ── */}
            {tab.loading ? (
                <Spinner message="Loading users..." />
            ) : tab.error ? (
                <div className="alert alert-error">{tab.error}</div>
            ) : filteredUsers.length === 0 ? (
                <div className="empty-state">
                    <Users size={48} className="empty-state-icon" />
                    <h3>{searchQuery.trim() ? 'No matching users found' : emptyMessages[activeTab].title}</h3>
                    <p>{searchQuery.trim() ? `No users match "${searchQuery}"` : emptyMessages[activeTab].sub}</p>
                </div>
            ) : (
                <>
                    {/* Summary badges */}
                    <div
                        className="card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            padding: '0.875rem 1.25rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        {activeTab === 'pending' && (
                            <span className="badge badge-warning">
                                <Clock size={11} /> {tab.data.length} Pending
                            </span>
                        )}
                        {activeTab === 'all' && (
                            <>
                                <span className="badge badge-success">
                                    <UserCheck size={11} />{' '}
                                    {tab.data.filter((u) => u.isApproved && !u.isSuspended).length} Active
                                </span>
                                <span className="badge badge-warning">
                                    <Clock size={11} />{' '}
                                    {tab.data.filter((u) => !u.isApproved && !u.isSuspended).length} Pending
                                </span>
                                <span className="badge badge-danger">
                                    <ShieldOff size={11} />{' '}
                                    {tab.data.filter((u) => u.isSuspended).length} Suspended
                                </span>
                            </>
                        )}
                        {activeTab === 'suspended' && (
                            <span className="badge badge-danger">
                                <ShieldOff size={11} /> {tab.data.length} Suspended
                            </span>
                        )}
                    </div>

                    {/* Cards Grid */}
                    <div className="grid-3">
                        {filteredUsers.map((user) => (
                            <div
                                key={user._id}
                                style={{
                                    opacity: actionLoading === user._id ? 0.5 : 1,
                                    pointerEvents: actionLoading === user._id ? 'none' : 'auto',
                                    transition: 'opacity 0.2s ease',
                                }}
                            >
                                <UserCard
                                    user={user}
                                    {...actionProps(activeTab)}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageUsers;
