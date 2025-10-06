import mongoose from 'mongoose';

/**
 * Esquema para el modelo Media (Películas y Series)
 * Modelo principal que relaciona todos los demás módulos
 */
const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    minlength: [1, 'El título debe tener al menos 1 caracter'],
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  originalTitle: {
    type: String,
    trim: true,
    maxlength: [200, 'El título original no puede exceder 200 caracteres']
  },
  synopsis: {
    type: String,
    required: [true, 'La sinopsis es obligatoria'],
    trim: true,
    minlength: [10, 'La sinopsis debe tener al menos 10 caracteres'],
    maxlength: [2000, 'La sinopsis no puede exceder 2000 caracteres']
  },
  releaseDate: {
    type: Date,
    required: [true, 'La fecha de estreno es obligatoria'],
    validate: {
      validator: function(v) {
        return v <= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Máximo 1 año en el futuro
      },
      message: 'La fecha de estreno no puede ser más de 1 año en el futuro'
    }
  },
  duration: {
    type: Number,
    required: [true, 'La duración es obligatoria'],
    min: [1, 'La duración debe ser mayor a 0 minutos'],
    max: [1000, 'La duración no puede exceder 1000 minutos'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'La duración debe ser un número entero (minutos)'
    }
  },
  // Relaciones con otros modelos
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Type',
    required: [true, 'El tipo es obligatorio']
  },
  director: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Director',
    required: [true, 'El director es obligatorio']
  },
  producer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producer',
    required: [true, 'La productora es obligatoria']
  },
  genres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre',
    required: [true, 'Debe tener al menos un género']
  }],
  // Información adicional
  rating: {
    imdb: {
      score: {
        type: Number,
        min: [0, 'La puntuación IMDB debe ser entre 0 y 10'],
        max: [10, 'La puntuación IMDB debe ser entre 0 y 10']
      },
      votes: {
        type: Number,
        min: [0, 'Los votos no pueden ser negativos']
      }
    },
    metacritic: {
      type: Number,
      min: [0, 'La puntuación Metacritic debe ser entre 0 y 100'],
      max: [100, 'La puntuación Metacritic debe ser entre 0 y 100']
    },
    rottenTomatoes: {
      type: Number,
      min: [0, 'La puntuación Rotten Tomatoes debe ser entre 0 y 100'],
      max: [100, 'La puntuación Rotten Tomatoes debe ser entre 0 y 100']
    }
  },
  cast: [{
    actor: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'El nombre del actor no puede exceder 100 caracteres']
    },
    character: {
      type: String,
      trim: true,
      maxlength: [100, 'El nombre del personaje no puede exceder 100 caracteres']
    },
    role: {
      type: String,
      enum: ['Protagonista', 'Antagonista', 'Secundario', 'Reparto', 'Cameo'],
      default: 'Reparto'
    }
  }],
  crew: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    role: {
      type: String,
      required: true,
      enum: ['Guionista', 'Cinematógrafo', 'Editor', 'Compositor', 'Diseñador de Producción', 'Diseñador de Vestuario', 'Maquillaje', 'Efectos Especiales', 'Sonido', 'Otro'],
      default: 'Otro'
    }
  }],
  technical: {
    language: {
      type: String,
      required: [true, 'El idioma es obligatorio'],
      trim: true,
      maxlength: [50, 'El idioma no puede exceder 50 caracteres']
    },
    subtitles: [{
      type: String,
      trim: true,
      maxlength: [50, 'El idioma de subtítulos no puede exceder 50 caracteres']
    }],
    country: {
      type: String,
      required: [true, 'El país de origen es obligatorio'],
      trim: true,
      maxlength: [50, 'El país no puede exceder 50 caracteres']
    },
    budget: {
      amount: {
        type: Number,
        min: [0, 'El presupuesto no puede ser negativo']
      },
      currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'COP', 'MXN', 'ARS', 'BRL'],
        default: 'USD'
      }
    },
    boxOffice: {
      amount: {
        type: Number,
        min: [0, 'La taquilla no puede ser negativa']
      },
      currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'COP', 'MXN', 'ARS', 'BRL'],
        default: 'USD'
      }
    }
  },
  // Información para series
  seriesInfo: {
    seasons: {
      type: Number,
      min: [1, 'Debe tener al menos 1 temporada'],
      validate: {
        validator: function(v) {
          return !v || Number.isInteger(v);
        },
        message: 'El número de temporadas debe ser un entero'
      }
    },
    episodes: {
      type: Number,
      min: [1, 'Debe tener al menos 1 episodio'],
      validate: {
        validator: function(v) {
          return !v || Number.isInteger(v);
        },
        message: 'El número de episodios debe ser un entero'
      }
    },
    status: {
      type: String,
      enum: ['En emisión', 'Finalizada', 'Cancelada', 'En pausa', 'Próximamente'],
      default: 'Finalizada'
    }
  },
  // Metadatos
  poster: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'La URL del poster debe ser válida'
    }
  },
  trailer: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'La URL del trailer debe ser válida'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Cada tag no puede exceder 30 caracteres']
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
mediaSchema.index({ title: 1 });
mediaSchema.index({ releaseDate: -1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ director: 1 });
mediaSchema.index({ producer: 1 });
mediaSchema.index({ genres: 1 });
mediaSchema.index({ isActive: 1 });
mediaSchema.index({ 'technical.language': 1 });
mediaSchema.index({ 'technical.country': 1 });
mediaSchema.index({ 'rating.imdb.score': -1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ createdAt: -1 });

// Índices compuestos
mediaSchema.index({ type: 1, releaseDate: -1 });
mediaSchema.index({ director: 1, releaseDate: -1 });
mediaSchema.index({ producer: 1, releaseDate: -1 });
mediaSchema.index({ 'technical.country': 1, releaseDate: -1 });

// Validaciones personalizadas
mediaSchema.pre('save', async function(next) {
  try {
    // Verificar si la conexión está lista antes de hacer consultas
    if (mongoose.connection.readyState !== 1) {
      return next();
    }

    const validationErrors = [];

    // Validar que el título no exista (solo para documentos nuevos)
    if (this.isNew && this.title) {
      const existingMedia = await mongoose.model('Media').findOne({ 
        title: { $regex: new RegExp(`^${this.title.trim()}$`, 'i') },
        isActive: true 
      });
      if (existingMedia) {
        validationErrors.push({
          type: 'field',
          msg: `Ya existe un media con el título '${this.title}'`,
          path: 'title',
          location: 'body'
        });
      }
    }

    // Validar que tenga al menos un género
    if (!this.genres || this.genres.length === 0) {
      validationErrors.push({
        type: 'field',
        msg: 'Debe tener al menos un género',
        path: 'genres',
        location: 'body'
      });
    }

    // Validar que el tipo exista
    if (this.type) {
      const Type = mongoose.model('Type');
      const typeExists = await Type.findById(this.type);
      if (!typeExists) {
        validationErrors.push({
          type: 'field',
          msg: `El tipo con ID '${this.type}' no existe`,
          path: 'type',
          location: 'body'
        });
      }
    }

    // Validar que el director exista
    if (this.director) {
      const Director = mongoose.model('Director');
      const directorExists = await Director.findById(this.director);
      if (!directorExists) {
        validationErrors.push({
          type: 'field',
          msg: `El director con ID '${this.director}' no existe`,
          path: 'director',
          location: 'body'
        });
      }
    }

    // Validar que la productora exista
    if (this.producer) {
      const Producer = mongoose.model('Producer');
      const producerExists = await Producer.findById(this.producer);
      if (!producerExists) {
        validationErrors.push({
          type: 'field',
          msg: `La productora con ID '${this.producer}' no existe`,
          path: 'producer',
          location: 'body'
        });
      }
    }

    // Validar que todos los géneros existan
    if (this.genres && this.genres.length > 0) {
      const Genre = mongoose.model('Genre');
      const genreIds = this.genres.filter(id => id); // Filtrar valores null/undefined
      
      if (genreIds.length > 0) {
        const existingGenres = await Genre.find({ _id: { $in: genreIds } });
        const existingGenreIds = existingGenres.map(g => g._id.toString());
        
        const invalidGenres = genreIds.filter(id => !existingGenreIds.includes(id.toString()));
        
        if (invalidGenres.length > 0) {
          invalidGenres.forEach(genreId => {
            validationErrors.push({
              type: 'field',
              msg: `El género con ID '${genreId}' no existe`,
              path: 'genres',
              location: 'body'
            });
          });
        }
      }
    }

    // Si hay errores de validación, crear un error personalizado
    if (validationErrors.length > 0) {
      const error = new Error('Errores de validación de referencias');
      error.name = 'ValidationError';
      error.details = validationErrors;
      return next(error);
    }

    // Validar información de series
    if (this.seriesInfo && (this.seriesInfo.seasons || this.seriesInfo.episodes)) {
      if (!this.seriesInfo.seasons || !this.seriesInfo.episodes) {
        const error = new Error('Para series, tanto temporadas como episodios son obligatorios');
        return next(error);
      }
    }
    
    next();
  } catch (error) {
    // Si hay un error de conexión, continuar sin validación de referencias
    console.warn('Advertencia: No se pudo validar referencias debido a problemas de conexión');
    
    // Solo validar reglas básicas
    if (!this.genres || this.genres.length === 0) {
      return next(new Error('Debe tener al menos un género'));
    }
    
    if (this.seriesInfo && (this.seriesInfo.seasons || this.seriesInfo.episodes)) {
      if (!this.seriesInfo.seasons || !this.seriesInfo.episodes) {
        return next(new Error('Para series, tanto temporadas como episodios son obligatorios'));
      }
    }
    
    next();
  }
});

// Middleware pre-save para normalizar datos
mediaSchema.pre('save', function(next) {
  // Capitalizar título
  if (this.title) {
    this.title = this.title.trim();
  }
  
  // Limpiar tags duplicados
  if (this.tags && this.tags.length > 0) {
    this.tags = [...new Set(this.tags.filter(tag => tag.trim() !== ''))];
  }
  
  // Limpiar subtítulos duplicados
  if (this.technical && this.technical.subtitles && this.technical.subtitles.length > 0) {
    this.technical.subtitles = [...new Set(this.technical.subtitles.filter(sub => sub.trim() !== ''))];
  }
  
  next();
});

// Métodos estáticos
mediaSchema.statics.findActive = function() {
  return this.find({ isActive: true })
    .populate('type director producer genres')
    .sort({ releaseDate: -1 });
};

mediaSchema.statics.findByType = function(typeId) {
  return this.find({ type: typeId, isActive: true })
    .populate('type director producer genres')
    .sort({ releaseDate: -1 });
};

mediaSchema.statics.findByDirector = function(directorId) {
  return this.find({ director: directorId, isActive: true })
    .populate('type director producer genres')
    .sort({ releaseDate: -1 });
};

mediaSchema.statics.findByGenre = function(genreId) {
  return this.find({ genres: genreId, isActive: true })
    .populate('type director producer genres')
    .sort({ releaseDate: -1 });
};

// Métodos de instancia
mediaSchema.methods.getYear = function() {
  return this.releaseDate ? this.releaseDate.getFullYear() : null;
};

mediaSchema.methods.getDurationFormatted = function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

mediaSchema.methods.getAverageRating = function() {
  const ratings = [];
  
  if (this.rating.imdb && this.rating.imdb.score) {
    ratings.push(this.rating.imdb.score);
  }
  if (this.rating.metacritic) {
    ratings.push(this.rating.metacritic / 10); // Normalizar a escala de 10
  }
  if (this.rating.rottenTomatoes) {
    ratings.push(this.rating.rottenTomatoes / 10); // Normalizar a escala de 10
  }
  
  if (ratings.length === 0) return null;
  
  return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1);
};

mediaSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    year: this.getYear(),
    duration: this.getDurationFormatted(),
    averageRating: this.getAverageRating(),
    type: this.type,
    director: this.director,
    genres: this.genres,
    isActive: this.isActive
  };
};

// Configurar toJSON para incluir virtuals y métodos
mediaSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    ret.year = doc.getYear();
    ret.durationFormatted = doc.getDurationFormatted();
    ret.averageRating = doc.getAverageRating();
    return ret;
  }
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;