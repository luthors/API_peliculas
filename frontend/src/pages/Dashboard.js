import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  Movie as MovieIcon,
  Tv as TvIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  VideoLibrary as VideoLibraryIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { PageLoader, useNotification } from "../components/common";
import { tmdbService } from "../services/tmdbService";
import { useNavigate } from "react-router-dom";

/**
 * Dashboard Page Component
 * Displays overview statistics and key metrics of the system
 */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    genres: { total: 0, items: [] },
    types: { total: 4, items: ["Populares", "Mejor Valoradas", "Próximamente", "En Cartelera"] },
    media: {
      total: 0,
      popular: 0,
      topRated: 0,
      upcoming: 0,
      nowPlaying: 0,
      byGenre: [],
      recent: [],
    },
  });

  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  // Load dashboard statistics from TMDB
  const loadStats = async (showRefreshMessage = false) => {
    try {
      setRefreshing(true);

      // Fetch data from TMDB in parallel
      const [genresRes, popularRes, topRatedRes, upcomingRes, nowPlayingRes] = await Promise.all([
        tmdbService.getGenres(),
        tmdbService.getMovies({ page: 1, type: "popular" }),
        tmdbService.getMovies({ page: 1, type: "top_rated" }),
        tmdbService.getMovies({ page: 1, type: "upcoming" }),
        tmdbService.getMovies({ page: 1, type: "now_playing" }),
      ]);

      const genres = genresRes.success ? genresRes.data : [];
      const popularMovies = popularRes.success ? popularRes.data.media : [];

      // Calculate genre distribution from popular movies
      const genreDistribution = processMediaByGenre(popularMovies, genres);

      setStats({
        genres: {
          total: genres.length,
          items: genres,
        },
        types: {
          total: 4,
          items: ["Populares", "Mejor Valoradas", "Próximamente", "En Cartelera"],
        },
        media: {
          total: popularRes.data?.pagination?.totalPages * 20 || 0,
          popular: popularRes.success ? popularRes.data.media.length : 0,
          topRated: topRatedRes.success ? topRatedRes.data.media.length : 0,
          upcoming: upcomingRes.success ? upcomingRes.data.media.length : 0,
          nowPlaying: nowPlayingRes.success ? nowPlayingRes.data.media.length : 0,
          recent: popularMovies.slice(0, 5),
          byGenre: genreDistribution,
        },
      });

      if (showRefreshMessage) {
        showSuccess("Estadísticas actualizadas correctamente");
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      showError("Error al cargar las estadísticas del dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Process media data to get genre distribution
  const processMediaByGenre = (mediaList, genres) => {
    const genreCount = {};

    mediaList.forEach((media) => {
      if (media.genreIds && media.genreIds.length > 0) {
        media.genreIds.forEach((genreId) => {
          const genre = genres.find((g) => g.id === genreId);
          if (genre) {
            genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(genreCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 genres
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    loadStats(true);
  };

  if (loading) {
    return <PageLoader message="Cargando dashboard..." />;
  }

  // Statistics cards configuration
  const statsCards = [
    {
      title: "Géneros",
      total: stats.genres.total,
      active: stats.genres.total,
      icon: CategoryIcon,
      color: "#1976d2",
      path: "/catalog",
      subtitle: "Categorías disponibles",
    },
    {
      title: "Populares",
      total: stats.media.popular,
      active: stats.media.popular,
      icon: TrendingUpIcon,
      color: "#388e3c",
      path: "/catalog",
      subtitle: "Películas populares",
    },
    {
      title: "Mejor Valoradas",
      total: stats.media.topRated,
      active: stats.media.topRated,
      icon: MovieIcon,
      color: "#f57c00",
      path: "/catalog",
      subtitle: "Top rated",
    },
    {
      title: "Próximamente",
      total: stats.media.upcoming,
      active: stats.media.upcoming,
      icon: VideoLibraryIcon,
      color: "#7b1fa2",
      path: "/catalog",
      subtitle: "Estrenos próximos",
    },
    {
      title: "En Cartelera",
      total: stats.media.nowPlaying,
      active: stats.media.nowPlaying,
      icon: MovieIcon,
      color: "#d32f2f",
      path: "/catalog",
      subtitle: "Actualmente en cines",
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Resumen general del sistema de gestión de películas y series
          </Typography>
        </Box>

        <Tooltip title="Actualizar estadísticas">
          <IconButton onClick={handleRefresh} disabled={refreshing} color="primary" size="large">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {refreshing && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        {statsCards.map((card, index) => {
          const IconComponent = card.icon;
          const activePercentage = card.total > 0 ? (card.active / card.total) * 100 : 0;

          return (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Card
                onClick={() => navigate(card.path)}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: `${card.color}20`,
                        mr: 2,
                      }}
                    >
                      <IconComponent sx={{ color: card.color, fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
                        {card.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Chip
                      label={`${card.active} activos`}
                      size="small"
                      color={activePercentage > 80 ? "success" : activePercentage > 50 ? "warning" : "default"}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {activePercentage.toFixed(0)}%
                    </Typography>
                  </Box>

                  {card.subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      {card.subtitle}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {/* Recent Media */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TrendingUpIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" component="h2">
                Contenido Reciente
              </Typography>
            </Box>

            {stats.media.recent.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {stats.media.recent.map((media, index) => (
                  <Box
                    key={media._id || index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: "grey.50",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "grey.100",
                      },
                    }}
                    onClick={() => navigate("/catalog")}
                  >
                    <MovieIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {media.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {media.year} • ⭐ {media.rating?.toFixed(1)}
                      </Typography>
                    </Box>
                    <Chip label="Popular" size="small" variant="outlined" color="primary" />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                No hay contenido reciente disponible
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Top Genres */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CategoryIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" component="h2">
                Géneros Más Populares
              </Typography>
            </Box>

            {stats.media.byGenre.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {stats.media.byGenre.map((genre, index) => {
                  const maxCount = Math.max(...stats.media.byGenre.map((g) => g.count));
                  const percentage = (genre.count / maxCount) * 100;

                  return (
                    <Box key={genre.name}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                          {genre.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {genre.count} títulos
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "grey.200",
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                No hay datos de géneros disponibles
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Accede rápidamente a las secciones principales del sistema
            </Typography>

            <Grid container spacing={2}>
              {statsCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <Grid item xs={6} sm={4} md={2.4} key={index}>
                    <Card
                      onClick={() => navigate(card.path)}
                      sx={{
                        cursor: "pointer",
                        textAlign: "center",
                        p: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "grey.50",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <IconComponent sx={{ fontSize: 32, color: card.color, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        Ver {card.title}
                      </Typography>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
