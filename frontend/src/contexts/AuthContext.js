import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

/**
 * Contexto de Autenticación
 * Maneja el estado global de autenticación y usuario
 */

const AuthContext = createContext(null);

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

/**
 * Proveedor del contexto de autenticación
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Inicializar autenticación desde localStorage
   */
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error al inicializar autenticación:", error);
        // Limpiar localStorage si hay error
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Función de login
   */
  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authService.login(credentials);

      if (response.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      }

      throw new Error(response.message || "Error al iniciar sesión");
    } catch (err) {
      const errorMessage = err.message || "Error al iniciar sesión";
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Función de registro
   */
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authService.register(userData);

      if (response.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      }

      throw new Error(response.message || "Error al registrar usuario");
    } catch (err) {
      const errorMessage = err.message || "Error al registrar usuario";
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Función de logout
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualizar perfil del usuario
   */
  const updateProfile = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await authService.updateProfile(userData);

      if (response.success && response.data) {
        setUser(response.data);
        return { success: true, user: response.data };
      }

      throw new Error(response.message || "Error al actualizar perfil");
    } catch (err) {
      const errorMessage = err.message || "Error al actualizar perfil";
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Cambiar contraseña
   */
  const changePassword = useCallback(async (passwords) => {
    try {
      setError(null);
      const response = await authService.changePassword(passwords);
      return { success: true, message: response.message };
    } catch (err) {
      const errorMessage = err.message || "Error al cambiar contraseña";
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Recargar datos del usuario
   */
  const refreshUser = useCallback(async () => {
    try {
      setError(null);
      const response = await authService.getProfile();

      if (response.success && response.data) {
        setUser(response.data);
        return { success: true, user: response.data };
      }

      throw new Error(response.message || "Error al obtener perfil");
    } catch (err) {
      const errorMessage = err.message || "Error al obtener perfil";
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Verificar si el usuario es admin
   */
  const isAdmin = useCallback(() => {
    return user?.role === "admin";
  }, [user]);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Valor del contexto
  const value = {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    error,

    // Funciones
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    isAdmin,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
