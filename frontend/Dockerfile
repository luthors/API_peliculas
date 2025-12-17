# ==========================================
# STAGE 1: Build
# ==========================================
FROM node:18-alpine AS build

# Instalar pnpm para manejar dependencias
RUN npm install -g pnpm

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias para aprovechar cache de Docker
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias (incluyendo devDependencies necesarias para build)
RUN pnpm install --frozen-lockfile || npm install

# Copiar código fuente de la aplicación
COPY public/ ./public/
COPY src/ ./src/

# Variables de entorno para el build (se pueden sobrescribir)
ARG REACT_APP_API_URL=http://localhost:3001/api/v1
ARG REACT_APP_NAME="Sistema de Gestión de Películas y Series"
ARG REACT_APP_VERSION=1.0.0

ENV REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_NAME=$REACT_APP_NAME \
    REACT_APP_VERSION=$REACT_APP_VERSION

# Construir la aplicación React para producción
RUN npm run build

# ==========================================
# STAGE 2: Producción con Nginx
# ==========================================
FROM nginx:1.25-alpine AS production

# Metadatos
LABEL maintainer="Luis Toro <luis@example.com>"
LABEL description="Frontend React para gestión de películas y series"
LABEL version="1.0.0"

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build de React desde stage anterior
COPY --from=build /app/build /usr/share/nginx/html

# Crear usuario no-root para nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Cambiar a usuario no-root
USER nginx

# Exponer puerto 80
EXPOSE 80

# Health check para verificar que Nginx está sirviendo correctamente
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Nginx se ejecutará en foreground
CMD ["nginx", "-g", "daemon off;"]
