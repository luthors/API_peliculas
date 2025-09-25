import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Backdrop,
  Paper,
  Skeleton,
} from '@mui/material';

/**
 * Reusable Loading Spinner Component
 * Provides different loading states and animations
 */
const LoadingSpinner = ({
  loading = true,
  type = 'circular', // 'circular', 'linear', 'backdrop', 'skeleton'
  size = 40,
  message = 'Cargando...',
  showMessage = true,
  color = 'primary',
  backdrop = false,
  fullScreen = false,
  minHeight = 200,
  skeletonRows = 5,
  skeletonVariant = 'rectangular',
  children = null,
}) => {
  if (!loading && children) {
    return children;
  }

  if (!loading) {
    return null;
  }

  // Skeleton loader
  if (type === 'skeleton') {
    return (
      <Box sx={{ width: '100%', p: 2 }}>
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <Skeleton
            key={index}
            variant={skeletonVariant}
            height={skeletonVariant === 'rectangular' ? 60 : undefined}
            sx={{ mb: 1 }}
            animation="wave"
          />
        ))}
      </Box>
    );
  }

  // Backdrop loader
  if (type === 'backdrop' || backdrop || fullScreen) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={size} />
        {showMessage && (
          <Typography variant="h6" color="inherit">
            {message}
          </Typography>
        )}
      </Backdrop>
    );
  }

  // Linear progress loader
  if (type === 'linear') {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress color={color} />
        {showMessage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // Default circular loader
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: minHeight,
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress color={color} size={size} />
      {showMessage && (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          {message}
        </Typography>
      )}
    </Box>
  );
};

// Predefined loading components for common use cases
export const PageLoader = (props) => (
  <LoadingSpinner
    type="circular"
    size={60}
    message="Cargando página..."
    minHeight={400}
    {...props}
  />
);

export const TableLoader = (props) => (
  <LoadingSpinner
    type="skeleton"
    skeletonRows={8}
    skeletonVariant="rectangular"
    {...props}
  />
);

export const FormLoader = (props) => (
  <LoadingSpinner
    type="skeleton"
    skeletonRows={6}
    skeletonVariant="rounded"
    {...props}
  />
);

export const FullScreenLoader = (props) => (
  <LoadingSpinner
    type="backdrop"
    size={80}
    message="Procesando..."
    fullScreen
    {...props}
  />
);

export const ButtonLoader = ({ loading, children, ...props }) => {
  if (loading) {
    return (
      <CircularProgress
        size={20}
        color="inherit"
        {...props}
      />
    );
  }
  return children;
};

// Loading wrapper component
export const LoadingWrapper = ({ loading, children, ...loaderProps }) => {
  return (
    <LoadingSpinner loading={loading} {...loaderProps}>
      {children}
    </LoadingSpinner>
  );
};

// Loading overlay component
export const LoadingOverlay = ({ loading, children, ...props }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress {...props} />
            <Typography variant="body2" color="text.secondary">
              Cargando...
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default LoadingSpinner;