// Common Components Exports
// This file centralizes all common component exports for easier imports

// Protected Route Component
export { default as ProtectedRoute } from "./ProtectedRoute";

// Data Table Component
export { default as DataTable } from "./DataTable";

// Search and Filters Component
export { default as SearchAndFilters } from "./SearchAndFilters";

// Confirmation Dialog Components
export {
  default as ConfirmDialog,
  DeleteConfirmDialog,
  DeactivateConfirmDialog,
  RestoreConfirmDialog,
} from "./ConfirmDialog";

// Notification Components
export {
  default as NotificationSnackbar,
  SuccessNotification,
  ErrorNotification,
  WarningNotification,
  InfoNotification,
  useNotification,
} from "./NotificationSnackbar";

// Loading Components
export {
  default as LoadingSpinner,
  PageLoader,
  TableLoader,
  FormLoader,
  FullScreenLoader,
  ButtonLoader,
  LoadingWrapper,
  LoadingOverlay,
} from "./LoadingSpinner";

// Export all as a single object for convenience
export default {
  DataTable: require("./DataTable").default,
  SearchAndFilters: require("./SearchAndFilters").default,
  ConfirmDialog: require("./ConfirmDialog").default,
  DeleteConfirmDialog: require("./ConfirmDialog").DeleteConfirmDialog,
  DeactivateConfirmDialog: require("./ConfirmDialog").DeactivateConfirmDialog,
  RestoreConfirmDialog: require("./ConfirmDialog").RestoreConfirmDialog,
  NotificationSnackbar: require("./NotificationSnackbar").default,
  SuccessNotification: require("./NotificationSnackbar").SuccessNotification,
  ErrorNotification: require("./NotificationSnackbar").ErrorNotification,
  WarningNotification: require("./NotificationSnackbar").WarningNotification,
  InfoNotification: require("./NotificationSnackbar").InfoNotification,
  useNotification: require("./NotificationSnackbar").useNotification,
  LoadingSpinner: require("./LoadingSpinner").default,
  PageLoader: require("./LoadingSpinner").PageLoader,
  TableLoader: require("./LoadingSpinner").TableLoader,
  FormLoader: require("./LoadingSpinner").FormLoader,
  FullScreenLoader: require("./LoadingSpinner").FullScreenLoader,
  ButtonLoader: require("./LoadingSpinner").ButtonLoader,
  LoadingWrapper: require("./LoadingSpinner").LoadingWrapper,
  LoadingOverlay: require("./LoadingSpinner").LoadingOverlay,
};
