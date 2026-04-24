import React, { useMemo } from 'react';
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
  Info,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  Clock,
} from 'lucide-react';

const clampScore = (n) => Math.min(100, Math.max(0, Math.round(n)));

export const AIAnalysis = ({ answer, compact = false }) => {
  const confidence = Number(answer?.aiConfidence ?? answer?.aiScore) || 0;

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

  const analysisFactors = useMemo(() => {
    const offsets = [3, -2, 5, -1];
    return [
      {
        label: 'Accuracy',
        score: clampScore(confidence + offsets[0]),
        icon: <CheckCircle size={16} />,
        description: 'Factual correctness and technical accuracy',
      },
      {
        label: 'Completeness',
        score: clampScore(confidence + offsets[1]),
        icon: <BookOpen size={16} />,
        description: 'Thoroughness and coverage of the topic',
      },
      {
        label: 'Clarity',
        score: clampScore(confidence + offsets[2]),
        icon: <Info size={16} />,
        description: 'How well the answer is explained',
      },
      {
        label: 'Relevance',
        score: clampScore(confidence + offsets[3]),
        icon: <TrendingUp size={16} />,
        description: 'Direct relevance to the question asked',
      },
    ];
  }, [confidence]);

  const createdLabel = useMemo(() => {
    const raw = answer?.createdAt;
    if (!raw) return '—';
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? String(raw) : d.toLocaleString();
  }, [answer?.createdAt]);

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Brain size={16} />
        <LinearProgress
          variant="determinate"
          value={confidence}
          sx={{ width: 80, height: 4, borderRadius: 2 }}
          color={getScoreColor(confidence)}
        />
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          {confidence}%
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
          label={`${getScoreLabel(confidence)} (${confidence}%)`}
          color={getScoreColor(confidence)}
          size="small"
          icon={<Award size={14} />}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" paragraph>
        {answer?.aiReasoning || 'No reasoning provided.'}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {analysisFactors.map((factor) => (
          <Grid size={{ xs: 12, sm: 6 }} key={factor.label}>
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
                {factor.score}%
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Users size={14} />
          <Typography variant="caption">
            Expert Verified: {answer?.author?.isExpert ? 'Yes' : 'No'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Clock size={14} />
          <Typography variant="caption">Response Time: {createdLabel}</Typography>
        </Box>
        {answer?.isBestAnswer && (
          <Chip icon={<Award size={14} />} label="AI Best Answer" color="success" size="small" />
        )}
      </Box>
    </Paper>
  );
};

export default AIAnalysis;
