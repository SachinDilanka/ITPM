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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, ArrowRight } from 'lucide-react';

const branches = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Other'
];

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    semester: '',
    branch: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

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
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
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
                  Join KnowVerse Today
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4 }}>
                  Start your journey of collaborative learning
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ color: '#10b981' }}>✓</span> Create and share study notes
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ color: '#10b981' }}>✓</span> Ask questions and get answers
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ color: '#10b981' }}>✓</span> Participate in academic polls
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ color: '#10b981' }}>✓</span> Build your academic reputation
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Right Side - Registration Form */}
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
                  Create Account
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', mb: 4, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Fill in your details to get started
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
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
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        helperText="Minimum 3 characters"
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
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
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
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel>Semester</InputLabel>
                        <Select
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          label="Semester"
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(147, 51, 234, 0.3)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(147, 51, 234, 0.5)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#9333ea',
                            },
                          }}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <MenuItem key={sem} value={sem}>
                              Semester {sem}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel>Branch</InputLabel>
                        <Select
                          name="branch"
                          value={formData.branch}
                          onChange={handleChange}
                          label="Branch"
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(147, 51, 234, 0.3)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(147, 51, 234, 0.5)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#9333ea',
                            },
                          }}
                        >
                          {branches.map((branch) => (
                            <MenuItem key={branch} value={branch}>
                              {branch}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        helperText="Minimum 6 characters"
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
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
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
                    </Grid>
                  </Grid>

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
                      {loading ? 'Creating Account...' : 'Create Account'}
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
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      sx={{
                        color: '#9333ea',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Sign In
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

export default Register;
