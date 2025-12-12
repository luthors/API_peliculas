import express from 'express';
import { body } from 'express-validator';
import {
  createBulkGenres,
  createBulkDirectors,
  createBulkProducers,
  createBulkTypes,
  createBulkMedia,
  createBulkAll
} from '../controllers/bulkController.js';

const router = express.Router();

/**
 * Validaciones para creación masiva de géneros
 */
const validateBulkGenres = [
  body('genres')
    .isArray({ min: 1 })
    .withMessage('Se requiere un array de géneros con al menos un elemento'),
  body('genres.*.name')
    .notEmpty()
    .withMessage('El nombre del género es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/)
    .withMessage('El nombre solo puede contener letras, espacios y guiones'),
  body('genres.*.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('genres.*.tags')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array')
];

/**
 * Validaciones para creación masiva de directores
 */
const validateBulkDirectors = [
  body('directors')
    .isArray({ min: 1 })
    .withMessage('Se requiere un array de directores con al menos un elemento'),
  body('directors.*.name')
    .notEmpty()
    .withMessage('El nombre del director es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/)
    .withMessage('El nombre solo puede contener letras, espacios, puntos y guiones'),
  body('directors.*.biography')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La biografía no puede exceder 2000 caracteres'),
  body('directors.*.birthDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser una fecha válida'),
  body('directors.*.nationality')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La nacionalidad no puede exceder 50 caracteres')
];

/**
 * Validaciones para creación masiva de productoras
 */
const validateBulkProducers = [
  body('producers')
    .isArray({ min: 1 })
    .withMessage('Se requiere un array de productoras con al menos un elemento'),
  body('producers.*.name')
    .notEmpty()
    .withMessage('El nombre de la productora es obligatorio')
    .isLength({ min: 2, max: 150 })
    .withMessage('El nombre debe tener entre 2 y 150 caracteres'),
  body('producers.*.country')
    .notEmpty()
    .withMessage('El país de origen es obligatorio')
    .isLength({ max: 50 })
    .withMessage('El país no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/)
    .withMessage('El país solo puede contener letras, espacios y guiones'),
  body('producers.*.foundedYear')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('El año de fundación debe ser válido'),
  body('producers.*.description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres')
];

/**
 * Validaciones para creación masiva de tipos
 */
const validateBulkTypes = [
  body('types')
    .isArray({ min: 1 })
    .withMessage('Se requiere un array de tipos con al menos un elemento'),
  body('types.*.name')
    .notEmpty()
    .withMessage('El nombre del tipo es obligatorio')
    .isIn(['Película', 'Serie', 'Documental', 'Miniserie', 'Cortometraje', 'Telefilme', 'Especial TV', 'Webserie'])
    .withMessage('El tipo debe ser válido'),
  body('types.*.category')
    .notEmpty()
    .withMessage('La categoría es obligatoria')
    .isIn(['Largometraje', 'Serie TV', 'Contenido Digital', 'Documental', 'Especial'])
    .withMessage('La categoría debe ser válida'),
  body('types.*.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
];

/**
 * Validaciones para creación masiva de media
 */
const validateBulkMedia = [
  body('media')
    .isArray({ min: 1 })
    .withMessage('Se requiere un array de media con al menos un elemento'),
  body('media.*.title')
    .notEmpty()
    .withMessage('El título es obligatorio')
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),
  body('media.*.type')
    .notEmpty()
    .withMessage('El tipo es obligatorio')
    .isMongoId()
    .withMessage('El tipo debe ser un ID válido'),
  body('media.*.director')
    .notEmpty()
    .withMessage('El director es obligatorio')
    .isMongoId()
    .withMessage('El director debe ser un ID válido'),
  body('media.*.producer')
    .notEmpty()
    .withMessage('La productora es obligatoria')
    .isMongoId()
    .withMessage('La productora debe ser un ID válido'),
  body('media.*.genres')
    .isArray({ min: 1 })
    .withMessage('Se requiere al menos un género'),
  body('media.*.genres.*')
    .isMongoId()
    .withMessage('Cada género debe ser un ID válido'),
  body('media.*.releaseDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de lanzamiento debe ser válida'),
  body('media.*.duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La duración debe ser un número positivo')
];

/**
 * Validaciones para creación masiva completa
 */
const validateBulkAll = [
  body('genres')
    .optional()
    .isArray()
    .withMessage('Los géneros deben ser un array'),
  body('directors')
    .optional()
    .isArray()
    .withMessage('Los directores deben ser un array'),
  body('producers')
    .optional()
    .isArray()
    .withMessage('Las productoras deben ser un array'),
  body('types')
    .optional()
    .isArray()
    .withMessage('Los tipos deben ser un array'),
  body('media')
    .optional()
    .isArray()
    .withMessage('Los media deben ser un array')
];

// Rutas para operaciones masivas
router.post('/genres', validateBulkGenres, createBulkGenres);
router.post('/directors', validateBulkDirectors, createBulkDirectors);
router.post('/producers', validateBulkProducers, createBulkProducers);
router.post('/types', validateBulkTypes, createBulkTypes);
router.post('/media', validateBulkMedia, createBulkMedia);
router.post('/all', validateBulkAll, createBulkAll);

export default router;