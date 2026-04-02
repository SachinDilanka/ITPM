import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, Search, TrendingUp, Clock, BookOpen } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import { filterNotesApi, getPendingQueueApi } from '../../api/notesApi';
import Spinner from '../../components/ui/Spinner';
import NoteCard from '../../components/cards/NoteCard';
import Button from '../../components/ui/Button';

const StudentDashboard = () => {
    const { user } = useAuth();

    const fetchNotes = useCallback(() => filterNotesApi({ status: 'approved' }), []);
    const { data: notesData, loading: notesLoading } = useFetch(fetchNotes);

    const fetchQueue = useCallback(() => getPendingQueueApi(), []);
    const { data: queueData, loading: queueLoading } = useFetch(fetchQueue);

    const notes = notesData?.notes || notesData || [];
    const queue = queueData?.queue || queueData || [];

    return (
        <div className="page-container">
            {/* Welcome Banner */}
            <div
                className="card"
                style={{
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.3) 0%, rgba(0,210,255,0.15) 100%)',
                    border: '1px solid rgba(108,99,255,0.3)',
                    marginBottom: '2rem',
                    padding: '2rem',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.5rem' }}>
                            Welcome back, <span style={{ color: 'var(--primary-light)' }}>{user?.name?.split(' ')[0]}</span>! 👋
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Explore academic notes shared by your peers, or contribute your own.
                        </p>
                    </div>
                    <Link to="/student/upload">
                        <Button variant="primary">
                            <Upload size={16} /> Upload Note
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                {[
                    { label: 'Available Notes', value: notes.length, icon: <FileText size={48} />, color: 'var(--primary)' },
                    { label: 'In Review Queue', value: queue.length, icon: <Clock size={48} />, color: 'var(--warning)' },
                    { label: 'Your Contributions', value: notes.filter(n => n.uploadedBy?._id === user?._id).length, icon: <TrendingUp size={48} />, color: 'var(--success)' },
                ].map((stat) => (
                    <div className="stat-card" key={stat.label} style={{ '--accent-color': stat.color }}>
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-icon">{stat.icon}</span>
                    </div>
                ))}
            </div>

            {/* Recent Notes */}
            <div className="card-header flex-between" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Notes</h3>
                <Link to="/student/notes">
                    <Button variant="ghost" size="sm">View All →</Button>
                </Link>
            </div>

            {notesLoading ? (
                <Spinner message="Loading notes..." />
            ) : notes.length === 0 ? (
                <div className="empty-state">
                    <BookOpen size={48} className="empty-state-icon" />
                    <h3>No notes available yet</h3>
                    <p>Be the first to upload a note and help your classmates!</p>
                    <Link to="/student/upload">
                        <Button variant="primary"><Upload size={16} /> Upload First Note</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid-3">
                    {notes.slice(0, 6).map((note) => (
                        <NoteCard key={note._id} note={note} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
