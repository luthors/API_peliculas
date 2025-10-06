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
import Catalog from './pages/Catalog';
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
        <Routes>
          {/* Public catalog route - accessible without admin layout */}
          <Route path="/catalog" element={<Catalog />} />
          
          {/* Default route redirects to catalog for public users */}
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          
          {/* Admin routes with layout */}
          <Route path="/admin/*" element={
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="genres" element={<Genres />} />
                  <Route path="directors" element={<Directors />} />
                  <Route path="producers" element={<Producers />} />
                  <Route path="types" element={<Types />} />
                  <Route path="media" element={<Media />} />
                </Routes>
              </Layout>
            </Box>
          } />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/genres" element={<Navigate to="/admin/genres" replace />} />
          <Route path="/directors" element={<Navigate to="/admin/directors" replace />} />
          <Route path="/producers" element={<Navigate to="/admin/producers" replace />} />
          <Route path="/types" element={<Navigate to="/admin/types" replace />} />
          <Route path="/media" element={<Navigate to="/admin/media" replace />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
