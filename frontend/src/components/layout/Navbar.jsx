import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, LogOut, Menu } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getInitials, getMediaUrl } from '../../utils/helpers';

const Navbar = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchValue.trim();
        if (!q) return;
        // If currently on the notes management page, search notes; otherwise search users
        if (location.pathname.includes('/admin/notes')) {
            navigate(`/admin/notes?q=${encodeURIComponent(q)}`);
        } else {
            navigate(`/admin/users?q=${encodeURIComponent(q)}`);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <button className="btn btn-ghost btn-icon" onClick={onToggleSidebar} title="Toggle Sidebar">
                    <Menu size={20} />
                </button>
                <form className="navbar-search" onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
                    <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                        <Search size={16} color="var(--text-muted)" />
                    </button>
                    <input
                        type="text"
                        placeholder="Search notes, users..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </form>
            </div>

            <div className="navbar-right">
                <button className="btn btn-ghost btn-icon" title="Notifications">
                    <Bell size={20} />
                </button>

                <div className="user-menu" ref={dropdownRef}>
                    <div
                        className="flex flex-center gap-1"
                        style={{ cursor: 'pointer', gap: '0.625rem' }}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="user-avatar">
                            {getMediaUrl(user?.avatarUrl) ? (
                                <img src={getMediaUrl(user.avatarUrl)} alt="" />
                            ) : (
                                getInitials(user?.name)
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                {user?.role}
                            </span>
                        </div>
                        <ChevronDown size={14} color="var(--text-muted)" />
                    </div>

                    {dropdownOpen && (
                        <div className="user-dropdown">
                            <div className="user-dropdown-info">
                                <div className="user-dropdown-name">{user?.name}</div>
                                <div className="user-dropdown-email">{user?.email}</div>
                            </div>

                            {user?.role === 'student' && (
                                <NavLink
                                    to="/student/profile"
                                    className="dropdown-item"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <User size={16} /> Profile
                                </NavLink>
                            )}

                            <button className="dropdown-item danger" onClick={handleLogout}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
