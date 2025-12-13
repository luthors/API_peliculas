import axios from "axios";

// Base URL for the API
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api/v1";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (response.data.success && response.data.data) {
            const { token } = response.data.data;
            localStorage.setItem("token", token);

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear storage and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // For other 401 errors or if refresh failed
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API endpoints configuration
export const endpoints = {
  // Genres endpoints
  genres: {
    getAll: "/genres",
    getById: (id) => `/genres/${id}`,
    create: "/genres",
    update: (id) => `/genres/${id}`,
    delete: (id) => `/genres/${id}`,
    getActive: "/genres/active",
    getStats: "/genres/stats",
  },

  // Directors endpoints
  directors: {
    getAll: "/directors",
    getById: (id) => `/directors/${id}`,
    create: "/directors",
    update: (id) => `/directors/${id}`,
    delete: (id) => `/directors/${id}`,
    getActive: "/directors/active",
    getByNationality: (nationality) => `/directors/nationality/${nationality}`,
    getStats: "/directors/stats",
  },

  // Producers endpoints
  producers: {
    getAll: "/producers",
    getById: (id) => `/producers/${id}`,
    create: "/producers",
    update: (id) => `/producers/${id}`,
    delete: (id) => `/producers/${id}`,
    getActive: "/producers/active",
    getByCountry: (country) => `/producers/country/${country}`,
    getBySpecialty: (specialty) => `/producers/specialty/${specialty}`,
    getStats: "/producers/stats",
  },

  // Types endpoints
  types: {
    getAll: "/types",
    getById: (id) => `/types/${id}`,
    create: "/types",
    update: (id) => `/types/${id}`,
    delete: (id) => `/types/${id}`,
    getActive: "/types/active",
    getByCategory: (category) => `/types/category/${category}`,
    getByPlatform: (platform) => `/types/platform/${platform}`,
    getStats: "/types/stats",
  },

  // Media endpoints
  media: {
    getAll: "/media",
    getById: (id) => `/media/${id}`,
    create: "/media",
    update: (id) => `/media/${id}`,
    delete: (id) => `/media/${id}`,
    getActive: "/media/active",
    getByType: (typeId) => `/media/type/${typeId}`,
    getByDirector: (directorId) => `/media/director/${directorId}`,
    getByGenre: (genreId) => `/media/genre/${genreId}`,
    getStats: "/media/stats",
  },
};

// Helper functions for common API operations
export const apiHelpers = {
  // Generic GET request with query parameters
  get: async (endpoint, params = {}) => {
    try {
      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generic POST request
  post: async (endpoint, data) => {
    try {
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generic PUT request
  put: async (endpoint, data) => {
    try {
      const response = await api.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generic DELETE request
  delete: async (endpoint) => {
    try {
      const response = await api.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
