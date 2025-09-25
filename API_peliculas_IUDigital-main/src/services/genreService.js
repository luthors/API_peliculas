import { apiHelpers, endpoints } from './api';

/**
 * Genre Service - Handles all genre-related API operations
 */
class GenreService {
  /**
   * Get all genres with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {boolean} params.isActive - Filter by active status
   * @returns {Promise<Object>} Response with genres data
   */
  async getAllGenres(params = {}) {
    return await apiHelpers.get(endpoints.genres.getAll, params);
  }

  /**
   * Get a specific genre by ID
   * @param {string} id - Genre ID
   * @returns {Promise<Object>} Genre data
   */
  async getGenreById(id) {
    return await apiHelpers.get(endpoints.genres.getById(id));
  }

  /**
   * Create a new genre
   * @param {Object} genreData - Genre information
   * @param {string} genreData.name - Genre name (required)
   * @param {string} genreData.description - Genre description
   * @returns {Promise<Object>} Created genre data
   */
  async createGenre(genreData) {
    return await apiHelpers.post(endpoints.genres.create, genreData);
  }

  /**
   * Update an existing genre
   * @param {string} id - Genre ID
   * @param {Object} genreData - Updated genre information
   * @returns {Promise<Object>} Updated genre data
   */
  async updateGenre(id, genreData) {
    return await apiHelpers.put(endpoints.genres.update(id), genreData);
  }

  /**
   * Delete a genre (soft delete)
   * @param {string} id - Genre ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteGenre(id) {
    return await apiHelpers.delete(endpoints.genres.delete(id));
  }

  /**
   * Get only active genres
   * @returns {Promise<Array>} Array of active genres
   */
  async getActiveGenres() {
    return await apiHelpers.get(endpoints.genres.getActive);
  }

  /**
   * Get genre statistics
   * @returns {Promise<Object>} Genre statistics
   */
  async getGenreStats() {
    return await apiHelpers.get(endpoints.genres.getStats);
  }

  /**
   * Search genres by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Search results
   */
  async searchGenres(searchTerm) {
    return await this.getAllGenres({ search: searchTerm });
  }

  /**
   * Get paginated genres
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Paginated genres
   */
  async getPaginatedGenres(page = 1, limit = 10) {
    return await this.getAllGenres({ page, limit });
  }
}

// Export a singleton instance
const genreService = new GenreService();
export default genreService;