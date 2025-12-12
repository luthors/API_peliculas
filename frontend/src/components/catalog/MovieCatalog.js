import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  Pagination,
  Alert,
  Skeleton,
  Fab,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import {
  Movie as MovieIcon,
  Tv as TvIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { catalogService } from '../../services/catalogService';
import MovieCard from './MovieCard';
import CatalogFilters from './CatalogFilters';
import CatalogNavigation from './CatalogNavigation';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * MovieCatalog Component
 * Main catalog component for displaying movies and series
 * Similar to TMDB interface with filtering, search, and pagination
 */
const MovieCatalog = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Movies, 2: Series
  const [media, setMedia] = useState([]);
  const [genres, setGenres] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    genre: '',
    year: '',
    rating: [0, 10],
    sort: 'releaseDate',
    order: 'desc',
    genres: [], // Multiple genres
  });

  // Stats state
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalSeries: 0,
    totalMedia: 0,
  });

  // Tab configuration
  const tabs = [
    { label: 'Todo', icon: <GridIcon />, value: '' },
    { label: 'Películas', icon: <MovieIcon />, value: '68e2cd77e06821ba04090350' }, // ID real de Película
    { label: 'Series', icon: <TvIcon />, value: '68e2cd77e06821ba04090351' }, // ID real de Serie
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load media when filters or pagination change
  useEffect(() => {
    loadMedia();
  }, [filters, currentPage, activeTab]);

  /**
   * Load initial data (genres, types, stats)
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [genresData, typesData, statsData] = await Promise.all([
        catalogService.getGenres(),
        catalogService.getTypes(),
        catalogService.getMediaStats(),
      ]);

      // Handle different response structures from catalogService
      setGenres(genresData.data || []);
      setTypes(typesData.data || []);
      
      // Process stats data to calculate totalMovies and totalSeries
      const statsResponse = statsData.data || {};
      const typeStats = statsResponse.typeStats || [];
      
      // Calculate movies and series count from typeStats
      let totalMovies = 0;
      let totalSeries = 0;
      
      typeStats.forEach(stat => {
        if (stat.type === 'Película') {
          totalMovies = stat.count;
        } else if (stat.type === 'Serie') {
          totalSeries = stat.count;
        }
      });
      
      setStats({
        totalMovies,
        totalSeries,
        totalMedia: statsResponse.totalMedia || 0,
      });
      
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load media based on current filters and pagination
   */
  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare query parameters
      const queryParams = {
        page: currentPage,
        limit: itemsPerPage,
        sort: filters.sort,
        order: filters.order,
      };

      // Add filters
      if (filters.search) queryParams.search = filters.search;
      if (filters.genre) queryParams.genre = filters.genre;
      if (filters.year) queryParams.year = filters.year;
      if (filters.rating && (filters.rating[0] > 0 || filters.rating[1] < 10)) {
        queryParams.minRating = filters.rating[0];
        queryParams.maxRating = filters.rating[1];
      }
      if (filters.genres && filters.genres.length > 0) {
        queryParams.genres = filters.genres.join(',');
      }

      // Add type filter based on active tab
      const currentTab = tabs[activeTab];
      if (currentTab.value) {
        queryParams.type = currentTab.value;
      }

      let response;
      
      // Use appropriate service method
      if (filters.search) {
        response = await catalogService.searchMedia(filters.search, queryParams);
      } else if (currentTab.value) {
        response = await catalogService.getMediaByType(currentTab.value, queryParams);
      } else {
        response = await catalogService.getAllMedia(queryParams);
      }

      // Handle different response structures from catalogService
      const mediaData = response.data || [];
      const paginationData = response.pagination || {};
      
      setMedia(Array.isArray(mediaData) ? mediaData : []);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.total || mediaData.length || 0);
      setCurrentPage(paginationData.currentPage || currentPage);

// ... existing code ...

    } catch (err) {
      console.error('Error loading media:', err);
      setError('Error al cargar el contenido. Por favor, intenta de nuevo.');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, activeTab, itemsPerPage]);

  /**
   * Handle tab change
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1); // Reset to first page
  };

  /**
   * Handle filter changes
   */
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  /**
   * Handle search
   */
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  };

  /**
   * Handle clear filters
   */
  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      genre: '',
      year: '',
      rating: [0, 10],
      sort: 'releaseDate',
      order: 'desc',
      genres: [],
    });
    setCurrentPage(1);
  };

  /**
   * Handle pagination change
   */
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    loadMedia();
  };

  /**
   * Render loading skeletons
   */
  const renderLoadingSkeletons = () => (
    <Grid container spacing={3}>
      {Array.from({ length: itemsPerPage }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Skeleton variant="rectangular" height={300} />
            <Box sx={{ p: 2 }}>
              <Skeleton variant="text" height={24} />
              <Skeleton variant="text" height={20} width="60%" />
              <Skeleton variant="text" height={20} width="40%" />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  /**
   * Render media grid
   */
  const renderMediaGrid = () => {
    if (loading) {
      return renderLoadingSkeletons();
    }

    if (media.length === 0) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron resultados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Intenta ajustar los filtros o términos de búsqueda
          </Typography>
          <Button variant="outlined" onClick={handleClearFilters}>
            Limpiar filtros
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {media.map((item) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={viewMode === 'grid' ? 4 : 12} 
            lg={viewMode === 'grid' ? 3 : 12} 
            key={item._id}
          >
            <MovieCard
              media={item}
              variant={viewMode}
              onPlay={() => console.log('Play:', item.title)}
              onFavorite={() => console.log('Favorite:', item.title)}
              onShare={() => console.log('Share:', item.title)}
              onViewDetails={() => console.log('View details:', item.title)}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Modern Navigation Header */}
      <CatalogNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        stats={stats}
        onSearch={() => console.log('Search clicked')}
        onToggleFilters={() => console.log('Toggle filters clicked')}
        filtersOpen={false}
      />

      {/* Filters */}
      <CatalogFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        genres={genres}
        types={types}
        loading={loading}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
      />

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Results Header */}
      {!loading && !error && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}
        >
          <Typography variant="h6" color="text.secondary">
            {totalItems > 0 
              ? `Mostrando ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} de ${totalItems} resultados`
              : 'No hay resultados'
            }
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<GridIcon />}
              onClick={() => setViewMode('grid')}
            >
              Cuadrícula
            </Button>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<ListIcon />}
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
          </Box>
        </Box>
      )}

      {/* Media Grid */}
      {renderMediaGrid()}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? 'small' : 'medium'}
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Refresh FAB */}
      <Fab
        color="primary"
        aria-label="refresh"
        onClick={handleRefresh}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <RefreshIcon />
      </Fab>

      {/* Loading Overlay */}
      {loading && (
        <LoadingSpinner 
          open={loading} 
          message="Cargando contenido..." 
        />
      )}
    </Container>
  );
};

export default MovieCatalog;