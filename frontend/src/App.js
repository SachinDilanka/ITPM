import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { Navbar } from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Questions from './pages/Questions.jsx';
import Polls from './pages/Polls.jsx';
import Profile from './pages/Profile.jsx';

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
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%)',
        color: '#fff'
      }}>
        <Router>
          <Navbar />
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
