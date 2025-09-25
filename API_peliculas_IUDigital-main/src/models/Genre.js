import mongoose from 'mongoose';

/**
 * Esquema para el modelo Genre (Género)
 * Representa los géneros cinematográficos disponibles
 */
const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del género es obligatorio'],
    unique: true,
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    validate: {
      validator: function(v) {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(v);
      },
      message: 'El nombre solo puede contener letras, espacios y guiones'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  versionKey: false // Elimina el campo __v
});

// Índices para optimizar consultas
// Nota: El índice en 'name' se crea automáticamente por unique: true
genreSchema.index({ isActive: 1 });
genreSchema.index({ createdAt: -1 });

// Middleware pre-save para normalizar datos
genreSchema.pre('save', function(next) {
  // Capitalizar primera letra de cada palabra
  if (this.name) {
    this.name = this.name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Limpiar tags duplicados
  if (this.tags && this.tags.length > 0) {
    this.tags = [...new Set(this.tags.filter(tag => tag.trim() !== ''))];
  }
  
  next();
});

// Método estático para buscar géneros activos
genreSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Método de instancia para obtener información resumida
genreSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

// Método virtual para contar media asociados
genreSchema.virtual('mediaCount', {
  ref: 'Media',
  localField: '_id',
  foreignField: 'genres',
  count: true
});

// Configurar toJSON para incluir virtuals
genreSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

// Validación personalizada para evitar nombres duplicados (case-insensitive)
genreSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existingGenre = await this.constructor.findOne({
      name: { $regex: new RegExp(`^${this.name}$`, 'i') },
      _id: { $ne: this._id }
    });
    
    if (existingGenre) {
      const error = new Error(`Ya existe un género con el nombre '${this.name}'`);
      error.code = 11000;
      return next(error);
    }
  }
  next();
});

const Genre = mongoose.model('Genre', genreSchema);

export default Genre;