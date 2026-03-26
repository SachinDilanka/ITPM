import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Fade,
  IconButton,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  DeleteSweep,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export const ActionConfirmDialog = ({ 
  open, 
  onClose, 
  title,
  message,
  itemName,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  icon,
  severity = 'warning',
  confirmColor = '#fb923c'
}) => {
  if (!open) return null;

  const getBackground = () => {
    switch (severity) {
      case 'delete':
        return 'linear-gradient(135deg, #8b1538 0%, #d81b60 100%)';
      case 'end':
        return 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)';
      default:
        return 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)';
    }
  };

  const getIconColor = () => {
    switch (severity) {
      case 'delete':
        return '#ec4899';
      case 'end':
        return '#fb923c';
      default:
        return '#fb923c';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        minWidth: 400
      }}
    >
      <Fade in={open} timeout={300}>
        <Paper
          elevation={16}
          sx={{
            background: getBackground(),
            borderRadius: 16,
            p: 4,
            textAlign: 'center',
            animation: 'glow 2s ease-in-out infinite alternate',
            '@keyframes glow': {
              '0%': { 
                boxShadow: `0 0 30px ${confirmColor}40, 0 0 60px ${confirmColor}20, inset 0 0 30px ${confirmColor}15` 
              },
              '100%': { 
                boxShadow: `0 0 40px ${confirmColor}60, 0 0 80px ${confirmColor}30, inset 0 0 40px ${confirmColor}20` 
              }
            }
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {icon || (severity === 'delete' ? (
              <DeleteSweep sx={{ 
                fontSize: 56, 
                color: getIconColor(), 
                mb: 3, 
                animation: 'pulse 1.5s infinite',
                filter: `drop-shadow(0 0 20px ${confirmColor}80)`,
              }} />
            ) : (
              <CheckCircle sx={{ 
                fontSize: 56, 
                color: getIconColor(), 
                mb: 3, 
                animation: 'pulse 1.5s infinite',
                filter: `drop-shadow(0 0 20px ${confirmColor}80)`,
              }} />
            ))}
          </motion.div>
          
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
            {title}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.95)', 
              mb: 4,
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: 1.5
            }}
          >
            {message}
            {itemName && (
              <Box 
                component="span" 
                sx={{ 
                  color: getIconColor(),
                  fontWeight: 'bold',
                  mx: 1,
                  fontSize: '18px',
                  textShadow: `0 0 10px ${confirmColor}60`
                }}
              >
                "{itemName}"
              </Box>
            )}
            ?
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={onCancel || onClose}
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              {cancelText || 'Cancel'}
            </Button>
            <Button
              variant="outlined"
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              {confirmText || 'Confirm'}
            </Button>
          </Box>
          
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                color: '#ffffff',
                opacity: 1,
                transform: 'rotate(90deg) scale(1.1)',
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Paper>
      </Fade>
    </Box>
  );
};

export default ActionConfirmDialog;
