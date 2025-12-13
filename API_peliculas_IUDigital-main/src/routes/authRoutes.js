import express from "express";
import { body, param, query } from "express-validator";
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * Validaciones para el módulo de Autenticación
 */

// Validaciones para registro de usuario
const registerValidation = [
  body("firstName")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios")
    .trim(),

  body("lastName")
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El apellido solo puede contener letras y espacios")
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail()
    .trim(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("La contraseña debe contener al menos una mayúscula, una minúscula y un número"),

  body("role").optional().isIn(["user", "admin"]).withMessage('El rol debe ser "user" o "admin"'),
];

// Validaciones para login
const loginValidation = [
  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail()
    .trim(),

  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];

// Validaciones para actualizar perfil
const updateProfileValidation = [
  body("firstName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios")
    .trim(),

  body("lastName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El apellido solo puede contener letras y espacios")
    .trim(),

  body("avatar").optional().isURL().withMessage("El avatar debe ser una URL válida").trim(),
];

// Validaciones para cambiar contraseña
const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("La contraseña actual es obligatoria"),

  body("newPassword")
    .notEmpty()
    .withMessage("La nueva contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La nueva contraseña debe tener al menos 6 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número"),
];

// Validaciones para actualizar usuario (Admin)
const updateUserValidation = [
  param("id").isMongoId().withMessage("ID de usuario inválido"),

  body("firstName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios")
    .trim(),

  body("lastName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El apellido solo puede contener letras y espacios")
    .trim(),

  body("role").optional().isIn(["user", "admin"]).withMessage('El rol debe ser "user" o "admin"'),

  body("isActive").optional().isBoolean().withMessage("isActive debe ser un valor booleano"),

  body("avatar").optional().isURL().withMessage("El avatar debe ser una URL válida").trim(),
];

// Validación para ID de MongoDB
const mongoIdValidation = [param("id").isMongoId().withMessage("ID de usuario inválido")];

// Validaciones para query parameters de listado
const listUsersValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("El número de página debe ser un entero positivo"),

  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("El límite debe ser un entero entre 1 y 100"),

  query("sort")
    .optional()
    .isIn(["firstName", "lastName", "email", "role", "createdAt", "lastLogin"])
    .withMessage("Campo de ordenamiento inválido"),

  query("order").optional().isIn(["asc", "desc"]).withMessage('El orden debe ser "asc" o "desc"'),

  query("active")
    .optional()
    .isIn(["true", "false", "all"])
    .withMessage('El filtro activo debe ser "true", "false" o "all"'),

  query("role").optional().isIn(["user", "admin", "all"]).withMessage('El rol debe ser "user", "admin" o "all"'),
];

/**
 * RUTAS PÚBLICAS (No requieren autenticación)
 */

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post("/register", registerValidation, register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post("/login", loginValidation, login);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refrescar token de acceso
 * @access  Public
 */
router.post("/refresh-token", refreshToken);

/**
 * RUTAS PRIVADAS (Requieren autenticación)
 */

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post("/logout", protect, logout);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Obtener perfil del usuario actual
 * @access  Private
 */
router.get("/profile", protect, getProfile);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Actualizar perfil del usuario actual
 * @access  Private
 */
router.put("/profile", protect, updateProfileValidation, updateProfile);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Cambiar contraseña del usuario actual
 * @access  Private
 */
router.put("/change-password", protect, changePasswordValidation, changePassword);

/**
 * RUTAS DE ADMINISTRACIÓN (Requieren autenticación y rol admin)
 */

/**
 * @route   GET /api/v1/auth/users
 * @desc    Obtener todos los usuarios (Admin only)
 * @access  Private/Admin
 */
router.get("/users", protect, authorize("admin"), listUsersValidation, getAllUsers);

/**
 * @route   GET /api/v1/auth/stats
 * @desc    Obtener estadísticas de usuarios (Admin only)
 * @access  Private/Admin
 */
router.get("/stats", protect, authorize("admin"), getUserStats);

/**
 * @route   GET /api/v1/auth/users/:id
 * @desc    Obtener usuario por ID (Admin only)
 * @access  Private/Admin
 */
router.get("/users/:id", protect, authorize("admin"), mongoIdValidation, getUserById);

/**
 * @route   PUT /api/v1/auth/users/:id
 * @desc    Actualizar usuario (Admin only)
 * @access  Private/Admin
 */
router.put("/users/:id", protect, authorize("admin"), updateUserValidation, updateUser);

/**
 * @route   DELETE /api/v1/auth/users/:id
 * @desc    Eliminar usuario (Admin only)
 * @access  Private/Admin
 */
router.delete("/users/:id", protect, authorize("admin"), mongoIdValidation, deleteUser);

export default router;
