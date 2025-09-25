import Media from '../models/Media.js';
import { validationResult } from 'express-validator';

/**
 * Controlador para el módulo de Media
 * Maneja todas las operaciones CRUD para películas y series
 */

/**
 * @desc    Obtener todos los medios
 * @route   GET /api/v1/media
 * @access  Public
 */
const getAllMedia = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'title', 
      order = 'asc',
      active = 'true',
      search = '',
      type = '',
      genre = '',
      director = '',
      producer = '',
      year = '',
      rating = ''
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (active !== 'all') {
      filters.isActive = active === 'true';
    }
    
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { synopsis: { $regex: search, $options: 'i' } },
        { 'cast.name': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      filters.type = type;
    }
    
    if (genre) {
      filters.genres = genre;
    }
    
    if (director) {
      filters.director = director;
    }
    
    if (producer) {
      filters.producer = producer;
    }
    
    if (year) {
      const yearNum = parseInt(year);
      filters.releaseDate = {
        $gte: new Date(yearNum, 0, 1),
        $lt: new Date(yearNum + 1, 0, 1)
      };
    }
    
    if (rating) {
      const ratingNum = parseFloat(rating);
      filters['ratings.average'] = { $gte: ratingNum };
    }

    // Configurar paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Configurar ordenamiento
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Ejecutar consulta con paginación y populate
    const [media, total] = await Promise.all([
      Media.find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('type', 'name category')
        .populate('director', 'name nationality')
        .populate('producer', 'name country')
        .populate('genres', 'name'),
      Media.countDocuments(filters)
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        }
      },
      message: `${media.length} contenidos encontrados`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener un medio por ID
 * @route   GET /api/v1/media/:id
 * @access  Public
 */
const getMediaById = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('type', 'name category format')
      .populate('director', 'name nationality biography')
      .populate('producer', 'name country foundedYear')
      .populate('genres', 'name description');

    if (!media) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Contenido no encontrado',
          details: `No existe un contenido con el ID: ${req.params.id}`
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { media },
      message: 'Contenido encontrado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear un nuevo medio
 * @route   POST /api/v1/media
 * @access  Private
 */
const createMedia = async (req, res, next) => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Errores de validación',
          details: errors.array()
        }
      });
    }

    const mediaData = {
      ...req.body,
      createdBy: req.user?.id || 'system'
    };

    const media = await Media.create(mediaData);
    
    // Populate para la respuesta
    await media.populate([
      { path: 'type', select: 'name category' },
      { path: 'director', select: 'name nationality' },
      { path: 'producer', select: 'name country' },
      { path: 'genres', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      data: { media },
      message: 'Contenido creado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar un medio
 * @route   PUT /api/v1/media/:id
 * @access  Private
 */
const updateMedia = async (req, res, next) => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Errores de validación',
          details: errors.array()
        }
      });
    }

    const media = await Media.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate([
      { path: 'type', select: 'name category' },
      { path: 'director', select: 'name nationality' },
      { path: 'producer', select: 'name country' },
      { path: 'genres', select: 'name' }
    ]);

    if (!media) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Contenido no encontrado',
          details: `No existe un contenido con el ID: ${req.params.id}`
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { media },
      message: 'Contenido actualizado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar un medio (soft delete)
 * @route   DELETE /api/v1/media/:id
 * @access  Private
 */
const deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Contenido no encontrado',
          details: `No existe un contenido con el ID: ${req.params.id}`
        }
      });
    }

    // Soft delete - marcar como inactivo
    media.isActive = false;
    await media.save();

    res.status(200).json({
      success: true,
      data: { media },
      message: 'Contenido desactivado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener medios activos
 * @route   GET /api/v1/media/active
 * @access  Public
 */
const getActiveMedia = async (req, res, next) => {
  try {
    const media = await Media.findActive()
      .populate('type', 'name')
      .populate('director', 'name')
      .populate('genres', 'name');

    res.status(200).json({
      success: true,
      data: { media },
      message: `${media.length} contenidos activos encontrados`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener medios por tipo
 * @route   GET /api/v1/media/type/:typeId
 * @access  Public
 */
const getMediaByType = async (req, res, next) => {
  try {
    const { typeId } = req.params;
    const media = await Media.findByType(typeId)
      .populate('director', 'name')
      .populate('producer', 'name')
      .populate('genres', 'name');

    res.status(200).json({
      success: true,
      data: { media },
      message: `${media.length} contenidos del tipo especificado encontrados`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener medios por director
 * @route   GET /api/v1/media/director/:directorId
 * @access  Public
 */
const getMediaByDirector = async (req, res, next) => {
  try {
    const { directorId } = req.params;
    const media = await Media.findByDirector(directorId)
      .populate('type', 'name')
      .populate('producer', 'name')
      .populate('genres', 'name');

    res.status(200).json({
      success: true,
      data: { media },
      message: `${media.length} contenidos del director especificado encontrados`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener medios por género
 * @route   GET /api/v1/media/genre/:genreId
 * @access  Public
 */
const getMediaByGenre = async (req, res, next) => {
  try {
    const { genreId } = req.params;
    const media = await Media.findByGenre(genreId)
      .populate('type', 'name')
      .populate('director', 'name')
      .populate('producer', 'name');

    res.status(200).json({
      success: true,
      data: { media },
      message: `${media.length} contenidos del género especificado encontrados`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener estadísticas de medios
 * @route   GET /api/v1/media/stats
 * @access  Public
 */
const getMediaStats = async (req, res, next) => {
  try {
    const [totalMedia, activeMedia, inactiveMedia] = await Promise.all([
      Media.countDocuments(),
      Media.countDocuments({ isActive: true }),
      Media.countDocuments({ isActive: false })
    ]);

    // Estadísticas por tipo
    const typeStats = await Media.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'types',
          localField: 'type',
          foreignField: '_id',
          as: 'typeInfo'
        }
      },
      { $unwind: '$typeInfo' },
      { $group: { _id: '$typeInfo.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1
        }
      }
    ]);

    // Estadísticas por género
    const genreStats = await Media.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$genres' },
      {
        $lookup: {
          from: 'genres',
          localField: 'genres',
          foreignField: '_id',
          as: 'genreInfo'
        }
      },
      { $unwind: '$genreInfo' },
      { $group: { _id: '$genreInfo.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          genre: '$_id',
          count: 1
        }
      }
    ]);

    // Estadísticas por año de lanzamiento
    const yearStats = await Media.aggregate([
      { $match: { isActive: true, releaseDate: { $exists: true } } },
      {
        $group: {
          _id: { $year: '$releaseDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          year: '$_id',
          count: 1
        }
      }
    ]);

    // Top directores por cantidad de contenido
    const topDirectors = await Media.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$director', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'directors',
          localField: '_id',
          foreignField: '_id',
          as: 'directorInfo'
        }
      },
      { $unwind: '$directorInfo' },
      {
        $project: {
          _id: 0,
          id: '$directorInfo._id',
          name: '$directorInfo.name',
          nationality: '$directorInfo.nationality',
          count: 1
        }
      }
    ]);

    // Top productoras por cantidad de contenido
    const topProducers = await Media.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$producer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'producers',
          localField: '_id',
          foreignField: '_id',
          as: 'producerInfo'
        }
      },
      { $unwind: '$producerInfo' },
      {
        $project: {
          _id: 0,
          id: '$producerInfo._id',
          name: '$producerInfo.name',
          country: '$producerInfo.country',
          count: 1
        }
      }
    ]);

    // Estadísticas de ratings
    const ratingStats = await Media.aggregate([
      {
        $match: {
          isActive: true,
          'ratings.average': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$ratings.average' },
          maxRating: { $max: '$ratings.average' },
          minRating: { $min: '$ratings.average' },
          totalRated: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          averageRating: { $round: ['$averageRating', 2] },
          maxRating: 1,
          minRating: 1,
          totalRated: 1
        }
      }
    ]);

    // Distribución por duración
    const durationStats = await Media.aggregate([
      {
        $match: {
          isActive: true,
          duration: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$duration', 30] }, then: 'Muy corta (< 30 min)' },
                { case: { $lt: ['$duration', 60] }, then: 'Corta (30-60 min)' },
                { case: { $lt: ['$duration', 120] }, then: 'Media (1-2 horas)' },
                { case: { $lt: ['$duration', 180] }, then: 'Larga (2-3 horas)' },
                { case: { $gte: ['$duration', 180] }, then: 'Muy larga (> 3 horas)' }
              ],
              default: 'Sin clasificar'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } },
      {
        $project: {
          _id: 0,
          durationRange: '$_id',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMedia,
        activeMedia,
        inactiveMedia,
        typeStats,
        genreStats,
        yearStats,
        topDirectors,
        topProducers,
        ratingStats: ratingStats[0] || null,
        durationStats
      },
      message: 'Estadísticas de medios obtenidas exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

export {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  getActiveMedia,
  getMediaByType,
  getMediaByDirector,
  getMediaByGenre,
  getMediaStats
};