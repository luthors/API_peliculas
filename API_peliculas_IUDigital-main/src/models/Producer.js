import mongoose from 'mongoose';

/**
 * Esquema para el modelo Producer (Productora)
 * Representa las compañías productoras de películas y series
 */
const producerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la productora es obligatorio'],
    unique: true,
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [150, 'El nombre no puede exceder 150 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
    default: ''
  },
  foundedYear: {
    type: Number,
    min: [1800, 'El año de fundación debe ser mayor a 1800'],
    max: [new Date().getFullYear(), 'El año de fundación no puede ser futuro'],
    validate: {
      validator: function(v) {
        return !v || (Number.isInteger(v) && v > 0);
      },
      message: 'El año de fundación debe ser un número entero válido'
    }
  },
  country: {
    type: String,
    required: [true, 'El país de origen es obligatorio'],
    trim: true,
    maxlength: [50, 'El país no puede exceder 50 caracteres'],
    validate: {
      validator: function(v) {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(v);
      },
      message: 'El país solo puede contener letras, espacios y guiones'
    }
  },
  headquarters: {
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'La ciudad no puede exceder 100 caracteres']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'La dirección no puede exceder 200 caracteres']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'El código postal no puede exceder 20 caracteres']
    }
  },
  contact: {
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'El email debe tener un formato válido'
      }
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^[+]?[0-9\s()-]+$/.test(v);
        },
        message: 'El teléfono debe tener un formato válido'
      }
    }
  },
  specialties: [{
    type: String,
    trim: true,
    lowercase: true,
    enum: {
      values: ['accion', 'drama', 'comedia', 'terror', 'ciencia-ficcion', 'romance', 'thriller', 'animacion', 'documental', 'musical', 'aventura', 'fantasia', 'misterio', 'crimen', 'guerra', 'western', 'biografia', 'historia', 'familia', 'deportes'],
      message: 'La especialidad {VALUE} no es válida'
    }
  }],
  budget: {
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'COP', 'MXN', 'ARS', 'BRL'],
      default: 'USD'
    },
    range: {
      type: String,
      enum: ['low', 'medium', 'high', 'blockbuster'],
      default: 'medium'
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
// Nota: El índice en 'name' se crea automáticamente por unique: true
producerSchema.index({ country: 1 });
producerSchema.index({ isActive: 1 });
producerSchema.index({ foundedYear: -1 });
producerSchema.index({ specialties: 1 });
producerSchema.index({ createdAt: -1 });

// Índice compuesto para búsquedas por país y especialidad
producerSchema.index({ country: 1, specialties: 1 });

// Middleware pre-save para normalizar datos
producerSchema.pre('save', function(next) {
  // Capitalizar nombre
  if (this.name) {
    this.name = this.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Capitalizar país
  if (this.country) {
    this.country = this.country
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Capitalizar ciudad
  if (this.headquarters && this.headquarters.city) {
    this.headquarters.city = this.headquarters.city
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Limpiar especialidades duplicadas
  if (this.specialties && this.specialties.length > 0) {
    this.specialties = [...new Set(this.specialties.filter(spec => spec.trim() !== ''))];
  }
  
  next();
});

// Método estático para buscar productoras activas
producerSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Método estático para buscar por país
producerSchema.statics.findByCountry = function(country) {
  return this.find({ 
    country: { $regex: new RegExp(country, 'i') },
    isActive: true 
  }).sort({ name: 1 });
};

// Método estático para buscar por especialidad
producerSchema.statics.findBySpecialty = function(specialty) {
  return this.find({ 
    specialties: specialty.toLowerCase(),
    isActive: true 
  }).sort({ name: 1 });
};

// Método de instancia para calcular años de operación
producerSchema.methods.getYearsInOperation = function() {
  if (!this.foundedYear) return null;
  return new Date().getFullYear() - this.foundedYear;
};

// Método de instancia para obtener información resumida
producerSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    country: this.country,
    foundedYear: this.foundedYear,
    yearsInOperation: this.getYearsInOperation(),
    specialties: this.specialties,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

// Método virtual para contar media producidos
producerSchema.virtual('mediaCount', {
  ref: 'Media',
  localField: '_id',
  foreignField: 'producer',
  count: true
});

// Configurar toJSON para incluir virtuals
producerSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    if (ret.foundedYear) {
      ret.yearsInOperation = doc.getYearsInOperation();
    }
    return ret;
  }
});

// Validación personalizada para evitar nombres duplicados (case-insensitive)
producerSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existingProducer = await this.constructor.findOne({
      name: { $regex: new RegExp(`^${this.name}$`, 'i') },
      _id: { $ne: this._id }
    });
    
    if (existingProducer) {
      const error = new Error(`Ya existe una productora con el nombre '${this.name}'`);
      error.code = 11000;
      return next(error);
    }
  }
  next();
});

const Producer = mongoose.model('Producer', producerSchema);

export default Producer;