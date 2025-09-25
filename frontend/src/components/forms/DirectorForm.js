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
  Grid,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ButtonLoader } from '../common';

// Validation schema for director form
const directorSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.'-]+$/, 'El nombre contiene caracteres no válidos'),
  nationality: yup
    .string()
    .required('La nacionalidad es obligatoria')
    .min(2, 'La nacionalidad debe tener al menos 2 caracteres')
    .max(50, 'La nacionalidad no puede exceder 50 caracteres'),
  birthDate: yup
    .date()
    .nullable()
    .max(new Date(), 'La fecha de nacimiento no puede ser futura')
    .min(new Date('1900-01-01'), 'La fecha de nacimiento debe ser posterior a 1900'),
  biography: yup
    .string()
    .max(1000, 'La biografía no puede exceder 1000 caracteres'),
  awards: yup
    .string()
    .max(500, 'Los premios no pueden exceder 500 caracteres'),
  isActive: yup.boolean(),
});

/**
 * Director Form Component
 * Handles creation and editing of director records
 */
const DirectorForm = ({
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
    resolver: yupResolver(directorSchema),
    defaultValues: {
      name: '',
      nationality: '',
      birthDate: null,
      biography: '',
      awards: '',
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
          nationality: initialData.nationality || '',
          birthDate: initialData.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
          biography: initialData.biography || '',
          awards: initialData.awards || '',
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        });
      } else {
        reset({
          name: '',
          nationality: '',
          birthDate: '',
          biography: '',
          awards: '',
          isActive: true,
        });
      }
      setSubmitError(null);
    }
  }, [open, initialData, mode, reset]);

  const handleFormSubmit = async (data) => {
    try {
      setSubmitError(null);
      // Convert birthDate to proper format if provided
      const formattedData = {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
      };
      await onSubmit(formattedData);
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
      return `Editar Director: ${initialData?.name || ''}`;
    }
    return 'Crear Nuevo Director';
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
            : 'Completa la información para crear un nuevo director'
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

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Información Básica
              </Typography>
            </Grid>

            {/* Name Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre Completo"
                    placeholder="Ej: Steven Spielberg"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* Nationality Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name="nationality"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nacionalidad"
                    placeholder="Ej: Estadounidense, Británico"
                    fullWidth
                    required
                    error={!!errors.nationality}
                    helperText={errors.nationality?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* Birth Date Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Fecha de Nacimiento"
                    type="date"
                    fullWidth
                    error={!!errors.birthDate}
                    helperText={
                      errors.birthDate?.message || 
                      (field.value && `Edad: ${calculateAge(field.value)} años`)
                    }
                    disabled={isLoading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Active Status */}
            <Grid item xs={12} md={6}>
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
                            ? 'El director estará disponible para asignar'
                            : 'El director estará oculto'
                          }
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                Información Adicional
              </Typography>
            </Grid>

            {/* Biography Field */}
            <Grid item xs={12}>
              <Controller
                name="biography"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Biografía"
                    placeholder="Describe la carrera y logros del director..."
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.biography}
                    helperText={errors.biography?.message || `${field.value?.length || 0}/1000 caracteres`}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* Awards Field */}
            <Grid item xs={12}>
              <Controller
                name="awards"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Premios y Reconocimientos"
                    placeholder="Lista los principales premios y reconocimientos..."
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.awards}
                    helperText={errors.awards?.message || `${field.value?.length || 0}/500 caracteres`}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
          </Grid>

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
                <strong>Nacionalidad:</strong> {watchedValues.nationality || 'Sin especificar'}
              </Typography>
              {watchedValues.birthDate && (
                <Typography variant="body2">
                  <strong>Edad:</strong> {calculateAge(watchedValues.birthDate)} años
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Estado:</strong> {watchedValues.isActive ? 'Activo' : 'Inactivo'}
              </Typography>
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
                : 'Crear Director'
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DirectorForm;