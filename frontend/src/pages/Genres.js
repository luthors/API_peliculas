import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  DataTable,
  SearchAndFilters,
  PageLoader,
  useNotification,
  DeleteConfirmDialog,
  DeactivateConfirmDialog,
  RestoreConfirmDialog,
} from '../components/common';
import GenreForm from '../components/forms/GenreForm';
import { genreService } from '../services';

/**
 * Genres Management Page
 * Handles CRUD operations for genre records
 */
const Genres = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
  });
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    isActive: '',
  });
  
  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Confirmation dialogs state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, genre: null });
  const [deactivateDialog, setDeactivateDialog] = useState({ open: false, genre: null });
  const [restoreDialog, setRestoreDialog] = useState({ open: false, genre: null });
  
  const { showSuccess, showError, showWarning } = useNotification();

  // Load genres data
  const loadGenres = useCallback(async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      
      const params = {
        page: pagination.page + 1, // API uses 1-based pagination
        limit: pagination.limit,
        ...searchFilters,
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await genreService.getAll(params);
      
      setGenres(response.data?.data || []);
      setTotalCount(response.data?.totalCount || 0);
    } catch (error) {
      console.error('Error loading genres:', error);
      showError('Error al cargar los géneros');
      setGenres([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [pagination, searchFilters, showError]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadGenres();
  }, [loadGenres]);

  // Handle search
  const handleSearch = (searchTerm) => {
    setSearchFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  // Handle filters
  const handleFilter = (filters) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchFilters({ search: '', isActive: '' });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Handle pagination change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newLimit) => {
    setPagination({ page: 0, limit: newLimit });
  };

  // Form handlers
  const handleCreateGenre = () => {
    setFormMode('create');
    setSelectedGenre(null);
    setFormOpen(true);
  };

  const handleEditGenre = (genre) => {
    setFormMode('edit');
    setSelectedGenre(genre);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      
      if (formMode === 'create') {
        await genreService.create(formData);
        showSuccess('Género creado exitosamente');
      } else {
        await genreService.update(selectedGenre._id, formData);
        showSuccess('Género actualizado exitosamente');
      }
      
      setFormOpen(false);
      loadGenres(false); // Reload data without loading spinner
    } catch (error) {
      console.error('Error saving genre:', error);
      throw error; // Re-throw to let form handle the error
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedGenre(null);
  };

  // Delete handlers
  const handleDeleteClick = (genre) => {
    setDeleteDialog({ open: true, genre });
  };

  const handleDeleteConfirm = async () => {
    try {
      await genreService.delete(deleteDialog.genre._id);
      showSuccess('Género eliminado exitosamente');
      setDeleteDialog({ open: false, genre: null });
      loadGenres(false);
    } catch (error) {
      console.error('Error deleting genre:', error);
      showError('Error al eliminar el género');
    }
  };

  // Deactivate handlers
  const handleDeactivateClick = (genre) => {
    setDeactivateDialog({ open: true, genre });
  };

  const handleDeactivateConfirm = async () => {
    try {
      await genreService.update(deactivateDialog.genre._id, { isActive: false });
      showWarning('Género desactivado exitosamente');
      setDeactivateDialog({ open: false, genre: null });
      loadGenres(false);
    } catch (error) {
      console.error('Error deactivating genre:', error);
      showError('Error al desactivar el género');
    }
  };

  // Restore handlers
  const handleRestoreClick = (genre) => {
    setRestoreDialog({ open: true, genre });
  };

  const handleRestoreConfirm = async () => {
    try {
      await genreService.update(restoreDialog.genre._id, { isActive: true });
      showSuccess('Género restaurado exitosamente');
      setRestoreDialog({ open: false, genre: null });
      loadGenres(false);
    } catch (error) {
      console.error('Error restoring genre:', error);
      showError('Error al restaurar el género');
    }
  };

  // Table columns configuration
  const columns = [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'description',
      headerName: 'Descripción',
      flex: 2,
      minWidth: 200,
      renderCell: (value) => {
        if (!value) return <em style={{ color: '#999' }}>Sin descripción</em>;
        return value.length > 100 ? `${value.substring(0, 100)}...` : value;
      },
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 120,
      renderCell: (value) => (
        <Chip
          label={value ? 'Activo' : 'Inactivo'}
          color={value ? 'success' : 'default'}
          size="small"
          variant={value ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Fecha Creación',
      width: 140,
      type: 'date',
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => handleEditGenre(row)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {row.isActive ? (
            <Tooltip title="Desactivar">
              <IconButton
                size="small"
                onClick={() => handleDeactivateClick(row)}
                color="warning"
              >
                <HideIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Activar">
              <IconButton
                size="small"
                onClick={() => handleRestoreClick(row)}
                color="success"
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(row)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Filter configuration
  const filterConfig = [
    {
      key: 'isActive',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'true', label: 'Activo' },
        { value: 'false', label: 'Inactivo' },
      ],
    },
  ];

  if (loading) {
    return <PageLoader message="Cargando géneros..." />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Géneros
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los géneros cinematográficos del sistema
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Actualizar">
            <IconButton onClick={() => loadGenres()} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateGenre}
            sx={{ minWidth: 140 }}
          >
            Nuevo Género
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <SearchAndFilters
        onSearch={handleSearch}
        onFilter={handleFilter}
        onClear={handleClearFilters}
        searchPlaceholder="Buscar géneros por nombre..."
        filters={filterConfig}
        initialValues={searchFilters}
      />

      {/* Results Summary */}
      {totalCount > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Se encontraron {totalCount} género{totalCount !== 1 ? 's' : ''}
          {searchFilters.search && ` que coinciden con "${searchFilters.search}"`}
        </Alert>
      )}

      {/* Data Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={genres}
          loading={loading}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: totalCount,
            onPageChange: handlePageChange,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          emptyMessage="No se encontraron géneros"
        />
      </Paper>

      {/* Genre Form Dialog */}
      <GenreForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedGenre}
        isLoading={formLoading}
        mode={formMode}
      />

      {/* Confirmation Dialogs */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, genre: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteDialog.genre?.name}
        itemType="género"
      />

      <DeactivateConfirmDialog
        open={deactivateDialog.open}
        onClose={() => setDeactivateDialog({ open: false, genre: null })}
        onConfirm={handleDeactivateConfirm}
        itemName={deactivateDialog.genre?.name}
        itemType="género"
      />

      <RestoreConfirmDialog
        open={restoreDialog.open}
        onClose={() => setRestoreDialog({ open: false, genre: null })}
        onConfirm={handleRestoreConfirm}
        itemName={restoreDialog.genre?.name}
        itemType="género"
      />
    </Box>
  );
};

export default Genres;