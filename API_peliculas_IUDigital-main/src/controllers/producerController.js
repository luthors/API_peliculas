import Producer from '../models/Producer.js';
import Media from '../models/Media.js';
import { validationResult } from 'express-validator';

/**
 * Controlador para el módulo de Productoras
 * Maneja todas las operaciones CRUD para compañías productoras
 */

/**
 * @desc    Obtener todas las productoras
 * @route   GET /api/v1/producers
 * @access  Public
 */
const getAllProducers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'name', 
      order = 'asc',
      active = 'true',
      search = '',
      country = '',
      specialty = ''
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
        { country: { $regex: search, $options: 'i' } },
        { 'headquarters.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (country) {
      filters.country = { $regex: country, $options: 'i' };
    }
    
    if (specialty) {
      filters.specialties = specialty.toLowerCase();
    }

    // Configurar paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Configurar ordenamiento
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Ejecutar consulta con paginación
    const [producers, total] = await Promise.all([
      Producer.find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('mediaCount'),
      Producer.countDocuments(filters)
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        producers,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        }
      },
      message: `${producers.length} productoras encontradas`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener una productora por ID
 * @route   GET /api/v1/producers/:id
 * @access  Public
 */
const getProducerById = async (req, res, next) => {
  try {
    const producer = await Producer.findById(req.params.id).populate('mediaCount');

    if (!producer) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Productora no encontrada',
          details: `No existe una productora con el ID: ${req.params.id}`
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { producer },
      message: 'Productora encontrada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear una nueva productora
 * @route   POST /api/v1/producers
 * @access  Private
 */
const createProducer = async (req, res, next) => {
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

    const producerData = {
      ...req.body,
      createdBy: req.user?.id || 'system'
    };

    const producer = await Producer.create(producerData);

    res.status(201).json({
      success: true,
      data: { producer },
      message: 'Productora creada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar una productora
 * @route   PUT /api/v1/producers/:id
 * @access  Private
 */
const updateProducer = async (req, res, next) => {
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

    const producer = await Producer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!producer) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Productora no encontrada',
          details: `No existe una productora con el ID: ${req.params.id}`
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { producer },
      message: 'Productora actualizada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar una productora (soft delete)
 * @route   DELETE /api/v1/producers/:id
 * @access  Private
 */
const deleteProducer = async (req, res, next) => {
  try {
    const producer = await Producer.findById(req.params.id);

    if (!producer) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Productora no encontrada',
          details: `No existe una productora con el ID: ${req.params.id}`
        }
      });
    }

    // Verificar si la productora está siendo usada por algún media
    const mediaCount = await Media.countDocuments({ producer: req.params.id });
    
    if (mediaCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No se puede eliminar la productora',
          details: `La productora está asociada a ${mediaCount} película(s)/serie(s). Desactívala en su lugar.`
        }
      });
    }

    // Soft delete - marcar como inactivo
    producer.isActive = false;
    await producer.save();

    res.status(200).json({
      success: true,
      data: { producer },
      message: 'Productora desactivada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener productoras activas (para selects)
 * @route   GET /api/v1/producers/active
 * @access  Public
 */
const getActiveProducers = async (req, res, next) => {
  try {
    const producers = await Producer.findActive();

    res.status(200).json({
      success: true,
      data: { producers },
      message: `${producers.length} productoras activas encontradas`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener productoras por país
 * @route   GET /api/v1/producers/country/:country
 * @access  Public
 */
const getProducersByCountry = async (req, res, next) => {
  try {
    const { country } = req.params;
    const producers = await Producer.findByCountry(country);

    res.status(200).json({
      success: true,
      data: { producers },
      message: `${producers.length} productoras de ${country} encontradas`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener productoras por especialidad
 * @route   GET /api/v1/producers/specialty/:specialty
 * @access  Public
 */
const getProducersBySpecialty = async (req, res, next) => {
  try {
    const { specialty } = req.params;
    const producers = await Producer.findBySpecialty(specialty);

    res.status(200).json({
      success: true,
      data: { producers },
      message: `${producers.length} productoras especializadas en ${specialty} encontradas`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener estadísticas de productoras
 * @route   GET /api/v1/producers/stats
 * @access  Public
 */
const getProducerStats = async (req, res, next) => {
  try {
    const [totalProducers, activeProducers, inactiveProducers] = await Promise.all([
      Producer.countDocuments(),
      Producer.countDocuments({ isActive: true }),
      Producer.countDocuments({ isActive: false })
    ]);

    // Obtener países más comunes
    const countryStats = await Producer.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          country: '$_id',
          count: 1
        }
      }
    ]);

    // Obtener especialidades más comunes
    const specialtyStats = await Producer.aggregate([
      { $match: { isActive: true, specialties: { $exists: true, $ne: [] } } },
      { $unwind: '$specialties' },
      { $group: { _id: '$specialties', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          specialty: '$_id',
          count: 1
        }
      }
    ]);

    // Obtener productoras más prolíficas
    const prolificProducers = await Media.aggregate([
      { $group: { _id: '$producer', mediaCount: { $sum: 1 } } },
      { $sort: { mediaCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'producers',
          localField: '_id',
          foreignField: '_id',
          as: 'producer'
        }
      },
      { $unwind: '$producer' },
      {
        $project: {
          _id: 0,
          id: '$producer._id',
          name: '$producer.name',
          country: '$producer.country',
          mediaCount: 1
        }
      }
    ]);

    // Obtener distribución por años de fundación
    const foundedYearStats = await Producer.aggregate([
      {
        $match: {
          isActive: true,
          foundedYear: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$foundedYear', 1950] }, then: 'Antes de 1950' },
                { case: { $lt: ['$foundedYear', 1980] }, then: '1950-1979' },
                { case: { $lt: ['$foundedYear', 2000] }, then: '1980-1999' },
                { case: { $lt: ['$foundedYear', 2010] }, then: '2000-2009' },
                { case: { $gte: ['$foundedYear', 2010] }, then: '2010 en adelante' }
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
          period: '$_id',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducers,
        activeProducers,
        inactiveProducers,
        countryStats,
        specialtyStats,
        prolificProducers,
        foundedYearStats
      },
      message: 'Estadísticas de productoras obtenidas exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

export {
  getAllProducers,
  getProducerById,
  createProducer,
  updateProducer,
  deleteProducer,
  getActiveProducers,
  getProducersByCountry,
  getProducersBySpecialty,
  getProducerStats
};