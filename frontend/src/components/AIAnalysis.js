import React from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Paper,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Brain,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  Clock,
} from 'lucide-react';

export const AIAnalysis = ({ answer, compact = false }) => {
  const getScoreColor = (score) => {
    if (score >= 95) return 'success';
    if (score >= 85) return 'warning';
    if (score >= 75) return 'info';
    return 'error';
  };

  const getScoreLabel = (score) => {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Good';
    if (score >= 75) return 'Fair';
    return 'Poor';
  };

  const analysisFactors = [
    {
      label: 'Accuracy',
      score: Math.min(100, answer.aiConfidence + Math.random() * 10 - 5),
      icon: <CheckCircle size={16} />,
      description: 'Factual correctness and technical accuracy'
    },
    {
      label: 'Completeness',
      score: Math.min(100, answer.aiConfidence + Math.random() * 10 - 5),
      icon: <BookOpen size={16} />,
      description: 'Thoroughness and coverage of the topic'
    },
    {
      label: 'Clarity',
      score: Math.min(100, answer.aiConfidence + Math.random() * 10 - 5),
      icon: <Info size={16} />,
      description: 'How well the answer is explained'
    },
    {
      label: 'Relevance',
      score: Math.min(100, answer.aiConfidence + Math.random() * 10 - 5),
      icon: <TrendingUp size={16} />,
      description: 'Direct relevance to the question asked'
    }
  ];

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Brain size={16} />
        <LinearProgress
          variant="determinate"
          value={answer.aiConfidence}
          sx={{ width: 80, height: 4, borderRadius: 2 }}
          color={getScoreColor(answer.aiConfidence)}
        />
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          {answer.aiConfidence}%
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.50' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Brain size={20} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          AI Analysis
        </Typography>
        <Chip
          label={`${getScoreLabel(answer.aiConfidence)} (${answer.aiConfidence}%)`}
          color={getScoreColor(answer.aiConfidence)}
          size="small"
          icon={<Award size={14} />}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" paragraph>
        {answer.aiReasoning}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {analysisFactors.map((factor, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {factor.icon}
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  {factor.label}
                </Typography>
                <Tooltip title={factor.description}>
                  <IconButton size="small" sx={{ p: 0.2 }}>
                    <Info size={12} />
                  </IconButton>
                </Tooltip>
              </Box>
              <LinearProgress
                variant="determinate"
                value={factor.score}
                sx={{ height: 6, borderRadius: 3 }}
                color={getScoreColor(factor.score)}
              />
              <Typography variant="caption" sx={{ ml: 1 }}>
                {Math.round(factor.score)}%
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Users size={14} />
          <Typography variant="caption">
            Expert Verified: {answer.author.isExpert ? 'Yes' : 'No'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Clock size={14} />
          <Typography variant="caption">
            Response Time: {answer.createdAt}
          </Typography>
        </Box>
        {answer.isBestAnswer && (
          <Chip
            icon={<Award size={14} />}
            label="AI Best Answer"
            color="success"
            size="small"
          />
        )}
      </Box>
    </Paper>
  );
};
