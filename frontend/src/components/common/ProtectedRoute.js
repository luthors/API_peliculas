import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Componente ProtectedRoute
 * Protege rutas que requieren autenticación
 * Redirige al login si el usuario no está autenticado
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Componentes hijos a renderizar
 * @param {string[]} props.roles - Roles permitidos (opcional)
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar roles si se especificaron
  if (roles.length > 0 && user) {
    const hasRequiredRole = roles.includes(user.role);

    if (!hasRequiredRole) {
      // Redirigir al catálogo si no tiene el rol requerido
      return <Navigate to="/catalog" replace />;
    }
  }

  // Usuario autenticado y con rol correcto, renderizar children
  return <>{children}</>;
};

export default ProtectedRoute;
