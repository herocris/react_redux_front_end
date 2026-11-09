import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    mode: 'light',
    toggleMode: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);
