import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { Navbar } from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Questions from './pages/Questions.jsx';
import Polls from './pages/Polls.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9333ea',
    },
    secondary: {
      main: '#ec4899',
    },
    background: {
      default: '#0f0f23',
      paper: '#1a1a2e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(147, 51, 234, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Router>
            <Navbar />
            <Box sx={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/questions" element={
                  <ProtectedRoute>
                    <Questions />
                  </ProtectedRoute>
                } />
                <Route path="/polls" element={
                  <ProtectedRoute>
                    <Polls />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
              </Routes>
            </Box>
            <Footer />
          </Router>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
