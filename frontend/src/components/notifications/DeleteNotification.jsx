import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Button,
  Fade,
  Slide,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import { Delete, Undo, Close, CheckCircle, Error, Warning, Info, DeleteSweep } from '@mui/icons-material';

const DeleteNotification = ({
  open,
  onClose,
  message,
  severity = 'info',
  action,
  undo,
  autoHideDuration = 6000,
  showProgress = true,
  itemName = '',
}) => {
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(autoHideDuration);

  useEffect(() => {
    if (!open || !showProgress) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 100;
        if (newTime <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        setProgress((newTime / autoHideDuration) * 100);
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [open, autoHideDuration, onClose, showProgress]);

  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 20, color: '#4caf50' }} />;
      case 'error':
        return <Error sx={{ fontSize: 20, color: '#f44336' }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 20, color: '#ff9800' }} />;
      default:
        return <Info sx={{ fontSize: 20, color: '#2196f3' }} />;
    }
  };

  const getBackground = () => {
    switch (severity) {
      case 'success':
        return 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)';
      case 'error':
        return 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)';
      case 'delete':
        return 'linear-gradient(135deg, #8b1538 0%, #d81b60 100%)';
      default:
        return 'linear-gradient(135deg, #2196f3 0%, #03a9f4 100%)';
    }
  };

  const getTextColor = () => '#ffffff';

  const getAccentColor = () => {
    switch (severity) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#9333ea';
      case 'warning':
        return '#ff9800';
      case 'delete':
        return '#ec4899';
      default:
        return '#2196f3';
    }
  };

  const handleUndo = () => {
    if (undo) undo();
    onClose();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        maxWidth: 400,
      }}
    >
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            background: getBackground(),
            borderRadius: 3,
            overflow: 'hidden',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.02)' },
              '100%': { transform: 'scale(1)' },
            },
          }}
        >
          {showProgress && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                '& .MuiLinearProgress-bar': {
                  background: severity === 'delete' ? getAccentColor() : 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 0,
                  transition: 'all 0.1s linear',
                },
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                height: 3,
              }}
            />
          )}

          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                {severity === 'delete' ? (
                  <DeleteSweep
                    sx={{
                      fontSize: 28,
                      color: getAccentColor(),
                      animation: 'pulse 2s infinite',
                      filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))',
                    }}
                  />
                ) : (
                  getIcon()
                )}
              </Box>

              <Box sx={{ flex: 1, color: getTextColor() }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    color: getTextColor(),
                    fontSize: '14px',
                    textShadow: severity === 'delete' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  {message}
                </Typography>

                {itemName && (
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.9,
                      mb: 1.5,
                      color: getTextColor(),
                      fontSize: '12px',
                      fontWeight: 500,
                      background: severity === 'delete' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'inline-block',
                    }}
                  >
                    {itemName}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 2 }}>
                  {undo && showProgress && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Undo sx={{ fontSize: 14 }} />}
                      onClick={handleUndo}
                      sx={{
                        color: getTextColor(),
                        borderColor: severity === 'delete' ? getAccentColor() : 'rgba(255, 255, 255, 0.5)',
                        fontSize: '11px',
                        py: 0.6,
                        px: 1.8,
                        borderRadius: 6,
                        textTransform: 'none',
                        fontWeight: 600,
                        background: severity === 'delete' ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                        borderWidth: severity === 'delete' ? '2px' : '1px',
                        '&:hover': {
                          borderColor: getAccentColor(),
                          background: severity === 'delete' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                        },
                      }}
                    >
                      Undo
                    </Button>
                  )}

                  {action && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={action}
                      sx={{
                        background: severity === 'delete' ? getAccentColor() : 'rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        fontSize: '11px',
                        py: 0.6,
                        px: 1.8,
                        borderRadius: 6,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          background: severity === 'delete' ? '#d81b60' : 'rgba(255, 255, 255, 0.3)',
                        },
                      }}
                    >
                      Action
                    </Button>
                  )}

                  <Chip
                    label={`${Math.ceil(timeLeft / 1000)}s`}
                    size="small"
                    sx={{
                      background: severity === 'delete' ? getAccentColor() : 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      fontSize: '10px',
                      height: 22,
                      ml: 'auto',
                      borderRadius: 11,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>

              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  color: getTextColor(),
                  opacity: 0.8,
                  '&:hover': {
                    color: getAccentColor(),
                    opacity: 1,
                    transform: 'rotate(90deg) scale(1.1)',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Close sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
};

export const DeleteConfirmNotification = ({ open, onClose, itemName, onConfirm, onCancel }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        minWidth: 380,
      }}
    >
      <Fade in={open} timeout={300}>
        <Paper
          elevation={16}
          sx={{
            background: 'linear-gradient(135deg, #8b1538 0%, #d81b60 100%)',
            borderRadius: 16,
            p: 4,
            textAlign: 'center',
            animation: 'glow 2s ease-in-out infinite alternate',
            '@keyframes glow': {
              '0%': {
                boxShadow:
                  '0 0 30px rgba(236, 72, 153, 0.4), 0 0 60px rgba(236, 72, 153, 0.2), inset 0 0 30px rgba(236, 72, 153, 0.1)',
              },
              '100%': {
                boxShadow:
                  '0 0 40px rgba(236, 72, 153, 0.6), 0 0 80px rgba(236, 72, 153, 0.3), inset 0 0 40px rgba(236, 72, 153, 0.2)',
              },
            },
          }}
        >
          <DeleteSweep
            sx={{
              fontSize: 56,
              color: '#ec4899',
              mb: 3,
              animation: 'pulse 1.5s infinite',
              filter: 'drop-shadow(0 0 20px rgba(236, 72, 153, 0.8))',
            }}
          />

          <Typography
            variant="h5"
            sx={{
              color: '#ffffff',
              mb: 2,
              fontWeight: 'bold',
              fontSize: '24px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Delete Confirmation
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              mb: 4,
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            Are you sure you want to delete
            <Box
              component="span"
              sx={{
                color: '#ec4899',
                fontWeight: 'bold',
                mx: 1,
                fontSize: '18px',
                textShadow: '0 0 10px rgba(236, 72, 153, 0.6)',
              }}
            >
              &quot;{itemName}&quot;
            </Box>
            ?
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.6)',
                color: '#ffffff',
                borderRadius: 10,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                py: 1.2,
                px: 2.5,
                borderWidth: 2,
                '&:hover': {
                  borderColor: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              startIcon={<Delete />}
              onClick={onConfirm}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.6)',
                color: '#ffffff',
                borderRadius: 10,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                py: 1.2,
                px: 2.5,
                borderWidth: 2,
                '&:hover': {
                  borderColor: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              Delete
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default DeleteNotification;
