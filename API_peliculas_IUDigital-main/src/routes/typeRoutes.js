import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
  getActiveTypes,
  getTypesByCategory,
  getTypesByPlatform,
  getTypeStats
} from '../controllers/typeController.js';

const router = express.Router();

/**
 * Rutas para el módulo de Tipos
 * Incluye validaciones de entrada y manejo de errores
 */

// Validaciones comunes
const typeValidations = {
  name: body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .isIn([
      'Película', 'Serie', 'Documental', 'Miniserie', 'Cortometraje', 
      'Telefilme', 'Especial TV', 'Webserie'
    ])
    .withMessage('El tipo {VALUE} no es válido. Tipos permitidos: Película, Serie, Documental, Miniserie, Cortometraje, Telefilme, Especial TV, Webserie'),
    
  description: body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
    
  category: body('category')
    .trim()
    .notEmpty()
    .withMessage('La categoría es obligatoria')
    .isIn(['Largometraje', 'Serie TV', 'Contenido Digital', 'Documental', 'Especial'])
    .withMessage('La categoría {VALUE} no es válida. Categorías permitidas: Largometraje, Serie TV, Contenido Digital, Documental, Especial'),
    
  format: body('format')
    .optional()
    .isIn(['Episódico', 'Unitario', 'Temporadas', 'Capítulos', 'Único'])
    .withMessage('El formato {VALUE} no es válido. Formatos permitidos: Episódico, Unitario, Temporadas, Capítulos, Único'),
    
  duration: body('duration')
    .optional()
    .isObject()
    .withMessage('La duración debe ser un objeto válido'),
    
  'duration.min': body('duration.min')
    .optional()
    .isInt({ min: 1, max: 600 })
    .withMessage('La duración mínima debe estar entre 1 y 600 minutos'),
    
  'duration.max': body('duration.max')
    .optional()
    .isInt({ min: 1, max: 600 })
    .withMessage('La duración máxima debe estar entre 1 y 600 minutos')
    .custom((value, { req }) => {
      if (req.body.duration && req.body.duration.min && value < req.body.duration.min) {
        throw new Error('La duración máxima debe ser mayor que la mínima');
      }
      return true;
    }),
    
  'duration.unit': body('duration.unit')
    .optional()
    .isIn(['minutos', 'horas', 'episodios', 'temporadas'])
    .withMessage('La unidad de duración debe ser: minutos, horas, episodios o temporadas'),
    
  characteristics: body('characteristics')
    .optional()
    .isArray()
    .withMessage('Las características deben ser un array')
    .custom((value) => {
      const validCharacteristics = [
        'Episódico', 'Temporadas', 'Capítulos', 'Unitario', 'Antología',
        'Miniserie', 'Docuserie', 'Reality', 'Talk Show', 'Variedades',
        'Deportivo', 'Noticias', 'Infantil', 'Educativo', 'Musical',
        'Cocina', 'Viajes', 'Naturaleza', 'Historia', 'Ciencia',
        'Tecnología', 'Salud', 'Moda', 'Lifestyle'
      ];
      
      if (value && Array.isArray(value)) {
        for (const characteristic of value) {
          if (!validCharacteristics.includes(characteristic)) {
            throw new Error(`Característica no válida: ${characteristic}. Características permitidas: ${validCharacteristics.join(', ')}`);
          }
        }
      }
      return true;
    }),
    
  platforms: body('platforms')
    .optional()
    .isArray()
    .withMessage('Las plataformas deben ser un array')
    .custom((value) => {
      const validPlatforms = [
        'Cine', 'Televisión', 'Streaming', 'Digital', 'Festival', 'VOD', 'Blu-ray/DVD'
      ];
      
      if (value && Array.isArray(value)) {
        for (const platform of value) {
          if (!validPlatforms.includes(platform)) {
            throw new Error(`Plataforma no válida: ${platform}. Plataformas permitidas: ${validPlatforms.join(', ')}`);
          }
        }
      }
      return true;
    }),
    
  isActive: body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
};

// Validaciones para parámetros
const paramValidations = {
  id: param('id')
    .isMongoId()
    .withMessage('ID de tipo no válido'),
    
  category: param('category')
    .trim()
    .notEmpty()
    .withMessage('La categoría es obligatoria')
    .isIn(['audiovisual', 'streaming', 'televisión', 'cine', 'digital', 'web'])
    .withMessage('Categoría no válida'),
    
  platform: param('platform')
    .trim()
    .notEmpty()
    .withMessage('La plataforma es obligatoria')
    .isLength({ min: 2, max: 50 })
    .withMessage('La plataforma debe tener entre 2 y 50 caracteres')
};

// Validaciones para query parameters
const queryValidations = {
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
    
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
    
  sort: query('sort')
    .optional()
    .isIn(['name', 'category', 'createdAt', 'updatedAt'])
    .withMessage('Campo de ordenamiento no válido'),
    
  order: query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('El orden debe ser asc o desc'),
    
  active: query('active')
    .optional()
    .isIn(['true', 'false', 'all'])
    .withMessage('El filtro active debe ser true, false o all'),
    
  search: query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La búsqueda no puede exceder 100 caracteres'),
    
  category: query('category')
    .optional()
    .isIn(['audiovisual', 'streaming', 'televisión', 'cine', 'digital', 'web'])
    .withMessage('Categoría de filtro no válida'),
    
  platform: query('platform')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El filtro de plataforma no puede exceder 50 caracteres')
};

// Rutas principales

/**
 * @route   GET /api/v1/types/stats
 * @desc    Obtener estadísticas de tipos
 * @access  Public
 */
router.get('/stats', getTypeStats);

/**
 * @route   GET /api/v1/types/active
 * @desc    Obtener tipos activos
 * @access  Public
 */
router.get('/active', getActiveTypes);

/**
 * @route   GET /api/v1/types/category/:category
 * @desc    Obtener tipos por categoría
 * @access  Public
 */
router.get('/category/:category', 
  [paramValidations.category],
  getTypesByCategory
);

/**
 * @route   GET /api/v1/types/platform/:platform
 * @desc    Obtener tipos por plataforma
 * @access  Public
 */
router.get('/platform/:platform', 
  [paramValidations.platform],
  getTypesByPlatform
);

/**
 * @route   GET /api/v1/types
 * @desc    Obtener todos los tipos
 * @access  Public
 */
router.get('/', 
  [
    queryValidations.page,
    queryValidations.limit,
    queryValidations.sort,
    queryValidations.order,
    queryValidations.active,
    queryValidations.search,
    queryValidations.category,
    queryValidations.platform
  ],
  getAllTypes
);

/**
 * @route   GET /api/v1/types/:id
 * @desc    Obtener un tipo por ID
 * @access  Public
 */
router.get('/:id', 
  [paramValidations.id],
  getTypeById
);

/**
 * @route   POST /api/v1/types
 * @desc    Crear un nuevo tipo
 * @access  Private
 */
router.post('/', 
  [
    typeValidations.name,
    typeValidations.description,
    typeValidations.category,
    typeValidations.format,
    typeValidations.duration,
    typeValidations['duration.min'],
    typeValidations['duration.max'],
    typeValidations['duration.unit'],
    typeValidations.characteristics,
    typeValidations.platforms,
    typeValidations.isActive
  ],
  createType
);

/**
 * @route   PUT /api/v1/types/:id
 * @desc    Actualizar un tipo
 * @access  Private
 */
router.put('/:id', 
  [
    paramValidations.id,
    typeValidations.name,
    typeValidations.description,
    typeValidations.category,
    typeValidations.format,
    typeValidations.duration,
    typeValidations['duration.min'],
    typeValidations['duration.max'],
    typeValidations['duration.unit'],
    typeValidations.characteristics,
    typeValidations.platforms,
    typeValidations.isActive
  ],
  updateType
);

/**
 * @route   DELETE /api/v1/types/:id
 * @desc    Eliminar un tipo (soft delete)
 * @access  Private
 */
router.delete('/:id', 
  [paramValidations.id],
  deleteType
);

export default router;