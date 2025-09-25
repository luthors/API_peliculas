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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  RestoreFromTrash as RestoreIcon,
  Block as DeactivateIcon,
} from '@mui/icons-material';
import {
  DataTable,
  SearchAndFilters,
  ConfirmDialog,
  useNotification,
  LoadingSpinner,
} from '../components/common';
import { DirectorForm } from '../components/forms';
import { DirectorService } from '../services';

/**
 * Directors Page Component
 * Manages the complete CRUD operations for directors
 */
const Directors = () => {
  // State management
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [formMode, setFormMode] = useState('create');
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const [viewDialog, setViewDialog] = useState({ open: false, director: null });
  
  // Pagination and filtering
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    nationality: '',
    isActive: '',
    hasAwards: ''
  });
  
  // Notifications
  const { showNotification } = useNotification();
  
  // Table columns configuration
  const columns = [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'nationality',
      headerName: 'Nacionalidad',
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: 'birthDate',
      headerName: 'Fecha de Nacimiento',
      flex: 0.8,
      minWidth: 130,
      type: 'date',
    },
    {
      field: 'age',
      headerName: 'Edad',
      flex: 0.5,
      minWidth: 80,
      renderCell: (params) => {
        if (!params.row.birthDate) return 'N/A';
        const age = new Date().getFullYear() - new Date(params.row.birthDate).getFullYear();
        return `${age} años`;
      },
    },
    {
      field: 'awards',
      headerName: 'Premios',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params) => {
        const awards = params.row.awards;
        if (!awards || awards.length === 0) {
          return <Chip label="Sin premios" size="small" variant="outlined" />;
        }
        return (
          <Tooltip title={awards.join(', ')}>
            <Chip 
              label={`${awards.length} premio${awards.length > 1 ? 's' : ''}`} 
              size="small" 
              color="primary" 
            />
          </Tooltip>
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
      name: 'nationality',
      label: 'Nacionalidad',
      type: 'text',
      value: filters.nationality,
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
    {
      name: 'hasAwards',
      label: 'Con Premios',
      type: 'select',
      value: filters.hasAwards,
      options: [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Con premios' },
        { value: 'false', label: 'Sin premios' },
      ],
    },
  ];
  
  // Load directors data
  const loadDirectors = useCallback(async () => {
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
      
      const response = await DirectorService.getAll(params);
      
      setDirectors(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error loading directors:', error);
      showNotification('Error al cargar los directores', 'error');
      setDirectors([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, showNotification]);
  
  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadDirectors();
  }, [loadDirectors]);
  
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
      nationality: '',
      isActive: '',
      hasAwards: ''
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
    setSelectedDirector(null);
    setFormMode('create');
    setFormOpen(true);
  };
  
  const handleEdit = (director) => {
    setSelectedDirector(director);
    setFormMode('edit');
    setFormOpen(true);
  };
  
  const handleView = (director) => {
    setViewDialog({ open: true, director });
  };
  
  const handleDelete = (director) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar el director "${director.name}"?`,
      onConfirm: () => performDelete(director._id),
      severity: 'error',
    });
  };
  
  const handleDeactivate = (director) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Desactivación',
      message: `¿Estás seguro de que deseas desactivar el director "${director.name}"?`,
      onConfirm: () => performDeactivate(director._id),
      severity: 'warning',
    });
  };
  
  const handleRestore = (director) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Restauración',
      message: `¿Estás seguro de que deseas restaurar el director "${director.name}"?`,
      onConfirm: () => performRestore(director._id),
      severity: 'info',
    });
  };
  
  // API Operations
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      if (formMode === 'create') {
        await DirectorService.create(formData);
        showNotification('Director creado exitosamente', 'success');
      } else {
        await DirectorService.update(selectedDirector._id, formData);
        showNotification('Director actualizado exitosamente', 'success');
      }
      
      setFormOpen(false);
      setSelectedDirector(null);
      loadDirectors();
    } catch (error) {
      console.error('Error saving director:', error);
      showNotification(
        `Error al ${formMode === 'create' ? 'crear' : 'actualizar'} el director`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const performDelete = async (directorId) => {
    try {
      setLoading(true);
      await DirectorService.delete(directorId);
      showNotification('Director eliminado exitosamente', 'success');
      loadDirectors();
    } catch (error) {
      console.error('Error deleting director:', error);
      showNotification('Error al eliminar el director', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false });
    }
  };
  
  const performDeactivate = async (directorId) => {
    try {
      setLoading(true);
      await DirectorService.update(directorId, { isActive: false });
      showNotification('Director desactivado exitosamente', 'success');
      loadDirectors();
    } catch (error) {
      console.error('Error deactivating director:', error);
      showNotification('Error al desactivar el director', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false });
    }
  };
  
  const performRestore = async (directorId) => {
    try {
      setLoading(true);
      await DirectorService.update(directorId, { isActive: true });
      showNotification('Director restaurado exitosamente', 'success');
      loadDirectors();
    } catch (error) {
      console.error('Error restoring director:', error);
      showNotification('Error al restaurar el director', 'error');
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
          Gestión de Directores
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadDirectors}
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
            Nuevo Director
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
            searchPlaceholder="Buscar directores por nombre..."
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
              data={directors}
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle>
          {formMode === 'create' ? 'Crear Nuevo Director' : 'Editar Director'}
        </DialogTitle>
        <DialogContent>
          <DirectorForm
            director={selectedDirector}
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
        onClose={() => setViewDialog({ open: false, director: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalles del Director</DialogTitle>
        <DialogContent>
          {viewDialog.director && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {viewDialog.director.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Nacionalidad: {viewDialog.director.nationality}
              </Typography>
              {viewDialog.director.birthDate && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Fecha de Nacimiento: {new Date(viewDialog.director.birthDate).toLocaleDateString()}
                </Typography>
              )}
              {viewDialog.director.biography && (
                <Typography variant="body2" sx={{ mt: 2 }} gutterBottom>
                  <strong>Biografía:</strong><br />
                  {viewDialog.director.biography}
                </Typography>
              )}
              {viewDialog.director.awards && viewDialog.director.awards.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Premios:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {viewDialog.director.awards.map((award, index) => (
                      <Chip key={index} label={award} size="small" color="primary" />
                    ))}
                  </Box>
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={viewDialog.director.isActive ? 'Activo' : 'Inactivo'}
                  color={viewDialog.director.isActive ? 'success' : 'default'}
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

export default Directors;