import mongoose from "mongoose";
/**
 * Configuración y conexión a MongoDB
 * Maneja la conexión a la base de datos con opciones optimizadas
 */
export const connectDB = async () => {
  try {
    // Verificar si la URI de MongoDB está configurada
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI no configurada. Ejecutando sin base de datos.');
      return null;
    }

    // Opciones de conexión optimizadas para MongoDB Atlas
    const options = {
      maxPoolSize: 10, // Máximo número de conexiones en el pool
      serverSelectionTimeoutMS: 30000, // Timeout aumentado para selección de servidor
      socketTimeoutMS: 45000, // Timeout para operaciones de socket
      bufferCommands: true, // Habilitar buffering de comandos para evitar errores
      family: 4, // Forzar IPv4 para evitar problemas de DNS
      retryWrites: true, // Habilitar reintentos de escritura
      connectTimeoutMS: 30000, // Timeout de conexión
    };

    // Conectar a MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);

    // Event listeners para la conexión
    mongoose.connection.on("error", (err) => {
      console.error("❌ Error de conexión MongoDB:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB desconectado");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconectado");
    });

    // Retornar la conexión para confirmar que está establecida
    return conn;

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("🔒 Conexión MongoDB cerrada por terminación de la aplicación");
        process.exit(0);
      } catch (error) {
        console.error("❌ Error al cerrar conexión MongoDB:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);

    // En desarrollo, mostrar más detalles del error
    if (process.env.NODE_ENV === "development") {
      console.error("Detalles del error:", error);
    }

    // No terminar el proceso, permitir que el servidor continúe sin DB
    console.log("⚠️  Servidor continuará ejecutándose sin conexión a base de datos");
    return null;
  }
};

/**
 * Función para cerrar la conexión de base de datos
 * Útil para testing y shutdown graceful
 */
export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("🔒 Conexión MongoDB cerrada correctamente");
  } catch (error) {
    console.error("❌ Error cerrando conexión MongoDB:", error);
    throw error;
  }
};

/**
 * Función para limpiar la base de datos
 * Útil para testing
 */
export const clearDB = async () => {
  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }

    console.log("🧹 Base de datos limpiada");
  } catch (error) {
    console.error("❌ Error limpiando base de datos:", error);
    throw error;
  }
};