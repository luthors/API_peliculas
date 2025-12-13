import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Esquema para el modelo User (Usuario)
 * Representa los usuarios del sistema con autenticación y roles
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
      validate: {
        validator: function (v) {
          return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v);
        },
        message: "El nombre solo puede contener letras y espacios",
      },
    },
    lastName: {
      type: String,
      required: [true, "El apellido es obligatorio"],
      trim: true,
      minlength: [2, "El apellido debe tener al menos 2 caracteres"],
      maxlength: [50, "El apellido no puede exceder 50 caracteres"],
      validate: {
        validator: function (v) {
          return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v);
        },
        message: "El apellido solo puede contener letras y espacios",
      },
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Email inválido",
      },
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false, // No incluir password por defecto en las consultas
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: 'El rol debe ser "user" o "admin"',
      },
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false, // No incluir token por defecto
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false, // Elimina el campo __v
  }
);

// Índices para optimizar consultas
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual para nombre completo
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Configurar virtuals en JSON
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

userSchema.set("toObject", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

/**
 * Middleware pre-save para hashear la contraseña
 * Se ejecuta antes de guardar un usuario nuevo o actualizado
 */
userSchema.pre("save", async function (next) {
  // Solo hashear la contraseña si ha sido modificada (o es nueva)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generar salt y hashear contraseña
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Método de instancia para comparar contraseñas
 * @param {String} candidatePassword - Contraseña a verificar
 * @returns {Boolean} - True si las contraseñas coinciden
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Error al comparar contraseñas");
  }
};

/**
 * Método de instancia para obtener datos públicos del usuario
 * @returns {Object} - Objeto con datos públicos del usuario
 */
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    isActive: this.isActive,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
  };
};

/**
 * Método estático para buscar usuario por email
 * @param {String} email - Email del usuario
 * @returns {Object} - Usuario encontrado
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Método estático para obtener estadísticas de usuarios
 * @returns {Object} - Estadísticas de usuarios
 */
userSchema.statics.getStats = async function () {
  const [stats] = await this.aggregate([
    {
      $facet: {
        totalUsers: [{ $count: "count" }],
        activeUsers: [{ $match: { isActive: true } }, { $count: "count" }],
        inactiveUsers: [{ $match: { isActive: false } }, { $count: "count" }],
        usersByRole: [{ $group: { _id: "$role", count: { $sum: 1 } } }],
        recentUsers: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              email: 1,
              role: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ]);

  return {
    total: stats.totalUsers[0]?.count || 0,
    active: stats.activeUsers[0]?.count || 0,
    inactive: stats.inactiveUsers[0]?.count || 0,
    byRole: stats.usersByRole.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    recent: stats.recentUsers,
  };
};

// Crear y exportar el modelo
const User = mongoose.model("User", userSchema);

export default User;
