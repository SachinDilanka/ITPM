import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Brain,
  CheckCircle,
  Lightbulb,
  X,
  RefreshCw,
  Target,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '../../config/api';

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
      const response = await fetch(apiUrl('/api/ai/correct-poll'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: poll?.title,
          options: poll?.options ? poll.options.map((opt) => opt.text || opt) : [],
          subject: poll?.subject || 'General',
          description: poll?.description || '',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCorrection(data.data);
        setShowResult(true);
        if (onCorrectionReceived) {
          onCorrectionReceived(data.data);
          if (data.data.correctAnswer >= 0 && !poll?.hasVoted) {
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
      <Tooltip
        title="AI will analyze the poll and suggest the most likely correct answer based on the question and options."
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
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
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
            background: loading
              ? 'linear-gradient(45deg, #6366f1, #8b5cf6)'
              : 'linear-gradient(45deg, #ec4899, #f43f5e)',
            color: '#ffffff',
            borderRadius: 1.5,
            boxShadow: loading
              ? '0 2px 8px rgba(139, 92, 246, 0.3)'
              : '0 2px 8px rgba(236, 72, 153, 0.3)',
            '&:hover': {
              background: loading
                ? 'linear-gradient(45deg, #4f46e5, #7c3aed)'
                : 'linear-gradient(45deg, #db2777, #e11d48)',
              boxShadow: loading
                ? '0 4px 12px rgba(139, 92, 246, 0.4)'
                : '0 4px 12px rgba(236, 72, 153, 0.4)',
              transform: 'scale(1.02)',
            },
            '&:disabled': {
              background: 'linear-gradient(45deg, #6b7280, #9ca3af)',
              color: 'rgba(255, 255, 255, 0.6)',
              boxShadow: 'none',
            },
          }}
        >
          {loading ? 'AI Analyzing...' : 'AI Correct Answer'}
        </Button>
      </Tooltip>

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

      <AnimatePresence>
        {showResult && correction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
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
                animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Brain size={20} color="#9333ea" />
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

              {correction.correctAnswer >= 0 && (
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
                      <Typography
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          background: 'linear-gradient(45deg, #10b981, #059669)',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        ✓ Selected
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} color={answerSelected ? '#059669' : '#10b981'} />
                      <Typography
                        variant="body1"
                        sx={{ color: answerSelected ? '#059669' : '#10b981', fontWeight: 'bold' }}
                      >
                        Option {correction.correctAnswer + 1}
                        {answerSelected && ' - Automatically Selected'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {poll?.options && poll.options[correction.correctAnswer]
                        ? poll.options[correction.correctAnswer].text ||
                          poll.options[correction.correctAnswer]
                        : 'Option not available'}
                    </Typography>
                    {answerSelected && (
                      <Typography variant="caption" color="#10b981" sx={{ mt: 1, display: 'block', fontWeight: 'bold' }}>
                        AI has automatically selected this answer for you!
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}

              {correction.correctAnswer === -1 && (
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
                      <Lightbulb size={16} color="#3b82f6" />
                      <Typography variant="body1" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
                        Analysis & Guidance
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Open-ended question: the AI provides guidance rather than a single option index.
                    </Typography>
                  </Paper>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  AI Reasoning:
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                  {correction.reasoning}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Explanation:
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ fontStyle: 'italic' }}>
                  {correction.explanation}
                </Typography>
              </Box>

              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleAICorrection}
                  startIcon={<RefreshCw size={14} />}
                  sx={{
                    color: '#9333ea',
                    '&:hover': { background: 'rgba(147, 51, 234, 0.1)' },
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
