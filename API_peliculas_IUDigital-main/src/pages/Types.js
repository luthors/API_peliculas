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
import { TypeForm } from '../components/forms';
import { TypeService } from '../services';

/**
 * Types Page Component
 * Manages the complete CRUD operations for content types
 */
const Types = () => {
  // State management
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formMode, setFormMode] = useState('create');
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const [viewDialog, setViewDialog] = useState({ open: false, type: null });
  
  // Pagination and filtering
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    format: '',
    isActive: ''
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
      field: 'category',
      headerName: 'Categoría',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Película' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      field: 'format',
      headerName: 'Formato',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'platforms',
      headerName: 'Plataformas',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const platforms = params.value;
        if (!platforms || platforms.length === 0) {
          return <Chip label="Sin plataformas" size="small" variant="outlined" />;
        }
        if (platforms.length === 1) {
          return <Chip label={platforms[0]} size="small" color="info" />;
        }
        return (
          <Tooltip title={platforms.join(', ')}>
            <Chip 
              label={`${platforms.length} plataformas`} 
              size="small" 
              color="info" 
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'duration',
      headerName: 'Duración',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const { minDuration, maxDuration } = params.row;
        if (!minDuration && !maxDuration) return 'N/A';
        if (minDuration && maxDuration) {
          return `${minDuration}-${maxDuration} min`;
        }
        return `${minDuration || maxDuration} min`;
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
      name: 'category',
      label: 'Categoría',
      type: 'select',
      value: filters.category,
      options: [
        { value: '', label: 'Todas' },
        { value: 'Película', label: 'Película' },
        { value: 'Serie', label: 'Serie' },
        { value: 'Documental', label: 'Documental' },
        { value: 'Animación', label: 'Animación' },
      ],
    },
    {
      name: 'format',
      label: 'Formato',
      type: 'select',
      value: filters.format,
      options: [
        { value: '', label: 'Todos' },
        { value: 'Digital', label: 'Digital' },
        { value: 'Físico', label: 'Físico' },
        { value: 'Streaming', label: 'Streaming' },
        { value: 'Cine', label: 'Cine' },
        { value: 'TV', label: 'TV' },
      ],
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
  
  // Load types data
  const loadTypes = useCallback(async () => {
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
      
      const response = await TypeService.getAll(params);
      
      setTypes(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error loading types:', error);
      showNotification('Error al cargar los tipos', 'error');
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, showNotification]);
  
  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadTypes();
  }, [loadTypes]);
  
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
      category: '',
      format: '',
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
    setSelectedType(null);
    setFormMode('create');
    setFormOpen(true);
  };
  
  const handleEdit = (type) => {
    setSelectedType(type);
    setFormMode('edit');
    setFormOpen(true);
  };
  
  const handleView = (type) => {
    setViewDialog({ open: true, type });
  };
  
  const handleDelete = (type) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar el tipo "${type.name}"?`,
      onConfirm: () => performDelete(type._id),
      severity: 'error',
    });
  };
  
  const handleDeactivate = (type) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Desactivación',
      message: `¿Estás seguro de que deseas desactivar el tipo "${type.name}"?`,
      onConfirm: () => performDeactivate(type._id),
      severity: 'warning',
    });
  };
  
  const handleRestore = (type) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Restauración',
      message: `¿Estás seguro de que deseas restaurar el tipo "${type.name}"?`,
      onConfirm: () => performRestore(type._id),
      severity: 'info',
    });
  };
  
  // API Operations
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      if (formMode === 'create') {
        await TypeService.create(formData);
        showNotification('Tipo creado exitosamente', 'success');
      } else {
        await TypeService.update(selectedType._id, formData);
        showNotification('Tipo actualizado exitosamente', 'success');
      }
      
      setFormOpen(false);
      setSelectedType(null);
      loadTypes();
    } catch (error) {
      console.error('Error saving type:', error);
      showNotification(
        `Error al ${formMode === 'create' ? 'crear' : 'actualizar'} el tipo`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const performDelete = async (typeId) => {
    try {
      setLoading(true);
      await TypeService.delete(typeId);
      showNotification('Tipo eliminado exitosamente', 'success');
      loadTypes();
    } catch (error) {
      console.error('Error deleting type:', error);
      showNotification('Error al eliminar el tipo', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false });
    }
  };
  
  const performDeactivate = async (typeId) => {
    try {
      setLoading(true);
      await TypeService.update(typeId, { isActive: false });
      showNotification('Tipo desactivado exitosamente', 'success');
      loadTypes();
    } catch (error) {
      console.error('Error deactivating type:', error);
      showNotification('Error al desactivar el tipo', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false });
    }
  };
  
  const performRestore = async (typeId) => {
    try {
      setLoading(true);
      await TypeService.update(typeId, { isActive: true });
      showNotification('Tipo restaurado exitosamente', 'success');
      loadTypes();
    } catch (error) {
      console.error('Error restoring type:', error);
      showNotification('Error al restaurar el tipo', 'error');
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
          Gestión de Tipos
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadTypes}
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
            Nuevo Tipo
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
            searchPlaceholder="Buscar tipos por nombre..."
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
              data={types}
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
          {formMode === 'create' ? 'Crear Nuevo Tipo' : 'Editar Tipo'}
        </DialogTitle>
        <DialogContent>
          <TypeForm
            type={selectedType}
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
        onClose={() => setViewDialog({ open: false, type: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalles del Tipo</DialogTitle>
        <DialogContent>
          {viewDialog.type && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {viewDialog.type.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Categoría: {viewDialog.type.category}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Formato: {viewDialog.type.format}
              </Typography>
              {(viewDialog.type.minDuration || viewDialog.type.maxDuration) && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Duración: {viewDialog.type.minDuration || 0} - {viewDialog.type.maxDuration || 'Sin límite'} minutos
                </Typography>
              )}
              {viewDialog.type.description && (
                <Typography variant="body2" sx={{ mt: 2 }} gutterBottom>
                  <strong>Descripción:</strong><br />
                  {viewDialog.type.description}
                </Typography>
              )}
              {viewDialog.type.platforms && viewDialog.type.platforms.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Plataformas:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {viewDialog.type.platforms.map((platform, index) => (
                      <Chip key={index} label={platform} size="small" color="info" />
                    ))}
                  </Box>
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={viewDialog.type.isActive ? 'Activo' : 'Inactivo'}
                  color={viewDialog.type.isActive ? 'success' : 'default'}
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

export default Types;