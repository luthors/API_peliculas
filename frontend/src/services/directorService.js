import { apiHelpers, endpoints } from './api';

/**
 * Director Service - Handles all director-related API operations
 */
class DirectorService {
  /**
   * Get all directors with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {boolean} params.isActive - Filter by active status
   * @param {string} params.nationality - Filter by nationality
   * @returns {Promise<Object>} Response with directors data
   */
  async getAllDirectors(params = {}) {
    return await apiHelpers.get(endpoints.directors.getAll, params);
  }

  /**
   * Get a specific director by ID
   * @param {string} id - Director ID
   * @returns {Promise<Object>} Director data
   */
  async getDirectorById(id) {
    return await apiHelpers.get(endpoints.directors.getById(id));
  }

  /**
   * Create a new director
   * @param {Object} directorData - Director information
   * @param {string} directorData.firstName - First name (required)
   * @param {string} directorData.lastName - Last name (required)
   * @param {Date} directorData.birthDate - Birth date
   * @param {string} directorData.nationality - Nationality
   * @param {string} directorData.biography - Biography
   * @param {Array<string>} directorData.awards - Awards list
   * @param {string} directorData.website - Website URL
   * @returns {Promise<Object>} Created director data
   */
  async createDirector(directorData) {
    return await apiHelpers.post(endpoints.directors.create, directorData);
  }

  /**
   * Update an existing director
   * @param {string} id - Director ID
   * @param {Object} directorData - Updated director information
   * @returns {Promise<Object>} Updated director data
   */
  async updateDirector(id, directorData) {
    return await apiHelpers.put(endpoints.directors.update(id), directorData);
  }

  /**
   * Delete a director (soft delete)
   * @param {string} id - Director ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteDirector(id) {
    return await apiHelpers.delete(endpoints.directors.delete(id));
  }

  /**
   * Get only active directors
   * @returns {Promise<Array>} Array of active directors
   */
  async getActiveDirectors() {
    return await apiHelpers.get(endpoints.directors.getActive);
  }

  /**
   * Get directors by nationality
   * @param {string} nationality - Nationality to filter by
   * @returns {Promise<Array>} Array of directors from specified nationality
   */
  async getDirectorsByNationality(nationality) {
    return await apiHelpers.get(endpoints.directors.getByNationality(nationality));
  }

  /**
   * Get director statistics
   * @returns {Promise<Object>} Director statistics
   */
  async getDirectorStats() {
    return await apiHelpers.get(endpoints.directors.getStats);
  }

  /**
   * Search directors by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Search results
   */
  async searchDirectors(searchTerm) {
    return await this.getAllDirectors({ search: searchTerm });
  }

  /**
   * Get paginated directors
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Paginated directors
   */
  async getPaginatedDirectors(page = 1, limit = 10) {
    return await this.getAllDirectors({ page, limit });
  }

  /**
   * Get directors filtered by nationality with pagination
   * @param {string} nationality - Nationality to filter by
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Filtered and paginated directors
   */
  async getDirectorsByNationalityPaginated(nationality, page = 1, limit = 10) {
    return await this.getAllDirectors({ nationality, page, limit });
  }

  /**
   * Get unique nationalities from all directors
   * @returns {Promise<Array>} Array of unique nationalities
   */
  async getDirectorNationalities() {
    const stats = await this.getDirectorStats();
    return stats.nationalityDistribution?.map(item => item._id) || [];
  }
}

// Export a singleton instance
const directorService = new DirectorService();
export default directorService;