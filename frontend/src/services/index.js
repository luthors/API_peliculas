// Central export file for all services
import genreService from "./genreService";
import directorService from "./directorService";
import producerService from "./producerService";
import typeService from "./typeService";
import mediaService from "./mediaService";
import authService from "./authService";
import api, { endpoints, apiHelpers } from "./api";

// Export all services with both naming conventions
export {
  authService,
  genreService,
  directorService,
  producerService,
  typeService,
  mediaService,
  api,
  endpoints,
  apiHelpers,
};

// Export with PascalCase names for consistency
export {
  authService as AuthService,
  genreService as GenreService,
  directorService as DirectorService,
  producerService as ProducerService,
  typeService as TypeService,
  mediaService as MediaService,
};

// Default export with all services grouped
export default {
  genre: genreService,
  director: directorService,
  producer: producerService,
  type: typeService,
  media: mediaService,
  auth: authService,
  api,
  endpoints,
  apiHelpers,
};
