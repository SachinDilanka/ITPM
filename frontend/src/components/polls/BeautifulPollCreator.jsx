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
  Sparkles,
  Target,
  Zap,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';

const BeautifulPollCreator = ({ currentUser, onCreatePoll, isSubmitting, onCancel }) => {
  const [pollData, setPollData] = useState({
    title: '',
    description: '',
    year: '',
    semester: '',
    subject: '',
    isMultipleChoice: false,
    options: ['', '', '', ''],
  });

  const [formErrors, setFormErrors] = useState({});
  const [hoveredField, setHoveredField] = useState(null);

  const subjects = [
    'Introduction to Programming',
    'Network Design and Management',
    'Database Systems',
    'Programming Applications and Frameworks',
  ];

  const handleFieldChange = (field, value) => {
    const processedValue =
      (field === 'year' || field === 'semester') && value !== '' ? parseInt(value, 10) : value;

    setPollData((prev) => ({ ...prev, [field]: processedValue }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...pollData.options];
    updatedOptions[index] = value;
    setPollData((prev) => ({ ...prev, options: updatedOptions }));
  };

  const addOption = () => {
    if (pollData.options.length < 10) {
      setPollData((prev) => ({ ...prev, options: [...prev.options, ''] }));
    }
  };

  const removeOption = (index) => {
    if (pollData.options.length > 2) {
      const updatedOptions = pollData.options.filter((_, i) => i !== index);
      setPollData((prev) => ({ ...prev, options: updatedOptions }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!pollData.title.trim()) errors.title = 'Poll title is required';
    if (!pollData.description.trim()) errors.description = 'Description is required';
    if (!pollData.year) errors.year = 'Please select a year';
    if (!pollData.semester) errors.semester = 'Please select a semester';
    if (!pollData.subject) errors.subject = 'Please select a subject';

    const validOptions = pollData.options.filter((opt) => opt.trim());
    if (validOptions.length < 2) errors.options = 'At least 2 valid options are required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const validOptions = pollData.options.filter((opt) => opt.trim());
      onCreatePoll({
        ...pollData,
        options: validOptions,
        author: currentUser?.id,
      });
    }
  };

  const years = [1, 2, 3, 4];
  const semesters = [1, 2];

  const selectCardSx = (selected, accent) => ({
    position: 'relative',
    p: 3,
    borderRadius: 3,
    border: '3px solid',
    borderColor: selected ? accent : 'rgba(255, 255, 255, 0.2)',
    background: selected
      ? `linear-gradient(135deg, ${accent} 0%, ${accent} 100%)`
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
    color: 'white',
    textAlign: 'center',
    cursor: 'pointer',
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    userSelect: 'none',
    transition: 'border-color 0.2s, transform 0.2s',
    '&:hover': {
      borderColor: accent,
      transform: 'translateY(-4px)',
    },
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
            <Sparkles size={32} color="#9333ea" />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #9333ea, #ec4899, #3b82f6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Create Amazing Poll
            </Typography>
            <Target size={32} color="#ec4899" />
          </Box>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
            Design engaging polls for your academic community
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Fill in the details below to create your interactive poll
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: 3,
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
                },
              }}
              onMouseEnter={() => setHoveredField('basic')}
              onMouseLeave={() => setHoveredField(null)}
            >
              {hoveredField === 'basic' && (
                <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                  <Edit3 size={16} color="#9333ea" />
                </Box>
              )}

              <Typography
                variant="h6"
                sx={{ color: 'white', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
              >
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
                  <Typography sx={{ color: 'white' }}>Allow multiple selections</Typography>
                }
              />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 3,
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
                },
              }}
              onMouseEnter={() => setHoveredField('academic')}
              onMouseLeave={() => setHoveredField(null)}
            >
              {hoveredField === 'academic' && (
                <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                  <BookOpen size={16} color="#10b981" />
                </Box>
              )}

              <Typography
                variant="h6"
                sx={{ color: 'white', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Star size={20} color="#3b82f6" />
                Academic Details
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calendar size={18} />
                  Academic Year
                  {pollData.year ? (
                    <Chip label="✓ Selected" size="small" sx={{ ml: 1, bgcolor: '#10b981', color: 'white' }} />
                  ) : null}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  {years.map((year) => (
                    <Box
                      key={year}
                      onClick={() => handleFieldChange('year', year)}
                      sx={selectCardSx(pollData.year === year, '#059669')}
                    >
                      {pollData.year === year && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.95)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={16} color="#10b981" />
                        </Box>
                      )}
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {year}
                      </Typography>
                      <Typography variant="caption">Year {year}</Typography>
                    </Box>
                  ))}
                </Box>
                {formErrors.year && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {formErrors.year}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={18} />
                  Semester
                  {pollData.semester ? (
                    <Chip label="✓ Selected" size="small" sx={{ ml: 1, bgcolor: '#3b82f6', color: 'white' }} />
                  ) : null}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  {semesters.map((semester) => (
                    <Box
                      key={semester}
                      onClick={() => handleFieldChange('semester', semester)}
                      sx={{ ...selectCardSx(pollData.semester === semester, '#3b82f6'), position: 'relative' }}
                    >
                      {pollData.semester === semester && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.95)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={16} color="#3b82f6" />
                        </Box>
                      )}
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {semester}
                      </Typography>
                      <Typography variant="caption">{semester === 1 ? 'First' : 'Second'}</Typography>
                    </Box>
                  ))}
                </Box>
                {formErrors.semester && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {formErrors.semester}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookOpen size={18} />
                  Subject
                  {pollData.subject ? (
                    <Chip label="✓ Selected" size="small" sx={{ ml: 1, bgcolor: '#f59e0b', color: 'white' }} />
                  ) : null}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                  {subjects.map((subject) => (
                    <Box
                      key={subject}
                      onClick={() => handleFieldChange('subject', subject)}
                      sx={{
                        ...selectCardSx(pollData.subject === subject, '#f59e0b'),
                        minHeight: 80,
                        p: 2,
                        position: 'relative',
                      }}
                    >
                      {pollData.subject === subject && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.95)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={14} color="#f59e0b" />
                        </Box>
                      )}
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {subject}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {formErrors.subject && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {formErrors.subject}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 3,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #f59e0b, #ef4444, #ec4899)',
                },
              }}
              onMouseEnter={() => setHoveredField('options')}
              onMouseLeave={() => setHoveredField(null)}
            >
              {hoveredField === 'options' && (
                <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                  <CheckCircle size={16} color="#f59e0b" />
                </Box>
              )}

              <Typography
                variant="h6"
                sx={{ color: 'white', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <CheckCircle size={20} color="#f59e0b" />
                Poll Options
              </Typography>

              <Grid container spacing={2}>
                {pollData.options.map((option, index) => (
                  <Grid size={{ xs: 12, md: 6 }} key={index}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Box
                        sx={{
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
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <TextField
                        fullWidth
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'rgba(245, 158, 11, 0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(245, 158, 11, 0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#f59e0b' },
                          },
                          '& .MuiInputBase-input': { color: 'white' },
                        }}
                      />
                      {pollData.options.length > 2 && (
                        <IconButton onClick={() => removeOption(index)} sx={{ color: '#ef4444', flexShrink: 0 }}>
                          <Trash2 size={16} />
                        </IconButton>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {pollData.options.length < 10 && (
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
                    '&:hover': { background: 'rgba(245, 158, 11, 0.1)', borderColor: '#d97706' },
                  }}
                  variant="outlined"
                  startIcon={<Plus size={16} />}
                >
                  Add Option
                </Button>
              )}

              {formErrors.options && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {formErrors.options}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {Object.keys(formErrors).length > 0 && (
          <Alert severity="error" sx={{ mt: 3 }}>
            Please fill in all required fields correctly
          </Alert>
        )}

        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="contained"
            size="large"
            startIcon={
              isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={20} />
            }
            sx={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 'bold',
              '&:disabled': { background: '#6b7280' },
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </Button>
          <Button
            onClick={onCancel}
            variant="outlined"
            size="large"
            sx={{
              color: 'white',
              borderColor: 'rgba(239, 68, 68, 0.5)',
              textTransform: 'none',
              px: 4,
              '&:hover': { borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' },
            }}
          >
            Cancel
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default BeautifulPollCreator;
