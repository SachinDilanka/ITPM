import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import App from './App';
import { createKnowVerseTheme } from './theme';
import './assets/styles/global.css';
import './index.css';
import './App.css';
import reportWebVitals from './reportWebVitals';

const knowVerseTheme = createKnowVerseTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={knowVerseTheme}>
        <CssBaseline />
        <AuthProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);

if (import.meta.env.PROD) {
  reportWebVitals(console.log);
}
