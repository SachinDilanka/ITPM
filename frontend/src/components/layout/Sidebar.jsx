import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Upload, User, Users,
    ClipboardList, BarChart2, AlertTriangle, Layers, LogOut, BookOpen,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/notes', icon: FileText, label: 'Browse Notes' },
    { to: '/student/upload', icon: Upload, label: 'Upload Note' },
    { to: '/student/profile', icon: User, label: 'Profile' },
];

const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Manage Users' },
    { to: '/admin/notes', icon: ClipboardList, label: 'Manage Notes' },
    { to: '/admin/reports', icon: AlertTriangle, label: 'Reports' },
    { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
];

const Sidebar = ({ isOpen = true }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const links = user?.role === 'admin' ? adminLinks : studentLinks;
    const sectionLabel = user?.role === 'admin' ? 'Administration' : 'Student Portal';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`sidebar${isOpen ? '' : ' collapsed'}`}>
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <BookOpen size={22} color="#fff" />
                </div>
                <span className="logo-text">Know<span>Verse</span></span>
            </div>

            <div className="sidebar-section">
                <p className="sidebar-section-label">{sectionLabel}</p>
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={18} className="nav-item-icon" />
                        {label}
                    </NavLink>
                ))}
            </div>

            <div className="sidebar-footer">
                <button className="nav-item" style={{ width: '100%', color: 'var(--danger)' }} onClick={handleLogout}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
