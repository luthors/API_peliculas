import React from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Slide,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';

/**
 * Transition component for the snackbar
 */
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

/**
 * Reusable Notification Snackbar Component
 * Provides consistent notification display across the application
 */
const NotificationSnackbar = ({
  open,
  onClose,
  message,
  severity = 'info', // 'success', 'error', 'warning', 'info'
  title = null,
  autoHideDuration = 6000,
  position = { vertical: 'bottom', horizontal: 'left' },
  showCloseButton = true,
  action = null,
}) => {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={position}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={showCloseButton ? handleClose : undefined}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          minWidth: 300,
          maxWidth: 500,
        }}
        action={
          action || (showCloseButton && (
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ))
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

// Predefined notification types for common use cases
export const SuccessNotification = (props) => (
  <NotificationSnackbar
    severity="success"
    autoHideDuration={4000}
    {...props}
  />
);

export const ErrorNotification = (props) => (
  <NotificationSnackbar
    severity="error"
    autoHideDuration={8000}
    {...props}
  />
);

export const WarningNotification = (props) => (
  <NotificationSnackbar
    severity="warning"
    autoHideDuration={6000}
    {...props}
  />
);

export const InfoNotification = (props) => (
  <NotificationSnackbar
    severity="info"
    autoHideDuration={5000}
    {...props}
  />
);

// Hook for managing notification state
export const useNotification = () => {
  const [notification, setNotification] = React.useState({
    open: false,
    message: '',
    severity: 'info',
    title: null,
  });

  const showNotification = (message, severity = 'info', title = null) => {
    setNotification({
      open: true,
      message,
      severity,
      title,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false,
    }));
  };

  const showSuccess = (message, title = null) => {
    showNotification(message, 'success', title);
  };

  const showError = (message, title = 'Error') => {
    showNotification(message, 'error', title);
  };

  const showWarning = (message, title = 'Advertencia') => {
    showNotification(message, 'warning', title);
  };

  const showInfo = (message, title = null) => {
    showNotification(message, 'info', title);
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default NotificationSnackbar;