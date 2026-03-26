import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Snackbar,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
  Login as LoginIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      showSnackbar('Login successful!', 'success');
      
      // Redirect based on user role or to home
      setTimeout(() => {
        navigate('/questions');
      }, 1500);
      
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      showSnackbar(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <School sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
            <Typography component="h1" variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              KnowVerse
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Sign in to your academic community
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate('/forgot-password')}
                sx={{ textAlign: 'right' }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              disabled={loading}
              sx={{ mt: 2, mb: 2, py: 1.5 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate('/register')}
                sx={{ fontWeight: 'bold' }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>

          {/* Demo Account Info */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Demo Account:</strong><br />
              Email: demo@knowverse.com<br />
              Password: demo123
            </Typography>
          </Alert>
        </Paper>

        {/* Footer */}
        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            © 2024 KnowVerse. Built for academic excellence.
          </Typography>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
