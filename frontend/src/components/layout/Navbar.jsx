import { useState, useMemo } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    InputAdornment,
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Search,
    Notifications,
    Person,
    Dashboard,
    MenuBook,
    Logout,
    Settings,
    Chat,
    Menu as MenuIcon,
    Close,
    Book,
    BarChart,
    Login as LoginIcon,
    People,
    QuestionAnswer,
    CloudUpload,
    Assessment,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getInitials, getMediaUrl } from '../../utils/helpers';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const isAuthenticated = Boolean(user);

    const [anchorEl, setAnchorEl] = useState(null);
    const [navDrawerOpen, setNavDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const menuItems = useMemo(() => {
        if (!user) {
            return [
                { icon: <Dashboard />, label: 'Home', path: '/' },
                { icon: <Book />, label: 'Browse Notes', path: '/student/notes' },
            ];
        }
        if (user.role === 'admin') {
            return [
                { icon: <Dashboard />, label: 'Dashboard', path: '/admin/dashboard' },
                { icon: <People />, label: 'Users', path: '/admin/users' },
                { icon: <MenuBook />, label: 'Notes', path: '/admin/notes' },
                { icon: <BarChart />, label: 'Analytics', path: '/admin/analytics' },
            ];
        }
        return [
            { icon: <QuestionAnswer />, label: 'Questions', path: '/student/questions' },
            { icon: <BarChart />, label: 'Polls', path: '/student/polls' },
            { icon: <Assessment />, label: 'My dashboard', path: '/student/my-dashboard' },
            { icon: <Book />, label: 'Browse Notes', path: '/student/notes' },
            { icon: <CloudUpload />, label: 'Upload Note', path: '/student/upload' },
        ];
    }, [user]);

    const profilePath = user?.role === 'admin' ? '/admin/dashboard' : '/student/profile';

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        setNavDrawerOpen(false);
        navigate('/');
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        if (location.pathname.includes('/admin/')) {
            if (location.pathname.includes('/admin/notes')) {
                navigate(`/admin/notes?q=${encodeURIComponent(q)}`);
            } else {
                navigate(`/admin/users?q=${encodeURIComponent(q)}`);
            }
        } else {
            navigate(`/student/notes?q=${encodeURIComponent(q)}`);
        }
    };

    const handleMobileMenuOpen = () => {
        setNavDrawerOpen(true);
    };

    const displayName = user?.name || user?.username || 'User';
    const subtitle = user?.role === 'admin' ? 'Administrator' : user?.role === 'student' ? 'Student' : 'Guest';
    const avatarSrc = getMediaUrl(user?.profilePicture || user?.avatarUrl || '');

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(147, 51, 234, 0.3)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'nowrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 3 }, minWidth: 0 }}>
                        <IconButton
                            sx={{
                                display: { xs: 'flex', md: 'none' },
                                color: '#fff',
                            }}
                            onClick={handleMobileMenuOpen}
                            aria-label="Open menu"
                        >
                            <MenuIcon />
                        </IconButton>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                                minWidth: 0,
                            }}
                            onClick={() => navigate('/')}
                        >
                            <Typography
                                variant="h6"
                                noWrap
                                sx={{
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: { xs: '1.1rem', sm: '1.35rem' },
                                }}
                            >
                                📚 KnowVerse
                            </Typography>
                        </Box>

                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexWrap: 'wrap' }}>
                            {menuItems.map((item) => (
                                <Button
                                    key={item.path + item.label}
                                    onClick={() => navigate(item.path)}
                                    startIcon={item.icon}
                                    size="small"
                                    sx={{
                                        color: isActive(item.path) ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                                        background: isActive(item.path)
                                            ? 'linear-gradient(45deg, #9333ea, #ec4899)'
                                            : 'transparent',
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 0.75,
                                        '&:hover': {
                                            background: isActive(item.path)
                                                ? 'linear-gradient(45deg, #7c3aed, #db2777)'
                                                : 'rgba(147, 51, 234, 0.1)',
                                            color: '#fff',
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    <Box
                        component="form"
                        onSubmit={handleSearchSubmit}
                        sx={{ display: { xs: 'none', lg: 'flex' }, flex: 1, maxWidth: 400, mx: 2 }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search notes, users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    color: '#fff',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(147, 51, 234, 0.3)',
                                        borderRadius: 2,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(147, 51, 234, 0.5)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#9333ea',
                                    },
                                },
                            }}
                            sx={{
                                '& .MuiInputBase-input': {
                                    color: '#fff',
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexShrink: 0 }}>
                        {isAuthenticated ? (
                            <>
                                <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)', display: { xs: 'none', sm: 'flex' } }}>
                                    <Notifications />
                                </IconButton>

                                <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)', display: { xs: 'none', sm: 'flex' } }}>
                                    <Chat />
                                </IconButton>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar
                                        src={avatarSrc || undefined}
                                        sx={{
                                            bgcolor: '#9333ea',
                                            width: 40,
                                            height: 40,
                                            cursor: 'pointer',
                                            border: '2px solid rgba(147, 51, 234, 0.5)',
                                            '&:hover': {
                                                border: '2px solid #9333ea',
                                            },
                                        }}
                                        onClick={handleMenu}
                                    >
                                        {!avatarSrc && (displayName.charAt(0).toUpperCase() || 'U')}
                                    </Avatar>
                                    <Box sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: 140 }}>
                                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }} noWrap>
                                            {displayName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} noWrap>
                                            {subtitle}
                                        </Typography>
                                    </Box>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<LoginIcon />}
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        borderColor: 'rgba(147, 51, 234, 0.5)',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        '&:hover': {
                                            borderColor: '#9333ea',
                                            background: 'rgba(147, 51, 234, 0.1)',
                                            color: '#fff',
                                        },
                                    }}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => navigate('/register')}
                                    sx={{
                                        display: { xs: 'none', sm: 'inline-flex' },
                                        background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #7c3aed, #db2777)',
                                            boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)',
                                        },
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(147, 51, 234, 0.3)',
                        mt: 1,
                        '& .MuiMenuItem-root': {
                            color: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                                background: 'rgba(147, 51, 234, 0.1)',
                                color: '#fff',
                            },
                        },
                    },
                }}
            >
                <MenuItem
                    onClick={() => {
                        navigate(profilePath);
                        handleClose();
                    }}
                >
                    <Settings sx={{ mr: 2 }} />
                    Account settings
                </MenuItem>
                <Divider sx={{ borderColor: 'rgba(147, 51, 234, 0.3)' }} />
                <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 2 }} />
                    Logout
                </MenuItem>
            </Menu>

            <Drawer
                anchor="left"
                open={navDrawerOpen}
                onClose={() => setNavDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(147, 51, 234, 0.3)',
                        width: 280,
                    },
                }}
            >
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            KnowVerse
                        </Typography>
                        <IconButton onClick={() => setNavDrawerOpen(false)} sx={{ color: '#fff' }}>
                            <Close />
                        </IconButton>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(147, 51, 234, 0.3)' }} />
                    <List sx={{ p: 2 }}>
                        {menuItems.map((item) => (
                            <ListItemButton
                                key={item.path + item.label}
                                onClick={() => {
                                    navigate(item.path);
                                    setNavDrawerOpen(false);
                                }}
                                sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    background: isActive(item.path)
                                        ? 'linear-gradient(45deg, #9333ea, #ec4899)'
                                        : 'transparent',
                                    color: isActive(item.path) ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                                    '&:hover': {
                                        background: isActive(item.path)
                                            ? 'linear-gradient(45deg, #7c3aed, #db2777)'
                                            : 'rgba(147, 51, 234, 0.1)',
                                        color: '#fff',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        ))}
                        {!isAuthenticated && (
                            <>
                                <Divider sx={{ borderColor: 'rgba(147, 51, 234, 0.3)', my: 1 }} />
                                <ListItemButton
                                    onClick={() => {
                                        navigate('/login');
                                        setNavDrawerOpen(false);
                                    }}
                                    sx={{ borderRadius: 2, color: '#fff' }}
                                >
                                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                        <LoginIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Login" />
                                </ListItemButton>
                                <ListItemButton
                                    onClick={() => {
                                        navigate('/register');
                                        setNavDrawerOpen(false);
                                    }}
                                    sx={{ borderRadius: 2, color: '#fff' }}
                                >
                                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                        <Person />
                                    </ListItemIcon>
                                    <ListItemText primary="Sign up" />
                                </ListItemButton>
                            </>
                        )}
                        {isAuthenticated && (
                            <>
                                <Divider sx={{ borderColor: 'rgba(147, 51, 234, 0.3)', my: 1 }} />
                                <ListItemButton
                                    onClick={() => {
                                        handleLogout();
                                    }}
                                    sx={{ borderRadius: 2, color: 'rgba(255, 255, 255, 0.8)' }}
                                >
                                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                        <Logout />
                                    </ListItemIcon>
                                    <ListItemText primary="Logout" />
                                </ListItemButton>
                            </>
                        )}
                    </List>
            </Drawer>
        </>
    );
};

export default Navbar;
