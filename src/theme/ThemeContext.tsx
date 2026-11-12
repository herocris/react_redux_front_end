import { useMemo, useState, type ReactNode } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ThemeContext, type ThemeMode } from './themeState';
import { esES } from '@mui/material/locale';

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
    const [mode, setMode] = useState<ThemeMode>(
        (localStorage.getItem("themeMode") as ThemeMode) || "light"
    );

    const toggleMode = () => {
        setMode((prev) => {
            const next = prev === "light" ? "dark" : "light";
            localStorage.setItem("themeMode", next);
            return next;
        });
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === "light"
                        ? {
                            background: { default: "#f5f5f5", paper: "#fff" },
                            primary: { main: "#1976d2" },
                        }
                        : {
                            background: { default: "#121212", paper: "#3b3b3bff" },
                            primary: { main: "#90caf9" },
                        }),
                },
            }, esES),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ mode, toggleMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
