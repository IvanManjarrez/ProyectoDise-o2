# 1: IMAGEN BASE
FROM node:18-alpine AS base

# Instala dumb-init para manejar señales del sistema correctamente
# Esto es importante para que Docker pueda parar el container limpiamente
RUN apk add --no-cache dumb-init

# Crea un usuario no-root por seguridad (principio de menor privilegio)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 2: INSTALACIÓN DE DEPENDENCIAS
FROM base AS dependencies

# Establece el directorio de trabajo dentro del container
WORKDIR /app

# Copia SOLO los archivos de dependencias primero
COPY package*.json ./

# Instala SOLO dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# 3: CONSTRUCCIÓN DE LA APLICACIÓN
FROM base AS build

WORKDIR /app

# Copia package.json para instalar TODAS las dependencias (incluyendo dev)
COPY package*.json ./

# Instala todas las dependencias (incluye TypeScript, @nestjs/cli, etc.)
RUN npm ci

# Copia TODO el código fuente
COPY . .

# Compila TypeScript a JavaScript
# Esto ejecuta: nest build (que usa TypeScript compiler)
# Genera archivos JavaScript en la carpeta /dist
RUN npm run build

# 4: IMAGEN FINAL DE PRODUCCIÓN
FROM base AS production

WORKDIR /app

# Cambia al usuario no-root
USER nestjs

# Copia dependencias de producción desde la etapa 2
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copia código compilado desde la etapa 3
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# Copia archivo de configuración de package.json (necesario para metadata)
COPY --chown=nestjs:nodejs package*.json ./
COPY --chown=nestjs:nodejs .env* ./

# Expone el puerto 3010 (puerto del Museum Proxy)
# NOTA: Esto es solo documentación, no abre el puerto automáticamente
EXPOSE 3010

# Define variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3010
ENV REDIS_URL=redis://redis:6379
ENV MET_API_URL=http://met-adapter:3012
ENV HARVARD_API_URL=http://harvard-adapter:3013

# Comando que ejecuta cuando el container inicia
# dumb-init maneja señales del sistema correctamente
# node dist/main.js ejecuta tu aplicación compilada
CMD ["dumb-init", "node", "dist/main.js"]
