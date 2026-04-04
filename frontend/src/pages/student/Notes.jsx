import { useState, useCallback, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { filterNotesApi } from '../../api/notesApi';
import { getRatingSummariesApi, upsertRatingApi, deleteRatingApi } from '../../api/ratingsApi';
import useAuth from '../../hooks/useAuth';
import NoteCard from '../../components/cards/NoteCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { SUBJECTS, SEMESTERS, YEARS } from '../../utils/constants';

const Notes = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState({ subject: '', semester: '', year: '', status: 'approved' });
    const [ratingsByNoteId, setRatingsByNoteId] = useState({});
    const [ratingLoadingNoteId, setRatingLoadingNoteId] = useState(null);

    const fetchFn = useCallback(() => filterNotesApi(filters), [filters]);
    const { data, loading, error, execute } = useFetch(fetchFn);
    const notes = useMemo(() => data?.notes || data || [], [data]);

    const sortedNotes = useMemo(() => {
        return [...notes].sort((a, b) => {
            const aAvg = Number(ratingsByNoteId[a._id]?.averageRating || 0);
            const bAvg = Number(ratingsByNoteId[b._id]?.averageRating || 0);
            if (bAvg !== aAvg) return bAvg - aAvg;

            const aTotal = Number(ratingsByNoteId[a._id]?.totalRatings || 0);
            const bTotal = Number(ratingsByNoteId[b._id]?.totalRatings || 0);
            if (bTotal !== aTotal) return bTotal - aTotal;

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
        setRatingLoadingNoteId(noteId);
        try {
            if (rating === 0) {
                // Delete existing rating
                const existing = ratingsByNoteId[noteId];
                if (existing?.ratingId) {
                    const res = await deleteRatingApi(existing.ratingId);
                    const summary = res.data?.summary;
                    if (summary) {
                        setRatingsByNoteId((prev) => ({
                            ...prev,
                            [String(summary.noteId || noteId)]: summary,
                        }));
                    } else {
                        setRatingsByNoteId((prev) => ({
                            ...prev,
                            [noteId]: {
                                ...(prev[noteId] || {}),
                                userRating: null,
                                ratingId: null,
                            },
                        }));
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
        } catch {
            // Keep browsing uninterrupted if rating request fails.
        } finally {
            setRatingLoadingNoteId(null);
        }
    };

    const handleFilterChange = (e) => {
        setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        execute();
    };

    const handleClear = () => {
        setFilters({ subject: '', semester: '', year: '', status: 'approved' });
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Browse Notes</h1>
                <p>Search and filter academic notes by subject, semester, or year</p>
            </div>

            {/* Filter Bar */}
            <form className="filter-bar" onSubmit={handleSearch}>
                <select name="subject" className="form-input" value={filters.subject} onChange={handleFilterChange}>
                    <option value="">All Subjects</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <select name="semester" className="form-input" value={filters.semester} onChange={handleFilterChange}>
                    <option value="">All Semesters</option>
                    {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                </select>

                <select name="year" className="form-input" value={filters.year} onChange={handleFilterChange}>
                    <option value="">All Years</option>
                    {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>

                <Button type="submit" variant="primary">
                    <Search size={16} /> Search
                </Button>

                <Button type="button" variant="ghost" onClick={handleClear}>
                    Clear
                </Button>
            </form>

            {/* Results */}
            {loading ? (
                <Spinner message="Searching notes..." />
            ) : error ? (
                <div className="alert alert-error">{error}</div>
            ) : notes.length === 0 ? (
                <div className="empty-state">
                    <BookOpen size={48} className="empty-state-icon" />
                    <h3>No notes found</h3>
                    <p>Try adjusting your filters or check back later.</p>
                </div>
            ) : (
                <>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        Found <strong style={{ color: 'var(--text-primary)' }}>{sortedNotes.length}</strong> notes
                    </p>
                    <div className="grid-3">
                        {sortedNotes.map((note) => (
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
                </>
            )}
        </div>
    );
};

export default Notes;
