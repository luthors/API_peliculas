import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Button,
  Toolbar,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import PublicNavBar from "./PublicNavBar";
import ModernMovieCard from "./ModernMovieCard";
import { tmdbService } from "../../services/tmdbService";
import { useThemeMode } from "../../contexts/ThemeContext";

/**
 * Modern Catalog Component
 * Professional catalog with filters, search, and animations
 */
const ModernCatalog = () => {
  const { isDarkMode } = useThemeMode();
  const [media, setMedia] = useState([]);
  const [genres, setGenres] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("popular");
  const [selectedGenre, setSelectedGenre] = useState(null);

  const itemsPerPage = 20;

  // Load initial data
  useEffect(() => {
    loadGenres();
    loadTypes();
  }, []);

  // Load media when filters change
  useEffect(() => {
    loadMedia();
  }, [page, searchQuery, selectedType, selectedGenre, genres]); // Added genres dependency to map names correctly

  const loadGenres = async () => {
    try {
      const response = await tmdbService.getGenres();
      if (response.success && Array.isArray(response.data)) {
        // Map TMDB id to _id for consistency
        setGenres(response.data.map((g) => ({ _id: g.id, name: g.name })));
      } else {
        setGenres([]);
      }
    } catch (err) {
      console.error("Error loading genres:", err);
      setGenres([]);
    }
  };

  const loadTypes = () => {
    // Static types mapped to TMDB endpoints
    setTypes([
      { _id: "popular", name: "Populares" },
      { _id: "top_rated", name: "Mejor Valoradas" },
      { _id: "upcoming", name: "Próximamente" },
      { _id: "now_playing", name: "En Cartelera" },
    ]);
  };

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tmdbService.getMovies({
        page,
        type: selectedType,
        genre: selectedGenre,
        search: searchQuery,
      });

      if (response.success && response.data) {
        const mediaData = response.data.media || [];

        // Enrich media with genre names using the loaded genres list
        const enrichedMedia = mediaData.map((item) => ({
          ...item,
          genres:
            item.genreIds
              ?.map((id) => {
                const g = genres.find((gen) => gen._id === id);
                return g ? { name: g.name } : null;
              })
              .filter(Boolean) || [],
        }));

        setMedia(enrichedMedia);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setMedia([]);
        setError("Error al cargar el catálogo");
      }
    } catch (err) {
      console.error("Error loading media:", err);
      setMedia([]);
      setError("Error al conectar con el servidor. Por favor, intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleTypeChange = (event, newValue) => {
    setSelectedType(newValue);
    setPage(1);
  };

  const handleGenreClick = (genreId) => {
    setSelectedGenre(selectedGenre === genreId ? null : genreId);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlay = async (movie) => {
    console.log("Play movie:", movie);
    // Fetch full details to get trailer
    const details = await tmdbService.getMovieDetails(movie._id);
    if (details.success && details.data.trailerUrl) {
      window.open(details.data.trailerUrl, "_blank");
    } else {
      alert("Trailer no disponible");
    }
  };

  const handleInfo = (movie) => {
    console.log("Show info:", movie);
    // TODO: Implement info modal
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Navigation Bar */}
      <PublicNavBar onSearch={handleSearch} categories={genres} />

      {/* Spacer for fixed navbar */}
      <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: isDarkMode
                  ? "linear-gradient(45deg, #90caf9 30%, #f48fb1 90%)"
                  : "linear-gradient(45deg, #2196f3 30%, #f50057 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Descubre tu próxima historia
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                fontWeight: 400,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Miles de películas y series esperan por ti
            </Typography>
          </Box>
        </motion.div>

        {/* Type Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <Box sx={{ mb: 4, borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={selectedType}
              onChange={handleTypeChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                  minHeight: 48,
                },
              }}
            >
              <Tab label="Todos" value="all" />
              {(types || []).map((type) => (
                <Tab key={type._id} label={type.name} value={type._id} />
              ))}
            </Tabs>
          </Box>
        </motion.div>

        {/* Genre Filters */}
        {genres.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
                Géneros
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(genres || []).map((genre) => (
                  <Chip
                    key={genre._id}
                    label={genre.name}
                    onClick={() => handleGenreClick(genre._id)}
                    color={selectedGenre === genre._id ? "primary" : "default"}
                    variant={selectedGenre === genre._id ? "filled" : "outlined"}
                    component={motion.div}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
                {selectedGenre && (
                  <Button size="small" onClick={() => handleGenreClick(null)} sx={{ ml: 1 }}>
                    Limpiar filtro
                  </Button>
                )}
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}

        {/* Media Grid */}
        {!loading && (
          <>
            {!(media || []).length ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 2, color: "text.secondary" }}>
                    No se encontraron resultados
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    Intenta con otros filtros o búsqueda
                  </Typography>
                </Box>
              </motion.div>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(5, 1fr)",
                    xl: "repeat(5, 1fr)",
                  },
                  gap: 3,
                  justifyItems: "center",
                }}
              >
                {(media || []).map((item, index) => (
                  <Box
                    key={item._id || index}
                    sx={{
                      width: "100%",
                      maxWidth: "260px",
                    }}
                  >
                    <ModernMovieCard movie={item} onPlay={handlePlay} onInfo={handleInfo} />
                  </Box>
                ))}
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 6,
                    mb: 4,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontWeight: 600,
                      },
                    }}
                  />
                </Box>
              </motion.div>
            )}
          </>
        )}
      </Container>

      {/* Footer */}
      <Box
        component={motion.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        sx={{
          py: 6,
          mt: 8,
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" align="center" sx={{ color: "text.secondary" }}>
            © 2025 CineStream. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default ModernCatalog;
