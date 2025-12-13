# Sistema de Autenticación - API de Películas

## 📋 Descripción General

El sistema de autenticación implementa **JWT (JSON Web Tokens)** para gestionar la autenticación y autorización de
usuarios. Incluye dos roles: **admin** y **user**.

---

## 🔑 Características Principales

### Autenticación

- ✅ Registro de usuarios
- ✅ Login con email y contraseña
- ✅ Logout
- ✅ Tokens JWT (Access Token + Refresh Token)
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validaciones robustas

### Autorización

- ✅ Protección de rutas con middleware
- ✅ Roles: `admin` y `user`
- ✅ Verificación de permisos
- ✅ Soft delete de usuarios

### Gestión de Perfil

- ✅ Ver perfil del usuario
- ✅ Actualizar perfil
- ✅ Cambiar contraseña
- ✅ Refresh de tokens

### Administración (Solo Admin)

- ✅ Listar todos los usuarios
- ✅ Ver usuario por ID
- ✅ Actualizar usuarios
- ✅ Desactivar usuarios
- ✅ Estadísticas de usuarios

---

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de que tu archivo `.env` tenga las siguientes configuraciones:

```env
# JWT Configuration
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_cambialo_en_produccion_2024_movies_api
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_muy_seguro_aqui_cambialo_en_produccion_2024
JWT_REFRESH_EXPIRE=30d

# API Configuration
API_VERSION=v1
API_PREFIX=/api/v1
```

### 2. Crear Usuario Administrador

Ejecuta el script para crear el primer usuario admin:

```bash
node src/scripts/createAdmin.js
```

**Credenciales por defecto:**

- **Email:** admin@peliculas.com
- **Password:** Admin123

⚠️ **IMPORTANTE:** Cambia estas credenciales después del primer login.

---

## 📡 Endpoints de la API

### **Rutas Públicas** (No requieren autenticación)

#### 1. Registrar Usuario

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Respuesta Exitosa:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "firstName": "Juan",
      "lastName": "Pérez",
      "fullName": "Juan Pérez",
      "email": "juan@example.com",
      "role": "user",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Usuario registrado exitosamente"
}
```

#### 2. Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@peliculas.com",
  "password": "Admin123"
}
```

**Respuesta Exitosa:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "firstName": "Admin",
      "lastName": "Sistema",
      "fullName": "Admin Sistema",
      "email": "admin@peliculas.com",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Inicio de sesión exitoso"
}
```

#### 3. Refrescar Token

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **Rutas Privadas** (Requieren autenticación)

**Header requerido:**

```http
Authorization: Bearer <tu-token-jwt>
```

#### 4. Obtener Perfil

```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

#### 5. Actualizar Perfil

```http
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Juan Carlos",
  "lastName": "Pérez López",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### 6. Cambiar Contraseña

```http
PUT /api/v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

#### 7. Cerrar Sesión

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

---

### **Rutas de Administración** (Solo Admin)

**Headers requeridos:**

```http
Authorization: Bearer <token-de-admin>
```

#### 8. Listar Usuarios

```http
GET /api/v1/auth/users?page=1&limit=10&sort=createdAt&order=desc&active=all&role=all&search=juan
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 10, max: 100)
- `sort` (opcional): Campo para ordenar (firstName, lastName, email, role, createdAt, lastLogin)
- `order` (opcional): Orden (asc, desc)
- `active` (opcional): Filtrar por estado (true, false, all)
- `role` (opcional): Filtrar por rol (user, admin, all)
- `search` (opcional): Buscar en firstName, lastName, email

#### 9. Obtener Usuario por ID

```http
GET /api/v1/auth/users/:id
Authorization: Bearer <token>
```

#### 10. Actualizar Usuario

```http
PUT /api/v1/auth/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "admin",
  "isActive": true
}
```

#### 11. Desactivar Usuario

```http
DELETE /api/v1/auth/users/:id
Authorization: Bearer <token>
```

#### 12. Estadísticas de Usuarios

```http
GET /api/v1/auth/stats
Authorization: Bearer <token>
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "total": 15,
    "active": 12,
    "inactive": 3,
    "byRole": {
      "admin": 2,
      "user": 13
    },
    "recent": [...]
  }
}
```

---

## 🔐 Seguridad

### Contraseñas

- Mínimo 6 caracteres
- Debe contener: mayúscula, minúscula y número
- Hasheadas con bcrypt (salt rounds: 10)
- Campo `password` no se incluye en respuestas por defecto

### Tokens JWT

- **Access Token:** Expira en 7 días
- **Refresh Token:** Expira en 30 días
- Almacenado solo en el cliente (localStorage/sessionStorage)
- Verificación en cada request protegida

### Validaciones

- Email único en la base de datos
- Formato de email validado
- Nombres solo con letras y espacios
- Protección contra inyección SQL/NoSQL
- Rate limiting configurable

---

## 🛡️ Middleware de Autenticación

### `protect`

Protege rutas que requieren autenticación.

**Uso:**

```javascript
import { protect } from "../middleware/auth.js";

router.get("/profile", protect, getProfile);
```

### `authorize(...roles)`

Verifica que el usuario tenga uno de los roles especificados.

**Uso:**

```javascript
import { protect, authorize } from "../middleware/auth.js";

// Solo admins
router.get("/users", protect, authorize("admin"), getAllUsers);

// Admins o users
router.get("/media", protect, authorize("admin", "user"), getMedia);
```

### `optionalAuth`

Autenticación opcional. Añade usuario a `req.user` si el token es válido, pero no bloquea si no lo es.

**Uso:**

```javascript
import { optionalAuth } from "../middleware/auth.js";

// El catálogo público puede mostrar contenido personalizado si hay usuario
router.get("/catalog", optionalAuth, getCatalog);
```

---

## 👥 Modelo de Usuario

### Campos del Modelo

```javascript
{
  firstName: String,        // Requerido, 2-50 caracteres
  lastName: String,         // Requerido, 2-50 caracteres
  email: String,            // Requerido, único, email válido
  password: String,         // Requerido, mínimo 6 caracteres (hasheado)
  role: String,             // 'user' o 'admin' (default: 'user')
  isActive: Boolean,        // Estado del usuario (default: true)
  avatar: String,           // URL del avatar (opcional)
  lastLogin: Date,          // Último inicio de sesión
  refreshToken: String,     // Refresh token actual
  createdAt: Date,          // Auto-generado
  updatedAt: Date           // Auto-generado
}
```

### Virtuals

- `fullName`: Concatenación de firstName + lastName

### Métodos de Instancia

- `comparePassword(candidatePassword)`: Verifica contraseña
- `getPublicProfile()`: Retorna datos públicos del usuario

### Métodos Estáticos

- `findByEmail(email)`: Busca usuario por email
- `getStats()`: Obtiene estadísticas de usuarios

---

## 🔄 Flujo de Autenticación

### Registro

1. Usuario envía datos de registro
2. Sistema valida datos
3. Verifica que el email no exista
4. Hashea la contraseña
5. Crea el usuario en la BD
6. Genera tokens (access + refresh)
7. Retorna usuario y tokens

### Login

1. Usuario envía credenciales
2. Sistema busca usuario por email
3. Verifica que el usuario esté activo
4. Compara contraseña con bcrypt
5. Genera nuevos tokens
6. Actualiza lastLogin y refreshToken
7. Retorna usuario y tokens

### Acceso a Ruta Protegida

1. Cliente envía request con token en header
2. Middleware `protect` extrae token
3. Verifica y decodifica token
4. Busca usuario en BD
5. Verifica que esté activo
6. Añade usuario a `req.user`
7. Continúa con el controlador

---

## 🎯 Roles y Permisos

### Role: `user`

- ✅ Ver catálogo público
- ✅ Ver su propio perfil
- ✅ Actualizar su propio perfil
- ✅ Cambiar su contraseña
- ❌ Acceder al dashboard de administración
- ❌ Crear/editar/eliminar contenido
- ❌ Ver otros usuarios

### Role: `admin`

- ✅ Todas las funciones de `user`
- ✅ Acceder al dashboard de administración
- ✅ Gestionar géneros, directores, productoras, tipos y media
- ✅ Ver todos los usuarios
- ✅ Crear/editar/desactivar usuarios
- ✅ Ver estadísticas del sistema

---

## 🧪 Testing con Postman

### 1. Crear Usuario Admin

```bash
node src/scripts/createAdmin.js
```

### 2. Login como Admin

```http
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@peliculas.com",
  "password": "Admin123"
}
```

### 3. Guardar el Token

Copia el token de la respuesta y añádelo a las siguientes requests:

```
Authorization: Bearer <tu-token>
```

### 4. Probar Endpoints Protegidos

```http
GET http://localhost:3001/api/v1/auth/profile
Authorization: Bearer <token>
```

---

## 📚 Errores Comunes

### 401 Unauthorized

- Token no proporcionado
- Token inválido
- Token expirado
- Usuario no encontrado

### 403 Forbidden

- Usuario inactivo
- Rol no autorizado para el recurso

### 400 Bad Request

- Datos de validación incorrectos
- Email ya registrado
- Contraseña actual incorrecta

---

## 🔧 Mejores Prácticas

1. **Cambiar secrets en producción:**

   ```env
   JWT_SECRET=<genera-un-secret-aleatorio-y-seguro>
   JWT_REFRESH_SECRET=<genera-otro-secret-diferente>
   ```

2. **Usar HTTPS en producción**

3. **Implementar rate limiting:**

   - Ya configurado en el middleware

4. **Rotar refresh tokens periódicamente**

5. **Implementar logout en el cliente:**

   - Eliminar tokens del localStorage
   - Limpiar estado de autenticación

6. **Validar tokens expirados:**
   - Usar refresh token para obtener nuevo access token

---

## 📞 Soporte

Para más información, consulta:

- README.md principal
- Documentación de endpoints
- Código fuente de los controladores

---

**Desarrollado por:** Luis Toro  
**Institución:** IU Digital  
**Fecha:** Diciembre 2024  
**Versión:** 1.0.0
