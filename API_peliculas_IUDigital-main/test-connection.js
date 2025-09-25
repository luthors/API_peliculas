import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Script de prueba para verificar conectividad con MongoDB
 * Prueba diferentes configuraciones de conexión
 */

const testConnections = async () => {
  console.log('🔍 Iniciando pruebas de conectividad con MongoDB...\n');

  // Configuración 1: URI original con IPv4 forzado
  const config1 = {
    uri: process.env.MONGODB_URI,
    options: {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Forzar IPv4
      maxPoolSize: 1,
      bufferCommands: false,
    }
  };

  // Configuración 2: URI con formato estándar (sin SRV)
  const config2 = {
    uri: 'mongodb://luthors:luthors@ac-ash9ant-shard-00-00.mwrtvvg.mongodb.net:27017,ac-ash9ant-shard-00-01.mwrtvvg.mongodb.net:27017,ac-ash9ant-shard-00-02.mwrtvvg.mongodb.net:27017/peliculas?ssl=true&replicaSet=atlas-14hdqp-shard-0&authSource=admin&retryWrites=true&w=majority',
    options: {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 1,
      bufferCommands: false,
    }
  };

  const testConnection = async (config, name) => {
    console.log(`📡 Probando ${name}...`);
    try {
      await mongoose.connect(config.uri, config.options);
      console.log(`✅ ${name}: Conexión exitosa`);
      console.log(`📊 Base de datos: ${mongoose.connection.name}`);
      console.log(`🏠 Host: ${mongoose.connection.host}`);
      await mongoose.disconnect();
      return true;
    } catch (error) {
      console.log(`❌ ${name}: Error de conexión`);
      console.log(`   Código: ${error.code || 'N/A'}`);
      console.log(`   Mensaje: ${error.message}`);
      return false;
    }
  };

  // Probar configuraciones
  const result1 = await testConnection(config1, 'Configuración SRV con IPv4');
  console.log('');
  
  if (!result1) {
    const result2 = await testConnection(config2, 'Configuración estándar');
    console.log('');
  }

  console.log('🏁 Pruebas completadas');
  process.exit(0);
};

// Ejecutar pruebas
testConnections().catch(error => {
  console.error('💥 Error en las pruebas:', error);
  process.exit(1);
});