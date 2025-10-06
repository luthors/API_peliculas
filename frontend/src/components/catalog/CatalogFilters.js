import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid,
  Paper,
  Typography,
  Collapse,
  IconButton,
  Slider,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';

/**
 * CatalogFilters Component
 * Provides filtering and search functionality for the movie/series catalog
 * Similar to TMDB filtering system
 */
const CatalogFilters = ({
  filters,
  onFiltersChange,
  genres = [],
  types = [],
  loading = false,
  onSearch,
  onClearFilters,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle search input
  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    handleFilterChange('search', searchTerm);
    
    // Trigger search with debounce
    if (onSearch) {
      clearTimeout(handleSearchChange.timeoutId);
      handleSearchChange.timeoutId = setTimeout(() => {
        onSearch(searchTerm);
      }, 500);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      type: '',
      genre: '',
      year: '',
      rating: [0, 10],
      sort: 'releaseDate',
      order: 'desc',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      localFilters.search ||
      localFilters.type ||
      localFilters.genre ||
      localFilters.year ||
      (localFilters.rating && (localFilters.rating[0] > 0 || localFilters.rating[1] < 10))
    );
  };

  // Generate year options (last 50 years + next 5 years)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 5; year >= currentYear - 50; year--) {
      years.push(year);
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  // Sort options
  const sortOptions = [
    { value: 'releaseDate', label: 'Fecha de estreno' },
    { value: 'title', label: 'Título' },
    { value: 'rating', label: 'Calificación' },
    { value: 'duration', label: 'Duración' },
  ];

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar películas, series, actores..."
          value={localFilters.search || ''}
          onChange={handleSearchChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: localFilters.search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => handleFilterChange('search', '')}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            },
          }}
        />
      </Box>

      {/* Quick Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Filtros rápidos:
        </Typography>
        
        {/* Type Filter */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={localFilters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            label="Tipo"
            disabled={loading}
          >
            <MenuItem value="">Todos</MenuItem>
            {types.map((type) => (
              <MenuItem key={type._id || type.id} value={type._id || type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Genre Filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Género</InputLabel>
          <Select
            value={localFilters.genre || ''}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            label="Género"
            disabled={loading}
          >
            <MenuItem value="">Todos</MenuItem>
            {genres.map((genre) => (
              <MenuItem key={genre._id || genre.id} value={genre._id || genre.id}>
                {genre.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort Filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={localFilters.sort || 'releaseDate'}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            label="Ordenar por"
            disabled={loading}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Order Filter */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Orden</InputLabel>
          <Select
            value={localFilters.order || 'desc'}
            onChange={(e) => handleFilterChange('order', e.target.value)}
            label="Orden"
            disabled={loading}
          >
            <MenuItem value="desc">Desc</MenuItem>
            <MenuItem value="asc">Asc</MenuItem>
          </Select>
        </FormControl>

        {/* Advanced Filters Toggle */}
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{ ml: 'auto' }}
        >
          <TuneIcon />
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Advanced Filters */}
      <Collapse in={expanded}>
        <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            Filtros Avanzados
          </Typography>
          
          <Grid container spacing={2}>
            {/* Year Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Año</InputLabel>
                <Select
                  value={localFilters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  label="Año"
                  disabled={loading}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Rating Range */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" gutterBottom>
                Calificación: {localFilters.rating?.[0] || 0} - {localFilters.rating?.[1] || 10}
              </Typography>
              <Slider
                value={localFilters.rating || [0, 10]}
                onChange={(e, value) => handleFilterChange('rating', value)}
                valueLabelDisplay="auto"
                min={0}
                max={10}
                step={0.1}
                disabled={loading}
                sx={{ mt: 1 }}
              />
            </Grid>

            {/* Multiple Genre Selection */}
            <Grid item xs={12} sm={12} md={5}>
              <Autocomplete
                multiple
                options={genres}
                getOptionLabel={(option) => option.name}
                value={genres.filter(genre => 
                  localFilters.genres?.includes(genre._id || genre.id)
                )}
                onChange={(e, selectedGenres) => {
                  const genreIds = selectedGenres.map(genre => genre._id || genre.id);
                  handleFilterChange('genres', genreIds);
                }}
                disabled={loading}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.name}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Géneros múltiples"
                    placeholder="Seleccionar géneros"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      {/* Active Filters and Clear Button */}
      {hasActiveFilters() && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Filtros activos
            </Typography>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={loading}
            >
              Limpiar filtros
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default CatalogFilters;