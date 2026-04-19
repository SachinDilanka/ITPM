import { BookOpen, Heart } from 'lucide-react';

/** Compact footer for authenticated app layout (dashboard, notes, etc.). */
const SimpleFooter = () => (
    <footer
        style={{
            padding: '1rem 2rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={14} />
            <span>KnowVerse © {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            Made with <Heart size={12} color="var(--accent)" fill="var(--accent)" /> for students
        </div>
    </footer>
);

export default SimpleFooter;
