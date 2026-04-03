import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // Only block on loading when we don't have a user yet (e.g. right after sign-up, user is set first)
  if (loading && !user) {
    return (
      <div className="page-loading">
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
