import { useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getReportedNotesApi } from '../../api/adminApi';
import { approveNoteApi, rejectNoteApi } from '../../api/adminApi';
import Spinner from '../../components/ui/Spinner';
import ReportCard from '../../components/cards/ReportCard';

const Reports = () => {
    const fetchReported = useCallback(() => getReportedNotesApi(), []);
    const { data, loading, error, execute } = useFetch(fetchReported);
    const reports = data?.notes || data || [];

    const handleAction = async (action, noteId) => {
        try {
            if (action === 'approve') await approveNoteApi(noteId);
            if (action === 'reject') await rejectNoteApi(noteId);
            execute();
        } catch (err) {
            console.error('Report action failed:', err);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Reported Content</h1>
                    <p>Review notes that have been flagged by users for inappropriate content</p>
                </div>
                <button className="btn btn-secondary" onClick={() => execute()}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {reports.length > 0 && (
                <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
                    <AlertTriangle size={16} />
                    <span>{reports.length} note{reports.length > 1 ? 's' : ''} flagged for review. Please take appropriate action.</span>
                </div>
            )}

            {loading ? (
                <Spinner message="Loading reported notes..." />
            ) : error ? (
                <div className="alert alert-error">{error}</div>
            ) : reports.length === 0 ? (
                <div className="empty-state">
                    <AlertTriangle size={48} className="empty-state-icon" />
                    <h3>No reported content</h3>
                    <p>All notes are clean. Great community!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reports.map((report) => (
                        <ReportCard
                            key={report._id}
                            report={report}
                            onApprove={(id) => handleAction('approve', id)}
                            onReject={(id) => handleAction('reject', id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reports;
