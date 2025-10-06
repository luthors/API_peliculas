// Importaciones principales
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

// Importaciones locales
import { connectDB } from "./config/database.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Importar rutas
import genreRoutes from "./routes/genreRoutes.js";
import directorRoutes from "./routes/directorRoutes.js";
import productorRoutes from "./routes/producerRoutes.js";
import typeRoutes from "./routes/typeRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import bulkRoutes from "./routes/bulkRoutes.js";


// Crear instancia de Express
const app = express();

// Middlewares de seguridad y configuración
app.use(helmet()); // Seguridad HTTP headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined")); // Logging de requests
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || "10mb" })); // Parser JSON
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || "10mb" }));

// Ruta de health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Movies API is running",
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || "v1",
  });
});

// Rutas principales de la API
const apiPrefix = process.env.API_PREFIX || "/api/v1";
app.use(`${apiPrefix}/genres`, genreRoutes);
app.use(`${apiPrefix}/directors`, directorRoutes);
app.use(`${apiPrefix}/producers`, productorRoutes);
app.use(`${apiPrefix}/types`, typeRoutes);
app.use(`${apiPrefix}/media`, mediaRoutes);
app.use(`${apiPrefix}/bulk`, bulkRoutes);

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenido a la API de Gestión de Películas y Series",
    version: process.env.API_VERSION || "v1",
    endpoints: {
      health: "/health",
      genres: `${apiPrefix}/genres`,
      directors: `${apiPrefix}/directors`,
      producers: `${apiPrefix}/producers`,
      types: `${apiPrefix}/types`,
      media: `${apiPrefix}/media`,
    },
    documentation: "Ver README.md para documentación completa",
  });
});

// Middlewares de manejo de errores (deben ir al final)
app.use(notFound); // 404 handler
app.use(errorHandler); // Error handler global

// Configuración del puerto
const PORT = process.env.PORT || 3001;

// Función para inicializar la aplicación
const startServer = async () => {
  try {
    // Intentar conectar a la base de datos
    const dbConnection = await connectDB();
    
    if (dbConnection) {
      console.log('✅ Base de datos conectada correctamente');
    } else {
      console.log('⚠️  Ejecutando sin conexión a base de datos');
    }
    
    // Iniciar el servidor independientemente del estado de la base de datos
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error.message);
    console.log('⚠️  Servidor continuará ejecutándose sin conexión a base de datos');
    
    // Iniciar servidor sin base de datos
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });
  }
};

// Inicializar la aplicación
startServer();

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando servidor...');
  process.exit(0);
});

export default app;