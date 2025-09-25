import { apiHelpers, endpoints } from './api';

/**
 * Producer Service - Handles all producer-related API operations
 */
class ProducerService {
  /**
   * Get all producers with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {boolean} params.isActive - Filter by active status
   * @param {string} params.country - Filter by country
   * @param {string} params.specialty - Filter by specialty
   * @returns {Promise<Object>} Response with producers data
   */
  async getAllProducers(params = {}) {
    return await apiHelpers.get(endpoints.producers.getAll, params);
  }

  /**
   * Get a specific producer by ID
   * @param {string} id - Producer ID
   * @returns {Promise<Object>} Producer data
   */
  async getProducerById(id) {
    return await apiHelpers.get(endpoints.producers.getById(id));
  }

  /**
   * Create a new producer
   * @param {Object} producerData - Producer information
   * @param {string} producerData.name - Producer name (required)
   * @param {number} producerData.foundedYear - Founded year
   * @param {string} producerData.country - Country
   * @param {string} producerData.headquarters - Headquarters location
   * @param {string} producerData.website - Website URL
   * @param {Array<string>} producerData.specialties - Specialties list
   * @param {string} producerData.description - Description
   * @returns {Promise<Object>} Created producer data
   */
  async createProducer(producerData) {
    return await apiHelpers.post(endpoints.producers.create, producerData);
  }

  /**
   * Update an existing producer
   * @param {string} id - Producer ID
   * @param {Object} producerData - Updated producer information
   * @returns {Promise<Object>} Updated producer data
   */
  async updateProducer(id, producerData) {
    return await apiHelpers.put(endpoints.producers.update(id), producerData);
  }

  /**
   * Delete a producer (soft delete)
   * @param {string} id - Producer ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteProducer(id) {
    return await apiHelpers.delete(endpoints.producers.delete(id));
  }

  /**
   * Get only active producers
   * @returns {Promise<Array>} Array of active producers
   */
  async getActiveProducers() {
    return await apiHelpers.get(endpoints.producers.getActive);
  }

  /**
   * Get producers by country
   * @param {string} country - Country to filter by
   * @returns {Promise<Array>} Array of producers from specified country
   */
  async getProducersByCountry(country) {
    return await apiHelpers.get(endpoints.producers.getByCountry(country));
  }

  /**
   * Get producers by specialty
   * @param {string} specialty - Specialty to filter by
   * @returns {Promise<Array>} Array of producers with specified specialty
   */
  async getProducersBySpecialty(specialty) {
    return await apiHelpers.get(endpoints.producers.getBySpecialty(specialty));
  }

  /**
   * Get producer statistics
   * @returns {Promise<Object>} Producer statistics
   */
  async getProducerStats() {
    return await apiHelpers.get(endpoints.producers.getStats);
  }

  /**
   * Search producers by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Search results
   */
  async searchProducers(searchTerm) {
    return await this.getAllProducers({ search: searchTerm });
  }

  /**
   * Get paginated producers
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Paginated producers
   */
  async getPaginatedProducers(page = 1, limit = 10) {
    return await this.getAllProducers({ page, limit });
  }

  /**
   * Get producers filtered by country with pagination
   * @param {string} country - Country to filter by
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Filtered and paginated producers
   */
  async getProducersByCountryPaginated(country, page = 1, limit = 10) {
    return await this.getAllProducers({ country, page, limit });
  }

  /**
   * Get producers filtered by specialty with pagination
   * @param {string} specialty - Specialty to filter by
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Filtered and paginated producers
   */
  async getProducersBySpecialtyPaginated(specialty, page = 1, limit = 10) {
    return await this.getAllProducers({ specialty, page, limit });
  }

  /**
   * Get unique countries from all producers
   * @returns {Promise<Array>} Array of unique countries
   */
  async getProducerCountries() {
    const stats = await this.getProducerStats();
    return stats.countryDistribution?.map(item => item._id) || [];
  }

  /**
   * Get unique specialties from all producers
   * @returns {Promise<Array>} Array of unique specialties
   */
  async getProducerSpecialties() {
    const stats = await this.getProducerStats();
    return stats.specialtyDistribution?.map(item => item._id) || [];
  }
}

// Export a singleton instance
const producerService = new ProducerService();
export default producerService;