import axios from "axios";

const BASE_URL = process.env.REACT_APP_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const ACCESS_TOKEN = process.env.REACT_APP_TMDB_ACCESS_TOKEN;
// Revertimos a w500 para tener mejor calidad, el tamaño lo controlaremos por CSS
const IMAGE_BASE_URL = process.env.REACT_APP_TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p/w500";

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
  params: {
    language: "es-ES", // Get data in Spanish
  },
});

export const tmdbService = {
  getGenres: async () => {
    try {
      const response = await tmdbApi.get("/genre/movie/list");
      return { success: true, data: response.data.genres };
    } catch (error) {
      console.error("Error fetching genres:", error);
      return { success: false, data: [] };
    }
  },

  getMovies: async ({ page = 1, type = "popular", genre = null, search = null }) => {
    try {
      let endpoint = "/discover/movie";
      const params = { page };

      if (search) {
        endpoint = "/search/movie";
        params.query = search;
      } else {
        // Map our internal types to TMDB endpoints
        if (["popular", "top_rated", "upcoming", "now_playing"].includes(type)) {
          endpoint = `/movie/${type}`;
        }

        if (genre) {
          endpoint = "/discover/movie";
          params.with_genres = genre;
          // Add sorting logic if needed when filtering by genre
          params.sort_by = "popularity.desc";
        }
      }

      const response = await tmdbApi.get(endpoint, { params });

      const movies = response.data.results.map((movie) => ({
        _id: movie.id,
        title: movie.title,
        description: movie.overview,
        posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
        // Ajustamos el replace para que coincida con w500
        backdropUrl: movie.backdrop_path ? `${IMAGE_BASE_URL.replace("w500", "original")}${movie.backdrop_path}` : null,
        rating: movie.vote_average,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : "",
        genreIds: movie.genre_ids,
        releaseDate: movie.release_date,
        popularity: movie.popularity,
      }));

      return {
        success: true,
        data: {
          media: movies,
          pagination: {
            totalPages: Math.min(response.data.total_pages, 500), // TMDB limit
            currentPage: response.data.page,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching movies:", error);
      return { success: false, error: error.message };
    }
  },

  // Helper to fetch full details (trailer, director, etc.)
  getMovieDetails: async (movieId) => {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}`, {
        params: { append_to_response: "videos,credits" },
      });
      const data = response.data;

      const trailer = data.videos?.results?.find((v) => v.site === "YouTube" && v.type === "Trailer");
      const director = data.credits?.crew?.find((c) => c.job === "Director");
      const producer =
        data.production_companies && data.production_companies.length > 0 ? data.production_companies[0] : null;

      return {
        success: true,
        data: {
          ...data,
          trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
          director: director ? director.name : "Desconocido",
          producer: producer ? producer.name : "Desconocido",
          producerDescription: producer ? `Compañía de origen: ${producer.origin_country}` : "",
        },
      };
    } catch (error) {
      return { success: false, error };
    }
  },
};
