/**
 * Middleware para manejar rutas no encontradas (404)
 * Se ejecuta cuando ninguna ruta coincide con la solicitud
 */
const notFound = (req, res, next) => {
  const message = `Ruta no encontrada: ${req.method} ${req.originalUrl}`;
  
  console.log(`⚠️  404 - ${message}`);
  
  const response = {
    success: false,
    error: {
      message: 'Ruta no encontrada',
      details: `La ruta ${req.method} ${req.originalUrl} no existe en esta API`,
      suggestion: 'Verifica la URL y el método HTTP. Consulta la documentación para rutas disponibles.'
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      health: '/health',
      api: {
        genres: '/api/v1/genres',
        directors: '/api/v1/directors',
        producers: '/api/v1/producers',
        types: '/api/v1/types',
        media: '/api/v1/media'
      }
    }
  };

  res.status(404).json(response);
};

export { notFound };