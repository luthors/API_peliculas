import { validationResult } from "express-validator";

/**
 * Controlador Mock para el módulo de Directores
 * Proporciona datos de prueba sin necesidad de conexión a MongoDB
 */

// Datos mock para directores
const mockDirectors = [
  {
    _id: "507f1f77bcf86cd799439011",
    name: "Christopher Nolan",
    birthDate: "1970-07-30",
    nationality: "British",
    biography: "Christopher Edward Nolan is a British-American film director, producer, and screenwriter known for his distinctive filmmaking style.",
    awards: ["Academy Award for Best Director", "BAFTA Award for Best Director"],
    website: "https://www.christophernolan.net",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    _id: "507f1f77bcf86cd799439012",
    name: "Quentin Tarantino",
    birthDate: "1963-03-27",
    nationality: "American",
    biography: "Quentin Jerome Tarantino is an American film director, screenwriter, producer, and actor.",
    awards: ["Academy Award for Best Original Screenplay", "Palme d'Or"],
    website: "https://www.tarantino.info",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    _id: "507f1f77bcf86cd799439013",
    name: "Martin Scorsese",
    birthDate: "1942-11-17",
    nationality: "American",
    biography: "Martin Charles Scorsese is an American film director, producer, screenwriter, and actor.",
    awards: ["Academy Award for Best Director", "AFI Life Achievement Award"],
    website: "https://www.martinscorsese.com",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    _id: "507f1f77bcf86cd799439014",
    name: "Steven Spielberg",
    birthDate: "1946-12-18",
    nationality: "American",
    biography: "Steven Allan Spielberg is an American film director, producer, and screenwriter.",
    awards: ["Academy Award for Best Director", "Kennedy Center Honors"],
    website: "https://www.stevenspieberg.com",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    _id: "507f1f77bcf86cd799439015",
    name: "Denis Villeneuve",
    birthDate: "1967-10-03",
    nationality: "Canadian",
    biography: "Denis Villeneuve is a Canadian film director and screenwriter.",
    awards: ["BAFTA Award for Best Director", "Directors Guild of Canada Award"],
    website: "https://www.denisvilleneuve.com",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  }
];

/**
 * @desc    Obtener todos los directores (Mock)
 * @route   GET /api/v1/directors
 * @access  Public
 */
const getAllDirectors = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "name",
      order = "asc",
      active = "true",
      search = "",
      nationality = "",
    } = req.query;

    // Filtrar directores
    let filteredDirectors = [...mockDirectors];

    // Filtro por estado activo
    if (active !== "all") {
      filteredDirectors = filteredDirectors.filter(director => 
        director.isActive === (active === "true")
      );
    }

    // Filtro por búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDirectors = filteredDirectors.filter(director =>
        director.name.toLowerCase().includes(searchLower) ||
        director.biography.toLowerCase().includes(searchLower) ||
        director.nationality.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por nacionalidad
    if (nationality) {
      const nationalityLower = nationality.toLowerCase();
      filteredDirectors = filteredDirectors.filter(director =>
        director.nationality.toLowerCase().includes(nationalityLower)
      );
    }

    // Ordenamiento
    filteredDirectors.sort((a, b) => {
      let aValue = a[sort] || "";
      let bValue = b[sort] || "";
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (order === "desc") {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const paginatedDirectors = filteredDirectors.slice(skip, skip + limitNum);

    // Calcular estadísticas
    const totalDirectors = filteredDirectors.length;
    const totalPages = Math.ceil(totalDirectors / limitNum);

    res.status(200).json({
      success: true,
      count: paginatedDirectors.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalDirectors,
        pages: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      data: paginatedDirectors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener director por ID (Mock)
 * @route   GET /api/v1/directors/:id
 * @access  Public
 */
const getDirectorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const director = mockDirectors.find(d => d._id === id);
    
    if (!director) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Director no encontrado",
          details: { id }
        }
      });
    }

    res.status(200).json({
      success: true,
      data: director,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear nuevo director (Mock)
 * @route   POST /api/v1/directors
 * @access  Private
 */
const createDirector = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Datos de entrada inválidos",
          details: errors.array()
        }
      });
    }

    const newDirector = {
      _id: `507f1f77bcf86cd79943901${mockDirectors.length + 6}`,
      ...req.body,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockDirectors.push(newDirector);

    res.status(201).json({
      success: true,
      data: newDirector,
      message: "Director creado exitosamente"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar director (Mock)
 * @route   PUT /api/v1/directors/:id
 * @access  Private
 */
const updateDirector = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const directorIndex = mockDirectors.findIndex(d => d._id === id);
    
    if (directorIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Director no encontrado",
          details: { id }
        }
      });
    }

    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Datos de entrada inválidos",
          details: errors.array()
        }
      });
    }

    mockDirectors[directorIndex] = {
      ...mockDirectors[directorIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: mockDirectors[directorIndex],
      message: "Director actualizado exitosamente"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar director (Mock)
 * @route   DELETE /api/v1/directors/:id
 * @access  Private
 */
const deleteDirector = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const directorIndex = mockDirectors.findIndex(d => d._id === id);
    
    if (directorIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Director no encontrado",
          details: { id }
        }
      });
    }

    mockDirectors.splice(directorIndex, 1);

    res.status(200).json({
      success: true,
      message: "Director eliminado exitosamente"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener estadísticas de directores (Mock)
 * @route   GET /api/v1/directors/stats
 * @access  Public
 */
const getDirectorStats = async (req, res, next) => {
  try {
    const totalDirectors = mockDirectors.length;
    const activeDirectors = mockDirectors.filter(d => d.isActive).length;
    const inactiveDirectors = totalDirectors - activeDirectors;
    
    // Contar por nacionalidad
    const nationalityStats = mockDirectors.reduce((acc, director) => {
      acc[director.nationality] = (acc[director.nationality] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        total: totalDirectors,
        active: activeDirectors,
        inactive: inactiveDirectors,
        byNationality: nationalityStats
      }
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector,
  getDirectorStats,
};