import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme, customTheme, ThemeMode } from './theme';

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeContextProvider');
    }
    return context;
}

interface ThemeContextProviderProps {
    children: ReactNode;
}

export function ThemeContextProvider({ children }: ThemeContextProviderProps) {
    const [mode, setMode] = useState<ThemeMode>('dark'); // Default to dark

    const theme = useMemo(() => {
        switch (mode) {
            case 'light':
                return lightTheme;
            case 'dark':
                return darkTheme;
            case 'custom':
                return customTheme;
            default:
                return darkTheme;
        }
    }, [mode]);

    return (
        <ThemeContext.Provider value={{ mode, setMode, theme }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}
