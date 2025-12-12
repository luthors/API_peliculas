import Genre from '../models/Genre.js';
import Director from '../models/Director.js';
import Producer from '../models/Producer.js';
import Type from '../models/Type.js';
import Media from '../models/Media.js';
import { validationResult } from 'express-validator';

/**
 * Controlador para operaciones masivas (bulk)
 * Maneja la creación múltiple de objetos para todos los modelos
 */

/**
 * @desc    Crear múltiples géneros
 * @route   POST /api/v1/bulk/genres
 * @access  Private
 */
const createBulkGenres = async (req, res, next) => {
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

    const { genres } = req.body;

    if (!Array.isArray(genres) || genres.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Se requiere un array de géneros válido',
          details: 'El campo "genres" debe ser un array con al menos un elemento'
        }
      });
    }

    // Agregar información del usuario que crea
    const genresWithUser = genres.map(genre => ({
      ...genre,
      createdBy: req.user?.id || 'system'
    }));

    // Crear géneros en lote
    const createdGenres = await Genre.insertMany(genresWithUser, { 
      ordered: false, // Continúa insertando aunque algunos fallen
      rawResult: true 
    });

    res.status(201).json({
      success: true,
      data: { 
        genres: createdGenres.insertedIds,
        created: createdGenres.insertedCount,
        total: genres.length
      },
      message: `${createdGenres.insertedCount} de ${genres.length} géneros creados exitosamente`
    });

  } catch (error) {
    // Manejar errores de duplicados y otros errores de validación
    if (error.code === 11000) {
      const duplicateKeys = Object.keys(error.keyValue || {});
      return res.status(400).json({
        success: false,
        error: {
          message: 'Error de duplicados',
          details: `Ya existe un género con ${duplicateKeys.join(', ')}: ${Object.values(error.keyValue || {}).join(', ')}`
        }
      });
    }
    next(error);
  }
};

/**
 * @desc    Crear múltiples directores
 * @route   POST /api/v1/bulk/directors
 * @access  Private
 */
const createBulkDirectors = async (req, res, next) => {
  try {
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

    const { directors } = req.body;

    if (!Array.isArray(directors) || directors.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Se requiere un array de directores válido',
          details: 'El campo "directors" debe ser un array con al menos un elemento'
        }
      });
    }

    const directorsWithUser = directors.map(director => ({
      ...director,
      createdBy: req.user?.id || 'system'
    }));

    const createdDirectors = await Director.insertMany(directorsWithUser, { 
      ordered: false,
      rawResult: true 
    });

    res.status(201).json({
      success: true,
      data: { 
        directors: createdDirectors.insertedIds,
        created: createdDirectors.insertedCount,
        total: directors.length
      },
      message: `${createdDirectors.insertedCount} de ${directors.length} directores creados exitosamente`
    });

  } catch (error) {
    if (error.code === 11000) {
      const duplicateKeys = Object.keys(error.keyValue || {});
      return res.status(400).json({
        success: false,
        error: {
          message: 'Error de duplicados',
          details: `Ya existe un director con ${duplicateKeys.join(', ')}: ${Object.values(error.keyValue || {}).join(', ')}`
        }
      });
    }
    next(error);
  }
};

/**
 * @desc    Crear múltiples productoras
 * @route   POST /api/v1/bulk/producers
 * @access  Private
 */
const createBulkProducers = async (req, res, next) => {
  try {
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

    const { producers } = req.body;

    if (!Array.isArray(producers) || producers.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Se requiere un array de productoras válido',
          details: 'El campo "producers" debe ser un array con al menos un elemento'
        }
      });
    }

    const producersWithUser = producers.map(producer => ({
      ...producer,
      createdBy: req.user?.id || 'system'
    }));

    const createdProducers = await Producer.insertMany(producersWithUser, { 
      ordered: false,
      rawResult: true 
    });

    res.status(201).json({
      success: true,
      data: { 
        producers: createdProducers.insertedIds,
        created: createdProducers.insertedCount,
        total: producers.length
      },
      message: `${createdProducers.insertedCount} de ${producers.length} productoras creadas exitosamente`
    });

  } catch (error) {
    if (error.code === 11000) {
      const duplicateKeys = Object.keys(error.keyValue || {});
      return res.status(400).json({
        success: false,
        error: {
          message: 'Error de duplicados',
          details: `Ya existe una productora con ${duplicateKeys.join(', ')}: ${Object.values(error.keyValue || {}).join(', ')}`
        }
      });
    }
    next(error);
  }
};

/**
 * @desc    Crear múltiples tipos
 * @route   POST /api/v1/bulk/types
 * @access  Private
 */
const createBulkTypes = async (req, res, next) => {
  try {
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

    const { types } = req.body;

    if (!Array.isArray(types) || types.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Se requiere un array de tipos válido',
          details: 'El campo "types" debe ser un array con al menos un elemento'
        }
      });
    }

    const typesWithUser = types.map(type => ({
      ...type,
      createdBy: req.user?.id || 'system'
    }));

    const createdTypes = await Type.insertMany(typesWithUser, { 
      ordered: false,
      rawResult: true 
    });

    res.status(201).json({
      success: true,
      data: { 
        types: createdTypes.insertedIds,
        created: createdTypes.insertedCount,
        total: types.length
      },
      message: `${createdTypes.insertedCount} de ${types.length} tipos creados exitosamente`
    });

  } catch (error) {
    if (error.code === 11000) {
      const duplicateKeys = Object.keys(error.keyValue || {});
      return res.status(400).json({
        success: false,
        error: {
          message: 'Error de duplicados',
          details: `Ya existe un tipo con ${duplicateKeys.join(', ')}: ${Object.values(error.keyValue || {}).join(', ')}`
        }
      });
    }
    next(error);
  }
};

/**
 * @desc    Crear múltiples medias
 * @route   POST /api/v1/bulk/media
 * @access  Private
 */
const createBulkMedia = async (req, res, next) => {
  try {
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

    const { media } = req.body;

    if (!Array.isArray(media) || media.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Se requiere un array de media válido',
          details: 'El campo "media" debe ser un array con al menos un elemento'
        }
      });
    }

    const mediaWithUser = media.map(mediaItem => ({
      ...mediaItem,
      createdBy: req.user?.id || 'system'
    }));

    const createdMedia = await Media.insertMany(mediaWithUser, { 
      ordered: false,
      rawResult: true 
    });

    res.status(201).json({
      success: true,
      data: { 
        media: createdMedia.insertedIds,
        created: createdMedia.insertedCount,
        total: media.length
      },
      message: `${createdMedia.insertedCount} de ${media.length} elementos de media creados exitosamente`
    });

  } catch (error) {
    if (error.code === 11000) {
      const duplicateKeys = Object.keys(error.keyValue || {});
      return res.status(400).json({
        success: false,
        error: {
          message: 'Error de duplicados',
          details: `Ya existe un media con ${duplicateKeys.join(', ')}: ${Object.values(error.keyValue || {}).join(', ')}`
        }
      });
    }
    next(error);
  }
};

/**
 * @desc    Crear todos los objetos en una sola operación
 * @route   POST /api/v1/bulk/all
 * @access  Private
 */
const createBulkAll = async (req, res, next) => {
  try {
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

    const { genres, directors, producers, types, media } = req.body;
    const results = {};
    const userId = req.user?.id || 'system';

    // Crear géneros primero
    if (genres && Array.isArray(genres) && genres.length > 0) {
      try {
        const genresWithUser = genres.map(genre => ({ ...genre, createdBy: userId }));
        const createdGenres = await Genre.insertMany(genresWithUser, { ordered: false, rawResult: true });
        results.genres = {
          created: createdGenres.insertedCount,
          total: genres.length,
          ids: createdGenres.insertedIds
        };
      } catch (error) {
        results.genres = { error: error.message, created: 0, total: genres.length };
      }
    }

    // Crear directores
    if (directors && Array.isArray(directors) && directors.length > 0) {
      try {
        const directorsWithUser = directors.map(director => ({ ...director, createdBy: userId }));
        const createdDirectors = await Director.insertMany(directorsWithUser, { ordered: false, rawResult: true });
        results.directors = {
          created: createdDirectors.insertedCount,
          total: directors.length,
          ids: createdDirectors.insertedIds
        };
      } catch (error) {
        results.directors = { error: error.message, created: 0, total: directors.length };
      }
    }

    // Crear productoras
    if (producers && Array.isArray(producers) && producers.length > 0) {
      try {
        const producersWithUser = producers.map(producer => ({ ...producer, createdBy: userId }));
        const createdProducers = await Producer.insertMany(producersWithUser, { ordered: false, rawResult: true });
        results.producers = {
          created: createdProducers.insertedCount,
          total: producers.length,
          ids: createdProducers.insertedIds
        };
      } catch (error) {
        results.producers = { error: error.message, created: 0, total: producers.length };
      }
    }

    // Crear tipos
    if (types && Array.isArray(types) && types.length > 0) {
      try {
        const typesWithUser = types.map(type => ({ ...type, createdBy: userId }));
        const createdTypes = await Type.insertMany(typesWithUser, { ordered: false, rawResult: true });
        results.types = {
          created: createdTypes.insertedCount,
          total: types.length,
          ids: createdTypes.insertedIds
        };
      } catch (error) {
        results.types = { error: error.message, created: 0, total: types.length };
      }
    }

    // Crear media al final (requiere que existan las referencias)
    if (media && Array.isArray(media) && media.length > 0) {
      try {
        const mediaWithUser = media.map(mediaItem => ({ ...mediaItem, createdBy: userId }));
        const createdMedia = await Media.insertMany(mediaWithUser, { ordered: false, rawResult: true });
        results.media = {
          created: createdMedia.insertedCount,
          total: media.length,
          ids: createdMedia.insertedIds
        };
      } catch (error) {
        results.media = { error: error.message, created: 0, total: media.length };
      }
    }

    const totalCreated = Object.values(results).reduce((sum, result) => sum + (result.created || 0), 0);
    const totalRequested = Object.values(results).reduce((sum, result) => sum + (result.total || 0), 0);

    res.status(201).json({
      success: true,
      data: results,
      message: `Operación masiva completada: ${totalCreated} de ${totalRequested} objetos creados exitosamente`
    });

  } catch (error) {
    next(error);
  }
};

export {
  createBulkGenres,
  createBulkDirectors,
  createBulkProducers,
  createBulkTypes,
  createBulkMedia,
  createBulkAll
};