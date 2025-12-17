# ==========================================
# STAGE 1: Dependencias
# ==========================================
FROM node:18-alpine AS dependencies

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias (aprovecha cache de Docker)
COPY package.json pnpm-lock.yaml ./

# Instalar TODAS las dependencias (incluyendo devDependencies para verificar)
RUN pnpm install --frozen-lockfile

# ==========================================
# STAGE 2: Builder (para futuras compilaciones si es necesario)
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependencias desde stage anterior
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./

# Copiar código fuente
COPY src/ ./src/

# Instalar solo dependencias de producción
RUN npm install -g pnpm && \
    pnpm prune --prod && \
    pnpm store prune

# ==========================================
# STAGE 3: Producción
# ==========================================
FROM node:18-alpine AS production

# Metadatos
LABEL maintainer="Luis Toro <luis@example.com>"
LABEL description="API REST para gestión de películas y series"
LABEL version="1.0.0"

# Instalar dumb-init para manejo adecuado de señales
RUN apk add --no-cache dumb-init

# Crear grupo y usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apiuser -u 1001 -G nodejs

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias de producción
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/package.json ./

# Copiar código fuente
COPY --chown=apiuser:nodejs src/ ./src/

# Cambiar a usuario no-root
USER apiuser

# Exponer puerto (configurable vía ENV)
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=3001

# Health check para Docker/Kubernetes
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${PORT}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar dumb-init para manejo correcto de señales (SIGTERM, SIGINT)
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["node", "src/app.js"]