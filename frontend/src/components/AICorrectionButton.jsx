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
  const [answerSelected, setAnswerSelected] = useState(false);

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
        
        // Call the callback and check if answer was selected
        if (onCorrectionReceived) {
          onCorrectionReceived(data.data);
          
          // Check if AI provided a valid answer and user hasn't voted
          if (data.data.correctAnswer >= 0 && !poll.hasVoted) {
            setAnswerSelected(true);
          }
        }
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
      <Tooltip 
        title="AI will analyze the poll and automatically select the most likely correct answer for you"
        arrow
        placement="top"
      >
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={handleAICorrection}
            disabled={disabled || loading}
            startIcon={
              loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ pointerEvents: 'none' }}
                >
                  <Brain size={16} />
                </motion.div>
              ) : (
                <Brain size={16} />
              )
            }
            sx={{
              textTransform: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              py: 1.5,
              px: 3,
              minHeight: '40px',
              minWidth: '100%',
              width: '100%',
              background: loading 
                ? 'linear-gradient(45deg, #6366f1, #8b5cf6)' 
                : 'linear-gradient(45deg, #ec4899, #f43f5e)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 1.5,
              boxShadow: loading 
                ? '0 2px 8px rgba(139, 92, 246, 0.3)' 
                : '0 2px 8px rgba(236, 72, 153, 0.3)',
              cursor: 'pointer',
              pointerEvents: disabled || loading ? 'none' : 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              '&:hover': {
                background: loading 
                  ? 'linear-gradient(45deg, #4f46e5, #7c3aed)' 
                  : 'linear-gradient(45deg, #db2777, #e11d48)',
                boxShadow: loading 
                  ? '0 4px 12px rgba(139, 92, 246, 0.4)' 
                  : '0 4px 12px rgba(236, 72, 153, 0.4)',
                transform: 'scale(1.02)'
              },
              '&:active': {
                transform: 'scale(0.98)'
              },
              '&:disabled': {
                background: 'linear-gradient(45deg, #6b7280, #9ca3af)',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'not-allowed',
                boxShadow: 'none',
                pointerEvents: 'none'
              },
              '& .MuiButton-startIcon': {
                marginRight: '8px',
                pointerEvents: 'none'
              },
              '& .MuiButton-label': {
                pointerEvents: 'none'
              }
            }}
          >
            {loading ? 'AI Analyzing...' : 'AI Correct Answer'}
          </Button>
      </Tooltip>

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
                        background: answerSelected 
                          ? 'linear-gradient(45deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.2))'
                          : 'linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1))',
                        border: answerSelected 
                          ? '2px solid rgba(16, 185, 129, 0.5)'
                          : '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: 1,
                        position: 'relative',
                      }}
                    >
                      {answerSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                          style={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            background: 'linear-gradient(45deg, #10b981, #059669)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                          }}
                        >
                          ✓ Selected
                        </motion.div>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <motion.div
                          animate={{
                            scale: answerSelected ? [1, 1.3, 1] : [1, 1.2, 1],
                          }}
                          transition={{
                            duration: answerSelected ? 0.8 : 1,
                            repeat: answerSelected ? 3 : Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <CheckCircle size={16} color={answerSelected ? "#059669" : "#10b981"} />
                        </motion.div>
                        <Typography variant="body1" sx={{ color: answerSelected ? "#059669" : '#10b981', fontWeight: 'bold' }}>
                          Option {correction.correctAnswer + 1}
                          {answerSelected && ' - Automatically Selected'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {poll.options && poll.options[correction.correctAnswer] ? 
                          (poll.options[correction.correctAnswer].text || poll.options[correction.correctAnswer]) : 
                          'Option not available'
                        }
                      </Typography>
                      {answerSelected && (
                        <Typography variant="caption" color="#10b981" sx={{ mt: 1, display: 'block', fontWeight: 'bold' }}>
                          AI has automatically selected this answer for you!
                        </Typography>
                      )}
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
