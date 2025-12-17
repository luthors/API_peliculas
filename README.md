# Sistema de Gestión de Películas y Series

Backend REST API con Node.js/Express y Frontend con React para gestión de películas y series.

## 🚀 Inicio Rápido

### Con Docker (Recomendado)

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Iniciar aplicación completa
docker-compose up -d

# 3. Acceder a:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - MongoDB: localhost:27017
```

Ver [DOCKER_README.md](./DOCKER_README.md) para documentación completa de Docker.

### Sin Docker (Desarrollo Local)

**Backend:**
```bash
cd API_peliculas_IUDigital-main
pnpm install
pnpm run dev
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm run start
```

**MongoDB:** Debe estar ejecutándose localmente en puerto 27017.

## 📁 Estructura del Proyecto

```
.
├── API_peliculas_IUDigital-main/   # Backend Node.js/Express
│   ├── src/
│   │   ├── app.js                 # Punto de entrada
│   │   ├── config/                # Configuración (database)
│   │   ├── controllers/           # Controladores
│   │   ├── models/                # Modelos de MongoDB
│   │   ├── routes/                # Rutas de API
│   │   └── middleware/            # Middlewares
│   ├── Dockerfile                 # Docker para backend
│   └── package.json
│
├── frontend/                       # Frontend React
│   ├── src/
│   │   ├── components/            # Componentes React
│   │   ├── pages/                 # Páginas
│   │   ├── services/              # Servicios API
│   │   └── contexts/              # Contextos React
│   ├── Dockerfile                 # Docker para frontend
│   ├── nginx.conf                 # Configuración Nginx
│   └── package.json
│
├── docker-compose.yml              # Orquestación de servicios
├── .env.example                    # Template de variables
├── DOCKER_README.md                # Documentación Docker
└── README.md                       # Este archivo
```

## 🛠️ Tecnologías

### Backend
- Node.js 18+
- Express.js
- MongoDB con Mongoose
- JWT para autenticación
- Express Validator
- Helmet (seguridad)

### Frontend
- React 19
- Material-UI
- React Router
- Axios
- React Hook Form

### DevOps
- Docker & Docker Compose
- Nginx (para servir frontend)
- GitHub Actions (CI/CD)

## 📚 Documentación

- **Backend**: Ver [API_peliculas_IUDigital-main/README.md](./API_peliculas_IUDigital-main/README.md)
- **Frontend**: Ver [frontend/README.md](./frontend/README.md)
- **Docker**: Ver [DOCKER_README.md](./DOCKER_README.md)
- **CI/CD**: Ver [contexto/cdci.md](./contexto/cdci.md)

## 🔒 Seguridad

**IMPORTANTE**: El archivo `.env.example` contiene valores por defecto para desarrollo.

Para producción, cambiar:
- `MONGO_ROOT_PASSWORD`
- `JWT_SECRET`
- `CORS_ORIGIN`

## 👥 Autores

- Luis Toro - IUDigital
- Lazaro Zapata - IUDigital

## 📄 Licencia

MIT License - Ver LICENSE para más detalles.
