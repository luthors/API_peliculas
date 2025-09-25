import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

/**
 * Reusable Confirmation Dialog Component
 * Used for confirming destructive actions like delete operations
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar Acción',
  message = '¿Estás seguro de que deseas realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  severity = 'warning', // 'warning', 'error', 'info'
  itemName = null,
  itemType = 'elemento',
  isLoading = false,
  additionalInfo = null,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading && onClose) {
      onClose();
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'error':
        return <DeleteIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'warning';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getSeverityIcon()}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity={getSeverityColor()} sx={{ mb: 2 }}>
          <Typography variant="body1">
            {message}
          </Typography>
          
          {itemName && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
              {itemType}: "{itemName}"
            </Typography>
          )}
        </Alert>
        
        {additionalInfo && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {additionalInfo}
            </Typography>
          </Box>
        )}
        
        {severity === 'error' && (
          <Typography variant="body2" color="error" sx={{ mt: 2, fontStyle: 'italic' }}>
            ⚠️ Esta acción no se puede deshacer.
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          startIcon={<CancelIcon />}
          sx={{ minWidth: 100 }}
        >
          {cancelText}
        </Button>
        
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={getSeverityColor()}
          disabled={isLoading}
          startIcon={severity === 'error' ? <DeleteIcon /> : <WarningIcon />}
          sx={{ minWidth: 100 }}
        >
          {isLoading ? 'Procesando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Predefined configurations for common use cases
export const DeleteConfirmDialog = (props) => (
  <ConfirmDialog
    title="Confirmar Eliminación"
    message="¿Estás seguro de que deseas eliminar este elemento?"
    confirmText="Eliminar"
    severity="error"
    {...props}
  />
);

export const DeactivateConfirmDialog = (props) => (
  <ConfirmDialog
    title="Confirmar Desactivación"
    message="¿Estás seguro de que deseas desactivar este elemento?"
    confirmText="Desactivar"
    severity="warning"
    additionalInfo="El elemento será marcado como inactivo pero no se eliminará permanentemente."
    {...props}
  />
);

export const RestoreConfirmDialog = (props) => (
  <ConfirmDialog
    title="Confirmar Restauración"
    message="¿Estás seguro de que deseas restaurar este elemento?"
    confirmText="Restaurar"
    severity="info"
    additionalInfo="El elemento será marcado como activo nuevamente."
    {...props}
  />
);

export default ConfirmDialog;