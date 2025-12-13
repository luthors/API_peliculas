import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/common";
import Layout from "./components/layout/Layout";
import { Dashboard, Genres, Directors, Producers, Types, Media, Catalog, Login, Register } from "./pages";
import DatabaseSeeder from "./components/admin/DatabaseSeeder";
import "./App.css";

/**
 * Main Application Component
 * Configures routing, theme, authentication, and global layout
 */
function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes - Accessible without authentication */}
            <Route path="/" element={<Catalog />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Admin Routes - Only for authenticated admins */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Box sx={{ display: "flex", minHeight: "100vh" }}>
                    <Layout>
                      <Routes>
                        {/* Admin dashboard as default */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Admin management routes */}
                        <Route path="/genres" element={<Genres />} />
                        <Route path="/directors" element={<Directors />} />
                        <Route path="/producers" element={<Producers />} />
                        <Route path="/types" element={<Types />} />
                        <Route path="/media" element={<Media />} />

                        {/* RUTA TEMPORAL PARA CARGAR DATOS */}
                        <Route path="/admin/seed" element={<DatabaseSeeder />} />

                        {/* Catch-all route redirects to dashboard */}
                        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                      </Routes>
                    </Layout>
                  </Box>
                </ProtectedRoute>
              }
            />

            {/* Catch-all route for undefined paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
