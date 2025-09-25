import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Layout from './components/layout/Layout';
import {
  Dashboard,
  Genres,
  Directors,
  Producers,
  Types,
  Media,
} from './pages';
import './App.css';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

/**
 * Main Application Component
 * Configures routing, theme, and global layout
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Layout>
            <Routes>
              {/* Default route redirects to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Main application routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/genres" element={<Genres />} />
              <Route path="/directors" element={<Directors />} />
              <Route path="/producers" element={<Producers />} />
              <Route path="/types" element={<Types />} />
              <Route path="/media" element={<Media />} />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
