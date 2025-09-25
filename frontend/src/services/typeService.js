import { apiHelpers, endpoints } from './api';

/**
 * Type Service - Handles all type-related API operations
 */
class TypeService {
  /**
   * Get all types with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {boolean} params.isActive - Filter by active status
   * @param {string} params.category - Filter by category
   * @param {string} params.platform - Filter by platform
   * @returns {Promise<Object>} Response with types data
   */
  async getAllTypes(params = {}) {
    return await apiHelpers.get(endpoints.types.getAll, params);
  }

  /**
   * Get a specific type by ID
   * @param {string} id - Type ID
   * @returns {Promise<Object>} Type data
   */
  async getTypeById(id) {
    return await apiHelpers.get(endpoints.types.getById(id));
  }

  /**
   * Create a new type
   * @param {Object} typeData - Type information
   * @param {string} typeData.name - Type name (required)
   * @param {string} typeData.description - Type description
   * @param {string} typeData.category - Category (audiovisual, streaming, broadcast)
   * @param {string} typeData.format - Format (digital, physical, streaming)
   * @param {Object} typeData.duration - Duration configuration
   * @param {Array<string>} typeData.features - Features list
   * @param {Array<string>} typeData.platforms - Platforms list
   * @returns {Promise<Object>} Created type data
   */
  async createType(typeData) {
    return await apiHelpers.post(endpoints.types.create, typeData);
  }

  /**
   * Update an existing type
   * @param {string} id - Type ID
   * @param {Object} typeData - Updated type information
   * @returns {Promise<Object>} Updated type data
   */
  async updateType(id, typeData) {
    return await apiHelpers.put(endpoints.types.update(id), typeData);
  }

  /**
   * Delete a type (soft delete)
   * @param {string} id - Type ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteType(id) {
    return await apiHelpers.delete(endpoints.types.delete(id));
  }

  /**
   * Get only active types
   * @returns {Promise<Array>} Array of active types
   */
  async getActiveTypes() {
    return await apiHelpers.get(endpoints.types.getActive);
  }

  /**
   * Get types by category
   * @param {string} category - Category to filter by
   * @returns {Promise<Array>} Array of types from specified category
   */
  async getTypesByCategory(category) {
    return await apiHelpers.get(endpoints.types.getByCategory(category));
  }

  /**
   * Get types by platform
   * @param {string} platform - Platform to filter by
   * @returns {Promise<Array>} Array of types for specified platform
   */
  async getTypesByPlatform(platform) {
    return await apiHelpers.get(endpoints.types.getByPlatform(platform));
  }

  /**
   * Get type statistics
   * @returns {Promise<Object>} Type statistics
   */
  async getTypeStats() {
    return await apiHelpers.get(endpoints.types.getStats);
  }

  /**
   * Search types by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Search results
   */
  async searchTypes(searchTerm) {
    return await this.getAllTypes({ search: searchTerm });
  }

  /**
   * Get paginated types
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Paginated types
   */
  async getPaginatedTypes(page = 1, limit = 10) {
    return await this.getAllTypes({ page, limit });
  }

  /**
   * Get types filtered by category with pagination
   * @param {string} category - Category to filter by
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Filtered and paginated types
   */
  async getTypesByCategoryPaginated(category, page = 1, limit = 10) {
    return await this.getAllTypes({ category, page, limit });
  }

  /**
   * Get types filtered by platform with pagination
   * @param {string} platform - Platform to filter by
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Filtered and paginated types
   */
  async getTypesByPlatformPaginated(platform, page = 1, limit = 10) {
    return await this.getAllTypes({ platform, page, limit });
  }

  /**
   * Get available categories
   * @returns {Array<string>} Array of available categories
   */
  getAvailableCategories() {
    return ['audiovisual', 'streaming', 'broadcast'];
  }

  /**
   * Get available formats
   * @returns {Array<string>} Array of available formats
   */
  getAvailableFormats() {
    return ['digital', 'physical', 'streaming'];
  }

  /**
   * Get unique platforms from all types
   * @returns {Promise<Array>} Array of unique platforms
   */
  async getTypePlatforms() {
    const stats = await this.getTypeStats();
    return stats.platformDistribution?.map(item => item._id) || [];
  }
}

// Export a singleton instance
const typeService = new TypeService();
export default typeService;