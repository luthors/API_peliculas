import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  Divider,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LoadingSpinner } from '../common';

// Validation schema for type form
const typeSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .matches(/^[a-zA-Z0-9\s\-&.,()]+$/, 'El nombre contiene caracteres no válidos'),
  category: yup
    .string()
    .required('La categoría es obligatoria')
    .oneOf(['Película', 'Serie', 'Documental', 'Cortometraje', 'Miniserie', 'Especial'], 'Categoría no válida'),
  format: yup
    .string()
    .required('El formato es obligatorio')
    .oneOf(['Digital', 'Físico', 'Streaming', 'Cine', 'Televisión', 'Web'], 'Formato no válido'),
  description: yup
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  platforms: yup
    .array()
    .of(yup.string())
    .max(15, 'No se pueden agregar más de 15 plataformas'),
  duration: yup
    .object().shape({
      min: yup
        .number()
        .nullable()
        .transform((value, originalValue) => originalValue === '' ? null : value)
        .min(1, 'La duración mínima debe ser mayor a 0')
        .max(1000, 'La duración mínima no puede exceder 1000 minutos'),
      max: yup
        .number()
        .nullable()
        .transform((value, originalValue) => originalValue === '' ? null : value)
        .min(1, 'La duración máxima debe ser mayor a 0')
        .max(1000, 'La duración máxima no puede exceder 1000 minutos')
        .test('max-greater-than-min', 'La duración máxima debe ser mayor que la mínima', function(value) {
          const { min } = this.parent;
          if (min && value && value <= min) {
            return false;
          }
          return true;
        })
    }),
  isActive: yup.boolean(),
});

// Available categories
const categories = [
  'Película',
  'Serie',
  'Documental',
  'Cortometraje',
  'Miniserie',
  'Especial'
];

// Available formats
const formats = [
  'Digital',
  'Físico',
  'Streaming',
  'Cine',
  'Televisión',
  'Web'
];

// Common platforms for autocomplete
const commonPlatforms = [
  'Netflix',
  'Amazon Prime Video',
  'Disney+',
  'HBO Max',
  'Hulu',
  'Apple TV+',
  'Paramount+',
  'Peacock',
  'YouTube',
  'Crunchyroll',
  'Funimation',
  'Pluto TV',
  'Tubi',
  'Vudu',
  'Google Play Movies',
  'iTunes',
  'Microsoft Store',
  'Roku Channel',
  'IMDb TV',
  'Crackle'
];

/**
 * TypeForm Component
 * Form for creating and editing content type records
 * 
 * @param {Object} props - Component props
 * @param {Object} props.type - Type data for editing (optional)
 * @param {Function} props.onSubmit - Submit handler function
 * @param {Function} props.onCancel - Cancel handler function
 * @param {boolean} props.loading - Loading state
 * @param {string} props.mode - Form mode ('create' or 'edit')
 */
const TypeForm = ({ 
  type = null, 
  onSubmit, 
  onCancel, 
  loading = false, 
  mode = 'create' 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [platformInput, setPlatformInput] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue,
    getValues
  } = useForm({
    resolver: yupResolver(typeSchema),
    defaultValues: {
      name: '',
      category: '',
      format: '',
      description: '',
      platforms: [],
      duration: {
        min: '',
        max: ''
      },
      isActive: true,
    },
    mode: 'onChange'
  });

  const watchedValues = watch();

  // Load type data when editing
  useEffect(() => {
    if (type && mode === 'edit') {
      reset({
        name: type.name || '',
        category: type.category || '',
        format: type.format || '',
        description: type.description || '',
        platforms: type.platforms || [],
        duration: {
          min: type.duration?.min || '',
          max: type.duration?.max || ''
        },
        isActive: type.isActive !== undefined ? type.isActive : true,
      });
    }
  }, [type, mode, reset]);

  // Handle form submission
  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      duration: {
        min: data.duration.min || null,
        max: data.duration.max || null
      }
    };
    onSubmit(formattedData);
  };

  // Handle platform addition
  const handleAddPlatform = (event, newValue) => {
    if (newValue && !watchedValues.platforms.includes(newValue)) {
      const updatedPlatforms = [...watchedValues.platforms, newValue];
      setValue('platforms', updatedPlatforms, { shouldValidate: true });
    }
    setPlatformInput('');
  };

  // Handle platform removal
  const handleRemovePlatform = (platformToRemove) => {
    const updatedPlatforms = watchedValues.platforms.filter(
      platform => platform !== platformToRemove
    );
    setValue('platforms', updatedPlatforms, { shouldValidate: true });
  };

  // Format duration for display
  const formatDuration = (min, max) => {
    if (!min && !max) return 'No especificada';
    if (min && max) return `${min} - ${max} minutos`;
    if (min) return `Mínimo ${min} minutos`;
    if (max) return `Máximo ${max} minutos`;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {mode === 'edit' ? 'Editar Tipo de Contenido' : 'Nuevo Tipo de Contenido'}
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Información Básica
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre del Tipo"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Categoría</InputLabel>
                      <Select
                        {...field}
                        label="Categoría"
                        disabled={loading}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.category.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="format"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.format}>
                      <InputLabel>Formato</InputLabel>
                      <Select
                        {...field}
                        label="Formato"
                        disabled={loading}
                      >
                        {formats.map((format) => (
                          <MenuItem key={format} value={format}>
                            {format}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.format && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.format.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              {/* Duration */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Duración (minutos)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="duration.min"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Mínima"
                          type="number"
                          fullWidth
                          size="small"
                          error={!!errors.duration?.min}
                          helperText={errors.duration?.min?.message}
                          disabled={loading}
                          inputProps={{ min: 1, max: 1000 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="duration.max"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Máxima"
                          type="number"
                          fullWidth
                          size="small"
                          error={!!errors.duration?.max}
                          helperText={errors.duration?.max?.message}
                          disabled={loading}
                          inputProps={{ min: 1, max: 1000 }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Description */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descripción"
                      multiline
                      rows={3}
                      fullWidth
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      disabled={loading}
                      placeholder="Descripción del tipo de contenido, características, etc."
                    />
                  )}
                />
              </Grid>
              
              {/* Platforms */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Plataformas Disponibles
                </Typography>
                
                <Autocomplete
                  options={commonPlatforms}
                  value={platformInput}
                  onChange={handleAddPlatform}
                  inputValue={platformInput}
                  onInputChange={(event, newInputValue) => {
                    setPlatformInput(newInputValue);
                  }}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Agregar Plataforma"
                      placeholder="Escribe o selecciona una plataforma"
                      disabled={loading}
                    />
                  )}
                  sx={{ mb: 2 }}
                />
                
                {/* Display selected platforms */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {watchedValues.platforms?.map((platform, index) => (
                    <Chip
                      key={index}
                      label={platform}
                      onDelete={() => handleRemovePlatform(platform)}
                      color="primary"
                      variant="outlined"
                      disabled={loading}
                    />
                  ))}
                </Box>
                
                {errors.platforms && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {errors.platforms.message}
                  </Alert>
                )}
              </Grid>
              
              {/* Status */}
              <Grid item xs={12}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          disabled={loading}
                        />
                      }
                      label="Tipo Activo"
                    />
                  )}
                />
              </Grid>
              
              {/* Form Actions */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || !isValid}
                      startIcon={loading && <LoadingSpinner size={20} />}
                    >
                      {loading ? 'Guardando...' : (mode === 'edit' ? 'Actualizar' : 'Crear')}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </Box>
                  
                  <Button
                    variant="text"
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={loading}
                  >
                    {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa'}
                  </Button>
                </Box>
              </Grid>
              
              {/* Form Preview */}
              {showPreview && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Vista Previa del Tipo de Contenido
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Nombre:
                          </Typography>
                          <Typography variant="body1">
                            {watchedValues.name || 'Sin especificar'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Categoría:
                          </Typography>
                          <Typography variant="body1">
                            {watchedValues.category || 'Sin especificar'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Formato:
                          </Typography>
                          <Typography variant="body1">
                            {watchedValues.format || 'Sin especificar'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Duración:
                          </Typography>
                          <Typography variant="body1">
                            {formatDuration(watchedValues.duration?.min, watchedValues.duration?.max)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Plataformas:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {watchedValues.platforms?.length > 0 ? (
                              watchedValues.platforms.map((platform, index) => (
                                <Chip key={index} label={platform} size="small" />
                              ))
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                Sin plataformas
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Descripción:
                          </Typography>
                          <Typography variant="body1">
                            {watchedValues.description || 'Sin descripción'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Estado:
                          </Typography>
                          <Chip
                            label={watchedValues.isActive ? 'Activo' : 'Inactivo'}
                            color={watchedValues.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TypeForm;