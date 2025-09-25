import express from "express";
import { body, param, query } from "express-validator";
import {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  getActiveMedia,
  getMediaByType,
  getMediaByDirector,
  getMediaByGenre,
  getMediaStats,
} from "../controllers/mediaController.js";

const router = express.Router();

/**
 * Rutas para el módulo de Media (Películas y Series)
 * Incluye validaciones de entrada y manejo de errores
 */

// Validaciones comunes
const mediaValidations = {
  title: body("title")
    .trim()
    .notEmpty()
    .withMessage("El título es obligatorio")
    .isLength({ min: 1, max: 200 })
    .withMessage("El título debe tener entre 1 y 200 caracteres"),

  synopsis: body("synopsis")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("La sinopsis no puede exceder 2000 caracteres"),

  releaseDate: body("releaseDate")
    .optional()
    .isISO8601()
    .withMessage("La fecha de estreno debe ser una fecha válida")
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const minDate = new Date("1888-01-01"); // Primera película conocida
      const maxDate = new Date(now.getFullYear() + 5, 11, 31); // Máximo 5 años en el futuro

      if (date < minDate || date > maxDate) {
        throw new Error(`La fecha debe estar entre ${minDate.getFullYear()} y ${maxDate.getFullYear()}`);
      }
      return true;
    }),

  duration: body("duration")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("La duración debe ser un número entre 1 y 1000 minutos"),

  type: body("type")
    .notEmpty()
    .withMessage("El tipo es obligatorio")
    .isMongoId()
    .withMessage("El tipo debe ser un ID válido"),

  director: body("director")
    .notEmpty()
    .withMessage("El director es obligatorio")
    .isMongoId()
    .withMessage("El director debe ser un ID válido"),

  producer: body("producer")
    .notEmpty()
    .withMessage("La productora es obligatoria")
    .isMongoId()
    .withMessage("La productora debe ser un ID válido"),

  genres: body("genres")
    .isArray({ min: 1, max: 5 })
    .withMessage("Debe seleccionar entre 1 y 5 géneros")
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error("Los géneros deben ser un array");
      }

      for (const genreId of value) {
        if (!genreId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Cada género debe ser un ID válido");
        }
      }
      return true;
    }),

  ratings: body("ratings").optional().isObject().withMessage("Las calificaciones deben ser un objeto válido"),

  "ratings.imdb": body("ratings.imdb")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("La calificación de IMDb debe estar entre 0 y 10"),

  "ratings.rottenTomatoes": body("ratings.rottenTomatoes")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("La calificación de Rotten Tomatoes debe estar entre 0 y 100"),

  "ratings.metacritic": body("ratings.metacritic")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("La calificación de Metacritic debe estar entre 0 y 100"),

  cast: body("cast")
    .optional()
    .isArray({ max: 50 })
    .withMessage("El reparto no puede tener más de 50 miembros")
    .custom((value) => {
      if (value && Array.isArray(value)) {
        for (const member of value) {
          if (!member.actor || typeof member.actor !== "string" || member.actor.trim().length === 0) {
            throw new Error("Cada miembro del reparto debe tener un nombre de actor válido");
          }
          if (member.character && typeof member.character !== "string") {
            throw new Error("El personaje debe ser una cadena de texto");
          }
          if (member.role && !["Protagonista", "Antagonista", "Secundario", "Reparto", "Cameo"].includes(member.role)) {
            throw new Error("El rol debe ser uno de: Protagonista, Antagonista, Secundario, Reparto, Cameo");
          }
        }
      }
      return true;
    }),

  crew: body("crew")
    .optional()
    .isArray({ max: 30 })
    .withMessage("El equipo técnico no puede tener más de 30 miembros")
    .custom((value) => {
      if (value && Array.isArray(value)) {
        for (const member of value) {
          if (!member.name || typeof member.name !== "string" || member.name.trim().length === 0) {
            throw new Error("Cada miembro del equipo debe tener un nombre válido");
          }
          if (!member.role || typeof member.role !== "string" || member.role.trim().length === 0) {
            throw new Error("Cada miembro del equipo debe tener un rol válido");
          }
        }
      }
      return true;
    }),

  seriesInfo: body("seriesInfo").optional().isObject().withMessage("La información de serie debe ser un objeto válido"),

  "seriesInfo.seasons": body("seriesInfo.seasons")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("El número de temporadas debe estar entre 1 y 50"),

  "seriesInfo.episodes": body("seriesInfo.episodes")
    .optional()
    .isInt({ min: 1, max: 2000 })
    .withMessage("El número de episodios debe estar entre 1 y 2000"),

  "seriesInfo.status": body("seriesInfo.status")
    .optional()
    .isIn(["En emisión", "Finalizada", "Cancelada", "En pausa", "Próximamente"])
    .withMessage("Estado de serie no válido"),

  metadata: body("metadata").optional().isObject().withMessage("Los metadatos deben ser un objeto válido"),

  "metadata.poster": body("metadata.poster").optional().isURL().withMessage("El póster debe ser una URL válida"),

  "metadata.trailer": body("metadata.trailer").optional().isURL().withMessage("El tráiler debe ser una URL válida"),

  tags: body("tags")
    .optional()
    .isArray({ max: 20 })
    .withMessage("No puede haber más de 20 etiquetas")
    .custom((value) => {
      if (value && Array.isArray(value)) {
        for (const tag of value) {
          if (typeof tag !== "string" || tag.trim().length === 0 || tag.length > 30) {
            throw new Error("Cada etiqueta debe ser una cadena de texto válida (máximo 30 caracteres)");
          }
        }
      }
      return true;
    }),

  subtitles: body("subtitles")
    .optional()
    .isArray({ max: 20 })
    .withMessage("No puede haber más de 20 idiomas de subtítulos")
    .custom((value) => {
      const validLanguages = [
        "español",
        "inglés",
        "francés",
        "alemán",
        "italiano",
        "portugués",
        "japonés",
        "coreano",
        "chino",
        "árabe",
        "ruso",
        "hindi",
        "catalán",
        "euskera",
        "gallego",
        "valenciano",
      ];

      if (value && Array.isArray(value)) {
        for (const subtitle of value) {
          if (!validLanguages.includes(subtitle.toLowerCase())) {
            throw new Error(`Idioma de subtítulo no válido: ${subtitle}`);
          }
        }
      }
      return true;
    }),

  isActive: body("isActive").optional().isBoolean().withMessage("isActive debe ser un valor booleano"),
};

// Validaciones para parámetros
const paramValidations = {
  id: param("id").isMongoId().withMessage("ID de contenido no válido"),

  typeId: param("typeId").isMongoId().withMessage("ID de tipo no válido"),

  directorId: param("directorId").isMongoId().withMessage("ID de director no válido"),

  genreId: param("genreId").isMongoId().withMessage("ID de género no válido"),
};

// Validaciones para query parameters
const queryValidations = {
  page: query("page").optional().isInt({ min: 1 }).withMessage("La página debe ser un número entero mayor a 0"),

  limit: query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entre 1 y 100"),

  sort: query("sort")
    .optional()
    .isIn(["title", "releaseDate", "duration", "ratings.average", "createdAt", "updatedAt"])
    .withMessage("Campo de ordenamiento no válido"),

  order: query("order").optional().isIn(["asc", "desc"]).withMessage("El orden debe ser asc o desc"),

  active: query("active")
    .optional()
    .isIn(["true", "false", "all"])
    .withMessage("El filtro active debe ser true, false o all"),

  search: query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("La búsqueda no puede exceder 100 caracteres"),

  type: query("type").optional().isMongoId().withMessage("El filtro de tipo debe ser un ID válido"),

  genre: query("genre").optional().isMongoId().withMessage("El filtro de género debe ser un ID válido"),

  director: query("director").optional().isMongoId().withMessage("El filtro de director debe ser un ID válido"),

  producer: query("producer").optional().isMongoId().withMessage("El filtro de productora debe ser un ID válido"),

  year: query("year")
    .optional()
    .isInt({ min: 1888, max: new Date().getFullYear() + 5 })
    .withMessage("El año debe ser válido"),

  rating: query("rating")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("La calificación debe estar entre 0 y 10"),
};

// Rutas principales

/**
 * @route   GET /api/v1/media/stats
 * @desc    Obtener estadísticas de medios
 * @access  Public
 */
router.get("/stats", getMediaStats);

/**
 * @route   GET /api/v1/media/active
 * @desc    Obtener medios activos
 * @access  Public
 */
router.get("/active", getActiveMedia);

/**
 * @route   GET /api/v1/media/type/:typeId
 * @desc    Obtener medios por tipo
 * @access  Public
 */
router.get("/type/:typeId", [paramValidations.typeId], getMediaByType);

/**
 * @route   GET /api/v1/media/director/:directorId
 * @desc    Obtener medios por director
 * @access  Public
 */
router.get("/director/:directorId", [paramValidations.directorId], getMediaByDirector);

/**
 * @route   GET /api/v1/media/genre/:genreId
 * @desc    Obtener medios por género
 * @access  Public
 */
router.get("/genre/:genreId", [paramValidations.genreId], getMediaByGenre);

/**
 * @route   GET /api/v1/media
 * @desc    Obtener todos los medios
 * @access  Public
 */
router.get(
  "/",
  [
    queryValidations.page,
    queryValidations.limit,
    queryValidations.sort,
    queryValidations.order,
    queryValidations.active,
    queryValidations.search,
    queryValidations.type,
    queryValidations.genre,
    queryValidations.director,
    queryValidations.producer,
    queryValidations.year,
    queryValidations.rating,
  ],
  getAllMedia
);

/**
 * @route   GET /api/v1/media/:id
 * @desc    Obtener un medio por ID
 * @access  Public
 */
router.get("/:id", [paramValidations.id], getMediaById);

/**
 * @route   POST /api/v1/media
 * @desc    Crear un nuevo medio
 * @access  Private
 */
router.post(
  "/",
  [
    mediaValidations.title,
    mediaValidations.synopsis,
    mediaValidations.releaseDate,
    mediaValidations.duration,
    mediaValidations.type,
    mediaValidations.director,
    mediaValidations.producer,
    mediaValidations.genres,
    mediaValidations.ratings,
    mediaValidations["ratings.imdb"],
    mediaValidations["ratings.rottenTomatoes"],
    mediaValidations["ratings.metacritic"],
    mediaValidations.cast,
    mediaValidations.crew,
    mediaValidations.seriesInfo,
    mediaValidations["seriesInfo.seasons"],
    mediaValidations["seriesInfo.episodes"],
    mediaValidations["seriesInfo.status"],
    mediaValidations.metadata,
    mediaValidations["metadata.poster"],
    mediaValidations["metadata.trailer"],
    mediaValidations.tags,
    mediaValidations.subtitles,
    mediaValidations.isActive,
  ],
  createMedia
);

/**
 * @route   PUT /api/v1/media/:id
 * @desc    Actualizar un medio
 * @access  Private
 */
router.put(
  "/:id",
  [
    paramValidations.id,
    mediaValidations.title,
    mediaValidations.synopsis,
    mediaValidations.releaseDate,
    mediaValidations.duration,
    mediaValidations.type,
    mediaValidations.director,
    mediaValidations.producer,
    mediaValidations.genres,
    mediaValidations.ratings,
    mediaValidations["ratings.imdb"],
    mediaValidations["ratings.rottenTomatoes"],
    mediaValidations["ratings.metacritic"],
    mediaValidations.cast,
    mediaValidations.crew,
    mediaValidations.seriesInfo,
    mediaValidations["seriesInfo.seasons"],
    mediaValidations["seriesInfo.episodes"],
    mediaValidations["seriesInfo.status"],
    mediaValidations.metadata,
    mediaValidations["metadata.poster"],
    mediaValidations["metadata.trailer"],
    mediaValidations.tags,
    mediaValidations.subtitles,
    mediaValidations.isActive,
  ],
  updateMedia
);

/**
 * @route   DELETE /api/v1/media/:id
 * @desc    Eliminar un medio (soft delete)
 * @access  Private
 */
router.delete("/:id", [paramValidations.id], deleteMedia);

export default router;
