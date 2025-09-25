import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
  permanentDeleteGenre,
  getActiveGenres,
  getGenreStats
} from '../controllers/genreController.js';

const router = express.Router();

/**
 * Validaciones para el modelo Genre
 */

// Validaciones para crear género
const createGenreValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/)
    .withMessage('El nombre solo puede contener letras, espacios y guiones')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array')
    .custom((tags) => {
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.trim().length === 0) {
            throw new Error('Cada tag debe ser una cadena no vacía');
          }
          if (tag.length > 30) {
            throw new Error('Cada tag no puede exceder 30 caracteres');
          }
        }
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para actualizar género
const updateGenreValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de género inválido'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/)
    .withMessage('El nombre solo puede contener letras, espacios y guiones')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array')
    .custom((tags) => {
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.trim().length === 0) {
            throw new Error('Cada tag debe ser una cadena no vacía');
          }
          if (tag.length > 30) {
            throw new Error('Cada tag no puede exceder 30 caracteres');
          }
        }
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validación para parámetros de ID
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de género inválido')
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
    .isIn(['name', 'createdAt', 'updatedAt'])
    .withMessage('El campo de ordenamiento debe ser: name, createdAt o updatedAt'),
  
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
    .trim()
];

/**
 * Rutas del módulo Genre
 */

// @route   GET /api/v1/genres/stats
// @desc    Obtener estadísticas de géneros
// @access  Public
router.get('/stats', getGenreStats);

// @route   GET /api/v1/genres/active
// @desc    Obtener géneros activos
// @access  Public
router.get('/active', getActiveGenres);

// @route   GET /api/v1/genres
// @desc    Obtener todos los géneros con paginación y filtros
// @access  Public
router.get('/', queryValidation, getAllGenres);

// @route   GET /api/v1/genres/:id
// @desc    Obtener un género por ID
// @access  Public
router.get('/:id', idValidation, getGenreById);

// @route   POST /api/v1/genres
// @desc    Crear un nuevo género
// @access  Private
router.post('/', createGenreValidation, createGenre);

// @route   PUT /api/v1/genres/:id
// @desc    Actualizar un género
// @access  Private
router.put('/:id', updateGenreValidation, updateGenre);

// @route   DELETE /api/v1/genres/:id
// @desc    Desactivar un género (soft delete)
// @access  Private
router.delete('/:id', idValidation, deleteGenre);

// @route   DELETE /api/v1/genres/:id/permanent
// @desc    Eliminar permanentemente un género
// @access  Private (Admin only)
router.delete('/:id/permanent', idValidation, permanentDeleteGenre);

export default router;