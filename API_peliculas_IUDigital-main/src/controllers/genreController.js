import Genre from '../models/Genre.js';
import Media from '../models/Media.js';
import { validationResult } from 'express-validator';

/**
 * Controlador para el módulo de Géneros
 * Maneja todas las operaciones CRUD para géneros cinematográficos
 */

/**
 * @desc    Obtener todos los géneros
 * @route   GET /api/v1/genres
 * @access  Public
 */
const getAllGenres = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'name', 
      order = 'asc',
      active = 'true',
      search = ''
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (active !== 'all') {
      filters.isActive = active === 'true';
    }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Configurar paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Configurar ordenamiento
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Ejecutar consulta con paginación
    const [genres, total] = await Promise.all([
      Genre.find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('mediaCount'),
      Genre.countDocuments(filters)
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        genres,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        }
      },
      message: `${genres.length} géneros encontrados`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener un género por ID
 * @route   GET /api/v1/genres/:id
 * @access  Public
 */
const getGenreById = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id).populate('mediaCount');

    if (!genre) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Género no encontrado',
          details: `No existe un género con el ID: ${req.params.id}`
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { genre },
      message: 'Género encontrado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear un nuevo género
 * @route   POST /api/v1/genres
 * @access  Private
 */
const createGenre = async (req, res, next) => {
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

    const genreData = {
      ...req.body,
      createdBy: req.user?.id || 'system'
    };

    const genre = await Genre.create(genreData);

    res.status(201).json({
      success: true,
      data: { genre },
      message: 'Género creado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar un género
 * @route   PUT /api/v1/genres/:id
 * @access  Private
 */
const updateGenre = async (req, res, next) => {
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

    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!genre) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Género no encontrado',
          details: `No existe un género con el ID: ${req.params.id}`
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { genre },
      message: 'Género actualizado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar un género (soft delete)
 * @route   DELETE /api/v1/genres/:id
 * @access  Private
 */
const deleteGenre = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Género no encontrado',
          details: `No existe un género con el ID: ${req.params.id}`
        }
      });
    }

    // Verificar si el género está siendo usado por algún media
     const mediaCount = await Media.countDocuments({ genres: req.params.id });
    
    if (mediaCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No se puede eliminar el género',
          details: `El género está siendo usado por ${mediaCount} película(s)/serie(s). Desactívalo en su lugar.`
        }
      });
    }

    // Soft delete - marcar como inactivo
    genre.isActive = false;
    await genre.save();

    res.status(200).json({
      success: true,
      data: { genre },
      message: 'Género desactivado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar permanentemente un género
 * @route   DELETE /api/v1/genres/:id/permanent
 * @access  Private (Admin only)
 */
const permanentDeleteGenre = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Género no encontrado',
          details: `No existe un género con el ID: ${req.params.id}`
        }
      });
    }

    // Verificar si el género está siendo usado
    const mediaCount = await Media.countDocuments({ genres: req.params.id });
    
    if (mediaCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No se puede eliminar permanentemente el género',
          details: `El género está siendo usado por ${mediaCount} película(s)/serie(s)`
        }
      });
    }

    await Genre.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Género eliminado permanentemente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener géneros activos (para selects)
 * @route   GET /api/v1/genres/active
 * @access  Public
 */
const getActiveGenres = async (req, res, next) => {
  try {
    const genres = await Genre.findActive();

    res.status(200).json({
      success: true,
      data: { genres },
      message: `${genres.length} géneros activos encontrados`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener estadísticas de géneros
 * @route   GET /api/v1/genres/stats
 * @access  Public
 */
const getGenreStats = async (req, res, next) => {
  try {
    const [totalGenres, activeGenres, inactiveGenres] = await Promise.all([
      Genre.countDocuments(),
      Genre.countDocuments({ isActive: true }),
      Genre.countDocuments({ isActive: false })
    ]);

    // Obtener géneros más populares (con más media)
    const popularGenres = await Media.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'genres',
          localField: '_id',
          foreignField: '_id',
          as: 'genre'
        }
      },
      { $unwind: '$genre' },
      {
        $project: {
          _id: 0,
          id: '$genre._id',
          name: '$genre.name',
          mediaCount: '$count'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalGenres,
        activeGenres,
        inactiveGenres,
        popularGenres
      },
      message: 'Estadísticas de géneros obtenidas exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

export {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
  permanentDeleteGenre,
  getActiveGenres,
  getGenreStats
};