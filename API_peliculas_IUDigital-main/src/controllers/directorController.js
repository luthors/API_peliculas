import Director from "../models/Director.js";
import Media from "../models/Media.js";
import { validationResult } from "express-validator";

/**
 * Controlador para el módulo de Directores
 * Maneja todas las operaciones CRUD para directores de películas y series
 */

/**
 * @desc    Obtener todos los directores
 * @route   GET /api/v1/directors
 * @access  Public
 */
const getAllDirectors = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "name",
      order = "asc",
      active = "true",
      search = "",
      nationality = "",
    } = req.query;

    // Construir filtros
    const filters = {};

    if (active !== "all") {
      filters.isActive = active === "true";
    }

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { biography: { $regex: search, $options: "i" } },
        { nationality: { $regex: search, $options: "i" } },
      ];
    }

    if (nationality) {
      filters.nationality = { $regex: nationality, $options: "i" };
    }

    // Configurar paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Configurar ordenamiento
    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Ejecutar consulta con paginación
    const [directors, total] = await Promise.all([
      Director.find(filters).sort(sortObj).skip(skip).limit(limitNum).populate("mediaCount"),
      Director.countDocuments(filters),
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        directors,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage,
        },
      },
      message: `${directors.length} directores encontrados`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener un director por ID
 * @route   GET /api/v1/directors/:id
 * @access  Public
 */
const getDirectorById = async (req, res, next) => {
  try {
    const director = await Director.findById(req.params.id).populate("mediaCount");

    if (!director) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Director no encontrado",
          details: `No existe un director con el ID: ${req.params.id}`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { director },
      message: "Director encontrado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear un nuevo director
 * @route   POST /api/v1/directors
 * @access  Private
 */
const createDirector = async (req, res, next) => {
  try {
    // Validar errores de entrada
    console.log("🪰🪰🪰🪰🪰🪰🪰🤷‍♂️🤷‍♂️ aqui", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Errores de validación",
          details: errors.array(),
        },
      });
    }

    const directorData = {
      ...req.body,
      createdBy: req.user?.id || "system",
    };

    const director = await Director.create(directorData);

    res.status(201).json({
      success: true,
      data: { director },
      message: "Director creado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar un director
 * @route   PUT /api/v1/directors/:id
 * @access  Private
 */
const updateDirector = async (req, res, next) => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Errores de validación",
          details: errors.array(),
        },
      });
    }

    const director = await Director.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!director) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Director no encontrado",
          details: `No existe un director con el ID: ${req.params.id}`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { director },
      message: "Director actualizado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar un director (soft delete)
 * @route   DELETE /api/v1/directors/:id
 * @access  Private
 */
const deleteDirector = async (req, res, next) => {
  try {
    const director = await Director.findById(req.params.id);

    if (!director) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Director no encontrado",
          details: `No existe un director con el ID: ${req.params.id}`,
        },
      });
    }

    // Verificar si el director está siendo usado por algún media
    const mediaCount = await Media.countDocuments({ director: req.params.id });

    if (mediaCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "No se puede eliminar el director",
          details: `El director está asociado a ${mediaCount} película(s)/serie(s). Desactívalo en su lugar.`,
        },
      });
    }

    // Soft delete - marcar como inactivo
    director.isActive = false;
    await director.save();

    res.status(200).json({
      success: true,
      data: { director },
      message: "Director desactivado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener directores activos (para selects)
 * @route   GET /api/v1/directors/active
 * @access  Public
 */
const getActiveDirectors = async (req, res, next) => {
  try {
    const directors = await Director.findActive();

    res.status(200).json({
      success: true,
      data: { directors },
      message: `${directors.length} directores activos encontrados`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener directores por nacionalidad
 * @route   GET /api/v1/directors/nationality/:nationality
 * @access  Public
 */
const getDirectorsByNationality = async (req, res, next) => {
  try {
    const { nationality } = req.params;
    const directors = await Director.findByNationality(nationality);

    res.status(200).json({
      success: true,
      data: { directors },
      message: `${directors.length} directores de ${nationality} encontrados`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener estadísticas de directores
 * @route   GET /api/v1/directors/stats
 * @access  Public
 */
const getDirectorStats = async (req, res, next) => {
  try {
    const [totalDirectors, activeDirectors, inactiveDirectors] = await Promise.all([
      Director.countDocuments(),
      Director.countDocuments({ isActive: true }),
      Director.countDocuments({ isActive: false }),
    ]);

    // Obtener nacionalidades más comunes
    const nationalityStats = await Director.aggregate([
      { $match: { isActive: true, nationality: { $exists: true, $ne: "" } } },
      { $group: { _id: "$nationality", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          nationality: "$_id",
          count: 1,
        },
      },
    ]);

    // Obtener directores más prolíficos
    const prolificDirectors = await Media.aggregate([
      { $group: { _id: "$director", mediaCount: { $sum: 1 } } },
      { $sort: { mediaCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "directors",
          localField: "_id",
          foreignField: "_id",
          as: "director",
        },
      },
      { $unwind: "$director" },
      {
        $project: {
          _id: 0,
          id: "$director._id",
          name: "$director.name",
          nationality: "$director.nationality",
          mediaCount: 1,
        },
      },
    ]);

    // Obtener rango de edades
    const ageStats = await Director.aggregate([
      {
        $match: {
          isActive: true,
          birthDate: { $exists: true, $ne: null },
        },
      },
      {
        $project: {
          age: {
            $floor: {
              $divide: [{ $subtract: [new Date(), "$birthDate"] }, 365.25 * 24 * 60 * 60 * 1000],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          avgAge: { $avg: "$age" },
          minAge: { $min: "$age" },
          maxAge: { $max: "$age" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDirectors,
        activeDirectors,
        inactiveDirectors,
        nationalityStats,
        prolificDirectors,
        ageStats: ageStats[0] || null,
      },
      message: "Estadísticas de directores obtenidas exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector,
  getActiveDirectors,
  getDirectorsByNationality,
  getDirectorStats,
};
