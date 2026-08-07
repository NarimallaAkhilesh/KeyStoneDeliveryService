import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0',
      light: '#1E88E5',
      dark: '#0D47A1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00BCD4',
      light: '#4DD0E1',
      dark: '#0097A7',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2E7D32',
      light: '#43A047',
      dark: '#1B5E20',
    },
    warning: {
      main: '#F57F17',
      light: '#FFA726',
      dark: '#E65100',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
      dark: '#B71C1C',
    },
    background: {
      default: '#F0F2F5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#546E7A',
    },
    divider: '#E0E7EF',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 700, letterSpacing: '-0.5px' },
    h2: { fontWeight: 700, letterSpacing: '-0.25px' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0px 1px 4px rgba(0,0,0,0.06)',
    '0px 2px 8px rgba(0,0,0,0.08)',
    '0px 4px 16px rgba(0,0,0,0.10)',
    '0px 6px 20px rgba(0,0,0,0.12)',
    '0px 8px 24px rgba(0,0,0,0.14)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'Inter', sans-serif",
          backgroundColor: '#F0F2F5',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1E88E5, #1565C0)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid #E0E7EF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, borderRadius: 6 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& th': {
            backgroundColor: '#EEF2FF',
            fontWeight: 600,
            color: '#1a1a2e',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#F8FAFF' },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;
