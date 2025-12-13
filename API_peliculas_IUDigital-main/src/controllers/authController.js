import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

/**
 * Controlador para el módulo de Autenticación
 * Maneja todas las operaciones de registro, login, perfil y gestión de usuarios
 */

/**
 * Función helper para generar JWT token
 * @param {String} userId - ID del usuario
 * @param {String} role - Rol del usuario
 * @returns {String} - Token JWT
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    process.env.JWT_SECRET || "your-secret-key-change-this",
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

/**
 * Función helper para generar refresh token
 * @param {String} userId - ID del usuario
 * @returns {String} - Refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key-change-this", {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });
};

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: "Errores de validación",
      });
    }

    const { firstName, lastName, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
    }

    // Si intenta registrarse como admin, verificar que sea el primer usuario
    let userRole = "user";
    if (role === "admin") {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        // Si es el primer usuario, puede ser admin
        userRole = "admin";
      } else {
        // Solo los admins existentes pueden crear otros admins
        userRole = "user";
      }
    }

    // Crear nuevo usuario
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: userRole,
    });

    // Generar tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Guardar refresh token en el usuario
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token,
        refreshToken,
      },
      message: "Usuario registrado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Iniciar sesión
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: "Errores de validación",
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email e incluir password
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Usuario inactivo. Contacte al administrador",
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Generar tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Actualizar refresh token y último login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token,
        refreshToken,
      },
      message: "Inicio de sesión exitoso",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cerrar sesión
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    // El usuario está disponible desde el middleware de autenticación
    const user = await User.findById(req.user.id);

    if (user) {
      // Eliminar refresh token
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: user.getPublicProfile(),
      message: "Perfil obtenido exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar perfil del usuario actual
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: "Errores de validación",
      });
    }

    const { firstName, lastName, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Actualizar campos permitidos
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      data: user.getPublicProfile(),
      message: "Perfil actualizado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cambiar contraseña del usuario actual
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: "Errores de validación",
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar contraseña actual
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refrescar token de acceso
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token es requerido",
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key-change-this");

    // Buscar usuario
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token inválido",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Usuario inactivo",
      });
    }

    // Generar nuevo access token
    const newToken = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
      },
      message: "Token refrescado exitosamente",
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token inválido o expirado",
      });
    }
    next(error);
  }
};

/**
 * ENDPOINTS DE ADMINISTRACIÓN (Solo Admin)
 */

/**
 * @desc    Obtener todos los usuarios (Admin only)
 * @route   GET /api/v1/auth/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      active = "all",
      role = "all",
      search = "",
    } = req.query;

    // Construir filtros
    const filters = {};

    if (active !== "all") {
      filters.isActive = active === "true";
    }

    if (role !== "all") {
      filters.role = role;
    }

    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Configurar paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Configurar ordenamiento
    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Ejecutar consulta
    const [users, total] = await Promise.all([
      User.find(filters).sort(sortObj).skip(skip).limit(limitNum),
      User.countDocuments(filters),
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        users: users.map((user) => user.getPublicProfile()),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
      message: `${users.length} usuarios encontrados`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener usuario por ID (Admin only)
 * @route   GET /api/v1/auth/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: user.getPublicProfile(),
      message: "Usuario encontrado",
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }
    next(error);
  }
};

/**
 * @desc    Actualizar usuario (Admin only)
 * @route   PUT /api/v1/auth/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req, res, next) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: "Errores de validación",
      });
    }

    const { id } = req.params;
    const { firstName, lastName, role, isActive, avatar } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Actualizar campos
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      data: user.getPublicProfile(),
      message: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar usuario (Admin only)
 * @route   DELETE /api/v1/auth/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // No permitir que el admin se elimine a sí mismo
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "No puedes eliminar tu propia cuenta",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Usuario desactivado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener estadísticas de usuarios (Admin only)
 * @route   GET /api/v1/auth/stats
 * @access  Private/Admin
 */
export const getUserStats = async (req, res, next) => {
  try {
    const stats = await User.getStats();

    res.status(200).json({
      success: true,
      data: stats,
      message: "Estadísticas obtenidas exitosamente",
    });
  } catch (error) {
    next(error);
  }
};
