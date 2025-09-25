import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  Chip,
  Autocomplete,
  InputAdornment,
  Alert,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Movie as MovieIcon,
  Tv as TvIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LoadingSpinner } from '../common';

// Validation schema
const validationSchema = yup.object({
  title: yup
    .string()
    .required('El título es obligatorio')
    .min(2, 'El título debe tener al menos 2 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  synopsis: yup
    .string()
    .max(2000, 'La sinopsis no puede exceder 2000 caracteres'),
  year: yup
    .number()
    .typeError('El año debe ser un número')
    .min(1900, 'El año debe ser mayor a 1900')
    .max(new Date().getFullYear() + 5, 'El año no puede ser muy futuro'),
  duration: yup
    .number()
    .typeError('La duración debe ser un número')
    .min(1, 'La duración debe ser mayor a 0')
    .max(1000, 'La duración no puede exceder 1000 minutos'),
  rating: yup
    .string()
    .max(10, 'La clasificación no puede exceder 10 caracteres'),
  budget: yup
    .number()
    .typeError('El presupuesto debe ser un número')
    .min(0, 'El presupuesto no puede ser negativo'),
  type: yup
    .string()
    .required('El tipo es obligatorio')
    .oneOf(['Película', 'Serie'], 'Tipo inválido'),
  genres: yup
    .array()
    .min(1, 'Debe seleccionar al menos un género'),
  directors: yup
    .array()
    .min(1, 'Debe seleccionar al menos un director'),
  producers: yup
    .array()
    .min(1, 'Debe seleccionar al menos una productora'),
  actors: yup
    .array(),
  languages: yup
    .array(),
  subtitles: yup
    .array(),
  releaseDate: yup
    .date()
    .typeError('Fecha inválida'),
  trailerUrl: yup
    .string()
    .url('URL inválida'),
  posterUrl: yup
    .string()
    .url('URL inválida'),
  coverUrl: yup
    .string()
    .url('URL inválida'),
  isActive: yup
    .boolean(),
});

// Predefined options
const mediaTypes = ['Película', 'Serie'];
const ratings = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'];
const commonLanguages = [
  'Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués',
  'Japonés', 'Coreano', 'Chino', 'Ruso', 'Árabe'
];
const commonActors = [
  'Leonardo DiCaprio', 'Meryl Streep', 'Robert De Niro', 'Scarlett Johansson',
  'Tom Hanks', 'Jennifer Lawrence', 'Brad Pitt', 'Natalie Portman',
  'Will Smith', 'Emma Stone', 'Ryan Gosling', 'Charlize Theron'
];

/**
 * MediaForm Component
 * Form for creating and editing media (movies and series)
 */
const MediaForm = ({ media, onSubmit, onCancel, loading = false, mode = 'create' }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [availableGenres] = useState([
    { _id: '1', name: 'Acción' },
    { _id: '2', name: 'Drama' },
    { _id: '3', name: 'Comedia' },
    { _id: '4', name: 'Terror' },
    { _id: '5', name: 'Ciencia Ficción' },
  ]);
  const [availableDirectors] = useState([
    { _id: '1', name: 'Christopher Nolan' },
    { _id: '2', name: 'Steven Spielberg' },
    { _id: '3', name: 'Quentin Tarantino' },
    { _id: '4', name: 'Martin Scorsese' },
    { _id: '5', name: 'Denis Villeneuve' },
  ]);
  const [availableProducers] = useState([
    { _id: '1', name: 'Warner Bros' },
    { _id: '2', name: 'Universal Pictures' },
    { _id: '3', name: 'Disney' },
    { _id: '4', name: 'Sony Pictures' },
    { _id: '5', name: 'Paramount Pictures' },
  ]);

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: '',
      synopsis: '',
      year: new Date().getFullYear(),
      duration: '',
      rating: '',
      budget: '',
      type: 'Película',
      genres: [],
      directors: [],
      producers: [],
      actors: [],
      languages: ['Español'],
      subtitles: [],
      releaseDate: '',
      trailerUrl: '',
      posterUrl: '',
      coverUrl: '',
      isActive: true,
    },
  });

  // Watch form values for preview
  const watchedValues = watch();

  // Load media data when editing
  useEffect(() => {
    if (mode === 'edit' && media) {
      reset({
        title: media.title || '',
        synopsis: media.synopsis || '',
        year: media.year || new Date().getFullYear(),
        duration: media.duration || '',
        rating: media.rating || '',
        budget: media.budget || '',
        type: media.type || 'Película',
        genres: media.genres || [],
        directors: media.directors || [],
        producers: media.producers || [],
        actors: media.actors || [],
        languages: media.languages || ['Español'],
        subtitles: media.subtitles || [],
        releaseDate: media.releaseDate ? media.releaseDate.split('T')[0] : '',
        trailerUrl: media.trailerUrl || '',
        posterUrl: media.posterUrl || '',
        coverUrl: media.coverUrl || '',
        isActive: media.isActive !== undefined ? media.isActive : true,
      });
    }
  }, [mode, media, reset]);

  // Handle form submission
  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      year: data.year ? parseInt(data.year) : undefined,
      duration: data.duration ? parseInt(data.duration) : undefined,
      budget: data.budget ? parseFloat(data.budget) : undefined,
      releaseDate: data.releaseDate || undefined,
    };
    onSubmit(formattedData);
  };

  // Handle cancel
  const handleCancel = () => {
    reset();
    onCancel();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Información Básica
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Title */}
          <Grid item xs={12} md={8}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Título *"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Type */}
          <Grid item xs={12} md={4}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Tipo *</InputLabel>
                  <Select
                    {...field}
                    label="Tipo *"
                    disabled={isSubmitting}
                  >
                    {mediaTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type === 'Película' ? <MovieIcon /> : <TvIcon />}
                          {type}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.type.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Synopsis */}
          <Grid item xs={12}>
            <Controller
              name="synopsis"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sinopsis"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.synopsis}
                  helperText={errors.synopsis?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Year, Duration, Rating */}
          <Grid item xs={12} md={4}>
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Año"
                  type="number"
                  fullWidth
                  error={!!errors.year}
                  helperText={errors.year?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Duración"
                  type="number"
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                    startAdornment: <InputAdornment position="start"><ScheduleIcon /></InputAdornment>,
                  }}
                  error={!!errors.duration}
                  helperText={errors.duration?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.rating}>
                  <InputLabel>Clasificación</InputLabel>
                  <Select
                    {...field}
                    label="Clasificación"
                    disabled={isSubmitting}
                  >
                    <MenuItem value="">
                      <em>Sin clasificación</em>
                    </MenuItem>
                    {ratings.map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.rating && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.rating.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Budget */}
          <Grid item xs={12} md={6}>
            <Controller
              name="budget"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Presupuesto"
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><MoneyIcon /></InputAdornment>,
                  }}
                  error={!!errors.budget}
                  helperText={errors.budget?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Release Date */}
          <Grid item xs={12} md={6}>
            <Controller
              name="releaseDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Fecha de Lanzamiento"
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!errors.releaseDate}
                  helperText={errors.releaseDate?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Relationships */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Relaciones
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Genres */}
          <Grid item xs={12} md={4}>
            <Controller
              name="genres"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  multiple
                  options={availableGenres}
                  getOptionLabel={(option) => option.name}
                  value={field.value || []}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Géneros *"
                      error={!!errors.genres}
                      helperText={errors.genres?.message}
                      disabled={isSubmitting}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option._id}
                        label={option.name}
                        {...getTagProps({ index })}
                        color="primary"
                        size="small"
                      />
                    ))
                  }
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Directors */}
          <Grid item xs={12} md={4}>
            <Controller
              name="directors"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  multiple
                  options={availableDirectors}
                  getOptionLabel={(option) => option.name}
                  value={field.value || []}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Directores *"
                      error={!!errors.directors}
                      helperText={errors.directors?.message}
                      disabled={isSubmitting}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option._id}
                        label={option.name}
                        {...getTagProps({ index })}
                        color="info"
                        size="small"
                      />
                    ))
                  }
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Producers */}
          <Grid item xs={12} md={4}>
            <Controller
              name="producers"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  multiple
                  options={availableProducers}
                  getOptionLabel={(option) => option.name}
                  value={field.value || []}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Productoras *"
                      error={!!errors.producers}
                      helperText={errors.producers?.message}
                      disabled={isSubmitting}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option._id}
                        label={option.name}
                        {...getTagProps({ index })}
                        color="secondary"
                        size="small"
                      />
                    ))
                  }
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Actors */}
          <Grid item xs={12} md={6}>
            <Controller
              name="actors"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  multiple
                  freeSolo
                  options={commonActors}
                  value={field.value || []}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Actores"
                      error={!!errors.actors}
                      helperText={errors.actors?.message || 'Puedes agregar actores personalizados'}
                      disabled={isSubmitting}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        {...getTagProps({ index })}
                        color="warning"
                        size="small"
                      />
                    ))
                  }
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Languages */}
          <Grid item xs={12} md={6}>
            <Controller
              name="languages"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  multiple
                  freeSolo
                  options={commonLanguages}
                  value={field.value || []}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Idiomas"
                      error={!!errors.languages}
                      helperText={errors.languages?.message}
                      disabled={isSubmitting}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        {...getTagProps({ index })}
                        color="success"
                        size="small"
                      />
                    ))
                  }
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Subtitles */}
          <Grid item xs={12}>
            <Controller
              name="subtitles"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  multiple
                  freeSolo
                  options={commonLanguages}
                  value={field.value || []}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Subtítulos"
                      error={!!errors.subtitles}
                      helperText={errors.subtitles?.message}
                      disabled={isSubmitting}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        {...getTagProps({ index })}
                        variant="outlined"
                        size="small"
                      />
                    ))
                  }
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Media URLs */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Multimedia
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Trailer URL */}
          <Grid item xs={12}>
            <Controller
              name="trailerUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="URL del Tráiler"
                  fullWidth
                  error={!!errors.trailerUrl}
                  helperText={errors.trailerUrl?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Poster URL */}
          <Grid item xs={12} md={6}>
            <Controller
              name="posterUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="URL del Póster"
                  fullWidth
                  error={!!errors.posterUrl}
                  helperText={errors.posterUrl?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Cover URL */}
          <Grid item xs={12} md={6}>
            <Controller
              name="coverUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="URL de la Portada"
                  fullWidth
                  error={!!errors.coverUrl}
                  helperText={errors.coverUrl?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          {/* Active Status */}
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
                      disabled={isSubmitting}
                    />
                  }
                  label="Activo"
                />
              )}
            />
          </Grid>

          {/* Preview Section */}
          {showPreview && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Vista Previa
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      src={watchedValues.posterUrl}
                      alt={watchedValues.title}
                      variant="rounded"
                      sx={{ width: 80, height: 120 }}
                    >
                      {watchedValues.type === 'Película' ? <MovieIcon /> : <TvIcon />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">
                        {watchedValues.title || 'Título del medio'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {watchedValues.type} • {watchedValues.year} • {watchedValues.duration} min
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {watchedValues.synopsis || 'Sin sinopsis'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Form Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setShowPreview(!showPreview)}
                disabled={isSubmitting}
              >
                {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Medio' : 'Actualizar Medio'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Error Alert */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Por favor, corrige los errores en el formulario antes de continuar.
        </Alert>
      )}
    </Box>
  );
};

export default MediaForm;