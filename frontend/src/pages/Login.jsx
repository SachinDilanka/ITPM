import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Grid,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: '100%' }}
      >
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Welcome Message */}
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Brain size={80} color="#9333ea" style={{ marginBottom: '2rem' }} />
                </motion.div>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  Welcome Back to KnowVerse
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4 }}>
                  Your academic community for learning and collaboration
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ color: '#10b981' }}>✓</span> Access study materials and notes
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ color: '#10b981' }}>✓</span> Connect with peers and experts
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ color: '#10b981' }}>✓</span> Participate in academic discussions
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper
                elevation={10}
                sx={{
                  p: 4,
                  background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                  border: '2px solid rgba(147, 51, 234, 0.3)',
                  borderRadius: '16px',
                }}
              >
                <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#9333ea' }}>
                  Sign In
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', mb: 4, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Enter your credentials to access your account
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    margin="normal"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(147, 51, 234, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(147, 51, 234, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#9333ea',
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    margin="normal"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(147, 51, 234, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(147, 51, 234, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#9333ea',
                        },
                      },
                    }}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      endIcon={<ArrowRight size={20} />}
                      sx={{
                        mt: 3,
                        mb: 2,
                        py: 1.5,
                        background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #7c3aed, #db2777)',
                          boxShadow: '0 8px 25px rgba(147, 51, 234, 0.3)',
                        },
                      }}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </motion.div>
                </form>

                <Divider sx={{ my: 3, borderColor: 'rgba(147, 51, 234, 0.3)' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    OR
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Don't have an account?{' '}
                    <Link
                      href="/register"
                      sx={{
                        color: '#9333ea',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Sign Up
                    </Link>
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Login;
