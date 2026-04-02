import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { Home } from 'lucide-react';

const NotFound = () => {
    const { user } = useAuth();
    const homeLink = user?.role === 'admin' ? '/admin/dashboard' : user ? '/student/dashboard' : '/login';

    return (
        <div className="not-found">
            <div className="not-found-code">404</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Page Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '340px' }}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to={homeLink}>
                <Button variant="primary">
                    <Home size={16} /> Go back home
                </Button>
            </Link>
        </div>
    );
};

export default NotFound;
