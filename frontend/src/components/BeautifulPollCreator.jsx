import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Edit3,
  Calendar,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle,
  Check,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BeautifulPollCreator = ({ 
  currentUser, 
  onCreatePoll, 
  isSubmitting,
  onCancel 
}) => {
  const [pollData, setPollData] = useState({
    title: '',
    description: '',
    year: '',
    semester: '',
    subject: '',
    isMultipleChoice: false,
    options: ['', '', '', '']
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [hoveredField, setHoveredField] = useState(null);

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 
    'Biology', 'English'
  ];

  const handleFieldChange = (field, value) => {
    const processedValue = (field === 'year' || field === 'semester') && value !== '' 
      ? parseInt(value, 10) 
      : value;
    
    setPollData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...pollData.options];
    updatedOptions[index] = value;
    setPollData(prev => ({ ...prev, options: updatedOptions }));
  };

  const addOption = () => {
    if (pollData.options.length < 10) {
      setPollData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (pollData.options.length > 2) {
      const updatedOptions = pollData.options.filter((_, i) => i !== index);
      setPollData(prev => ({ ...prev, options: updatedOptions }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!pollData.title.trim()) errors.title = 'Poll title is required';
    if (!pollData.description.trim()) errors.description = 'Description is required';
    if (!pollData.year) errors.year = 'Please select a year';
    if (!pollData.semester) errors.semester = 'Please select a semester';
    if (!pollData.subject) errors.subject = 'Please select a subject';
    
    const validOptions = pollData.options.filter(opt => opt.trim());
    if (validOptions.length < 2) errors.options = 'At least 2 valid options are required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const validOptions = pollData.options.filter(opt => opt.trim());
      onCreatePoll({
        ...pollData,
        options: validOptions,
        author: currentUser.id
      });
    }
  };

  const years = [1, 2, 3, 4];
  const semesters = [1, 2];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={32} color="#9333ea" />
              </motion.div>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #9333ea, #ec4899, #3b82f6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Create Amazing Poll
              </Typography>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Target size={32} color="#ec4899" />
              </motion.div>
            </Box>
          </motion.div>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
            Design engaging polls for your academic community
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Fill in the details below to create your interactive poll
          </Typography>
        </Box>

        {/* Main Form */}
        <Grid container spacing={4}>
          {/* Left Column - Basic Info */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Paper
                sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #9333ea, #ec4899, #3b82f6)',
                  }
                }}
                onMouseEnter={() => setHoveredField('basic')}
                onMouseLeave={() => setHoveredField(null)}
              >
                {hoveredField === 'basic' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                    }}
                  >
                    <Edit3 size={16} color="#9333ea" />
                  </motion.div>
                )}

                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Zap size={20} color="#f59e0b" />
                  Basic Information
                </Typography>

                <TextField
                  fullWidth
                  label="Poll Title"
                  value={pollData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  placeholder="Enter an engaging title..."
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(147, 51, 234, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(147, 51, 234, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputBase-input': { color: 'white' },
                  }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={pollData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  multiline
                  rows={4}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  placeholder="Describe your poll in detail..."
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(147, 51, 234, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(147, 51, 234, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputBase-input': { color: 'white' },
                  }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={pollData.isMultipleChoice}
                      onChange={(e) => handleFieldChange('isMultipleChoice', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#9333ea' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#9333ea' },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: 'white' }}>
                      Allow multiple selections
                    </Typography>
                  }
                />
              </Paper>
            </motion.div>
          </Grid>

          {/* Right Column - Academic Details */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Paper
                sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6)',
                  }
                }}
                onMouseEnter={() => setHoveredField('academic')}
                onMouseLeave={() => setHoveredField(null)}
              >
                {hoveredField === 'academic' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                    }}
                  >
                    <BookOpen size={16} color="#10b981" />
                  </motion.div>
                )}

                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star size={20} color="#3b82f6" />
                  Academic Details
                </Typography>

                {/* Year Selection */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Calendar size={18} />
                    </motion.div>
                    <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Academic Year
                    </Typography>
                    {pollData.year && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Chip 
                          label="✓ Selected" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 600,
                            ml: 2
                          }} 
                        />
                      </motion.div>
                    )}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                    {years.map((year, index) => (
                      <Grid item key={year}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: index * 0.15, type: "spring", stiffness: 300 }}
                          whileHover={{ 
                            scale: 1.08, 
                            y: -8,
                            boxShadow: '0 15px 35px rgba(16, 185, 129, 0.4)',
                            rotateZ: 2
                          }}
                          whileTap={{ scale: 0.95, rotateZ: -2 }}
                          onClick={() => handleFieldChange('year', year)}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '3px solid',
                            borderColor: pollData.year === year ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                            background: pollData.year === year 
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)' 
                              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                            color: 'white',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: 120,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            '&:hover': {
                              borderColor: '#10b981',
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
                              transform: 'translateY(-8px) rotateZ(2deg)',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: -100,
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                              transition: 'all 0.8s',
                            },
                            '&:hover::before': {
                              left: '100%',
                            }
                          }}
                        >
                          {pollData.year === year && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.95)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                              }}
                            >
                              <Check size={16} color="#10b981" />
                            </motion.div>
                          )}
                          <motion.div
                            animate={{ 
                              y: pollData.year === year ? [0, -8, 0] : 0,
                              scale: pollData.year === year ? [1, 1.05, 1] : 1
                            }}
                            transition={{ duration: 2, repeat: pollData.year === year ? Infinity : 0 }}
                          >
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontSize: '2rem' }}>
                              {year}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, fontSize: '0.9rem' }}>
                              {year === 1 && '📚 First Year'}
                              {year === 2 && '📖 Second Year'}
                              {year === 3 && '🎓 Third Year'}
                              {year === 4 && '🏆 Final Year'}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                              {year === 1 && 'Foundation Year'}
                              {year === 2 && 'Intermediate Level'}
                              {year === 3 && 'Advanced Studies'}
                              {year === 4 && 'Graduation Year'}
                            </Typography>
                          </motion.div>
                        </motion.div>
                      </Grid>
                    ))}
                  </Box>
                  {formErrors.year && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block', fontWeight: 600 }}>
                        ⚠️ {formErrors.year}
                      </Typography>
                    </motion.div>
                  )}
                </Box>

                {/* Semester Selection */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Clock size={18} />
                    </motion.div>
                    <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Academic Semester
                    </Typography>
                    {pollData.semester && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Chip 
                          label="✓ Selected" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 600,
                            ml: 2
                          }} 
                        />
                      </motion.div>
                    )}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                    {semesters.map((semester, index) => (
                      <Grid item key={semester}>
                        <motion.div
                          initial={{ opacity: 0, x: -30, rotateY: 90 }}
                          animate={{ opacity: 1, x: 0, rotateY: 0 }}
                          transition={{ delay: index * 0.2, type: "spring", stiffness: 300 }}
                          whileHover={{ 
                            scale: 1.08, 
                            rotateY: 5,
                            boxShadow: '0 15px 35px rgba(59, 130, 246, 0.4)',
                            y: -8
                          }}
                          whileTap={{ scale: 0.95, rotateY: -5 }}
                          onClick={() => handleFieldChange('semester', semester)}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '3px solid',
                            borderColor: pollData.semester === semester ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
                            background: pollData.semester === semester 
                              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)' 
                              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                            color: 'white',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: 120,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            perspective: '1000px',
                            '&:hover': {
                              borderColor: '#3b82f6',
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))',
                              transform: 'translateY(-8px) rotateY(5deg)',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: '-50%',
                              left: '-50%',
                              width: '200%',
                              height: '200%',
                              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
                              transition: 'all 0.8s',
                            },
                            '&:hover::before': {
                              top: '-25%',
                              left: '-25%',
                            }
                          }}
                        >
                          {pollData.semester === semester && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.95)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                              }}
                            >
                              <Check size={16} color="#3b82f6" />
                            </motion.div>
                          )}
                          <motion.div
                            animate={{ 
                              scale: pollData.semester === semester ? [1, 1.08, 1] : 1,
                              rotateZ: pollData.semester === semester ? [0, 2, 0] : 0
                            }}
                            transition={{ duration: 2.5, repeat: pollData.semester === semester ? Infinity : 0 }}
                          >
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontSize: '2rem' }}>
                              {semester}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, fontSize: '0.9rem' }}>
                              {semester === 1 ? '🌸 First Semester' : '🍂 Second Semester'}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                              {semester === 1 ? 'Spring Session' : 'Fall Session'}
                            </Typography>
                          </motion.div>
                        </motion.div>
                      </Grid>
                    ))}
                  </Box>
                  {formErrors.semester && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block', fontWeight: 600 }}>
                        ⚠️ {formErrors.semester}
                      </Typography>
                    </motion.div>
                  )}
                </Box>

                {/* Subject Selection */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <BookOpen size={18} />
                    </motion.div>
                    <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Subject Area
                    </Typography>
                    {pollData.subject && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Chip 
                          label="✓ Selected" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 600,
                            ml: 2
                          }} 
                        />
                      </motion.div>
                    )}
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 2.5,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(245, 158, 11, 0.5)',
                      borderRadius: '4px',
                      '&:hover': {
                        background: 'rgba(245, 158, 11, 0.7)',
                      },
                    },
                  }}>
                    {subjects.map((subject, index) => (
                      <motion.div
                        key={subject}
                        initial={{ opacity: 0, y: 30, rotateX: 90 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                        whileHover={{ 
                          scale: 1.08, 
                          y: -5,
                          boxShadow: '0 12px 30px rgba(245, 158, 11, 0.4)',
                          rotateX: 5
                        }}
                        whileTap={{ scale: 0.95, rotateX: -5 }}
                        onClick={() => handleFieldChange('subject', subject)}
                        sx={{
                          p: 2.5,
                          borderRadius: 2.5,
                          border: '2px solid',
                          borderColor: pollData.subject === subject ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)',
                          background: pollData.subject === subject 
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)' 
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                          color: 'white',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          minHeight: 90,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          perspective: '1000px',
                          '&:hover': {
                            borderColor: '#f59e0b',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))',
                            transform: 'translateY(-5px) rotateX(5deg)',
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: '4px',
                            background: pollData.subject === subject 
                              ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                              : 'transparent',
                            transition: 'all 0.3s ease',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: pollData.subject === subject 
                              ? 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)'
                              : 'transparent',
                            transform: 'translateX(-100%)',
                            transition: 'transform 0.6s',
                          },
                          '&:hover::before': {
                            transform: 'translateX(100%)',
                          }
                        }}
                      >
                        {pollData.subject === subject && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.95)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 2,
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                            }}
                          >
                            <Check size={14} color="#f59e0b" />
                          </motion.div>
                        )}
                        <motion.div
                          animate={{ 
                            textShadow: pollData.subject === subject 
                              ? '0 0 25px rgba(245, 158, 11, 0.9)' 
                              : 'none',
                            scale: pollData.subject === subject ? [1, 1.05, 1] : 1
                          }}
                          transition={{ duration: 2, repeat: pollData.subject === subject ? Infinity : 0 }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {subject === 'Mathematics' && '📐'}
                            {subject === 'Physics' && '⚛️'}
                            {subject === 'Chemistry' && '🧪'}
                            {subject === 'Computer Science' && '💻'}
                            {subject === 'Biology' && '🔬'}
                            {subject === 'English' && '📚'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                            {subject}
                          </Typography>
                        </motion.div>
                      </motion.div>
                    ))}
                  </Box>
                  {formErrors.subject && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block', fontWeight: 600 }}>
                        ⚠️ {formErrors.subject}
                      </Typography>
                    </motion.div>
                  )}
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Bottom Section - Poll Options */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Paper
                sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #f59e0b, #ef4444, #ec4899)',
                  }
                }}
                onMouseEnter={() => setHoveredField('options')}
                onMouseLeave={() => setHoveredField(null)}
              >
                {hoveredField === 'options' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                    }}
                  >
                    <CheckCircle size={16} color="#f59e0b" />
                  </motion.div>
                )}

                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle size={20} color="#f59e0b" />
                  Poll Options
                </Typography>

                <Grid container spacing={2}>
                  {pollData.options.map((option, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            flexShrink: 0
                          }}>
                            {index + 1}
                          </Box>
                          <Box sx={{ flex: 1, position: 'relative' }}>
                            <TextField
                              fullWidth
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              error={!!formErrors[`option${index}`]}
                              helperText={formErrors[`option${index}`]}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  cursor: 'text',
                                  position: 'relative',
                                  '& fieldset': { 
                                    borderColor: 'rgba(245, 158, 11, 0.3)',
                                    transition: 'all 0.3s ease'
                                  },
                                  '&:hover fieldset': { 
                                    borderColor: 'rgba(245, 158, 11, 0.5)',
                                    cursor: 'text'
                                  },
                                  '&.Mui-focused fieldset': { 
                                    borderColor: '#f59e0b',
                                    cursor: 'text'
                                  },
                                  '& input': {
                                    cursor: 'text !important',
                                    position: 'relative',
                                    zIndex: 2,
                                    '&:hover': {
                                      cursor: 'text !important'
                                    }
                                  },
                                  '& .MuiInputBase-input': {
                                    cursor: 'text !important',
                                    color: 'white',
                                    position: 'relative',
                                    zIndex: 2,
                                    '&:hover': {
                                      cursor: 'text !important'
                                    },
                                    '&:focus': {
                                      cursor: 'text !important'
                                    }
                                  },
                                  '& .MuiInputLabel-root': { 
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    cursor: 'text',
                                    position: 'relative',
                                    zIndex: 2
                                  },
                                  '& .MuiFormHelperText-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    position: 'relative',
                                    zIndex: 2
                                  }
                                }
                              }}
                              InputProps={{
                                style: { 
                                  cursor: 'text',
                                  position: 'relative',
                                  zIndex: 2
                                },
                                onClick: (e) => {
                                  e.target.focus();
                                  e.target.select();
                                }
                              }}
                            />
                            {/* Full field clickable overlay */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                cursor: 'text',
                                zIndex: 3,
                                backgroundColor: 'transparent',
                                '&:hover': {
                                  cursor: 'text',
                                  backgroundColor: 'rgba(245, 158, 11, 0.02)'
                                },
                                '&:active': {
                                  backgroundColor: 'rgba(245, 158, 11, 0.05)'
                                }
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const input = e.currentTarget.parentElement.querySelector('input');
                                if (input) {
                                  input.focus();
                                  input.select();
                                }
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const input = e.currentTarget.parentElement.querySelector('input');
                                if (input) {
                                  input.focus();
                                  input.select();
                                }
                              }}
                            />
                          </Box>
                          {pollData.options.length > 2 && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <IconButton
                                onClick={() => removeOption(index)}
                                sx={{ 
                                  color: '#ef4444',
                                  flexShrink: 0,
                                  '&:hover': { 
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    cursor: 'pointer'
                                  }
                                }}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </motion.div>
                          )}
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                {pollData.options.length < 10 && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={addOption}
                      sx={{ 
                        color: '#f59e0b',
                        borderColor: '#f59e0b',
                        mt: 2,
                        width: '100%',
                        py: 1.5,
                        borderRadius: 2,
                        borderStyle: 'dashed',
                        '&:hover': {
                          background: 'rgba(245, 158, 11, 0.1)',
                          borderColor: '#d97706',
                        },
                      }}
                      variant="outlined"
                      startIcon={<Plus size={16} />}
                    >
                      Add Option
                    </Button>
                  </motion.div>
                )}

                {formErrors.options && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {formErrors.options}
                  </Typography>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Error Display */}
        {Object.keys(formErrors).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ mt: 3 }}
          >
            <Alert severity="error" sx={{ mb: 2 }}>
              Please fill in all required fields correctly
            </Alert>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
          sx={{ 
            mt: 6, 
            display: 'flex', 
            flexDirection: 'row',
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '4px',
              background: 'linear-gradient(90deg, transparent, #9333ea, transparent)',
              borderRadius: '2px',
              animation: 'pulse 2s infinite'
            },
            '@keyframes pulse': {
              '0%': { opacity: 0.3, transform: 'translateX(-50%) scaleX(0.5)' },
              '50%': { opacity: 1, transform: 'translateX(-50%) scaleX(1)' },
              '100%': { opacity: 0.3, transform: 'translateX(-50%) scaleX(0.5)' }
            }
          }}
        >
          {/* Cancel Button - Right Side */}
          <motion.div
            whileHover={{ 
              scale: 1.05, 
              y: -3,
              boxShadow: '0 15px 35px rgba(239, 68, 68, 0.3)'
            }}
            whileTap={{ scale: 0.95, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{ order: 2 }}
          >
            <Button
              onClick={onCancel}
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(239, 68, 68, 0.5)',
                borderWidth: 2,
                px: 4,
                py: 2,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 3,
                textTransform: 'none',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: '#ef4444',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 35px rgba(239, 68, 68, 0.4)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: -100,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    animation: 'shimmer 0.6s ease-out'
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(239, 68, 68, 0.1) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s'
                },
                '&:hover::before': {
                  transform: 'translateX(100%)'
                },
                '@keyframes shimmer': {
                  '0%': { left: '-100%' },
                  '100%': { left: '100%' }
                }
              }}
              variant="outlined"
              size="large"
              startIcon={
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Box sx={{ 
                    width: 18, 
                    height: 18, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography sx={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>
                      ✕
                    </Typography>
                  </Box>
                </motion.div>
              }
            >
              <Typography sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                Cancel
              </Typography>
            </Button>
          </motion.div>

          {/* Create Poll Button - Left Side */}
          <motion.div
            whileHover={{ 
              scale: 1.08, 
              y: -5,
              boxShadow: '0 20px 45px rgba(16, 185, 129, 0.5)'
            }}
            whileTap={{ scale: 0.95, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{ order: 1 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{ 
                background: isSubmitting 
                  ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                color: 'white',
                border: 'none',
                px: 6,
                py: 2.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 3,
                textTransform: 'none',
                position: 'relative',
                overflow: 'hidden',
                minWidth: '200px',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  background: isSubmitting 
                    ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                    : 'linear-gradient(135deg, #059669, #047857, #065f46)',
                  transform: 'translateY(-5px)',
                  boxShadow: '0 20px 45px rgba(16, 185, 129, 0.5)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: -100,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    animation: 'shimmer 0.6s ease-out'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
                    animation: 'pulse 2s infinite'
                  }
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                  cursor: 'not-allowed',
                  opacity: 0.7,
                  '&:hover': {
                    transform: 'none',
                    boxShadow: '0 8px 25px rgba(107, 114, 128, 0.3)'
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s'
                },
                '&:hover::before': {
                  transform: 'translateX(100%)'
                },
                '@keyframes shimmer': {
                  '0%': { left: '-100%' },
                  '100%': { left: '100%' }
                },
                '@keyframes pulse': {
                  '0%': { opacity: 0.3, transform: 'scale(0.8)' },
                  '50%': { opacity: 0.6, transform: 'scale(1)' },
                  '100%': { opacity: 0.3, transform: 'scale(0.8)' }
                }
              }}
              variant="contained"
              size="large"
              startIcon={
                isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <CircularProgress size={20} color="inherit" thickness={3} />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #ffffff, #e5e7eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}>
                      <CheckCircle size={16} color="#10b981" />
                    </Box>
                  </motion.div>
                )
              }
            >
              <motion.div
                animate={{ 
                  textShadow: isSubmitting 
                    ? 'none' 
                    : '0 0 20px rgba(16, 185, 129, 0.8)'
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Typography sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
                  {isSubmitting ? 'Creating...' : 'Create Poll'}
                </Typography>
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default BeautifulPollCreator;
