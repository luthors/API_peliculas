/**
 * Middleware global para manejo de errores
 * Captura y formatea todos los errores de la aplicación
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error para debugging
  console.error('🚨 Error capturado:', err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message: `Error de validación: ${message}`,
      statusCode: 400
    };
  }

  // Error de duplicado de Mongoose (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = {
      message: `El ${field} '${value}' ya existe en la base de datos`,
      statusCode: 400
    };
  }

  // Error de CastError de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    error = {
      message: `Recurso no encontrado. ID inválido: ${err.value}`,
      statusCode: 404
    };
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Token inválido. Acceso denegado',
      statusCode: 401
    };
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expirado. Por favor, inicia sesión nuevamente',
      statusCode: 401
    };
  }

  // Respuesta de error estructurada
  const response = {
    success: false,
    error: {
      message: error.message || 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Código de estado HTTP
  const statusCode = error.statusCode || err.statusCode || 500;

  res.status(statusCode).json(response);
};

export { errorHandler };