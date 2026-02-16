import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getProfile } from '../services/api';

const ThemeContext = createContext();

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState('#5240d6'); // Default purple
  const [loading, setLoading] = useState(true);

  const fetchTheme = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        
        const profile = await getProfile();
        if (profile.restaurant && profile.restaurant.theme && profile.restaurant.theme.primary) {
            setPrimaryColor(profile.restaurant.theme.primary);
        }
    } catch (error) {
        console.error("Failed to fetch theme", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--purple', primaryColor);
  }, [primaryColor]);

  const theme = createTheme({
    palette: {
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: '#10b981',
      },
      text: {
        primary: '#0f0f0f',
        secondary: '#7b7b7b',
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14, // 1.4rem -> 14px roughly if root is 10px
      htmlFontSize: 10,
    },
    components: {
       MuiButton: {
         styleOverrides: {
           root: {
             textTransform: 'none',
             borderRadius: '0.8rem',
             fontSize: '1.7rem',
             fontWeight: 500,
           }
         }
       }
    }
  });

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor, fetchTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
