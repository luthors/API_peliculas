import { apiHelpers, endpoints } from './api';

/**
 * Media Service - Handles all media-related API operations (Movies and Series)
 */
class MediaService {
  /**
   * Get all media with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {boolean} params.isActive - Filter by active status
   * @param {string} params.type - Filter by type ID
   * @param {string} params.genre - Filter by genre ID
   * @param {string} params.director - Filter by director ID
   * @param {string} params.producer - Filter by producer ID
   * @param {number} params.year - Filter by release year
   * @param {number} params.minRating - Minimum rating filter
   * @returns {Promise<Object>} Response with media data
   */
  async getAllMedia(params = {}) {
    return await apiHelpers.get(endpoints.media.getAll, params);
  }

  /**
   * Get a specific media by ID
   * @param {string} id - Media ID
   * @returns {Promise<Object>} Media data
   */
  async getMediaById(id) {
    return await apiHelpers.get(endpoints.media.getById(id));
  }

  /**
   * Create a new media
   * @param {Object} mediaData - Media information
   * @param {string} mediaData.title - Media title (required)
   * @param {string} mediaData.originalTitle - Original title
   * @param {string} mediaData.synopsis - Synopsis
   * @param {Date} mediaData.releaseDate - Release date
   * @param {number} mediaData.duration - Duration in minutes
   * @param {string} mediaData.type - Type ID (required)
   * @param {Array<string>} mediaData.genres - Genre IDs
   * @param {Array<string>} mediaData.directors - Director IDs
   * @param {Array<string>} mediaData.producers - Producer IDs
   * @param {Object} mediaData.rating - Rating information
   * @param {Array<Object>} mediaData.cast - Cast information
   * @param {Array<Object>} mediaData.crew - Crew information
   * @param {Object} mediaData.seriesInfo - Series-specific information
   * @param {string} mediaData.poster - Poster URL
   * @param {string} mediaData.trailer - Trailer URL
   * @param {Array<string>} mediaData.tags - Tags
   * @param {string} mediaData.language - Language
   * @param {Array<string>} mediaData.subtitles - Available subtitles
   * @returns {Promise<Object>} Created media data
   */
  async createMedia(mediaData) {
    return await apiHelpers.post(endpoints.media.create, mediaData);
  }

  /**
   * Update an existing media
   * @param {string} id - Media ID
   * @param {Object} mediaData - Updated media information
   * @returns {Promise<Object>} Updated media data
   */
  async updateMedia(id, mediaData) {
    return await apiHelpers.put(endpoints.media.update(id), mediaData);
  }

  /**
   * Delete a media (soft delete)
   * @param {string} id - Media ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteMedia(id) {
    return await apiHelpers.delete(endpoints.media.delete(id));
  }

  /**
   * Get only active media
   * @returns {Promise<Array>} Array of active media
   */
  async getActiveMedia() {
    return await apiHelpers.get(endpoints.media.getActive);
  }

  /**
   * Get media by type
   * @param {string} typeId - Type ID to filter by
   * @returns {Promise<Array>} Array of media of specified type
   */
  async getMediaByType(typeId) {
    return await apiHelpers.get(endpoints.media.getByType(typeId));
  }

  /**
   * Get media by director
   * @param {string} directorId - Director ID to filter by
   * @returns {Promise<Array>} Array of media directed by specified director
   */
  async getMediaByDirector(directorId) {
    return await apiHelpers.get(endpoints.media.getByDirector(directorId));
  }

  /**
   * Get media by genre
   * @param {string} genreId - Genre ID to filter by
   * @returns {Promise<Array>} Array of media of specified genre
   */
  async getMediaByGenre(genreId) {
    return await apiHelpers.get(endpoints.media.getByGenre(genreId));
  }

  /**
   * Get media statistics
   * @returns {Promise<Object>} Media statistics
   */
  async getMediaStats() {
    return await apiHelpers.get(endpoints.media.getStats);
  }

  /**
   * Search media by title
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Search results
   */
  async searchMedia(searchTerm) {
    return await this.getAllMedia({ search: searchTerm });
  }

  /**
   * Get paginated media
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Paginated media
   */
  async getPaginatedMedia(page = 1, limit = 10) {
    return await this.getAllMedia({ page, limit });
  }

  /**
   * Get media filtered by type with pagination
   * @param {string} typeId - Type ID to filter by
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Filtered and paginated media
   */
  async getMediaByTypePaginated(typeId, page = 1, limit = 10) {
    return await this.getAllMedia({ type: typeId, page, limit });
  }

  /**
   * Get media filtered by genre with pagination
   * @param {string} genreId - Genre ID to filter by
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Filtered and paginated media
   */
  async getMediaByGenrePaginated(genreId, page = 1, limit = 10) {
    return await this.getAllMedia({ genre: genreId, page, limit });
  }

  /**
   * Get media filtered by director with pagination
   * @param {string} directorId - Director ID to filter by
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Filtered and paginated media
   */
  async getMediaByDirectorPaginated(directorId, page = 1, limit = 10) {
    return await this.getAllMedia({ director: directorId, page, limit });
  }

  /**
   * Get media filtered by release year
   * @param {number} year - Release year
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Filtered and paginated media
   */
  async getMediaByYear(year, page = 1, limit = 10) {
    return await this.getAllMedia({ year, page, limit });
  }

  /**
   * Get media filtered by minimum rating
   * @param {number} minRating - Minimum rating (0-10)
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Filtered and paginated media
   */
  async getMediaByRating(minRating, page = 1, limit = 10) {
    return await this.getAllMedia({ minRating, page, limit });
  }

  /**
   * Get movies only (filter by movie types)
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Movies data
   */
  async getMovies(page = 1, limit = 10) {
    // This would need to be implemented based on how movie types are identified
    return await this.getAllMedia({ page, limit, category: 'movie' });
  }

  /**
   * Get series only (filter by series types)
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Series data
   */
  async getSeries(page = 1, limit = 10) {
    // This would need to be implemented based on how series types are identified
    return await this.getAllMedia({ page, limit, category: 'series' });
  }

  /**
   * Get top rated media
   * @param {number} limit - Number of items to return (default: 10)
   * @returns {Promise<Object>} Top rated media
   */
  async getTopRatedMedia(limit = 10) {
    return await this.getAllMedia({ minRating: 8, limit, sort: 'rating' });
  }

  /**
   * Get recently added media
   * @param {number} limit - Number of items to return (default: 10)
   * @returns {Promise<Object>} Recently added media
   */
  async getRecentMedia(limit = 10) {
    return await this.getAllMedia({ limit, sort: 'createdAt' });
  }

  /**
   * Advanced search with multiple filters
   * @param {Object} filters - Search filters
   * @param {string} filters.title - Title search
   * @param {Array<string>} filters.genres - Genre IDs
   * @param {Array<string>} filters.directors - Director IDs
   * @param {number} filters.yearFrom - Start year
   * @param {number} filters.yearTo - End year
   * @param {number} filters.minRating - Minimum rating
   * @param {number} filters.maxRating - Maximum rating
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Search results
   */
  async advancedSearch(filters, page = 1, limit = 10) {
    const params = { ...filters, page, limit };
    return await this.getAllMedia(params);
  }
}

// Export a singleton instance
const mediaService = new MediaService();
export default mediaService;