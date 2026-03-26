// KnowVerse Color Theme
export const knowVerseColors = {
  // Primary Brand Colors
  primary: {
    main: '#9333ea',      // Deep Purple
    light: '#a855f7',     // Light Purple
    dark: '#7c3aed',      // Dark Purple
    gradient: 'linear-gradient(45deg, #9333ea, #ec4899)',
    gradientReverse: 'linear-gradient(45deg, #ec4899, #9333ea)'
  },

  // Secondary Brand Colors  
  secondary: {
    main: '#ec4899',      // Pink
    light: '#f472b6',     // Light Pink
    dark: '#d81b60',      // Dark Pink
    gradient: 'linear-gradient(45deg, #ec4899, #f472b6)',
    gradientReverse: 'linear-gradient(45deg, #f472b6, #ec4899)'
  },

  // Accent Colors
  accent: {
    blue: '#2196f3',      // Blue
    green: '#4caf50',     // Green
    orange: '#ff9800',    // Orange
    red: '#f44336',       // Red (for errors only)
    yellow: '#ffc107',    // Yellow (for warnings)
  },

  // Neutral Colors
  neutral: {
    black: '#000000',
    dark: '#1a1a2e',     // Dark Background
    medium: '#16213e',    // Medium Background
    light: '#0f0f23',     // Light Background
    white: '#ffffff',
    gray: '#6b7280',
    lightGray: '#9ca3af'
  },

  // Semantic Colors
  semantic: {
    success: {
      main: '#4caf50',
      light: '#8bc34a',
      gradient: 'linear-gradient(45deg, #4caf50, #8bc34a)',
      background: 'rgba(76, 175, 80, 0.1)',
      border: 'rgba(76, 175, 80, 0.3)'
    },
    error: {
      main: '#9333ea',    // Using purple instead of red for brand consistency
      light: '#ec4899',
      gradient: 'linear-gradient(45deg, #9333ea, #ec4899)',
      background: 'rgba(147, 51, 234, 0.1)',
      border: 'rgba(147, 51, 234, 0.3)'
    },
    warning: {
      main: '#ff9800',
      light: '#ffc107',
      gradient: 'linear-gradient(45deg, #ff9800, #ffc107)',
      background: 'rgba(255, 152, 0, 0.1)',
      border: 'rgba(255, 152, 0, 0.3)'
    },
    info: {
      main: '#2196f3',
      light: '#03a9f4',
      gradient: 'linear-gradient(45deg, #2196f3, #03a9f4)',
      background: 'rgba(33, 150, 243, 0.1)',
      border: 'rgba(33, 150, 243, 0.3)'
    },
    delete: {
      main: '#8b1538',    // Dark Pink for delete actions
      light: '#d81b60',
      gradient: 'linear-gradient(135deg, #8b1538 0%, #d81b60 100%)',
      background: 'rgba(139, 21, 56, 0.1)',
      border: 'rgba(139, 21, 56, 0.3)',
      text: '#000000'     // Black text on dark pink
    }
  },

  // Text Colors
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    inverse: '#000000',
    inverseSecondary: 'rgba(0, 0, 0, 0.7)',
    inverseTertiary: 'rgba(0, 0, 0, 0.5)'
  },

  // Background Colors
  background: {
    default: '#0f0f23',
    paper: '#1a1a2e',
    elevated: '#16213e',
    overlay: 'rgba(15, 15, 35, 0.8)'
  },

  // Border Colors
  border: {
    primary: 'rgba(147, 51, 234, 0.3)',
    secondary: 'rgba(236, 72, 153, 0.3)',
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.2)'
  },

  // Shadow Colors
  shadow: {
    primary: 'rgba(147, 51, 234, 0.2)',
    secondary: 'rgba(236, 72, 153, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)'
  }
};

// Material-UI Theme Configuration
export const createKnowVerseTheme = () => ({
  palette: {
    mode: 'dark',
    primary: {
      main: knowVerseColors.primary.main,
      light: knowVerseColors.primary.light,
      dark: knowVerseColors.primary.dark,
    },
    secondary: {
      main: knowVerseColors.secondary.main,
      light: knowVerseColors.secondary.light,
      dark: knowVerseColors.secondary.dark,
    },
    background: {
      default: knowVerseColors.background.default,
      paper: knowVerseColors.background.paper,
    },
    text: {
      primary: knowVerseColors.text.primary,
      secondary: knowVerseColors.text.secondary,
    },
    error: {
      main: knowVerseColors.semantic.error.main,
    },
    warning: {
      main: knowVerseColors.semantic.warning.main,
    },
    info: {
      main: knowVerseColors.semantic.info.main,
    },
    success: {
      main: knowVerseColors.semantic.success.main,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      background: knowVerseColors.primary.gradient,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontWeight: 600,
      color: knowVerseColors.text.primary,
    },
    h3: {
      fontWeight: 600,
      color: knowVerseColors.text.primary,
    },
    h4: {
      fontWeight: 500,
      color: knowVerseColors.text.primary,
    },
    body1: {
      color: knowVerseColors.text.primary,
    },
    body2: {
      color: knowVerseColors.text.secondary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.3s ease',
        },
        contained: {
          background: knowVerseColors.primary.gradient,
          '&:hover': {
            background: knowVerseColors.primary.gradientReverse,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${knowVerseColors.shadow.primary}`,
          },
        },
        outlined: {
          borderColor: knowVerseColors.border.primary,
          color: knowVerseColors.primary.main,
          '&:hover': {
            borderColor: knowVerseColors.primary.main,
            background: 'rgba(147, 51, 234, 0.05)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: knowVerseColors.background.paper,
          border: `1px solid ${knowVerseColors.border.primary}`,
          borderRadius: 12,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 24px ${knowVerseColors.shadow.primary}`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: `0 2px 8px ${knowVerseColors.shadow.dark}`,
        },
        elevation2: {
          boxShadow: `0 4px 12px ${knowVerseColors.shadow.dark}`,
        },
        elevation3: {
          boxShadow: `0 6px 16px ${knowVerseColors.shadow.dark}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        colorPrimary: {
          background: knowVerseColors.primary.gradient,
          color: knowVerseColors.text.primary,
        },
        colorSecondary: {
          background: knowVerseColors.secondary.gradient,
          color: knowVerseColors.text.primary,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: knowVerseColors.border.primary,
            },
            '&:hover fieldset': {
              borderColor: knowVerseColors.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: knowVerseColors.primary.main,
              boxShadow: `0 0 0 2px ${knowVerseColors.shadow.primary}`,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: knowVerseColors.background.paper,
          border: `1px solid ${knowVerseColors.border.primary}`,
          borderRadius: 12,
        },
      },
    },
  },
});

export default knowVerseColors;
