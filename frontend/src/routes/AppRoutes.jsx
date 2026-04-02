import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Protected route wrapper – requires authentication + role
export const ProtectedRoute = ({ requiredRole }) => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (!user) return <Navigate to="/login" replace />;

    // Student logged in but not yet approved → redirect to waiting page
    if (user.role === 'student' && !user.isApproved) {
        return <Navigate to="/pending-approval" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
    }

    return (
        <div className={`app-layout${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="main-content">
                <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
                <Outlet />
                <Footer />
            </div>
        </div>
    );
};

// Redirect to appropriate dashboard if already logged in and approved
export const PublicRoute = () => {
    const { user } = useAuth();
    if (user) {
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'student' && user.isApproved) return <Navigate to="/student/dashboard" replace />;
        // student not yet approved — allow /login and /pending-approval
    }
    return <Outlet />;
};
