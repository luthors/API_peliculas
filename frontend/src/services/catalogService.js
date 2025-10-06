import axios from 'axios';

// Base URL for the API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

/**
 * Catalog Service
 * Handles API calls for the public movie/series catalog
 */
class CatalogService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Response Error:', error);
        if (error.response?.status === 404) {
          throw new Error('Recurso no encontrado');
        } else if (error.response?.status >= 500) {
          throw new Error('Error del servidor. Intenta nuevamente más tarde.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Tiempo de espera agotado. Verifica tu conexión.');
        }
        throw error;
      }
    );
  }

  /**
   * Get all media with filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getAllMedia(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        limit: 20,
        sort: 'releaseDate',
        order: 'desc',
        active: 'true',
      };

      const queryParams = { ...defaultParams, ...params };
      // Usar el endpoint correcto
      const response = await this.api.get('/media', { params: queryParams });
      
      return {
        success: true,
        data: response.data.data?.media || [],
        pagination: response.data.data?.pagination || {},
        message: response.data.message || 'Medios obtenidos exitosamente',
      };
    } catch (error) {
      console.error('Error fetching media:', error);
      throw new Error(error.message || 'Error al obtener los medios');
    }
  }

  /**
   * Get media by type (movies or series)
   * @param {string} typeId - Type ID
   * @param {Object} params - Additional query parameters
   * @returns {Promise} API response
   */
  async getMediaByType(typeId, params = {}) {
    try {
      const queryParams = {
        page: 1,
        limit: 20,
        sort: 'releaseDate',
        order: 'desc',
        type: typeId,
        ...params,
      };

      const response = await this.api.get('/media', { params: queryParams });
      
      return {
        success: true,
        data: response.data.data?.media || [],
        pagination: response.data.data?.pagination || {},
        message: response.data.message || 'Medios por tipo obtenidos exitosamente',
      };
    } catch (error) {
      console.error('Error fetching media by type:', error);
      throw new Error(error.message || 'Error al obtener medios por tipo');
    }
  }

  /**
   * Get media by genre
   * @param {string} genreId - Genre ID
   * @param {Object} params - Additional query parameters
   * @returns {Promise} API response
   */
  async getMediaByGenre(genreId, params = {}) {
    try {
      const queryParams = {
        page: 1,
        limit: 20,
        sort: 'releaseDate',
        order: 'desc',
        ...params,
      };

      const response = await this.api.get(`/media/genre/${genreId}`, { params: queryParams });
      
      return {
        success: true,
        data: response.data.data?.media || [],
        message: response.data.message || 'Medios por género obtenidos exitosamente',
      };
    } catch (error) {
      console.error('Error fetching media by genre:', error);
      throw new Error(error.message || 'Error al obtener medios por género');
    }
  }

  /**
   * Get media details by ID
   * @param {string} mediaId - Media ID
   * @returns {Promise} API response
   */
  async getMediaById(mediaId) {
    try {
      const response = await this.api.get(`/media/${mediaId}`);
      
      return {
        success: true,
        data: response.data.data?.media || null,
        message: response.data.message || 'Medio obtenido exitosamente',
      };
    } catch (error) {
      console.error('Error fetching media by ID:', error);
      throw new Error(error.message || 'Error al obtener el medio');
    }
  }

  /**
   * Search media by title or synopsis
   * @param {string} searchTerm - Search term
   * @param {Object} params - Additional query parameters
   * @returns {Promise} API response
   */
  async searchMedia(searchTerm, params = {}) {
    try {
      const queryParams = {
        search: searchTerm,
        page: 1,
        limit: 20,
        sort: 'releaseDate',
        order: 'desc',
        active: 'true',
        ...params,
      };

      // Usar el endpoint correcto
      const response = await this.api.get('/media', { params: queryParams });
      
      return {
        success: true,
        data: response.data.data?.media || [],
        pagination: response.data.data?.pagination || {},
        message: response.data.message || 'Búsqueda completada exitosamente',
      };
    } catch (error) {
      console.error('Error searching media:', error);
      throw new Error(error.message || 'Error al buscar medios');
    }
  }

  /**
   * Get all active genres
   * @returns {Promise} API response
   */
  async getGenres() {
    try {
      const response = await this.api.get('/genres/active');
      
      return {
        success: true,
        data: response.data.data?.genres || [],
        message: response.data.message || 'Géneros obtenidos exitosamente',
      };
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw new Error(error.message || 'Error al obtener los géneros');
    }
  }

  /**
   * Get all active types
   * @returns {Promise} API response
   */
  async getTypes() {
    try {
      // Usar el endpoint correcto
      const response = await this.api.get('/types');
      
      return {
        success: true,
        data: response.data.data?.types || [],
        message: response.data.message || 'Tipos obtenidos exitosamente',
      };
    } catch (error) {
      console.error('Error fetching types:', error);
      throw new Error(error.message || 'Error al obtener los tipos');
    }
  }

  /**
   * Get media statistics
   * @returns {Promise} API response
   */
  async getMediaStats() {
    try {
      // Usar el endpoint correcto
      const response = await this.api.get('/media/stats');
      
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Estadísticas obtenidas exitosamente',
      };
    } catch (error) {
      console.error('Error fetching media stats:', error);
      throw new Error(error.message || 'Error al obtener las estadísticas');
    }
  }
}

// Create and export service instance
const catalogService = new CatalogService();
export { catalogService };
export default catalogService;