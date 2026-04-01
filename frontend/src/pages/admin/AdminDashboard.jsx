import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, AlertTriangle, Clock, TrendingUp, Activity } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getDashboardStatsApi } from '../../api/analyticsApi';
import { getPendingQueueApi } from '../../api/notesApi';
import { updateNotePriorityApi } from '../../api/adminApi';
import { PRIORITY_LEVELS } from '../../utils/constants';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { formatDate, truncateText } from '../../utils/helpers';

const AdminDashboard = () => {
    const fetchStats = useCallback(() => getDashboardStatsApi(), []);
    const { data: stats, loading: statsLoading } = useFetch(fetchStats);

    const fetchQueue = useCallback(() => getPendingQueueApi(), []);
    const { data: queueData, loading: queueLoading, execute: executeQueue } = useFetch(fetchQueue);

    const [priorityFilter, setPriorityFilter] = useState('All');

    const queue = queueData?.queue || queueData || [];
    const filteredQueue = priorityFilter === 'All'
        ? queue
        : queue.filter(item => (item.priorityLevel || 'Medium') === priorityFilter);

    const handlePriorityChange = async (noteId, newPriority) => {
        try {
            await updateNotePriorityApi(noteId, { priorityLevel: newPriority });
            executeQueue(); // refresh queue
        } catch (err) {
            console.error('Failed to update priority:', err);
            alert('Failed to update priority');
        }
    };

    const statCards = [
        { label: 'Total Students', value: stats?.totalUsers ?? '—', icon: <Users size={48} />, color: 'var(--primary)', link: '/admin/users' },
        { label: 'Total Notes', value: stats?.totalNotes ?? '—', icon: <FileText size={48} />, color: 'var(--info)', link: '/admin/notes' },
        { label: 'Pending Notes', value: stats?.pendingNotes ?? '—', icon: <Clock size={48} />, color: 'var(--warning)', link: '/admin/notes' },
        { label: 'Pending Users', value: stats?.pendingUsers ?? '—', icon: <AlertTriangle size={48} />, color: 'var(--danger)', link: '/admin/users' },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Platform overview — manage users, notes, and content moderation</p>
            </div>

            {/* Stats */}
            {statsLoading ? (
                <Spinner message="Loading stats..." />
            ) : (
                <div className="grid-4" style={{ marginBottom: '2rem' }}>
                    {statCards.map((stat) => (
                        <Link to={stat.link} key={stat.label} style={{ textDecoration: 'none' }}>
                            <div className="stat-card" style={{ '--accent-color': stat.color, cursor: 'pointer' }}>
                                <span className="stat-label">{stat.label}</span>
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-icon">{stat.icon}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <div className="grid-2" style={{ gap: '1.5rem' }}>
                {/* Priority Queue */}
                <div className="card">
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h3 className="card-title">Priority Review Queue</h3>
                            <span className="badge badge-warning">{filteredQueue.length} pending</span>
                        </div>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '0.8rem',
                                background: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="All">All Priorities</option>
                            {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {queueLoading ? (
                        <Spinner size="sm" message="Loading queue..." />
                    ) : filteredQueue.length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <Activity size={32} className="empty-state-icon" />
                            <p>Queue is clear!</p>
                        </div>
                    ) : (
                        <div>
                            {filteredQueue.slice(0, 5).map((item, i) => (
                                <div key={item._id || i} className="queue-item">
                                    <div className="queue-rank">#{i + 1}</div>
                                    <div className="queue-info">
                                        <div className="queue-title">{item.title}</div>
                                        <div className="queue-meta">{item.subject} · {item.uploadedBy?.name || 'Unknown'}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <select
                                            value={item.priorityLevel || 'Medium'}
                                            onChange={(e) => handlePriorityChange(item._id, e.target.value)}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius-sm)',
                                                border: '1px solid var(--border)',
                                                fontSize: '0.8rem',
                                                background: 'var(--bg-surface)',
                                                color: 'var(--text-primary)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <span className="priority-score">Score: {item.priorityScore ?? '—'}</span>
                                    </div>
                                </div>
                            ))}
                            {filteredQueue.length > 5 && (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                                    +{filteredQueue.length - 5} more items
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Most Reported */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Most Reported Notes</h3>
                        <Link to="/admin/reports">
                            <Button variant="ghost" size="sm">View All →</Button>
                        </Link>
                    </div>

                    {statsLoading ? (
                        <Spinner size="sm" />
                    ) : (stats?.mostReportedNotes || []).length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <AlertTriangle size={32} className="empty-state-icon" />
                            <p>No reported notes</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Note</th>
                                        <th>Reports</th>
                                        <th>By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(stats?.mostReportedNotes || []).map((note) => (
                                        <tr key={note._id}>
                                            <td>{truncateText(note.title, 30)}</td>
                                            <td><span className="badge badge-danger">{note.reportsCount}</span></td>
                                            <td style={{ color: 'var(--text-muted)' }}>{note.uploadedBy?.name || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
