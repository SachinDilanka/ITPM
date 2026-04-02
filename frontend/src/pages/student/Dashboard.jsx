import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, Search, TrendingUp, Clock, BookOpen } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import { filterNotesApi, getPendingQueueApi } from '../../api/notesApi';
import { getRatingSummariesApi, upsertRatingApi } from '../../api/ratingsApi';
import Spinner from '../../components/ui/Spinner';
import NoteCard from '../../components/cards/NoteCard';
import Button from '../../components/ui/Button';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [ratingsByNoteId, setRatingsByNoteId] = useState({});
    const [ratingLoadingNoteId, setRatingLoadingNoteId] = useState(null);

    const fetchNotes = useCallback(() => filterNotesApi({ status: 'approved' }), []);
    const { data: notesData, loading: notesLoading } = useFetch(fetchNotes);

    const fetchQueue = useCallback(() => getPendingQueueApi(), []);
    const { data: queueData } = useFetch(fetchQueue);

    const notes = useMemo(() => notesData?.notes || notesData || [], [notesData]);
    const queue = useMemo(() => queueData?.queue || queueData || [], [queueData]);

    const sortedNotesByRating = useMemo(() => {
        return [...notes].sort((a, b) => {
            const aSummary = ratingsByNoteId[a._id] || {};
            const bSummary = ratingsByNoteId[b._id] || {};

            const avgDiff = Number(bSummary.averageRating || 0) - Number(aSummary.averageRating || 0);
            if (avgDiff !== 0) return avgDiff;

            const totalDiff = Number(bSummary.totalRatings || 0) - Number(aSummary.totalRatings || 0);
            if (totalDiff !== 0) return totalDiff;

            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
    }, [notes, ratingsByNoteId]);

    useEffect(() => {
        if (!user?._id || notes.length === 0) {
            setRatingsByNoteId({});
            return;
        }

        let cancelled = false;
        getRatingSummariesApi(notes.map((note) => note._id))
            .then((res) => {
                if (cancelled) return;
                const map = (res.data?.data || []).reduce((acc, row) => {
                    acc[String(row.noteId)] = row;
                    return acc;
                }, {});
                setRatingsByNoteId(map);
            })
            .catch(() => {
                if (!cancelled) setRatingsByNoteId({});
            });

        return () => { cancelled = true; };
    }, [notes, user?._id]);

    const handleRateNote = async (noteId, rating) => {
        const selectedNote = notes.find((note) => String(note._id) === String(noteId));
        const uploaderId = selectedNote?.uploadedBy?._id || selectedNote?.uploadedBy;
        if (String(uploaderId || '') === String(user?._id || '')) {
            return;
        }

        setRatingLoadingNoteId(noteId);
        try {
            if (rating === 0) {
                // Delete existing rating
                const existing = ratingsByNoteId[noteId];
                if (existing?.userRating) {
                    const ratingId = existing.ratingId;
                    if (ratingId) {
                        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ratings/${ratingId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${user?.token}`,
                            }
                        });
                    }
                }
            } else {
                // Create or update rating
                const res = await upsertRatingApi({ noteId, rating });
                const summary = res.data?.summary;
                if (summary) {
                    setRatingsByNoteId((prev) => ({
                        ...prev,
                        [String(summary.noteId || noteId)]: summary,
                    }));
                }
            }
            // Clear the rating from UI after delete
            if (rating === 0) {
                setRatingsByNoteId((prev) => ({
                    ...prev,
                    [noteId]: {
                        ...(prev[noteId] || {}),
                        userRating: null,
                    },
                }));
            }
        } catch {
            // Keep UI stable and avoid interrupting browsing if rating fails.
        } finally {
            setRatingLoadingNoteId(null);
        }
    };

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
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Top Rated Notes</h3>
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
                    {sortedNotesByRating.slice(0, 6).map((note) => (
                        <NoteCard
                            key={note._id}
                            note={note}
                            currentUserId={user?._id}
                            ratingSummary={ratingsByNoteId[note._id]}
                            onRate={handleRateNote}
                            ratingBusy={ratingLoadingNoteId === note._id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
