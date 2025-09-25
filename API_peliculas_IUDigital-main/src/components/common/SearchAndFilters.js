import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Typography,
  Collapse,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

/**
 * Reusable Search and Filters Component
 * Provides consistent search and filtering functionality across all modules
 */
const SearchAndFilters = ({
  onSearch,
  onFilter,
  onClear,
  searchPlaceholder = 'Buscar...',
  filters = [],
  initialValues = {},
  showAdvancedFilters = true,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValues.search || '');
  const [filterValues, setFilterValues] = useState(initialValues);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Update active filters count
  useEffect(() => {
    const count = Object.values(filterValues).filter(
      (value) => value !== '' && value !== null && value !== undefined
    ).length;
    setActiveFiltersCount(count);
  }, [filterValues]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilterValues = {
      ...filterValues,
      [filterKey]: value,
    };
    setFilterValues(newFilterValues);
    
    if (onFilter) {
      onFilter(newFilterValues);
    }
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setFilterValues({});
    
    if (onClear) {
      onClear();
    }
    
    if (onSearch) {
      onSearch('');
    }
    
    if (onFilter) {
      onFilter({});
    }
  };

  const renderFilter = (filter) => {
    const value = filterValues[filter.key] || '';
    
    switch (filter.type) {
      case 'select':
        return (
          <FormControl fullWidth size="small" key={filter.key}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={value}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'text':
        return (
          <TextField
            key={filter.key}
            fullWidth
            size="small"
            label={filter.label}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
          />
        );
      
      case 'number':
        return (
          <TextField
            key={filter.key}
            fullWidth
            size="small"
            type="number"
            label={filter.label}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            inputProps={{
              min: filter.min,
              max: filter.max,
              step: filter.step,
            }}
          />
        );
      
      case 'date':
        return (
          <TextField
            key={filter.key}
            fullWidth
            size="small"
            type="date"
            label={filter.label}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* Search Bar */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{ minWidth: 100 }}
          >
            Buscar
          </Button>
          
          {showAdvancedFilters && filters.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ minWidth: 120 }}
            >
              Filtros
              {activeFiltersCount > 0 && (
                <Chip
                  label={activeFiltersCount}
                  size="small"
                  color="primary"
                  sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Button>
          )}
          
          {(searchTerm || activeFiltersCount > 0) && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ClearIcon />}
              onClick={handleClearAll}
              sx={{ minWidth: 100 }}
            >
              Limpiar
            </Button>
          )}
        </Box>
      </Box>

      {/* Advanced Filters */}
      {showAdvancedFilters && filters.length > 0 && (
        <Collapse in={showFilters}>
          <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Filtros Avanzados
            </Typography>
            
            <Grid container spacing={2}>
              {filters.map((filter) => (
                <Grid item xs={12} sm={6} md={4} key={filter.key}>
                  {renderFilter(filter)}
                </Grid>
              ))}
            </Grid>
            
            {activeFiltersCount > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Filtros activos:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {Object.entries(filterValues)
                    .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
                    .map(([key, value]) => {
                      const filter = filters.find(f => f.key === key);
                      const displayValue = filter?.type === 'select' 
                        ? filter.options?.find(opt => opt.value === value)?.label || value
                        : value;
                      
                      return (
                        <Chip
                          key={key}
                          label={`${filter?.label}: ${displayValue}`}
                          onDelete={() => handleFilterChange(key, '')}
                          size="small"
                          variant="outlined"
                        />
                      );
                    })}
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      )}
    </Paper>
  );
};

export default SearchAndFilters;