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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LoadingSpinner } from '../common';

// Validation schema for producer form
const producerSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .matches(/^[a-zA-Z0-9\s\-&.,()]+$/, 'El nombre contiene caracteres no válidos'),
  country: yup
    .string()
    .required('El país es obligatorio')
    .min(2, 'El país debe tener al menos 2 caracteres')
    .max(50, 'El país no puede exceder 50 caracteres'),
  foundedYear: yup
    .number()
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .min(1800, 'El año de fundación debe ser posterior a 1800')
    .max(new Date().getFullYear(), `El año de fundación no puede ser posterior a ${new Date().getFullYear()}`),
  description: yup
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  website: yup
    .string()
    .nullable()
    .url('Debe ser una URL válida')
    .max(200, 'La URL no puede exceder 200 caracteres'),
  specialties: yup
    .array()
    .of(yup.string())
    .max(10, 'No se pueden agregar más de 10 especialidades'),
  isActive: yup.boolean(),
});

// Common specialties for autocomplete
const commonSpecialties = [
  'Acción',
  'Drama',
  'Comedia',
  'Terror',
  'Ciencia Ficción',
  'Romance',
  'Thriller',
  'Animación',
  'Documental',
  'Fantasía',
  'Aventura',
  'Crimen',
  'Misterio',
  'Guerra',
  'Western',
  'Musical',
  'Biografía',
  'Historia',
  'Deportes',
  'Familia'
];

/**
 * ProducerForm Component
 * Form for creating and editing producer records
 * 
 * @param {Object} props - Component props
 * @param {Object} props.producer - Producer data for editing (optional)
 * @param {Function} props.onSubmit - Submit handler function
 * @param {Function} props.onCancel - Cancel handler function
 * @param {boolean} props.loading - Loading state
 * @param {string} props.mode - Form mode ('create' or 'edit')
 */
const ProducerForm = ({ 
  producer = null, 
  onSubmit, 
  onCancel, 
  loading = false, 
  mode = 'create' 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [specialtyInput, setSpecialtyInput] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue,
    getValues
  } = useForm({
    resolver: yupResolver(producerSchema),
    defaultValues: {
      name: '',
      country: '',
      foundedYear: '',
      description: '',
      website: '',
      specialties: [],
      isActive: true,
    },
    mode: 'onChange'
  });

  const watchedValues = watch();

  // Load producer data when editing
  useEffect(() => {
    if (producer && mode === 'edit') {
      reset({
        name: producer.name || '',
        country: producer.country || '',
        foundedYear: producer.foundedYear || '',
        description: producer.description || '',
        website: producer.website || '',
        specialties: producer.specialties || [],
        isActive: producer.isActive !== undefined ? producer.isActive : true,
      });
    }
  }, [producer, mode, reset]);

  // Handle form submission
  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      foundedYear: data.foundedYear || null,
      website: data.website || null,
    };
    onSubmit(formattedData);
  };

  // Handle specialty addition
  const handleAddSpecialty = (event, newValue) => {
    if (newValue && !watchedValues.specialties.includes(newValue)) {
      const updatedSpecialties = [...watchedValues.specialties, newValue];
      setValue('specialties', updatedSpecialties, { shouldValidate: true });
    }
    setSpecialtyInput('');
  };

  // Handle specialty removal
  const handleRemoveSpecialty = (specialtyToRemove) => {
    const updatedSpecialties = watchedValues.specialties.filter(
      specialty => specialty !== specialtyToRemove
    );
    setValue('specialties', updatedSpecialties, { shouldValidate: true });
  };

  // Calculate company age
  const calculateAge = (foundedYear) => {
    if (!foundedYear) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - foundedYear;
  };

  const companyAge = calculateAge(watchedValues.foundedYear);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {mode === 'edit' ? 'Editar Productora' : 'Nueva Productora'}
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
                      label="Nombre de la Productora"
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
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="País"
                      fullWidth
                      error={!!errors.country}
                      helperText={errors.country?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="foundedYear"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Año de Fundación"
                      type="number"
                      fullWidth
                      error={!!errors.foundedYear}
                      helperText={
                        errors.foundedYear?.message || 
                        (companyAge && `Edad de la empresa: ${companyAge} años`)
                      }
                      disabled={loading}
                      inputProps={{ min: 1800, max: new Date().getFullYear() }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Sitio Web"
                      fullWidth
                      error={!!errors.website}
                      helperText={errors.website?.message}
                      disabled={loading}
                      placeholder="https://www.ejemplo.com"
                    />
                  )}
                />
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
                      rows={4}
                      fullWidth
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      disabled={loading}
                      placeholder="Descripción de la productora, historia, logros, etc."
                    />
                  )}
                />
              </Grid>
              
              {/* Specialties */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Especialidades
                </Typography>
                
                <Autocomplete
                  options={commonSpecialties}
                  value={specialtyInput}
                  onChange={handleAddSpecialty}
                  inputValue={specialtyInput}
                  onInputChange={(event, newInputValue) => {
                    setSpecialtyInput(newInputValue);
                  }}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Agregar Especialidad"
                      placeholder="Escribe o selecciona una especialidad"
                      disabled={loading}
                    />
                  )}
                  sx={{ mb: 2 }}
                />
                
                {/* Display selected specialties */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {watchedValues.specialties?.map((specialty, index) => (
                    <Chip
                      key={index}
                      label={specialty}
                      onDelete={() => handleRemoveSpecialty(specialty)}
                      color="primary"
                      variant="outlined"
                      disabled={loading}
                    />
                  ))}
                </Box>
                
                {errors.specialties && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {errors.specialties.message}
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
                      label="Productora Activa"
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
                        Vista Previa de la Productora
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
                            País:
                          </Typography>
                          <Typography variant="body1">
                            {watchedValues.country || 'Sin especificar'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Año de Fundación:
                          </Typography>
                          <Typography variant="body1">
                            {watchedValues.foundedYear || 'Sin especificar'}
                            {companyAge && ` (${companyAge} años)`}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Sitio Web:
                          </Typography>
                          <Typography variant="body1">
                            {watchedValues.website || 'Sin especificar'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Especialidades:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {watchedValues.specialties?.length > 0 ? (
                              watchedValues.specialties.map((specialty, index) => (
                                <Chip key={index} label={specialty} size="small" />
                              ))
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                Sin especialidades
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
                            label={watchedValues.isActive ? 'Activa' : 'Inactiva'}
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

export default ProducerForm;