import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
};

/**
 * Theme Provider Component
 * Manages dark/light mode with localStorage persistence
 */
export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to 'dark'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "dark";
  });

  // Persist theme changes to localStorage
  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Create theme based on current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // Light mode colors
                primary: {
                  main: "#2196f3",
                  light: "#64b5f6",
                  dark: "#1976d2",
                  contrastText: "#fff",
                },
                secondary: {
                  main: "#f50057",
                  light: "#ff4081",
                  dark: "#c51162",
                },
                background: {
                  default: "#f5f5f5",
                  paper: "#ffffff",
                  elevated: "#ffffff",
                },
                text: {
                  primary: "#212121",
                  secondary: "#757575",
                },
                divider: "rgba(0, 0, 0, 0.12)",
              }
            : {
                // Dark mode colors
                primary: {
                  main: "#90caf9",
                  light: "#e3f2fd",
                  dark: "#42a5f5",
                  contrastText: "#000",
                },
                secondary: {
                  main: "#f48fb1",
                  light: "#ffc1e3",
                  dark: "#bf5f82",
                },
                background: {
                  default: "#0a0e27",
                  paper: "#151b38",
                  elevated: "#1e2746",
                },
                text: {
                  primary: "#ffffff",
                  secondary: "#b0b9c9",
                },
                divider: "rgba(255, 255, 255, 0.12)",
              }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontSize: "3rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          },
          h2: {
            fontSize: "2.5rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
          },
          h3: {
            fontSize: "2rem",
            fontWeight: 600,
          },
          h4: {
            fontSize: "1.75rem",
            fontWeight: 600,
          },
          h5: {
            fontSize: "1.5rem",
            fontWeight: 600,
          },
          h6: {
            fontSize: "1.25rem",
            fontWeight: 600,
          },
          subtitle1: {
            fontSize: "1rem",
            fontWeight: 500,
            letterSpacing: "0.01em",
          },
          subtitle2: {
            fontSize: "0.875rem",
            fontWeight: 500,
            letterSpacing: "0.01em",
          },
          body1: {
            fontSize: "1rem",
            lineHeight: 1.6,
          },
          body2: {
            fontSize: "0.875rem",
            lineHeight: 1.5,
          },
          button: {
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.02em",
          },
        },
        shape: {
          borderRadius: 12,
        },
        shadows: [
          "none",
          mode === "light" ? "0px 2px 4px rgba(0, 0, 0, 0.05)" : "0px 2px 4px rgba(0, 0, 0, 0.3)",
          mode === "light" ? "0px 4px 8px rgba(0, 0, 0, 0.08)" : "0px 4px 8px rgba(0, 0, 0, 0.4)",
          mode === "light" ? "0px 8px 16px rgba(0, 0, 0, 0.1)" : "0px 8px 16px rgba(0, 0, 0, 0.5)",
          mode === "light" ? "0px 12px 24px rgba(0, 0, 0, 0.12)" : "0px 12px 24px rgba(0, 0, 0, 0.6)",
          ...Array(20).fill(
            mode === "light" ? "0px 16px 32px rgba(0, 0, 0, 0.15)" : "0px 16px 32px rgba(0, 0, 0, 0.7)"
          ),
        ],
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                padding: "10px 24px",
                fontSize: "0.95rem",
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                },
              },
              contained: {
                boxShadow: "none",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                fontWeight: 500,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
              elevation1: {
                boxShadow: mode === "light" ? "0px 2px 4px rgba(0, 0, 0, 0.05)" : "0px 2px 4px rgba(0, 0, 0, 0.3)",
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                boxShadow: "none",
                borderBottom: `1px solid ${mode === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)"}`,
              },
            },
          },
        },
      }),
    [mode]
  );

  const value = {
    mode,
    toggleTheme,
    isDarkMode: mode === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
