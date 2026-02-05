import { createTheme, ThemeOptions } from '@mui/material/styles';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './AuthContext';
import { fetchRestaurantDetails } from '@/app/services/api';
import { useLocation } from 'react-router-dom';

interface ThemeContextType {
    customTheme: any;
    setCustomTheme: (theme: any) => void;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
    const { activeRestaurantId, user } = useAuth();
    const location = useLocation();
    const [currentTheme, setCurrentTheme] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const defaultTheme: ThemeOptions = {
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        shape: {
            borderRadius: 12
        },
        palette: {
            mode: 'dark',
            primary: { main: '#ea580c' },
            secondary: { main: '#ec4899' },
        },
    };

    useEffect(() => {
        const loadTheme = async () => {
            let targetId = activeRestaurantId || user?.restaurantId;

            if (!targetId) {
                const params = new URLSearchParams(window.location.search);
                targetId = params.get('restaurantId') || undefined;
            }

            if (!targetId) {
                setLoading(false);
                return;
            }

            console.log("Loading theme for Restaurant ID:", targetId);

            try {
                const data = await fetchRestaurantDetails(targetId);
                if (data && data.theme) {
                    console.log("Theme loaded:", data.theme);
                    setCurrentTheme(data.theme);
                }
            } catch (err) {
                console.error("Failed to load theme", err);
            } finally {
                setLoading(false);
            }
        };
        loadTheme();
    }, [activeRestaurantId, location.search]);

    const activeMuiTheme = createTheme({
        ...defaultTheme,
        palette: {
            mode: currentTheme?.mode || 'dark', // default to dark
            primary: {
                main: currentTheme?.primaryColor || '#ea580c',
            },
            secondary: {
                main: currentTheme?.secondaryColor || '#ec4899',
            },
            background: currentTheme?.mode === 'light' ? {
                default: '#f8fafc',
                paper: '#ffffff',
            } : {
                default: '#0f172a',
                paper: '#1e293b',
            }
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        textTransform: 'none',
                        fontWeight: 600
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none'
                    }
                }
            }
        }
    });

    return (
        <ThemeContext.Provider value={{ customTheme: currentTheme, setCustomTheme: setCurrentTheme, isLoading: loading }}>
            <ThemeProvider theme={activeMuiTheme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useCustomTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useCustomTheme must be used within a CustomThemeProvider');
    }
    return context;
};
