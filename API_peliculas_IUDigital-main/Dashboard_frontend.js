import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import { PageLoader, useNotification } from '../components/common';
import {
  genreService,
  directorService,
  producerService,
  typeService,
  mediaService,
} from '../services';

/**
 * Dashboard Page Component
 * Displays overview statistics and key metrics of the system
 */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    genres: { total: 0, active: 0 },
    directors: { total: 0, active: 0, byNationality: [] },
    producers: { total: 0, active: 0, byCountry: [] },
    types: { total: 0, active: 0 },
    media: { total: 0, active: 0, movies: 0, series: 0, byGenre: [], recent: [] },
  });
  
  const { showError, showSuccess } = useNotification();

  // Load dashboard statistics
  const loadStats = async (showRefreshMessage = false) => {
    try {
      setRefreshing(true);
      
      // Fetch statistics from all services in parallel
      const [genreStats, directorStats, producerStats, typeStats, mediaStats] = await Promise.all([
        genreService.getGenreStats(),
        directorService.getDirectorStats(),
        producerService.getProducerStats(),
        typeService.getTypeStats(),
        mediaService.getMediaStats(),
      ]);

      // Get additional data for enhanced dashboard
      const [recentMedia, mediaByGenre] = await Promise.all([
        mediaService.getRecentMedia(5),
        mediaService.getAllMedia({ limit: 100 }), // Get sample for genre distribution
      ]);

      setStats({
        genres: genreStats.data || { total: 0, active: 0 },
        directors: directorStats.data || { total: 0, active: 0, byNationality: [] },
        producers: producerStats.data || { total: 0, active: 0, byCountry: [] },
        types: typeStats.data || { total: 0, active: 0 },
        media: {
          ...mediaStats.data,
          recent: recentMedia.data?.data || [],
          byGenre: processMediaByGenre(mediaByGenre.data?.data || []),
        },
      });

      if (showRefreshMessage) {
        showSuccess('Estadísticas actualizadas correctamente');
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      showError('Error al cargar las estadísticas del dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Process media data to get genre distribution
  const processMediaByGenre = (mediaList) => {
    const genreCount = {};
    mediaList.forEach(media => {
      if (media.genre?.name) {
        genreCount[media.genre.name] = (genreCount[media.genre.name] || 0) + 1;
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
      title: 'Géneros',
      total: stats.genres.total,
      active: stats.genres.active,
      icon: CategoryIcon,
      color: '#1976d2',
      path: '/genres',
    },
    {
      title: 'Directores',
      total: stats.directors.total,
      active: stats.directors.active,
      icon: PersonIcon,
      color: '#388e3c',
      path: '/directors',
    },
    {
      title: 'Productoras',
      total: stats.producers.total,
      active: stats.producers.active,
      icon: BusinessIcon,
      color: '#f57c00',
      path: '/producers',
    },
    {
      title: 'Tipos',
      total: stats.types.total,
      active: stats.types.active,
      icon: VideoLibraryIcon,
      color: '#7b1fa2',
      path: '/types',
    },
    {
      title: 'Medios',
      total: stats.media.total,
      active: stats.media.active,
      icon: MovieIcon,
      color: '#d32f2f',
      path: '/media',
      subtitle: `${stats.media.movies || 0} películas, ${stats.media.series || 0} series`,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Resumen general del sistema de gestión de películas y series
          </Typography>
        </Box>
        
        <Tooltip title="Actualizar estadísticas">
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            color="primary"
            size="large"
          >
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
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {card.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.title}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={`${card.active} activos`}
                      size="small"
                      color={activePercentage > 80 ? 'success' : activePercentage > 50 ? 'warning' : 'default'}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {activePercentage.toFixed(0)}%
                    </Typography>
                  </Box>
                  
                  {card.subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
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
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" component="h2">
                Contenido Reciente
              </Typography>
            </Box>
            
            {stats.media.recent.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {stats.media.recent.map((media, index) => (
                  <Box
                    key={media._id || index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'grey.50',
                    }}
                  >
                    {media.type?.name === 'Película' ? <MovieIcon sx={{ mr: 1, color: 'primary.main' }} /> : <TvIcon sx={{ mr: 1, color: 'secondary.main' }} />}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {media.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {media.genre?.name} • {media.director?.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={media.type?.name}
                      size="small"
                      variant="outlined"
                      color={media.type?.name === 'Película' ? 'primary' : 'secondary'}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No hay contenido reciente disponible
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Top Genres */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" component="h2">
                Géneros Más Populares
              </Typography>
            </Box>
            
            {stats.media.byGenre.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.media.byGenre.map((genre, index) => {
                  const maxCount = Math.max(...stats.media.byGenre.map(g => g.count));
                  const percentage = (genre.count / maxCount) * 100;
                  
                  return (
                    <Box key={genre.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
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
                          backgroundColor: 'grey.200',
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
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
                      sx={{ 
                        cursor: 'pointer',
                        textAlign: 'center',
                        p: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'grey.50',
                        },
                      }}
                    >
                      <IconComponent sx={{ fontSize: 32, color: card.color, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
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