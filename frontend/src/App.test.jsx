import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { createKnowVerseTheme } from './theme';

/**
 * Full <App /> pulls the whole route tree (MUI icons, etc.) and can hit EMFILE on Windows in Vitest.
 * Use a light smoke test here; add route-level tests in smaller modules if needed.
 */
describe('App / theme smoke', () => {
  it('KnowVerse theme uses dark mode', () => {
    const theme = createKnowVerseTheme();
    expect(theme.palette.mode).toBe('dark');
  });

  it('renders content inside ThemeProvider', () => {
    const theme = createKnowVerseTheme();
    render(
      <ThemeProvider theme={theme}>
        <Typography>KnowVerse</Typography>
      </ThemeProvider>
    );
    expect(screen.getByText('KnowVerse')).toBeInTheDocument();
  });
});
