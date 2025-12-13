# Testing Guide - Authentication System

## Sistema de Autenticación - Guía de Pruebas

### Requisitos Previos

1. **Backend en ejecución**:

   ```bash
   cd API_peliculas_IUDigital-main
   npm install
   npm start
   # Servidor en http://localhost:3001
   ```

2. **Frontend en ejecución**:

   ```bash
   cd frontend
   npm install
   npm start
   # App en http://localhost:3000
   ```

3. **Crear usuario administrador**:
   ```bash
   cd API_peliculas_IUDigital-main
   npm run create-admin
   # Email: admin@movies.com
   # Password: Admin123!
   ```

---

## Flujos de Prueba

### 1. Registro de Nuevo Usuario

**URL**: http://localhost:3000/register

**Pasos**:

1. Abrir la página de registro
2. Completar el formulario:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: juan.perez@test.com
   - Contraseña: Test123!
   - Confirmar Contraseña: Test123!
3. Click en "Registrarse"
4. **Resultado esperado**:
   - Mensaje de éxito
   - Redirección al catálogo después de 1.5 segundos

**Validaciones a verificar**:

- ❌ Email inválido muestra error
- ❌ Contraseña < 6 caracteres muestra error
- ❌ Contraseñas no coinciden muestra error
- ❌ Email duplicado muestra error
- ✅ Registro exitoso muestra mensaje y redirige

---

### 2. Login de Usuario

**URL**: http://localhost:3000/login

**Pasos**:

1. Abrir la página de login
2. Usar credenciales de prueba:
   - Email: admin@movies.com
   - Password: Admin123!
3. Click en "Iniciar Sesión"
4. **Resultado esperado**:
   - Redirección al dashboard
   - Información del usuario en el header
   - Menú lateral con opciones de administración

**Credenciales de prueba**:

- **Admin**: admin@movies.com / Admin123!
- **Usuario regular**: juan.perez@test.com / Test123!

**Validaciones a verificar**:

- ❌ Email inválido muestra error
- ❌ Contraseña incorrecta muestra error
- ❌ Usuario no existe muestra error
- ✅ Login exitoso redirige al dashboard

---

### 3. Acceso a Rutas Protegidas

**Escenario 1: Usuario No Autenticado**

1. Abrir navegador en modo incógnito
2. Intentar acceder a: http://localhost:3000/dashboard
3. **Resultado esperado**: Redirección automática a /login

**Escenario 2: Usuario Regular (sin rol admin)**

1. Login con: juan.perez@test.com / Test123!
2. Intentar acceder a: http://localhost:3000/dashboard
3. **Resultado esperado**: Redirección al catálogo (no tiene permisos)

**Escenario 3: Usuario Admin**

1. Login con: admin@movies.com / Admin123!
2. Acceder a: http://localhost:3000/dashboard
3. **Resultado esperado**: Acceso permitido, dashboard visible

**Rutas a probar**:

- ✅ `/catalog` - Accesible sin autenticación
- ✅ `/login` - Accesible sin autenticación
- ✅ `/register` - Accesible sin autenticación
- 🔒 `/dashboard` - Requiere admin
- 🔒 `/genres` - Requiere admin
- 🔒 `/directors` - Requiere admin
- 🔒 `/producers` - Requiere admin
- 🔒 `/types` - Requiere admin
- 🔒 `/media` - Requiere admin

---

### 4. Refresh Token Automático

**Pasos**:

1. Login como admin
2. Esperar 7 días (o modificar JWT_EXPIRES_IN a 1m para pruebas rápidas)
3. Hacer cualquier petición (ej: ir a /genres)
4. **Resultado esperado**:
   - Token se refresca automáticamente
   - Usuario permanece autenticado
   - No se muestra error ni redirección

**Para prueba rápida**:

- Modificar en backend `.env`: `JWT_EXPIRES_IN=1m`
- Esperar 1 minuto
- Navegar entre páginas
- Verificar que el token se refresca sin problemas

---

### 5. Logout

**Pasos**:

1. Login como cualquier usuario
2. Click en el ícono de usuario en el header (esquina superior derecha)
3. Click en "Cerrar Sesión"
4. **Resultado esperado**:
   - Redirección a /login
   - Token eliminado del localStorage
   - Intentar acceder a /dashboard redirige a /login

---

### 6. Persistencia de Sesión

**Pasos**:

1. Login como admin
2. Navegar por las diferentes páginas
3. Cerrar el navegador completamente
4. Abrir el navegador nuevamente
5. Acceder a: http://localhost:3000/dashboard
6. **Resultado esperado**:
   - Usuario sigue autenticado
   - Información del usuario visible
   - Acceso permitido al dashboard

---

### 7. Manejo de Errores

**Escenario 1: Backend No Disponible**

1. Detener el servidor backend
2. Intentar hacer login
3. **Resultado esperado**:
   - Mensaje de error: "Error al conectar con el servidor"

**Escenario 2: Token Inválido**

1. Login exitoso
2. Editar manualmente el token en localStorage (corromper)
3. Intentar acceder a /dashboard
4. **Resultado esperado**:
   - Token inválido detectado
   - Redirección a /login

**Escenario 3: Token Expirado**

1. Modificar `.env`: `JWT_EXPIRES_IN=1s`
2. Login exitoso
3. Esperar 2 segundos
4. Intentar acceder a /dashboard
5. **Resultado esperado**:
   - Intento automático de refresh token
   - Si falla, redirección a /login

---

## Verificación de localStorage

Abrir DevTools (F12) → Application/Almacenamiento → Local Storage → http://localhost:3000

**Items a verificar**:

- `token`: JWT access token
- `refreshToken`: JWT refresh token
- `user`: Objeto JSON con información del usuario

---

## API Endpoints Usados

| Método | Endpoint                     | Descripción                |
| ------ | ---------------------------- | -------------------------- |
| POST   | `/api/v1/auth/register`      | Registro de nuevo usuario  |
| POST   | `/api/v1/auth/login`         | Login de usuario           |
| POST   | `/api/v1/auth/logout`        | Logout de usuario          |
| GET    | `/api/v1/auth/profile`       | Obtener perfil del usuario |
| POST   | `/api/v1/auth/refresh-token` | Refrescar access token     |

---

## Criterios de Aceptación Validados

✅ **CA1**: Sistema de registro con validación de campos  
✅ **CA2**: Sistema de login con email y contraseña  
✅ **CA3**: Autenticación con JWT (access + refresh tokens)  
✅ **CA4**: Middleware de protección de rutas  
✅ **CA5**: Roles de usuario (admin/user)  
✅ **CA6**: Información del usuario en la interfaz  
✅ **CA7**: Funcionalidad de logout  
✅ **CA8**: Persistencia de sesión  
✅ **CA9**: Refresh token automático  
✅ **CA10**: Manejo de errores y validaciones

---

## Notas Adicionales

### Modificar configuración para pruebas rápidas

**Backend** (`API_peliculas_IUDigital-main/.env`):

```env
# Para probar expiración rápida de tokens
JWT_EXPIRES_IN=1m
JWT_REFRESH_EXPIRES_IN=2m
```

### Limpiar datos de prueba

```bash
# Backend
cd API_peliculas_IUDigital-main
npm run create-admin  # Recrea solo el admin

# Frontend
# DevTools → Application → Clear storage → Clear site data
```

### Herramientas útiles

- **Postman**: Importar `test_auth.postman_collection.json` para pruebas de API
- **React DevTools**: Ver estado de AuthContext en tiempo real
- **Redux DevTools**: No aplica (usando Context API)
- **Network Tab**: Verificar peticiones HTTP y respuestas

---

## Troubleshooting

### Problema: "Cannot connect to server"

- ✅ Verificar que el backend esté corriendo en puerto 3001
- ✅ Verificar que MongoDB esté conectado

### Problema: "Token expired"

- ✅ Verificar configuración de JWT_EXPIRES_IN
- ✅ Limpiar localStorage y hacer login nuevamente

### Problema: "Not authorized"

- ✅ Verificar que el usuario tenga rol 'admin' para rutas protegidas
- ✅ Verificar que el token sea válido

### Problema: Refresh token no funciona

- ✅ Verificar que refreshToken esté en localStorage
- ✅ Verificar interceptores en api.js
- ✅ Verificar endpoint /auth/refresh-token en backend
