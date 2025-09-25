import express from 'express';
import { body, param, query } from 'express-validator';
// Importar controlador mock temporalmente para pruebas sin MongoDB
import {
  getAllDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector,
  getDirectorStats
} from '../controllers/directorControllerMock.js';

// Controlador original (comentado temporalmente)
// import {
//   getAllDirectors,
//   getDirectorById,
//   createDirector,
//   updateDirector,
//   deleteDirector,
//   getActiveDirectors,
//   getDirectorsByNationality,
//   getDirectorStats
// } from '../controllers/directorController.js';

const router = express.Router();

/**
 * Validaciones para el modelo Director
 */

// Validaciones para crear director
const createDirectorValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/)
    .withMessage('El nombre solo puede contener letras, espacios, puntos y guiones')
    .trim(),
  
  body('biography')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La biografía no puede exceder 2000 caracteres')
    .trim(),
  
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de nacimiento debe tener formato válido (YYYY-MM-DD)')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
      return true;
    }),
  
  body('nationality')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La nacionalidad no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/)
    .withMessage('La nacionalidad solo puede contener letras, espacios y guiones')
    .trim(),
  
  body('awards')
    .optional()
    .isArray()
    .withMessage('Los premios deben ser un array'),
  
  body('awards.*.name')
    .if(body('awards').exists())
    .notEmpty()
    .withMessage('El nombre del premio es obligatorio')
    .isLength({ max: 200 })
    .withMessage('El nombre del premio no puede exceder 200 caracteres')
    .trim(),
  
  body('awards.*.year')
    .if(body('awards').exists())
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`El año debe estar entre 1900 y ${new Date().getFullYear()}`),
  
  body('awards.*.category')
    .if(body('awards').exists())
    .optional()
    .isLength({ max: 100 })
    .withMessage('La categoría no puede exceder 100 caracteres')
    .trim(),
  
  body('socialMedia.website')
    .optional()
    .isURL()
    .withMessage('La URL del sitio web debe ser válida'),
  
  body('socialMedia.twitter')
    .optional()
    .matches(/^@?[a-zA-Z0-9_]+$/)
    .withMessage('El usuario de Twitter debe ser válido')
    .trim(),
  
  body('socialMedia.instagram')
    .optional()
    .matches(/^@?[a-zA-Z0-9_.]+$/)
    .withMessage('El usuario de Instagram debe ser válido')
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para actualizar director
const updateDirectorValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de director inválido'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/)
    .withMessage('El nombre solo puede contener letras, espacios, puntos y guiones')
    .trim(),
  
  body('biography')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La biografía no puede exceder 2000 caracteres')
    .trim(),
  
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de nacimiento debe tener formato válido (YYYY-MM-DD)')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
      return true;
    }),
  
  body('nationality')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La nacionalidad no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/)
    .withMessage('La nacionalidad solo puede contener letras, espacios y guiones')
    .trim(),
  
  body('awards')
    .optional()
    .isArray()
    .withMessage('Los premios deben ser un array'),
  
  body('awards.*.name')
    .if(body('awards').exists())
    .notEmpty()
    .withMessage('El nombre del premio es obligatorio')
    .isLength({ max: 200 })
    .withMessage('El nombre del premio no puede exceder 200 caracteres')
    .trim(),
  
  body('awards.*.year')
    .if(body('awards').exists())
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`El año debe estar entre 1900 y ${new Date().getFullYear()}`),
  
  body('awards.*.category')
    .if(body('awards').exists())
    .optional()
    .isLength({ max: 100 })
    .withMessage('La categoría no puede exceder 100 caracteres')
    .trim(),
  
  body('socialMedia.website')
    .optional()
    .isURL()
    .withMessage('La URL del sitio web debe ser válida'),
  
  body('socialMedia.twitter')
    .optional()
    .matches(/^@?[a-zA-Z0-9_]+$/)
    .withMessage('El usuario de Twitter debe ser válido')
    .trim(),
  
  body('socialMedia.instagram')
    .optional()
    .matches(/^@?[a-zA-Z0-9_.]+$/)
    .withMessage('El usuario de Instagram debe ser válido')
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validación para parámetros de ID
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de director inválido')
];

// Validación para nacionalidad
const nationalityValidation = [
  param('nationality')
    .notEmpty()
    .withMessage('La nacionalidad es obligatoria')
    .isLength({ min: 2, max: 50 })
    .withMessage('La nacionalidad debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/)
    .withMessage('La nacionalidad solo puede contener letras, espacios y guiones')
];

// Validaciones para query parameters
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  
  query('sort')
    .optional()
    .isIn(['name', 'nationality', 'birthDate', 'createdAt', 'updatedAt'])
    .withMessage('El campo de ordenamiento debe ser: name, nationality, birthDate, createdAt o updatedAt'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('El orden debe ser: asc o desc'),
  
  query('active')
    .optional()
    .isIn(['true', 'false', 'all'])
    .withMessage('El filtro active debe ser: true, false o all'),
  
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El término de búsqueda no puede exceder 100 caracteres')
    .trim(),
  
  query('nationality')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El filtro de nacionalidad no puede exceder 50 caracteres')
    .trim()
];

/**
 * Rutas del módulo Director
 */

// @route   GET /api/v1/directors/stats
// @desc    Obtener estadísticas de directores
// @access  Public
router.get('/stats', getDirectorStats);

// Rutas temporalmente comentadas (no implementadas en mock)
// @route   GET /api/v1/directors/active
// @desc    Obtener directores activos
// @access  Public
// router.get('/active', getActiveDirectors);

// @route   GET /api/v1/directors/nationality/:nationality
// @desc    Obtener directores por nacionalidad
// @access  Public
// router.get('/nationality/:nationality', nationalityValidation, getDirectorsByNationality);

// @route   GET /api/v1/directors
// @desc    Obtener todos los directores con paginación y filtros
// @access  Public
router.get('/', queryValidation, getAllDirectors);

// @route   GET /api/v1/directors/:id
// @desc    Obtener un director por ID
// @access  Public
router.get('/:id', idValidation, getDirectorById);

// @route   POST /api/v1/directors
// @desc    Crear un nuevo director
// @access  Private
router.post('/', createDirectorValidation, createDirector);

// @route   PUT /api/v1/directors/:id
// @desc    Actualizar un director
// @access  Private
router.put('/:id', updateDirectorValidation, updateDirector);

// @route   DELETE /api/v1/directors/:id
// @desc    Desactivar un director (soft delete)
// @access  Private
router.delete('/:id', idValidation, deleteDirector);

export default router;