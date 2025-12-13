import api from "./api";

/**
 * Servicio de Autenticación
 * Maneja todas las operaciones relacionadas con autenticación de usuarios
 */

const authService = {
  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.firstName - Nombre
   * @param {string} userData.lastName - Apellido
   * @param {string} userData.email - Email
   * @param {string} userData.password - Contraseña
   * @returns {Promise<Object>} - Usuario y tokens
   */
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      // Guardar tokens en localStorage
      if (response.data.success && response.data.data) {
        const { token, refreshToken, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al registrar usuario" };
    }
  },

  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales
   * @param {string} credentials.email - Email
   * @param {string} credentials.password - Contraseña
   * @returns {Promise<Object>} - Usuario y tokens
   */
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      // Guardar tokens en localStorage
      if (response.data.success && response.data.data) {
        const { token, refreshToken, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al iniciar sesión" };
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise<Object>}
   */
  logout: async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        // Llamar al endpoint de logout en el backend
        await api.post("/auth/logout");
      }

      // Limpiar localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      return { success: true, message: "Sesión cerrada exitosamente" };
    } catch (error) {
      // Aunque falle el backend, limpiar localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      throw error.response?.data || { message: "Error al cerrar sesión" };
    }
  },

  /**
   * Obtener perfil del usuario actual
   * @returns {Promise<Object>} - Datos del usuario
   */
  getProfile: async () => {
    try {
      const response = await api.get("/auth/profile");

      // Actualizar usuario en localStorage
      if (response.data.success && response.data.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener perfil" };
    }
  },

  /**
   * Actualizar perfil del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<Object>}
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put("/auth/profile", userData);

      // Actualizar usuario en localStorage
      if (response.data.success && response.data.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar perfil" };
    }
  },

  /**
   * Cambiar contraseña
   * @param {Object} passwords - Contraseñas
   * @param {string} passwords.currentPassword - Contraseña actual
   * @param {string} passwords.newPassword - Nueva contraseña
   * @returns {Promise<Object>}
   */
  changePassword: async (passwords) => {
    try {
      const response = await api.put("/auth/change-password", passwords);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al cambiar contraseña" };
    }
  },

  /**
   * Refrescar token de acceso
   * @returns {Promise<Object>}
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("No hay refresh token disponible");
      }

      const response = await api.post("/auth/refresh-token", { refreshToken });

      // Actualizar token en localStorage
      if (response.data.success && response.data.data) {
        localStorage.setItem("token", response.data.data.token);
      }

      return response.data;
    } catch (error) {
      // Si falla el refresh, limpiar todo
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      throw error.response?.data || { message: "Error al refrescar token" };
    }
  },

  /**
   * Verificar si hay un usuario autenticado
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  },

  /**
   * Obtener el token actual
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem("token");
  },

  /**
   * Obtener el usuario actual del localStorage
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Verificar si el usuario es admin
   * @returns {boolean}
   */
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === "admin";
  },

  /**
   * ENDPOINTS DE ADMINISTRACIÓN
   */

  /**
   * Obtener todos los usuarios (Admin only)
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>}
   */
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get("/auth/users", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener usuarios" };
    }
  },

  /**
   * Obtener usuario por ID (Admin only)
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>}
   */
  getUserById: async (id) => {
    try {
      const response = await api.get(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener usuario" };
    }
  },

  /**
   * Actualizar usuario (Admin only)
   * @param {string} id - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<Object>}
   */
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/auth/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar usuario" };
    }
  },

  /**
   * Desactivar usuario (Admin only)
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>}
   */
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al desactivar usuario" };
    }
  },

  /**
   * Obtener estadísticas de usuarios (Admin only)
   * @returns {Promise<Object>}
   */
  getUserStats: async () => {
    try {
      const response = await api.get("/auth/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener estadísticas" };
    }
  },
};

export default authService;
