import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware de autenticación
 * Verifica el token JWT y añade el usuario a req.user
 */

/**
 * @desc    Proteger rutas - Verificar que el usuario esté autenticado
 * @access  Private
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Verificar si el header Authorization existe y comienza con 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      // Extraer token del header
      token = req.headers.authorization.split(" ")[1];
    }

    // Verificar si no hay token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No autorizado. Token no proporcionado",
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this");

      // Buscar usuario por ID del token
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Usuario inactivo. Contacte al administrador",
        });
      }

      // Añadir usuario a la request
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expirado",
        });
      }
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error en la autenticación",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Verificar roles autorizados
 * @param   {...String} roles - Roles permitidos (admin, user)
 * @access  Private
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    // Verificar si el rol del usuario está en los roles permitidos
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol '${req.user.role}' no está autorizado para acceder a este recurso`,
      });
    }

    next();
  };
};

/**
 * @desc    Middleware opcional de autenticación
 * @desc    Añade el usuario a req.user si el token es válido, pero no bloquea la petición
 * @access  Public/Private
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      // No hay token, continuar sin usuario
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this");

      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }
    } catch (error) {
      // Token inválido o expirado, continuar sin usuario
      // No lanzar error, solo continuar
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * @desc    Verificar que el usuario sea el propietario del recurso o admin
 * @param   {Function} getUserIdFromRequest - Función para extraer el userId de la request
 * @access  Private
 */
export const checkOwnershipOrAdmin = (getUserIdFromRequest) => {
  return async (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
      }

      // Los admins tienen acceso total
      if (req.user.role === "admin") {
        return next();
      }

      // Obtener el ID del usuario del recurso
      const resourceUserId = await getUserIdFromRequest(req);

      // Verificar si el usuario es el propietario
      if (resourceUserId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "No tienes permiso para acceder a este recurso",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * @desc    Rate limiting por usuario autenticado
 * @desc    Útil para limitar peticiones de usuarios específicos
 */
export const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const userRequests = requests.get(userId) || [];

    // Limpiar requests antiguos
    const validRequests = userRequests.filter((timestamp) => now - timestamp < windowMs);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Demasiadas peticiones. Por favor, intenta más tarde",
      });
    }

    validRequests.push(now);
    requests.set(userId, validRequests);

    next();
  };
};

export default {
  protect,
  authorize,
  optionalAuth,
  checkOwnershipOrAdmin,
  userRateLimit,
};
