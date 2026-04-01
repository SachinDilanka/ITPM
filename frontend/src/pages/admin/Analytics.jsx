import { useCallback } from 'react';
import { BarChart2, Users, FileText, Clock, AlertTriangle, TrendingUp, Award } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getDashboardStatsApi } from '../../api/analyticsApi';
import Spinner from '../../components/ui/Spinner';
import { truncateText } from '../../utils/helpers';

const StatWidget = ({ label, value, icon: Icon, color, subtitle }) => (
    <div className="stat-card" style={{ '--accent-color': color }}>
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value ?? '—'}</span>
        {subtitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{subtitle}</span>}
        <span className="stat-icon"><Icon size={48} /></span>
    </div>
);

const Analytics = () => {
    const fetchStats = useCallback(() => getDashboardStatsApi(), []);
    const { data: stats, loading, error } = useFetch(fetchStats);

    if (loading) return <div className="page-container"><Spinner message="Loading analytics..." /></div>;
    if (error) return <div className="page-container"><div className="alert alert-error">{error}</div></div>;

    const approvalRate = stats?.totalNotes > 0
        ? (((stats.totalNotes - stats.pendingNotes) / stats.totalNotes) * 100).toFixed(1)
        : 0;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Analytics</h1>
                <p>Platform insights and performance metrics</p>
            </div>

            {/* KPI cards */}
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
                <StatWidget label="Total Students" value={stats?.totalUsers} icon={Users} color="var(--primary)" subtitle="Registered accounts" />
                <StatWidget label="Total Notes" value={stats?.totalNotes} icon={FileText} color="var(--info)" subtitle="All submitted notes" />
                <StatWidget label="Pending Review" value={stats?.pendingNotes} icon={Clock} color="var(--warning)" subtitle="Awaiting admin action" />
                <StatWidget label="Pending Approvals" value={stats?.pendingUsers} icon={AlertTriangle} color="var(--danger)" subtitle="Student accounts" />
            </div>

            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                {/* Approval Rate */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Content Approval Rate</h3>
                        <TrendingUp size={18} color="var(--success)" />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Approved</span>
                            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{approvalRate}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${approvalRate}%` }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Total: {stats?.totalNotes ?? 0} notes</span>
                        <span>Pending: {stats?.pendingNotes ?? 0}</span>
                    </div>
                </div>

                {/* Platform Health */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Platform Health</h3>
                        <BarChart2 size={18} color="var(--primary)" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        {[
                            { label: 'Active Students', value: (stats?.totalUsers ?? 0) - (stats?.pendingUsers ?? 0), total: stats?.totalUsers, color: 'var(--success)' },
                            { label: 'Reviewed Notes', value: (stats?.totalNotes ?? 0) - (stats?.pendingNotes ?? 0), total: stats?.totalNotes, color: 'var(--info)' },
                        ].map((metric) => {
                            const pct = metric.total > 0 ? ((metric.value / metric.total) * 100).toFixed(0) : 0;
                            return (
                                <div key={metric.label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.8rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{metric.label}</span>
                                        <span style={{ fontWeight: 600 }}>{metric.value} / {metric.total ?? 0}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${pct}%`, background: metric.color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Most Reported Notes */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Top Reported Notes</h3>
                    <span className="badge badge-warning">
                        {(stats?.mostReportedNotes || []).length} flagged
                    </span>
                </div>

                {(stats?.mostReportedNotes || []).length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <Award size={32} className="empty-state-icon" />
                        <p>No reported notes — the community is clean!</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Note Title</th>
                                    <th>Subject</th>
                                    <th>Uploaded By</th>
                                    <th>Reports</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(stats?.mostReportedNotes || []).map((note, i) => (
                                    <tr key={note._id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{truncateText(note.title, 40)}</td>
                                        <td>{note.subject}</td>
                                        <td>{note.uploadedBy?.name || '—'}</td>
                                        <td><span className="badge badge-danger">{note.reportsCount}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
