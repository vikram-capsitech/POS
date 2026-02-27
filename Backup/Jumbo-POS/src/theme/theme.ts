import { createTheme, ThemeOptions } from '@mui/material/styles';

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#ea580c', // Orange from original
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#ea580c',
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b',   // Slate 800
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
  },
});

export const customTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark', // Custom premium dark
    primary: {
      main: '#8b5cf6', // Violet
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    secondary: {
      main: '#ec4899', // Pink
    },
    background: {
      default: '#09090b', // Zinc 950
      paper: '#18181b',   // Zinc 900
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
    },
    action: {
      active: '#8b5cf6',
      hover: 'rgba(139, 92, 246, 0.08)',
    },
  },
  components: {
    ...baseTheme.components,
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'linear-gradient(45deg, #8b5cf6 30%, #ec4899 90%)',
          border: 0,
          color: 'white',
          height: 48,
          padding: '0 30px',
          boxShadow: '0 3px 5px 2px rgba(139, 92, 246, .3)',
          '&:hover': {
            boxShadow: '0 6px 12px 4px rgba(139, 92, 246, .4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(24, 24, 27, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
});

export type ThemeMode = 'light' | 'dark' | 'custom';
