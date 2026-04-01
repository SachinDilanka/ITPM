import { useState, useCallback } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { filterNotesApi } from '../../api/notesApi';
import NoteCard from '../../components/cards/NoteCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { SUBJECTS, SEMESTERS, YEARS } from '../../utils/constants';

const Notes = () => {
    const [filters, setFilters] = useState({ subject: '', semester: '', year: '', status: 'approved' });

    const fetchFn = useCallback(() => filterNotesApi(filters), [filters]);
    const { data, loading, error, execute } = useFetch(fetchFn);
    const notes = data?.notes || data || [];

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
                            <NoteCard key={note._id} note={note} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Notes;
