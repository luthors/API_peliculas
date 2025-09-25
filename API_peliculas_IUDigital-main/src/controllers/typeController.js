import Type from '../models/Type.js';
import Media from '../models/Media.js';
import { validationResult } from 'express-validator';

/**
 * Controlador para el módulo de Tipos
 * Maneja todas las operaciones CRUD para tipos de contenido (Película, Serie, etc.)
 */

/**
 * @desc    Obtener todos los tipos
 * @route   GET /api/v1/types
 * @access  Public
 */
const getAllTypes = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'name', 
      order = 'asc',
      active = 'true',
      search = '',
      category = '',
      platform = ''
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
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filters.category = category.toLowerCase();
    }
    
    if (platform) {
      filters.platforms = platform.toLowerCase();
    }

    // Configurar paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Configurar ordenamiento
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Ejecutar consulta con paginación
    const [types, total] = await Promise.all([
      Type.find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('mediaCount'),
      Type.countDocuments(filters)
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        types,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        }
      },
      message: `${types.length} tipos encontrados`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener un tipo por ID
 * @route   GET /api/v1/types/:id
 * @access  Public
 */
const getTypeById = async (req, res, next) => {
  try {
    const type = await Type.findById(req.params.id).populate('mediaCount');

    if (!type) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Tipo no encontrado',
          details: `No existe un tipo con el ID: ${req.params.id}`
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { type },
      message: 'Tipo encontrado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear un nuevo tipo
 * @route   POST /api/v1/types
 * @access  Private
 */
const createType = async (req, res, next) => {
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

    const typeData = {
      ...req.body,
      createdBy: req.user?.id || 'system'
    };

    const type = await Type.create(typeData);

    res.status(201).json({
      success: true,
      data: { type },
      message: 'Tipo creado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar un tipo
 * @route   PUT /api/v1/types/:id
 * @access  Private
 */
const updateType = async (req, res, next) => {
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

    const type = await Type.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!type) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Tipo no encontrado',
          details: `No existe un tipo con el ID: ${req.params.id}`
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { type },
      message: 'Tipo actualizado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar un tipo (soft delete)
 * @route   DELETE /api/v1/types/:id
 * @access  Private
 */
const deleteType = async (req, res, next) => {
  try {
    const type = await Type.findById(req.params.id);

    if (!type) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Tipo no encontrado',
          details: `No existe un tipo con el ID: ${req.params.id}`
        }
      });
    }

    // Verificar si el tipo está siendo usado por algún media
    const mediaCount = await Media.countDocuments({ type: req.params.id });
    
    if (mediaCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No se puede eliminar el tipo',
          details: `El tipo está asociado a ${mediaCount} película(s)/serie(s). Desactívalo en su lugar.`
        }
      });
    }

    // Soft delete - marcar como inactivo
    type.isActive = false;
    await type.save();

    res.status(200).json({
      success: true,
      data: { type },
      message: 'Tipo desactivado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener tipos activos (para selects)
 * @route   GET /api/v1/types/active
 * @access  Public
 */
const getActiveTypes = async (req, res, next) => {
  try {
    const types = await Type.findActive();

    res.status(200).json({
      success: true,
      data: { types },
      message: `${types.length} tipos activos encontrados`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener tipos por categoría
 * @route   GET /api/v1/types/category/:category
 * @access  Public
 */
const getTypesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const types = await Type.findByCategory(category);

    res.status(200).json({
      success: true,
      data: { types },
      message: `${types.length} tipos de categoría ${category} encontrados`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener tipos por plataforma
 * @route   GET /api/v1/types/platform/:platform
 * @access  Public
 */
const getTypesByPlatform = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const types = await Type.findByPlatform(platform);

    res.status(200).json({
      success: true,
      data: { types },
      message: `${types.length} tipos disponibles en ${platform} encontrados`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener estadísticas de tipos
 * @route   GET /api/v1/types/stats
 * @access  Public
 */
const getTypeStats = async (req, res, next) => {
  try {
    const [totalTypes, activeTypes, inactiveTypes] = await Promise.all([
      Type.countDocuments(),
      Type.countDocuments({ isActive: true }),
      Type.countDocuments({ isActive: false })
    ]);

    // Obtener distribución por categorías
    const categoryStats = await Type.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      }
    ]);

    // Obtener distribución por formatos
    const formatStats = await Type.aggregate([
      { $match: { isActive: true, format: { $exists: true, $ne: null } } },
      { $group: { _id: '$format', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          format: '$_id',
          count: 1
        }
      }
    ]);

    // Obtener plataformas más populares
    const platformStats = await Type.aggregate([
      { $match: { isActive: true, platforms: { $exists: true, $ne: [] } } },
      { $unwind: '$platforms' },
      { $group: { _id: '$platforms', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          platform: '$_id',
          count: 1
        }
      }
    ]);

    // Obtener tipos más populares (con más contenido)
    const popularTypes = await Media.aggregate([
      { $group: { _id: '$type', mediaCount: { $sum: 1 } } },
      { $sort: { mediaCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'types',
          localField: '_id',
          foreignField: '_id',
          as: 'type'
        }
      },
      { $unwind: '$type' },
      {
        $project: {
          _id: 0,
          id: '$type._id',
          name: '$type.name',
          category: '$type.category',
          mediaCount: 1
        }
      }
    ]);

    // Obtener distribución por duración
    const durationStats = await Type.aggregate([
      {
        $match: {
          isActive: true,
          'duration.min': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$duration.min', 30] }, then: 'Corta (< 30 min)' },
                { case: { $lt: ['$duration.min', 60] }, then: 'Media (30-60 min)' },
                { case: { $lt: ['$duration.min', 120] }, then: 'Larga (1-2 horas)' },
                { case: { $gte: ['$duration.min', 120] }, then: 'Muy larga (> 2 horas)' }
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
        totalTypes,
        activeTypes,
        inactiveTypes,
        categoryStats,
        formatStats,
        platformStats,
        popularTypes,
        durationStats
      },
      message: 'Estadísticas de tipos obtenidas exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

export {
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
  getActiveTypes,
  getTypesByCategory,
  getTypesByPlatform,
  getTypeStats
};