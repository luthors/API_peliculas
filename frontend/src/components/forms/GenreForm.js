import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ButtonLoader } from '../common';

// Validation schema for genre form
const genreSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  description: yup
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  isActive: yup.boolean(),
});

/**
 * Genre Form Component
 * Handles creation and editing of genre records
 */
const GenreForm = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  mode = 'create', // 'create' or 'edit'
}) => {
  const [submitError, setSubmitError] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm({
    resolver: yupResolver(genreSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Watch form values for real-time validation feedback
  const watchedValues = watch();

  // Reset form when dialog opens/closes or initial data changes
  useEffect(() => {
    if (open) {
      if (initialData && mode === 'edit') {
        reset({
          name: initialData.name || '',
          description: initialData.description || '',
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        });
      } else {
        reset({
          name: '',
          description: '',
          isActive: true,
        });
      }
      setSubmitError(null);
    }
  }, [open, initialData, mode, reset]);

  const handleFormSubmit = async (data) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 
        error.message || 
        'Error al procesar la solicitud'
      );
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSubmitError(null);
      onClose();
    }
  };

  const getDialogTitle = () => {
    if (mode === 'edit') {
      return `Editar Género: ${initialData?.name || ''}`;
    }
    return 'Crear Nuevo Género';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {getDialogTitle()}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {mode === 'edit' 
            ? 'Modifica los campos necesarios y guarda los cambios'
            : 'Completa la información para crear un nuevo género'
          }
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Name Field */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre del Género"
                  placeholder="Ej: Acción, Drama, Comedia"
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={isLoading}
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              )}
            />

            {/* Description Field */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descripción"
                  placeholder="Describe las características de este género..."
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message || `${field.value?.length || 0}/500 caracteres`}
                  disabled={isLoading}
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              )}
            />

            {/* Active Status */}
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      {...field}
                      checked={field.value}
                      disabled={isLoading}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        Estado Activo
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {field.value 
                          ? 'El género estará disponible para su uso'
                          : 'El género estará oculto y no se podrá usar'
                        }
                      </Typography>
                    </Box>
                  }
                />
              )}
            />
          </Box>

          {/* Form Preview */}
          {isDirty && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Vista Previa:
              </Typography>
              <Typography variant="body2">
                <strong>Nombre:</strong> {watchedValues.name || 'Sin nombre'}
              </Typography>
              <Typography variant="body2">
                <strong>Estado:</strong> {watchedValues.isActive ? 'Activo' : 'Inactivo'}
              </Typography>
              {watchedValues.description && (
                <Typography variant="body2">
                  <strong>Descripción:</strong> {watchedValues.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            startIcon={<CancelIcon />}
            sx={{ minWidth: 100 }}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !isDirty}
            startIcon={isLoading ? <ButtonLoader loading /> : <SaveIcon />}
            sx={{ minWidth: 120 }}
          >
            {isLoading 
              ? 'Guardando...' 
              : mode === 'edit' 
                ? 'Actualizar' 
                : 'Crear Género'
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GenreForm;