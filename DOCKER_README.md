# Documentación Docker - Sistema de Gestión de Películas y Series

## 🐳 Introducción

Este proyecto está completamente dockerizado con una arquitectura de 3 servicios:

- **MongoDB**: Base de datos NoSQL
- **Backend**: API REST con Node.js/Express
- **Frontend**: Aplicación React servida con Nginx

## 📋 Prerrequisitos

- Docker Desktop instalado (Windows/Mac) o Docker Engine (Linux)
- Docker Compose v2.0+
- Al menos 2GB de RAM libre
- Puertos disponibles: 3000, 3001, 27017

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores (IMPORTANTE: cambiar passwords en producción)
notepad .env  # Windows
```

### 2. Iniciar Aplicación

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 3. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **MongoDB**: localhost:27017

## 📦 Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios (mantiene datos)
docker-compose down

# Detener y eliminar volúmenes (ELIMINA DATOS)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mongodb

# Ver estado de servicios
docker-compose ps

# Ver logs
docker-compose logs -f              # Todos los servicios
docker-compose logs -f backend      # Solo backend
docker-compose logs -f frontend     # Solo frontend
docker-compose logs -f mongodb      # Solo MongoDB
```

### Reconstrucción

```bash
# Reconstruir imágenes (después de cambios en código)
docker-compose build

# Reconstruir sin cache
docker-compose build --no-cache

# Reconstruir y reiniciar
docker-compose up -d --build
```

### Limpieza

```bash
# Eliminar contenedores detenidos
docker-compose rm

# Limpiar imágenes no utilizadas
docker image prune

# Limpieza profunda (CUIDADO)
docker system prune -a --volumes
```

## 🔍 Verificación de Salud

### Health Checks Automáticos

Todos los servicios tienen health checks configurados:

```bash
# Ver estado de salud
docker-compose ps

# Inspeccionar salud de un contenedor
docker inspect peliculas-backend --format='{{.State.Health.Status}}'
docker inspect peliculas-frontend --format='{{.State.Health.Status}}'
docker inspect peliculas-mongodb --format='{{.State.Health.Status}}'
```

### Tests Manuales

```bash
# Backend
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000/health

# MongoDB (requiere mongosh instalado)
mongosh "mongodb://admin:changeme123@localhost:27017/peliculas_db?authSource=admin"
```

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Puerto ya en uso

```bash
# Error: "port is already allocated"

# Verificar qué proceso usa el puerto
netstat -ano | findstr :3000   # Windows
lsof -i :3000                  # Mac/Linux

# Cambiar puerto en .env
FRONTEND_PORT=3001
BACKEND_PORT=3002
```

#### 2. Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs backend

# Reiniciar contenedor específico
docker-compose restart backend

# Reconstruir el servicio
docker-compose up -d --build backend
```

#### 3. Error de conexión a MongoDB

```bash
# Verificar que MongoDB está corriendo
docker-compose ps mongodb

# Ver logs de MongoDB
docker-compose logs mongodb

# Reiniciar MongoDB
docker-compose restart mongodb
```

#### 4. Frontend no se conecta al Backend

**Problema**: Error de CORS o red

```bash
# Verificar configuración de CORS en .env
CORS_ORIGIN=http://localhost:3000

# Verificar que backend está accesible
curl http://localhost:3001/health

# Reconstruir frontend con nueva URL de API
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

#### 5. Cambios en código no se reflejan

```bash
# Debes reconstruir la imagen
docker-compose build backend
docker-compose up -d backend

# O hacer ambos en un comando
docker-compose up -d --build
```

### Ver logs de errores

```bash
# Últimas 100 líneas de logs
docker-compose logs --tail=100

# Seguir logs en tiempo real
docker-compose logs -f --tail=50
```

## 🔒 Seguridad

### Desarrollo vs Producción

**IMPORTANTE**: El archivo `.env.example` contiene valores por **defecto para desarrollo**.

Para producción:

1. **Cambiar todas las contraseñas**:
   ```env
   MONGO_ROOT_PASSWORD=<password-seguro-generado>
   JWT_SECRET=<jwt-secret-aleatorio-256-bits>
   ```

2. **Usar variables de entorno del sistema**:
   - En Railway/AWS/Azure, configurar variables en el dashboard
   - NO commitear archivo `.env` al repositorio

3. **Configurar CORS apropiadamente**:
   ```env
   CORS_ORIGIN=https://tu-dominio-frontend.com
   ```

### Generar Secretos Seguros

```bash
# Generar JWT_SECRET seguro (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar password seguro (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

## 📊 Monitoreo

### Ver uso de recursos

```bash
# Ver estadísticas en tiempo real
docker stats

# Ver solo servicios de esta aplicación
docker stats peliculas-backend peliculas-frontend peliculas-mongodb
```

### Inspeccionar contenedores

```bash
# Ver configuración completa
docker inspect peliculas-backend

# Ver solo variables de entorno
docker inspect peliculas-backend --format='{{.Config.Env}}'

# Ver redes
docker network inspect peliculas-network
```

## 🔄 Actualizar la Aplicación

### Actualizar código

```bash
# 1. Hacer git pull o modificar código
git pull origin main

# 2. Reconstruir servicios afectados
docker-compose build backend frontend

# 3. Reiniciar con nueva imagen
docker-compose up -d
```

### Actualizar dependencias

```bash
# Backend
cd API_peliculas_IUDigital-main
pnpm update
cd ..
docker-compose build backend
docker-compose up -d backend

# Frontend
cd frontend
pnpm update
cd ..
docker-compose build frontend
docker-compose up -d frontend
```

## 💾 Backup y Restauración

### Backup de MongoDB

```bash
# Crear backup
docker exec peliculas-mongodb mongodump \
  --uri="mongodb://admin:changeme123@localhost:27017/peliculas_db?authSource=admin" \
  --out=/data/backup

# Copiar backup al host
docker cp peliculas-mongodb:/data/backup ./mongodb-backup
```

### Restaurar MongoDB

```bash
# Copiar backup al contenedor
docker cp ./mongodb-backup peliculas-mongodb:/data/restore

# Restaurar
docker exec peliculas-mongodb mongorestore \
  --uri="mongodb://admin:changeme123@localhost:27017/peliculas_db?authSource=admin" \
  /data/restore
```

## 🌐 Despliegue en Producción

### Railway

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Crear proyecto
railway init

# 4. Agregar MongoDB
railway add

# 5. Configurar variables de entorno en Railway dashboard

# 6. Desplegar backend
railway up --service backend
```

### AWS/Azure

Consultar documentación específica de cada proveedor para desplegar contenedores Docker.

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [MongoDB en Docker](https://hub.docker.com/_/mongo)
- [Nginx en Docker](https://hub.docker.com/_/nginx)

## ❓ FAQ

**P: ¿Puedo ejecutar solo el backend sin frontend?**
```bash
docker-compose up -d mongodb backend
```

**P: ¿Cómo accedo a la shell de MongoDB?**
```bash
docker exec -it peliculas-mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
```

**P: ¿Dónde se guardan los datos de MongoDB?**
Los datos se guardan en un volumen Docker llamado `peliculas-mongodb-data`. Persisten entre reinicios a menos que uses `docker-compose down -v`.

**P: ¿Cómo ejecuto comandos dentro de un contenedor?**
```bash
# Backend
docker exec -it peliculas-backend sh

# Frontend
docker exec -it peliculas-frontend sh
```

**P: ¿Puedo usar npm en lugar de pnpm?**
Sí, los Dockerfiles tienen fallback a npm si pnpm no está disponible.

---

**Soporte**: Si encuentras problemas, revisa los logs con `docker-compose logs -f` y la sección de Troubleshooting.
