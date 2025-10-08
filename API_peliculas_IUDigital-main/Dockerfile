# Dockerfile para Backend - API de Películas y Series
FROM node:18-alpine

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para aprovechar cache de Docker)
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Instalar pnpm globalmente e instalar dependencias de producción
    RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile && pnpm store prune

# Copiar código fuente
COPY src/ ./src/

# Cambiar propietario de archivos al usuario no-root
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto (Railway usa PORT dinámico)
EXPOSE 3001

# Comando de inicio con manejo de señales
CMD ["node", "src/app.js"]