import { useState, useCallback, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { filterNotesApi } from '../../api/notesApi';
import { getRatingSummariesApi, upsertRatingApi } from '../../api/ratingsApi';
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
                        Found <strong style={{ color: 'var(--text-primary)' }}>{notes.length}</strong> notes
                    </p>
                    <div className="grid-3">
                        {notes.map((note) => (
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
