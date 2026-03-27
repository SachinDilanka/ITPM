import React, { useState } from 'react';
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
  Badge,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search,
  Notifications,
  Person,
  Dashboard,
  MenuBook,
  Upload,
  AccountCircle,
  Logout,
  Settings,
  Chat,
  Menu as MenuIcon,
  Close,
  Book,
  BarChart
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { icon: <Dashboard />, label: 'Home', path: '/' },
    { icon: <Book />, label: 'Questions', path: '/questions' },
    { icon: <BarChart />, label: 'Polls', path: '/polls' },
    { icon: <AccountCircle />, label: 'Profile', path: '/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(147, 51, 234, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                color: '#fff'
              }}
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                📚 KnowVerse
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  sx={{
                    color: isActive(item.path) ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                    background: isActive(item.path) 
                      ? 'linear-gradient(45deg, #9333ea, #ec4899)' 
                      : 'transparent',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      background: isActive(item.path)
                        ? 'linear-gradient(45deg, #7c3aed, #db2777)'
                        : 'rgba(147, 51, 234, 0.1)',
                      color: '#fff'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: { xs: 'none', lg: 'flex' }, flex: 1, maxWidth: 400, mx: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search notes, questions..."
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
                    borderRadius: 2
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(147, 51, 234, 0.5)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9333ea'
                  }
                }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  color: '#fff'
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <Notifications />
            </IconButton>

            <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <Chat />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: '#9333ea',
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  border: '2px solid rgba(147, 51, 234, 0.5)',
                  '&:hover': {
                    border: '2px solid #9333ea'
                  }
                }}
                onClick={handleMenu}
              >
                SR
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Shenali Rodrigo
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Student
                </Typography>
              </Box>
            </Box>
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
                color: '#fff'
              }
            }
          }
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
          <AccountCircle sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
          <Settings sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider sx={{ borderColor: 'rgba(147, 51, 234, 0.3)' }} />
        <MenuItem onClick={handleClose}>
          <Logout sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            width: 280
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src="/book-logo-192.png"
              alt="KnowVerse"
              sx={{
                height: 28,
                width: 28,
                mr: 1
              }}
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              KnowVerse
            </Typography>
          </Box>
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </Box>
        
        <Divider sx={{ borderColor: 'rgba(147, 51, 234, 0.3)' }} />
        
        <List sx={{ p: 2 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.path}
              button
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
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
                  color: '#fff'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ borderColor: 'rgba(147, 51, 234, 0.3)' }} />
        
        <Box sx={{ p: 2, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Logout />}
            onClick={() => setMobileMenuOpen(false)}
            sx={{
              borderColor: 'rgba(147, 51, 234, 0.5)',
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                borderColor: '#9333ea',
                background: 'rgba(147, 51, 234, 0.1)',
                color: '#fff'
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
