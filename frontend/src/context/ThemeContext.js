import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
          secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2' },
          background: { default: '#f5f7fa', paper: '#ffffff' },
          text: { primary: '#1a1a2e', secondary: '#546e7a' },
        }
      : {
          primary: { main: '#90caf9', light: '#e3f2fd', dark: '#42a5f5' },
          secondary: { main: '#ce93d8', light: '#f3e5f5', dark: '#ab47bc' },
          background: { default: '#0a1929', paper: '#0d2137' },
          text: { primary: '#e0e0e0', secondary: '#b0bec5' },
        }),
  },
  typography: {
    fontFamily: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: '10px 24px', fontWeight: 600 },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
          '&:hover': { boxShadow: '0 6px 20px rgba(0,118,255,0.23)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } },
      },
    },
  },
});

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
