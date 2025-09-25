import mongoose from 'mongoose';

/**
 * Esquema para el modelo Director
 * Representa los directores de películas y series
 */
const directorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del director es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    validate: {
      validator: function(v) {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/.test(v);
      },
      message: 'El nombre solo puede contener letras, espacios, puntos y guiones'
    }
  },
  biography: {
    type: String,
    trim: true,
    maxlength: [2000, 'La biografía no puede exceder 2000 caracteres'],
    default: ''
  },
  birthDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v <= new Date();
      },
      message: 'La fecha de nacimiento no puede ser futura'
    }
  },
  nationality: {
    type: String,
    trim: true,
    maxlength: [50, 'La nacionalidad no puede exceder 50 caracteres'],
    validate: {
      validator: function(v) {
        return !v || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(v);
      },
      message: 'La nacionalidad solo puede contener letras, espacios y guiones'
    }
  },
  awards: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'El nombre del premio no puede exceder 200 caracteres']
    },
    year: {
      type: Number,
      min: [1900, 'El año debe ser mayor a 1900'],
      max: [new Date().getFullYear(), 'El año no puede ser futuro']
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'La categoría no puede exceder 100 caracteres']
    }
  }],
  socialMedia: {
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'La URL del sitio web debe ser válida'
      }
    },
    twitter: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^@?[a-zA-Z0-9_]+$/.test(v);
        },
        message: 'El usuario de Twitter debe ser válido'
      }
    },
    instagram: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^@?[a-zA-Z0-9_.]+$/.test(v);
        },
        message: 'El usuario de Instagram debe ser válido'
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para optimizar consultas
directorSchema.index({ name: 1 });
directorSchema.index({ nationality: 1 });
directorSchema.index({ isActive: 1 });
directorSchema.index({ birthDate: -1 });
directorSchema.index({ createdAt: -1 });

// Índice compuesto para búsquedas por nombre y nacionalidad
directorSchema.index({ name: 1, nationality: 1 });

// Middleware pre-save para normalizar datos
directorSchema.pre('save', function(next) {
  // Capitalizar nombre
  if (this.name) {
    this.name = this.name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Capitalizar nacionalidad
  if (this.nationality) {
    this.nationality = this.nationality
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Normalizar redes sociales
  if (this.socialMedia) {
    if (this.socialMedia.twitter && !this.socialMedia.twitter.startsWith('@')) {
      this.socialMedia.twitter = '@' + this.socialMedia.twitter;
    }
    if (this.socialMedia.instagram && !this.socialMedia.instagram.startsWith('@')) {
      this.socialMedia.instagram = '@' + this.socialMedia.instagram;
    }
  }
  
  next();
});

// Método estático para buscar directores activos
directorSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Método estático para buscar por nacionalidad
directorSchema.statics.findByNationality = function(nationality) {
  return this.find({ 
    nationality: { $regex: new RegExp(nationality, 'i') },
    isActive: true 
  }).sort({ name: 1 });
};

// Método de instancia para calcular edad
directorSchema.methods.getAge = function() {
  if (!this.birthDate) return null;
  
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Método de instancia para obtener información resumida
directorSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    nationality: this.nationality,
    age: this.getAge(),
    awardsCount: this.awards ? this.awards.length : 0,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

// Método virtual para contar media dirigidos
directorSchema.virtual('mediaCount', {
  ref: 'Media',
  localField: '_id',
  foreignField: 'director',
  count: true
});

// Configurar toJSON para incluir virtuals
directorSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    if (ret.birthDate) {
      ret.age = doc.getAge();
    }
    return ret;
  }
});

// Validación personalizada para evitar nombres duplicados (case-insensitive)
directorSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existingDirector = await this.constructor.findOne({
      name: { $regex: new RegExp(`^${this.name}$`, 'i') },
      _id: { $ne: this._id }
    });
    
    if (existingDirector) {
      const error = new Error(`Ya existe un director con el nombre '${this.name}'`);
      error.code = 11000;
      return next(error);
    }
  }
  next();
});

const Director = mongoose.model('Director', directorSchema);

export default Director;