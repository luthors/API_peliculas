import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  Chip,
  Tooltip,
  IconButton,
  Avatar,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  RestoreFromTrash as RestoreIcon,
  Block as DeactivateIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import {
  DataTable,
  SearchAndFilters,
  ConfirmDialog,
  useNotification,
  LoadingSpinner,
} from '../components/common';
import { MediaForm } from '../components/forms';
import { MediaService } from '../services';

/**
 * Media Page Component
 * Manages the complete CRUD operations for media (movies and series)
 */
const Media = () => {
  // State management
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [formMode, setFormMode] = useState('create');
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const [viewDialog, setViewDialog] = useState({ open: false, media: null });
  
  // Pagination and filtering
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    year: '',
    genre: '',
    director: '',
    producer: '',
    isActive: ''
  });
  
  // Notifications
  const { showNotification } = useNotification();
  
  // Table columns configuration
  const columns = [
    {
      field: 'poster',
      headerName: 'Póster',
      flex: 0.3,
      minWidth: 80,
      sortable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.posterUrl}
          alt={params.row.title}
          variant="rounded"
          sx={{ width: 40, height: 60 }}
        >
          {params.row.type === 'Película' ? <MovieIcon /> : <TvIcon />}
        </Avatar>
      ),
    },
    {
      field: 'title',
      headerName: 'Título',
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: 'type',
      headerName: 'Tipo',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Película' ? 'primary' : 'secondary'}
          size="small"
          icon={params.value === 'Película' ? <MovieIcon /> : <TvIcon />}
        />
      ),
    },
    {
      field: 'year',
      headerName: 'Año',
      flex: 0.5,
      minWidth: 80,
    },
    {
      field: 'duration',
      headerName: 'Duración',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params) => {
        if (!params.value) return 'N/A';
        return `${params.value} min`;
      },
    },
    {
      field: 'genres',
      headerName: 'Géneros',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const genres = params.value;
        if (!genres || genres.length === 0) {
          return <Chip label="Sin géneros" size="small" variant="outlined" />;
        }
        if (genres.length === 1) {
          return <Chip label={genres[0].name} size="small" color="primary" />;
        }
        return (
          <Tooltip title={genres.map(g => g.name).join(', ')}>
            <Chip 
              label={`${genres.length} géneros`} 
              size="small" 
              color="primary" 
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'directors',
      headerName: 'Directores',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const directors = params.value;
        if (!directors || directors.length === 0) {
          return <Chip label="Sin directores" size="small" variant="outlined" />;
        }
        if (directors.length === 1) {
          return <Chip label={directors[0].name} size="small" color="info" />;
        }
        return (
          <Tooltip title={directors.map(d => d.name).join(', ')}>
            <Chip 
              label={`${directors.length} directores`} 
              size="small" 
              color="info" 
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'rating',
      headerName: 'Clasificación',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params) => {
        if (!params.value) return 'N/A';
        return (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            color="warning"
          />
        );
      },
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      flex: 0.5,
      minWidth: 100,
      type: 'boolean',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 0.8,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Ver detalles">
            <IconButton
              size="small"
              onClick={() => handleView(params.row)}
              color="info"
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.isActive ? (
            <Tooltip title="Desactivar">
              <IconButton
                size="small"
                onClick={() => handleDeactivate(params.row)}
                color="warning"
              >
                <DeactivateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Restaurar">
              <IconButton
                size="small"
                onClick={() => handleRestore(params.row)}
                color="success"
              >
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row)}
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
      name: 'type',
      label: 'Tipo',
      type: 'select',
      value: filters.type,
      options: [
        { value: '', label: 'Todos' },
        { value: 'Película', label: 'Película' },
        { value: 'Serie', label: 'Serie' },
      ],
    },
    {
      name: 'year',
      label: 'Año',
      type: 'text',
      value: filters.year,
    },
    {
      name: 'genre',
      label: 'Género',
      type: 'text',
      value: filters.genre,
    },
    {
      name: 'director',
      label: 'Director',
      type: 'text',
      value: filters.director,
    },
    {
      name: 'producer',
      label: 'Productora',
      type: 'text',
      value: filters.producer,
    },
    {
      name: 'isActive',
      label: 'Estado',
      type: 'select',
      value: filters.isActive,
      options: [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' },
      ],
    },
  ];
  
  // Load media data
  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page + 1,
        limit: pagination.limit,
        ...filters,
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await MediaService.getAll(params);
      
      setMedia(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error loading media:', error);
      showNotification('Error al cargar los medios', 'error');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, showNotification]);
  
  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);
  
  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };
  
  // Handle filters
  const handleFilter = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      year: '',
      genre: '',
      director: '',
      producer: '',
      isActive: ''
    });
    setPagination(prev => ({ ...prev, page: 0 }));
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, limit: newPageSize, page: 0 }));
  };
  
  // CRUD Operations
  const handleCreate = () => {
    setSelectedMedia(null);
    setFormMode('create');
    setFormOpen(true);
  };
  
  const handleEdit = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setFormMode('edit');
    setFormOpen(true);
  };
  
  const handleView = (mediaItem) => {
    setViewDialog({ open: true, media: mediaItem });
  };
  
  const handleDelete = (mediaItem) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar "${mediaItem.title}"?`,
      onConfirm: () => performDelete(mediaItem._id),
      severity: 'error',
    });
  };
  
  const handleDeactivate = (mediaItem) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Desactivación',
      message: `¿Estás seguro de que deseas desactivar "${mediaItem.title}"?`,
      onConfirm: () => performDeactivate(mediaItem._id),
      severity: 'warning',
    });
  };
  
  const handleRestore = (mediaItem) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Restauración',
      message: `¿Estás seguro de que deseas restaurar "${mediaItem.title}"?`,
      onConfirm: () => performRestore(mediaItem._id),
      severity: 'info',
    });
  };
  
  // API Operations
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      if (formMode === 'create') {
        await MediaService.create(formData);
        showNotification('Medio creado exitosamente', 'success');
      } else {
        await MediaService.update(selectedMedia._id, formData);
        showNotification('Medio actualizado exitosamente', 'success');
      }
      
      setFormOpen(false);
      setSelectedMedia(null);
      loadMedia();
    } catch (error) {
      console.error('Error saving media:', error);
      showNotification(
        `Error al ${formMode === 'create' ? 'crear' : 'actualizar'} el medio`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const performDelete = async (mediaId) => {
    try {
      setLoading(true);
      await MediaService.delete(mediaId);
      showNotification('Medio eliminado exitosamente', 'success');
      loadMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
      showNotification('Error al eliminar el medio', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false });
    }
  };
  
  const performDeactivate = async (mediaId) => {
    try {
      setLoading(true);
      await MediaService.update(mediaId, { isActive: false });
      showNotification('Medio desactivado exitosamente', 'success');
      loadMedia();
    } catch (error) {
      console.error('Error deactivating media:', error);
      showNotification('Error al desactivar el medio', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false });
    }
  };
  
  const performRestore = async (mediaId) => {
    try {
      setLoading(true);
      await MediaService.update(mediaId, { isActive: true });
      showNotification('Medio restaurado exitosamente', 'success');
      loadMedia();
    } catch (error) {
      console.error('Error restoring media:', error);
      showNotification('Error al restaurar el medio', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false });
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Medios
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadMedia}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={loading}
          >
            Nuevo Medio
          </Button>
        </Box>
      </Box>
      
      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SearchAndFilters
            onSearch={handleSearch}
            onFilter={handleFilter}
            onClear={handleClearFilters}
            filters={filterConfig}
            searchPlaceholder="Buscar medios por título..."
          />
        </CardContent>
      </Card>
      
      {/* Data Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <LoadingSpinner />
            </Box>
          ) : (
            <DataTable
              data={media}
              columns={columns}
              pagination={{
                page: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreate}
        disabled={loading}
      >
        <AddIcon />
      </Fab>
      
      {/* Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          {formMode === 'create' ? 'Crear Nuevo Medio' : 'Editar Medio'}
        </DialogTitle>
        <DialogContent>
          <MediaForm
            media={selectedMedia}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormOpen(false)}
            loading={loading}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>
      
      {/* View Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, media: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalles del Medio</DialogTitle>
        <DialogContent>
          {viewDialog.media && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar
                  src={viewDialog.media.posterUrl}
                  alt={viewDialog.media.title}
                  variant="rounded"
                  sx={{ width: 120, height: 180 }}
                >
                  {viewDialog.media.type === 'Película' ? <MovieIcon /> : <TvIcon />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {viewDialog.media.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Tipo: {viewDialog.media.type}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Año: {viewDialog.media.year}
                  </Typography>
                  {viewDialog.media.duration && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Duración: {viewDialog.media.duration} minutos
                    </Typography>
                  )}
                  {viewDialog.media.rating && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Clasificación: {viewDialog.media.rating}
                    </Typography>
                  )}
                  {viewDialog.media.budget && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Presupuesto: ${viewDialog.media.budget.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              {viewDialog.media.synopsis && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Sinopsis:</strong><br />
                  {viewDialog.media.synopsis}
                </Typography>
              )}
              
              {viewDialog.media.genres && viewDialog.media.genres.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Géneros:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {viewDialog.media.genres.map((genre, index) => (
                      <Chip key={index} label={genre.name} size="small" color="primary" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {viewDialog.media.directors && viewDialog.media.directors.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Directores:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {viewDialog.media.directors.map((director, index) => (
                      <Chip key={index} label={director.name} size="small" color="info" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {viewDialog.media.producers && viewDialog.media.producers.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Productoras:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {viewDialog.media.producers.map((producer, index) => (
                      <Chip key={index} label={producer.name} size="small" color="secondary" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {viewDialog.media.trailerUrl && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Tráiler:</strong>
                  </Typography>
                  <Link
                    href={viewDialog.media.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    Ver tráiler
                    <LaunchIcon fontSize="small" />
                  </Link>
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={viewDialog.media.isActive ? 'Activo' : 'Inactivo'}
                  color={viewDialog.media.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ open: false })}
        severity={confirmDialog.severity}
      />
    </Box>
  );
};

export default Media;