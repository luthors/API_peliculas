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
  Launch as LaunchIcon,
} from '@mui/icons-material';
import {
  DataTable,
  SearchAndFilters,
  ConfirmDialog,
  useNotification,
  LoadingSpinner,
} from '../components/common';
import { ProducerForm } from '../components/forms';
import { ProducerService } from '../services';

/**
 * Producers Page Component
 * Manages the complete CRUD operations for producers
 */
const Producers = () => {
  // State management
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [formMode, setFormMode] = useState('create');
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const [viewDialog, setViewDialog] = useState({ open: false, producer: null });
  
  // Pagination and filtering
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    specialty: '',
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
      field: 'country',
      headerName: 'País',
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: 'foundedYear',
      headerName: 'Año de Fundación',
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => {
        if (!params.value) return 'N/A';
        const age = new Date().getFullYear() - params.value;
        return `${params.value} (${age} años)`;
      },
    },
    {
      field: 'specialties',
      headerName: 'Especialidades',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const specialties = params.value;
        if (!specialties || specialties.length === 0) {
          return <Chip label="Sin especialidades" size="small" variant="outlined" />;
        }
        if (specialties.length === 1) {
          return <Chip label={specialties[0]} size="small" color="primary" />;
        }
        return (
          <Tooltip title={specialties.join(', ')}>
            <Chip 
              label={`${specialties.length} especialidades`} 
              size="small" 
              color="primary" 
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'website',
      headerName: 'Sitio Web',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        if (!params.value) return 'N/A';
        return (
          <Link
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            Ver sitio
            <LaunchIcon fontSize="small" />
          </Link>
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
          label={params.value ? 'Activa' : 'Inactiva'}
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
      name: 'country',
      label: 'País',
      type: 'text',
      value: filters.country,
    },
    {
      name: 'specialty',
      label: 'Especialidad',
      type: 'text',
      value: filters.specialty,
    },
    {
      name: 'isActive',
      label: 'Estado',
      type: 'select',
      value: filters.isActive,
      options: [
        { value: '', label: 'Todas' },
        { value: 'true', label: 'Activas' },
        { value: 'false', label: 'Inactivas' },
      ],
    },
  ];
  
  // Load producers data
  const loadProducers = useCallback(async () => {
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
      
      const response = await ProducerService.getAll(params);
      
      setProducers(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error loading producers:', error);
      showNotification('Error al cargar las productoras', 'error');
      setProducers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, showNotification]);
  
  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadProducers();
  }, [loadProducers]);
  
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
      country: '',
      specialty: '',
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
    setSelectedProducer(null);
    setFormMode('create');
    setFormOpen(true);
  };
  
  const handleEdit = (producer) => {
    setSelectedProducer(producer);
    setFormMode('edit');
    setFormOpen(true);
  };
  
  const handleView = (producer) => {
    setViewDialog({ open: true, producer });
  };
  
  const handleDelete = (producer) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar la productora "${producer.name}"?`,
      onConfirm: () => performDelete(producer._id),
      severity: 'error',
    });
  };
  
  const handleDeactivate = (producer) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Desactivación',
      message: `¿Estás seguro de que deseas desactivar la productora "${producer.name}"?`,
      onConfirm: () => performDeactivate(producer._id),
      severity: 'warning',
    });
  };
  
  const handleRestore = (producer) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmar Restauración',
      message: `¿Estás seguro de que deseas restaurar la productora "${producer.name}"?`,
      onConfirm: () => performRestore(producer._id),
      severity: 'info',
    });
  };
  
  // API Operations
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      if (formMode === 'create') {
        await ProducerService.create(formData);
        showNotification('Productora creada exitosamente', 'success');
      } else {
        await ProducerService.update(selectedProducer._id, formData);
        showNotification('Productora actualizada exitosamente', 'success');
      }
      
      setFormOpen(false);
      setSelectedProducer(null);
      loadProducers();
    } catch (error) {
      console.error('Error saving producer:', error);
      showNotification(
        `Error al ${formMode === 'create' ? 'crear' : 'actualizar'} la productora`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const performDelete = async (producerId) => {
    try {
      setLoading(true);
      await ProducerService.delete(producerId);
      showNotification('Productora eliminada exitosamente', 'success');
      loadProducers();
    } catch (error) {
      console.error('Error deleting producer:', error);
      showNotification('Error al eliminar la productora', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false });
    }
  };
  
  const performDeactivate = async (producerId) => {
    try {
      setLoading(true);
      await ProducerService.update(producerId, { isActive: false });
      showNotification('Productora desactivada exitosamente', 'success');
      loadProducers();
    } catch (error) {
      console.error('Error deactivating producer:', error);
      showNotification('Error al desactivar la productora', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false });
    }
  };
  
  const performRestore = async (producerId) => {
    try {
      setLoading(true);
      await ProducerService.update(producerId, { isActive: true });
      showNotification('Productora restaurada exitosamente', 'success');
      loadProducers();
    } catch (error) {
      console.error('Error restoring producer:', error);
      showNotification('Error al restaurar la productora', 'error');
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
          Gestión de Productoras
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadProducers}
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
            Nueva Productora
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
            searchPlaceholder="Buscar productoras por nombre..."
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
              data={producers}
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
          {formMode === 'create' ? 'Crear Nueva Productora' : 'Editar Productora'}
        </DialogTitle>
        <DialogContent>
          <ProducerForm
            producer={selectedProducer}
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
        onClose={() => setViewDialog({ open: false, producer: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalles de la Productora</DialogTitle>
        <DialogContent>
          {viewDialog.producer && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {viewDialog.producer.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                País: {viewDialog.producer.country}
              </Typography>
              {viewDialog.producer.foundedYear && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Año de Fundación: {viewDialog.producer.foundedYear}
                </Typography>
              )}
              {viewDialog.producer.website && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Sitio Web: 
                  <Link
                    href={viewDialog.producer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ ml: 1 }}
                  >
                    {viewDialog.producer.website}
                  </Link>
                </Typography>
              )}
              {viewDialog.producer.description && (
                <Typography variant="body2" sx={{ mt: 2 }} gutterBottom>
                  <strong>Descripción:</strong><br />
                  {viewDialog.producer.description}
                </Typography>
              )}
              {viewDialog.producer.specialties && viewDialog.producer.specialties.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Especialidades:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {viewDialog.producer.specialties.map((specialty, index) => (
                      <Chip key={index} label={specialty} size="small" color="primary" />
                    ))}
                  </Box>
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={viewDialog.producer.isActive ? 'Activa' : 'Inactiva'}
                  color={viewDialog.producer.isActive ? 'success' : 'default'}
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

export default Producers;