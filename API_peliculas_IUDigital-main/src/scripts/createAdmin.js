import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { connectDB } from "../config/database.js";

dotenv.config();

/**
 * Script para crear el primer usuario administrador
 * Ejecutar: node src/scripts/createAdmin.js
 */

const createAdminUser = async () => {
  try {
    console.log("🔌 Conectando a la base de datos...");
    await connectDB();

    console.log("👤 Verificando usuarios existentes...");
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      console.log("⚠️  Ya existen usuarios en la base de datos.");
      console.log("📊 Total de usuarios:", userCount);

      const adminCount = await User.countDocuments({ role: "admin" });
      console.log("👮 Administradores:", adminCount);

      if (adminCount > 0) {
        console.log("✅ Ya existe al menos un usuario administrador.");
        process.exit(0);
      }
    }

    console.log("🔧 Creando usuario administrador...");

    const adminData = {
      firstName: "Admin",
      lastName: "Sistema",
      email: "admin@peliculas.com",
      password: "Admin123",
      role: "admin",
      isActive: true,
    };

    const admin = await User.create(adminData);

    console.log("✅ Usuario administrador creado exitosamente!");
    console.log("\n📝 Credenciales de acceso:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    ", adminData.email);
    console.log("🔑 Password: ", adminData.password);
    console.log("👤 Nombre:   ", admin.fullName);
    console.log("🎭 Rol:      ", admin.role);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  IMPORTANTE: Cambia esta contraseña después del primer login!");
    console.log("🔐 Usa el endpoint PUT /api/v1/auth/change-password\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al crear usuario administrador:", error);
    process.exit(1);
  }
};

// Ejecutar la función
createAdminUser();
