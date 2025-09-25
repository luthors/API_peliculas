import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllProducers,
  getProducerById,
  createProducer,
  updateProducer,
  deleteProducer,
  getActiveProducers,
  getProducersByCountry,
  getProducersBySpecialty,
  getProducerStats
} from '../controllers/producerController.js';

const router = express.Router();

/**
 * Rutas para el módulo de Productoras
 * Incluye validaciones de entrada y manejo de errores
 */

// Validaciones comunes
const producerValidations = {
  name: body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-&.,()]+$/)
    .withMessage('El nombre contiene caracteres no válidos'),
    
  description: body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
    
  foundedYear: body('foundedYear')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(`El año de fundación debe estar entre 1800 y ${new Date().getFullYear()}`),
    
  country: body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El país debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s\-]+$/)
    .withMessage('El país contiene caracteres no válidos'),
    
  headquarters: body('headquarters')
    .optional()
    .isObject()
    .withMessage('La sede debe ser un objeto válido'),
    
  'headquarters.city': body('headquarters.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La ciudad debe tener entre 2 y 50 caracteres'),
    
  'headquarters.address': body('headquarters.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La dirección no puede exceder 200 caracteres'),
    
  contact: body('contact')
    .optional()
    .isObject()
    .withMessage('El contacto debe ser un objeto válido'),
    
  'contact.email': body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
    
  'contact.phone': body('contact.phone')
    .optional()
    .matches(/^[+]?[0-9\s\-()]+$/)
    .withMessage('El teléfono contiene caracteres no válidos'),
    
  'contact.website': body('contact.website')
    .optional()
    .isURL()
    .withMessage('Debe ser una URL válida'),
    
  specialties: body('specialties')
    .optional()
    .isArray()
    .withMessage('Las especialidades deben ser un array')
    .custom((value) => {
      const validSpecialties = [
        'accion', 'drama', 'comedia', 'terror', 'ciencia-ficcion',
        'romance', 'thriller', 'animacion', 'documental', 'musical',
        'aventura', 'fantasia', 'misterio', 'crimen', 'guerra',
        'western', 'biografia', 'historia', 'familia', 'deportes'
      ];
      
      if (value && Array.isArray(value)) {
        for (const specialty of value) {
          if (!validSpecialties.includes(specialty.toLowerCase())) {
            throw new Error(`Especialidad no válida: ${specialty}`);
          }
        }
      }
      return true;
    }),
    
  budget: body('budget')
    .optional()
    .isObject()
    .withMessage('El presupuesto debe ser un objeto válido'),
    
  'budget.range': body('budget.range')
    .optional()
    .isIn(['low', 'medium', 'high', 'blockbuster'])
    .withMessage('El rango de presupuesto debe ser: low, medium, high, blockbuster'),
    
  'budget.currency': body('budget.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('La moneda debe tener 3 caracteres (ej: USD, EUR)'),
    
  isActive: body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
};

// Validaciones para parámetros
const paramValidations = {
  id: param('id')
    .isMongoId()
    .withMessage('ID de productora no válido'),
    
  country: param('country')
    .trim()
    .notEmpty()
    .withMessage('El país es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El país debe tener entre 2 y 50 caracteres'),
    
  specialty: param('specialty')
    .trim()
    .notEmpty()
    .withMessage('La especialidad es obligatoria')
    .isLength({ min: 2, max: 50 })
    .withMessage('La especialidad debe tener entre 2 y 50 caracteres')
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
    .isIn(['name', 'foundedYear', 'country', 'createdAt', 'updatedAt'])
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
    
  country: query('country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El filtro de país no puede exceder 50 caracteres'),
    
  specialty: query('specialty')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El filtro de especialidad no puede exceder 50 caracteres')
};

// Rutas principales

/**
 * @route   GET /api/v1/producers/stats
 * @desc    Obtener estadísticas de productoras
 * @access  Public
 */
router.get('/stats', getProducerStats);

/**
 * @route   GET /api/v1/producers/active
 * @desc    Obtener productoras activas
 * @access  Public
 */
router.get('/active', getActiveProducers);

/**
 * @route   GET /api/v1/producers/country/:country
 * @desc    Obtener productoras por país
 * @access  Public
 */
router.get('/country/:country', 
  [paramValidations.country],
  getProducersByCountry
);

/**
 * @route   GET /api/v1/producers/specialty/:specialty
 * @desc    Obtener productoras por especialidad
 * @access  Public
 */
router.get('/specialty/:specialty', 
  [paramValidations.specialty],
  getProducersBySpecialty
);

/**
 * @route   GET /api/v1/producers
 * @desc    Obtener todas las productoras
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
    queryValidations.country,
    queryValidations.specialty
  ],
  getAllProducers
);

/**
 * @route   GET /api/v1/producers/:id
 * @desc    Obtener una productora por ID
 * @access  Public
 */
router.get('/:id', 
  [paramValidations.id],
  getProducerById
);

/**
 * @route   POST /api/v1/producers
 * @desc    Crear una nueva productora
 * @access  Private
 */
router.post('/', 
  [
    producerValidations.name,
    producerValidations.description,
    producerValidations.foundedYear,
    producerValidations.country,
    producerValidations.headquarters,
    producerValidations['headquarters.city'],
    producerValidations['headquarters.address'],
    producerValidations.contact,
    producerValidations['contact.email'],
    producerValidations['contact.phone'],
    producerValidations['contact.website'],
    producerValidations.specialties,
    producerValidations.budget,
    producerValidations['budget.range'],
    producerValidations['budget.currency'],
    producerValidations.isActive
  ],
  createProducer
);

/**
 * @route   PUT /api/v1/producers/:id
 * @desc    Actualizar una productora
 * @access  Private
 */
router.put('/:id', 
  [
    paramValidations.id,
    producerValidations.name,
    producerValidations.description,
    producerValidations.foundedYear,
    producerValidations.country,
    producerValidations.headquarters,
    producerValidations['headquarters.city'],
    producerValidations['headquarters.address'],
    producerValidations.contact,
    producerValidations['contact.email'],
    producerValidations['contact.phone'],
    producerValidations['contact.website'],
    producerValidations.specialties,
    producerValidations.budget,
    producerValidations['budget.range'],
    producerValidations['budget.currency'],
    producerValidations.isActive
  ],
  updateProducer
);

/**
 * @route   DELETE /api/v1/producers/:id
 * @desc    Eliminar una productora (soft delete)
 * @access  Private
 */
router.delete('/:id', 
  [paramValidations.id],
  deleteProducer
);

export default router;