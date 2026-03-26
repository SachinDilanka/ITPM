import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  Fade,
  Slide,
  Grow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Brain,
  Sparkles,
  CheckCircle,
  Lightbulb,
  X,
  RefreshCw,
  Zap,
  Target,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AICorrectionButton = ({ poll, onCorrectionReceived, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const [correction, setCorrection] = useState(null);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleAICorrection = async () => {
    setLoading(true);
    setError(null);
    setShowResult(false);

    try {
      const response = await fetch('http://localhost:5000/api/ai/correct-poll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: poll.title,
          options: poll.options ? poll.options.map(opt => opt.text || opt) : [],
          subject: poll.subject || 'General',
          description: poll.description || ''
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCorrection(data.data);
        setShowResult(true);
        onCorrectionReceived && onCorrectionReceived(data.data);
      } else {
        setError(data.error || 'Failed to get AI correction');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('AI correction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setTimeout(() => setCorrection(null), 300);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'success';
    if (confidence >= 80) return 'warning';
    return 'error';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 90) return <CheckCircle size={16} />;
    if (confidence >= 80) return <Target size={16} />;
    return <Lightbulb size={16} />;
  };

  return (
    <Box>
      {/* AI Correction Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={handleAICorrection}
          disabled={disabled || loading}
          startIcon={
            loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Brain size={16} />
              </motion.div>
            ) : (
              <Brain size={16} />
            )
          }
          sx={{
            borderColor: 'rgba(147, 51, 234, 0.5)',
            color: '#9333ea',
            background: 'linear-gradient(45deg, rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05))',
            '&:hover': {
              borderColor: '#9333ea',
              background: 'linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))',
              boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)',
            },
            '&:disabled': {
              borderColor: 'rgba(147, 51, 234, 0.3)',
              color: 'rgba(147, 51, 234, 0.5)',
            },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {loading ? 'AI Analyzing...' : 'AI Correction'}
          
          {/* Animated sparkles */}
          {!loading && (
            <motion.div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 0.3, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles size={8} color="#9333ea" opacity={0.6} />
              </motion.div>
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              severity="error" 
              sx={{ mt: 2, fontSize: '0.8rem' }}
              action={
                <IconButton size="small" onClick={() => setError(null)}>
                  <X size={16} />
                </IconButton>
              }
            >
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Correction Result */}
      <AnimatePresence>
        {showResult && correction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ 
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
          >
            <Paper
              sx={{
                mt: 2,
                p: 3,
                background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                border: '2px solid rgba(147, 51, 234, 0.3)',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Animated background effect */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #9333ea, #ec4899, #3b82f6, #9333ea)',
                  backgroundSize: '200% 100%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '200% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Brain size={20} color="#9333ea" />
                  </motion.div>
                  <Typography variant="h6" sx={{ color: '#9333ea', fontWeight: 'bold' }}>
                    AI Analysis
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={getConfidenceIcon(correction.confidence)}
                    label={`${correction.confidence}% Confidence`}
                    color={getConfidenceColor(correction.confidence)}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <IconButton size="small" onClick={handleCloseResult}>
                    <X size={16} />
                  </IconButton>
                </Box>
              </Box>

              {/* Correct Answer - Only for multiple choice questions */}
              {correction.correctAnswer >= 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Suggested Correct Answer:
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1))',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <CheckCircle size={16} color="#10b981" />
                        </motion.div>
                        <Typography variant="body1" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                          Option {correction.correctAnswer + 1}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {poll.options && poll.options[correction.correctAnswer] ? 
                          (poll.options[correction.correctAnswer].text || poll.options[correction.correctAnswer]) : 
                          'Option not available'
                        }
                      </Typography>
                    </Paper>
                  </Box>
                </motion.div>
              )}

              {/* AI Guidance - For open-ended questions */}
              {correction.correctAnswer === -1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      AI Guidance:
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Lightbulb size={16} color="#3b82f6" />
                        </motion.div>
                        <Typography variant="body1" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
                          Analysis & Guidance
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This is an open-ended question. The AI provides analysis and guidance rather than a specific answer.
                      </Typography>
                    </Paper>
                  </Box>
                </motion.div>
              )}

              {/* AI Reasoning */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    AI Reasoning:
                  </Typography>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                    {correction.reasoning}
                  </Typography>
                </Box>
              </motion.div>

              {/* Explanation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Explanation:
                  </Typography>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ fontStyle: 'italic' }}>
                    {correction.explanation}
                  </Typography>
                </Box>
              </motion.div>

              {/* Retry Button */}
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleAICorrection}
                  startIcon={<RefreshCw size={14} />}
                  sx={{ 
                    color: '#9333ea',
                    '&:hover': {
                      background: 'rgba(147, 51, 234, 0.1)',
                    }
                  }}
                >
                  Retry Analysis
                </Button>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default AICorrectionButton;
