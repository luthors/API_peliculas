import mongoose from 'mongoose';

/**
 * Esquema para el modelo Type (Tipo)
 * Representa los tipos de contenido: Película, Serie, Documental, etc.
 */
const typeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del tipo es obligatorio'],
    unique: true,
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    enum: {
      values: ['Película', 'Serie', 'Documental', 'Miniserie', 'Cortometraje', 'Telefilme', 'Especial TV', 'Webserie'],
      message: 'El tipo {VALUE} no es válido. Tipos permitidos: Película, Serie, Documental, Miniserie, Cortometraje, Telefilme, Especial TV, Webserie'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    default: ''
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: {
      values: ['Largometraje', 'Serie TV', 'Contenido Digital', 'Documental', 'Especial'],
      message: 'La categoría {VALUE} no es válida'
    }
  },
  format: {
    type: String,
    enum: {
      values: ['Episódico', 'Unitario', 'Temporadas', 'Capítulos', 'Único'],
      message: 'El formato {VALUE} no es válido'
    },
    default: 'Único'
  },
  duration: {
    typical: {
      min: {
        type: Number,
        min: [1, 'La duración mínima debe ser mayor a 0'],
        validate: {
          validator: function(v) {
            return !v || Number.isInteger(v);
          },
          message: 'La duración debe ser un número entero (minutos)'
        }
      },
      max: {
        type: Number,
        min: [1, 'La duración máxima debe ser mayor a 0'],
        validate: {
          validator: function(v) {
            return !v || Number.isInteger(v);
          },
          message: 'La duración debe ser un número entero (minutos)'
        }
      }
    },
    unit: {
      type: String,
      enum: ['minutos', 'horas', 'episodios', 'temporadas'],
      default: 'minutos'
    }
  },
  characteristics: [{
    type: String,
    trim: true,
    maxlength: [100, 'Cada característica no puede exceder 100 caracteres']
  }],
  platforms: [{
    type: String,
    trim: true,
    enum: {
      values: ['Cine', 'Televisión', 'Streaming', 'Digital', 'Festival', 'VOD', 'Blu-ray/DVD'],
      message: 'La plataforma {VALUE} no es válida'
    }
  }],
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
typeSchema.index({ category: 1 });
typeSchema.index({ format: 1 });
typeSchema.index({ isActive: 1 });
typeSchema.index({ platforms: 1 });
typeSchema.index({ createdAt: -1 });

// Índice compuesto para búsquedas por categoría y formato
typeSchema.index({ category: 1, format: 1 });

// Validación personalizada para duración
typeSchema.pre('save', function(next) {
  if (this.duration && this.duration.typical) {
    const { min, max } = this.duration.typical;
    if (min && max && min > max) {
      return next(new Error('La duración mínima no puede ser mayor que la máxima'));
    }
  }
  next();
});

// Middleware pre-save para normalizar datos
typeSchema.pre('save', function(next) {
  // Limpiar características duplicadas
  if (this.characteristics && this.characteristics.length > 0) {
    this.characteristics = [...new Set(this.characteristics.filter(char => char.trim() !== ''))];
  }
  
  // Limpiar plataformas duplicadas
  if (this.platforms && this.platforms.length > 0) {
    this.platforms = [...new Set(this.platforms)];
  }
  
  next();
});

// Método estático para buscar tipos activos
typeSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Método estático para buscar por categoría
typeSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category: category,
    isActive: true 
  }).sort({ name: 1 });
};

// Método estático para buscar por plataforma
typeSchema.statics.findByPlatform = function(platform) {
  return this.find({ 
    platforms: platform,
    isActive: true 
  }).sort({ name: 1 });
};

// Método de instancia para verificar si es contenido episódico
typeSchema.methods.isEpisodic = function() {
  return ['Episódico', 'Temporadas', 'Capítulos'].includes(this.format);
};

// Método de instancia para obtener duración formateada
typeSchema.methods.getFormattedDuration = function() {
  if (!this.duration || !this.duration.typical) {
    return 'No especificada';
  }
  
  const { min, max } = this.duration.typical;
  const unit = this.duration.unit;
  
  if (min && max) {
    return `${min}-${max} ${unit}`;
  } else if (min) {
    return `Mínimo ${min} ${unit}`;
  } else if (max) {
    return `Máximo ${max} ${unit}`;
  }
  
  return 'No especificada';
};

// Método de instancia para obtener información resumida
typeSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    category: this.category,
    format: this.format,
    duration: this.getFormattedDuration(),
    platforms: this.platforms,
    isEpisodic: this.isEpisodic(),
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

// Método virtual para contar media de este tipo
typeSchema.virtual('mediaCount', {
  ref: 'Media',
  localField: '_id',
  foreignField: 'type',
  count: true
});

// Configurar toJSON para incluir virtuals
typeSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    ret.formattedDuration = doc.getFormattedDuration();
    ret.isEpisodic = doc.isEpisodic();
    return ret;
  }
});

// Validación personalizada para evitar nombres duplicados (case-insensitive)
typeSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existingType = await this.constructor.findOne({
      name: { $regex: new RegExp(`^${this.name}$`, 'i') },
      _id: { $ne: this._id }
    });
    
    if (existingType) {
      const error = new Error(`Ya existe un tipo con el nombre '${this.name}'`);
      error.code = 11000;
      return next(error);
    }
  }
  next();
});

const Type = mongoose.model('Type', typeSchema);

export default Type;