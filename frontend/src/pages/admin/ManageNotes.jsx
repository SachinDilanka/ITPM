import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, RefreshCw, Search } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { filterNotesApi } from '../../api/notesApi';
import { approveNoteApi, rejectNoteApi } from '../../api/adminApi';
import Spinner from '../../components/ui/Spinner';
import NoteCard from '../../components/cards/NoteCard';

const ManageNotes = () => {
    const [searchParams] = useSearchParams();
    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Pre-fill search from URL param (e.g. from Navbar search)
    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setSearchQuery(q);
            setFilter('approved'); // switch to approved to show all searchable notes
        }
    }, [searchParams]);

    const fetchNotes = useCallback(() => filterNotesApi({ status: filter }), [filter]);
    const { data, loading, error, execute } = useFetch(fetchNotes);
    const notes = data?.notes || data || [];

    // Filter notes by search query (title, subject, or uploader name)
    const filteredNotes = notes.filter((note) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            note.title?.toLowerCase().includes(q) ||
            note.subject?.toLowerCase().includes(q) ||
            note.uploadedBy?.name?.toLowerCase().includes(q)
        );
    });

    const handleAction = async (action, noteId) => {
        setActionLoading(noteId);
        try {
            if (action === 'approve') await approveNoteApi(noteId);
            if (action === 'reject') await rejectNoteApi(noteId);
            execute();
        } catch (err) {
            console.error('Action failed:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const tabStyle = (val) => ({
        padding: '0.5rem 1.25rem',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: 600,
        fontSize: '0.875rem',
        transition: 'var(--transition)',
        background: filter === val ? 'var(--primary)' : 'var(--bg-surface)',
        color: filter === val ? '#fff' : 'var(--text-secondary)',
    });

    return (
        <div className="page-container">
            <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Manage Notes</h1>
                    <p>Review, approve, or reject submitted academic notes</p>
                </div>
                <button className="btn btn-secondary" onClick={() => execute()}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '1.25rem', maxWidth: '400px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                    type="text"
                    placeholder="Search by title, subject, or uploader..."
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

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {['pending', 'approved', 'rejected'].map((tab) => (
                    <button key={tab} style={tabStyle(tab)} onClick={() => setFilter(tab)}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <Spinner message="Loading notes..." />
            ) : error ? (
                <div className="alert alert-error">{error}</div>
            ) : filteredNotes.length === 0 ? (
                <div className="empty-state">
                    <FileText size={48} className="empty-state-icon" />
                    <h3>{searchQuery.trim() ? 'No matching notes found' : `No ${filter} notes`}</h3>
                    {searchQuery.trim() && <p>No notes match &quot;{searchQuery}&quot;</p>}
                </div>
            ) : (
                <div className="grid-3">
                    {filteredNotes.map((note) => (
                        <NoteCard
                            key={note._id}
                            note={note}
                            showActions={filter === 'pending'}
                            onApprove={filter === 'pending' ? (id) => handleAction('approve', id) : null}
                            onReject={filter === 'pending' ? (id) => handleAction('reject', id) : null}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageNotes;
