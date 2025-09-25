# Sistema de Gestión de Películas y Series - Backend

## 📋 Descripción del Proyecto

Sistema completo de gestión de contenido audiovisual (películas y series) desarrollado con Node.js y Express. El proyecto implementa una API REST robusta con operaciones CRUD completas para la gestión de géneros, directores, productoras, tipos de contenido y medios audiovisuales.

## 🏗️ Arquitectura del Sistema

### Modelo Entidad-Relación (MER)

El sistema está basado en 5 entidades principales:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GÉNERO    │    │  DIRECTOR   │    │ PRODUCTORA  │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ _id         │    │ _id         │    │ _id         │
│ name        │    │ name        │    │ name        │
│ description │    │ biography   │    │ description │
│ isActive    │    │ birthDate   │    │ foundedYear │
│ createdBy   │    │ nationality │    │ country     │
│ timestamps  │    │ awards      │    │ headquarters│
└─────────────┘    │ socialMedia │    │ contact     │
       │           │ isActive    │    │ specialties │
       │           │ createdBy   │    │ budget      │
       │           │ timestamps  │    │ isActive    │
       │           └─────────────┘    │ createdBy   │
       │                  │           │ timestamps  │
       │                  │           └─────────────┘
       │                  │                  │
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │         MEDIA           │
              ├─────────────────────────┤
              │ _id                     │
              │ title                   │
              │ synopsis                │
              │ releaseDate             │
              │ duration                │
              │ type (ref: Type)        │
              │ director (ref: Director)│
              │ producer (ref: Producer)│
              │ genres (ref: Genre[])   │
              │ ratings                 │
              │ cast                    │
              │ crew                    │
              │ seriesInfo              │
              │ metadata                │
              │ tags                    │
              │ subtitles               │
              │ isActive                │
              │ createdBy               │
              │ timestamps              │
              └─────────────────────────┘
                          ▲
                          │
              ┌─────────────────────────┐
              │         TIPO            │
              ├─────────────────────────┤
              │ _id                     │
              │ name                    │
              │ description             │
              │ category                │
              │ format                  │
              │ duration                │
              │ characteristics         │
              │ platforms               │
              │ isActive                │
              │ createdBy               │
              │ timestamps              │
              └─────────────────────────┘
```

### Relaciones entre Entidades

- **Media ↔ Type**: Relación 1:N (Un tipo puede tener muchos medios)
- **Media ↔ Director**: Relación 1:N (Un director puede dirigir muchos medios)
- **Media ↔ Producer**: Relación 1:N (Una productora puede producir muchos medios)
- **Media ↔ Genre**: Relación N:M (Un medio puede tener múltiples géneros)

## 🛠️ Tecnologías Utilizadas

### Backend Framework
- **Node.js** (v18+): Runtime de JavaScript
- **Express.js** (v4.18+): Framework web minimalista

### Base de Datos
- **MongoDB** (v6+): Base de datos NoSQL orientada a documentos
- **Mongoose** (v7+): ODM (Object Document Mapper) para MongoDB

### Validación y Seguridad
- **express-validator** (v6+): Validación de datos de entrada
- **helmet** (v7+): Middleware de seguridad HTTP
- **cors** (v2+): Configuración de CORS (Cross-Origin Resource Sharing)
- **express-rate-limit** (v6+): Limitación de velocidad de peticiones

### Utilidades
- **dotenv** (v16+): Gestión de variables de entorno
- **morgan** (v1+): Logger de peticiones HTTP
- **compression** (v1+): Compresión gzip de respuestas

### Desarrollo
- **nodemon** (v3+): Reinicio automático del servidor en desarrollo

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de MongoDB
│   ├── controllers/
│   │   ├── genreController.js   # Controlador de géneros
│   │   ├── directorController.js # Controlador de directores
│   │   ├── producerController.js # Controlador de productoras
│   │   ├── typeController.js    # Controlador de tipos
│   │   └── mediaController.js   # Controlador de medios
│   ├── middleware/
│   │   ├── errorHandler.js      # Manejo global de errores
│   │   └── notFound.js          # Middleware para rutas no encontradas
│   ├── models/
│   │   ├── Genre.js             # Modelo de género
│   │   ├── Director.js          # Modelo de director
│   │   ├── Producer.js          # Modelo de productora
│   │   ├── Type.js              # Modelo de tipo
│   │   └── Media.js             # Modelo de medio
│   ├── routes/
│   │   ├── genreRoutes.js       # Rutas de géneros
│   │   ├── directorRoutes.js    # Rutas de directores
│   │   ├── producerRoutes.js    # Rutas de productoras
│   │   ├── typeRoutes.js        # Rutas de tipos
│   │   └── mediaRoutes.js       # Rutas de medios
│   └── app.js                   # Configuración principal de Express
├── .env                         # Variables de entorno
├── package.json                 # Dependencias y scripts
└── README.md                    # Documentación del proyecto
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- MongoDB (v6 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   # Configuración del servidor
   PORT=5000
   NODE_ENV=development
   
   # Base de datos
   MONGODB_URI=mongodb://localhost:27017/peliculas_db
   
   # JWT (para futuras implementaciones)
   JWT_SECRET=tu_jwt_secret_muy_seguro
   JWT_EXPIRE=30d
   
   # CORS
   CORS_ORIGIN=http://localhost:3000
   
   # Logging
   LOG_LEVEL=info
   
   # API
   API_VERSION=v1
   API_PREFIX=/api
   
   # Límites
   MAX_FILE_SIZE=10mb
   RATE_LIMIT_REQUESTS=100
   RATE_LIMIT_WINDOW=15
   ```

4. **Iniciar MongoDB**
   ```bash
   # En Windows
   net start MongoDB
   
   # En macOS/Linux
   sudo systemctl start mongod
   ```

5. **Ejecutar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## 📚 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Géneros (`/genres`)
- `GET /genres` - Obtener todos los géneros
- `GET /genres/active` - Obtener géneros activos
- `GET /genres/stats` - Obtener estadísticas de géneros
- `GET /genres/:id` - Obtener género por ID
- `POST /genres` - Crear nuevo género
- `PUT /genres/:id` - Actualizar género
- `DELETE /genres/:id` - Eliminar género (soft delete)

### Directores (`/directors`)
- `GET /directors` - Obtener todos los directores
- `GET /directors/active` - Obtener directores activos
- `GET /directors/nationality/:nationality` - Obtener directores por nacionalidad
- `GET /directors/stats` - Obtener estadísticas de directores
- `GET /directors/:id` - Obtener director por ID
- `POST /directors` - Crear nuevo director
- `PUT /directors/:id` - Actualizar director
- `DELETE /directors/:id` - Eliminar director (soft delete)

### Productoras (`/producers`)
- `GET /producers` - Obtener todas las productoras
- `GET /producers/active` - Obtener productoras activas
- `GET /producers/country/:country` - Obtener productoras por país
- `GET /producers/specialty/:specialty` - Obtener productoras por especialidad
- `GET /producers/stats` - Obtener estadísticas de productoras
- `GET /producers/:id` - Obtener productora por ID
- `POST /producers` - Crear nueva productora
- `PUT /producers/:id` - Actualizar productora
- `DELETE /producers/:id` - Eliminar productora (soft delete)

### Tipos (`/types`)
- `GET /types` - Obtener todos los tipos
- `GET /types/active` - Obtener tipos activos
- `GET /types/category/:category` - Obtener tipos por categoría
- `GET /types/platform/:platform` - Obtener tipos por plataforma
- `GET /types/stats` - Obtener estadísticas de tipos
- `GET /types/:id` - Obtener tipo por ID
- `POST /types` - Crear nuevo tipo
- `PUT /types/:id` - Actualizar tipo
- `DELETE /types/:id` - Eliminar tipo (soft delete)

### Medios (`/media`)
- `GET /media` - Obtener todos los medios
- `GET /media/active` - Obtener medios activos
- `GET /media/type/:typeId` - Obtener medios por tipo
- `GET /media/director/:directorId` - Obtener medios por director
- `GET /media/genre/:genreId` - Obtener medios por género
- `GET /media/stats` - Obtener estadísticas de medios
- `GET /media/:id` - Obtener medio por ID
- `POST /media` - Crear nuevo medio
- `PUT /media/:id` - Actualizar medio
- `DELETE /media/:id` - Eliminar medio (soft delete)

### Health Check
- `GET /health` - Verificar estado del servidor

## 🔍 Parámetros de Consulta

### Paginación
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)

### Ordenamiento
- `sort`: Campo de ordenamiento
- `order`: Dirección del ordenamiento (`asc` | `desc`)

### Filtros
- `active`: Filtrar por estado (`true` | `false` | `all`)
- `search`: Búsqueda de texto libre
- Filtros específicos por entidad (género, director, etc.)

### Ejemplo de Uso
```bash
GET /api/v1/media?page=1&limit=20&sort=title&order=asc&active=true&search=marvel
```

## 🛡️ Características de Seguridad

- **Helmet**: Configuración de headers de seguridad HTTP
- **CORS**: Control de acceso entre dominios
- **Rate Limiting**: Limitación de peticiones por IP
- **Validación de Entrada**: Validación exhaustiva con express-validator
- **Sanitización**: Limpieza automática de datos de entrada
- **Error Handling**: Manejo seguro de errores sin exposición de información sensible

## 📊 Características Avanzadas

### Soft Delete
Todos los modelos implementan eliminación suave (soft delete) para mantener la integridad referencial.

### Auditoría
- Campos `createdBy` y timestamps automáticos
- Tracking de cambios y creación de registros

### Validaciones Personalizadas
- Validación de unicidad case-insensitive
- Validaciones de integridad referencial
- Validaciones de formato y rangos específicos

### Índices de Base de Datos
- Índices optimizados para consultas frecuentes
- Índices compuestos para filtros múltiples
- Índices de texto para búsquedas

### Agregaciones y Estadísticas
- Estadísticas detalladas por módulo
- Consultas agregadas optimizadas
- Métricas de uso y popularidad

## 🧪 Testing

### Pruebas con Postman
Se incluye una colección de Postman con todos los endpoints configurados:

```bash
# Importar colección en Postman
# Archivo: postman_collection.json
```

### Ejemplos de Peticiones

#### Crear un Género
```json
POST /api/v1/genres
Content-Type: application/json

{
  "name": "Ciencia Ficción",
  "description": "Películas y series del género de ciencia ficción"
}
```

#### Crear una Película
```json
POST /api/v1/media
Content-Type: application/json

{
  "title": "Blade Runner 2049",
  "synopsis": "Secuela de la película clásica de ciencia ficción...",
  "releaseDate": "2017-10-06",
  "duration": 164,
  "type": "60f1b2c3d4e5f6789a0b1c2d",
  "director": "60f1b2c3d4e5f6789a0b1c2e",
  "producer": "60f1b2c3d4e5f6789a0b1c2f",
  "genres": ["60f1b2c3d4e5f6789a0b1c30"],
  "ratings": {
    "imdb": 8.0,
    "rottenTomatoes": 88
  }
}
```

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/peliculas_prod
```

### Scripts de Despliegue
```bash
# Construcción para producción
npm run build

# Inicio en producción
npm start
```

## 📈 Monitoreo y Logs

- **Morgan**: Logging de peticiones HTTP
- **Console Logging**: Logs estructurados por nivel
- **Error Tracking**: Captura y logging de errores

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👥 Autores

- **Luis Toro** - *Desarrollo Inicial* - IUDigital

## 🙏 Agradecimientos

- IUDigital por el apoyo académico
- Comunidad de Node.js y Express
- Documentación de MongoDB y Mongoose

---

**Nota**: Este proyecto es parte del programa académico de IUDigital y tiene fines educativos.