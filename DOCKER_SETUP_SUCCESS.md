# 🐳 Docker Setup - AR Art Gallery Microservices

## ✅ Status: COMPLETAMENTE FUNCIONAL

Todos los microservicios están corriendo exitosamente en contenedores Docker.

## 📦 Contenedores Activos

| Contenedor | Puerto | Estado | Imagen |
|------------|--------|--------|--------|
| ar-gateway | 3000 | ✅ Running | proyectodise-o2-api-gateway |
| ar-auth | 3001 | ✅ Running | proyectodise-o2-auth-service |
| ar-composition | 3002 | ✅ Running | proyectodise-o2-composition-service |
| ar-museum-proxy | 3010 | ✅ Running | proyectodise-o2-museum-proxy |
| ar-met | 3012 | ✅ Running | proyectodise-o2-met-adapter |
| ar-harvard | 3013 | ✅ Running | proyectodise-o2-harvard-adapter |
| ar-mongodb | 27017 | ✅ Running | mongo:6 |
| ar-redis | 6379 | ✅ Running | redis:7-alpine |

## 🚀 Comandos Rápidos

### Iniciar todo el sistema
```powershell
docker-compose -f docker-compose.simple.yml up -d
```

### Detener todo
```powershell
docker-compose -f docker-compose.simple.yml down
```

### Ver logs
```powershell
# Todos los servicios
docker-compose logs -f

# Un servicio específico
docker logs ar-gateway -f
docker logs ar-auth -f
docker logs ar-composition -f
```

### Ver estado
```powershell
docker-compose ps
```

### Reconstruir un servicio
```powershell
docker-compose up -d --build <servicio>
# Ejemplo: docker-compose up -d --build api-gateway
```

## 🔍 Endpoints de Verificación

### Health Check (API Gateway)
```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T00:17:16.480Z",
  "uptime": 118.162596252,
  "services": {
    "auth-service": {
      "status": "up",
      "url": "http://auth-service:3001"
    },
    "composition-service": {
      "status": "up",
      "url": "http://composition-service:3002"
    },
    "museum-proxy-service": {
      "status": "up",
      "url": "http://museum-proxy:3010"
    }
  }
}
```

### Documentación Swagger

- **API Gateway**: http://localhost:3000/api/docs
- **Auth Service**: http://localhost:3001/api/docs
- **Composition Service**: http://localhost:3002/api/docs
- **Museum Proxy**: http://localhost:3010/api/docs
- **MET Adapter**: http://localhost:3012/api/docs
- **Harvard Adapter**: http://localhost:3013/api/docs

## 📝 Configuración de Variables de Entorno

Las variables están configuradas en `docker-compose.yml`:

### MongoDB
- `MONGO_INITDB_ROOT_USERNAME`: artgallery
- `MONGO_INITDB_ROOT_PASSWORD`: secure123

### Auth Service
- `MONGO_URI`: mongodb://artgallery:secure123@mongodb:27017/auth-service?authSource=admin
- `JWT_SECRET`: your-super-secret-jwt-key-change-this-in-production

### API Gateway
- `JWT_SECRET`: your-super-secret-jwt-key-change-this-in-production
- `THROTTLE_TTL`: 60000 (1 minuto)
- `THROTTLE_LIMIT`: 10 requests

### Museum Services
- `HARVARD_API_KEY`: 4229f68b-585d-4c60-8d4a-00adafc8719c
- `REDIS_URL`: redis://redis:6379

## 🛠️ Troubleshooting

### Si un servicio no arranca

1. Ver logs detallados:
```powershell
docker logs <nombre-contenedor> --tail 50
```

2. Reiniciar el servicio:
```powershell
docker-compose -f docker-compose.simple.yml restart <servicio>
```

3. Reconstruir el servicio:
```powershell
docker-compose -f docker-compose.simple.yml up -d --build <servicio>
```

### Si hay problemas de conexión entre servicios

Los servicios se comunican a través de la red Docker `ar-network`. Usar los nombres de servicio como hostnames:
- `http://auth-service:3001`
- `http://composition-service:3002`
- `http://mongodb:27017`
- `http://redis:6379`

### Limpiar todo y empezar de nuevo

```powershell
# Detener y eliminar todo (incluyendo volúmenes)
docker-compose -f docker-compose.simple.yml down -v

# Limpiar imágenes huérfanas
docker image prune -f

# Volver a construir y arrancar
docker-compose -f docker-compose.simple.yml up -d --build
```

## 🎯 Arquitectura Simplificada

```
┌──────────────────────────────────────────────────────┐
│                  API Gateway :3000                   │
│  (Autenticación, Rate Limiting, Proxy Unificado)    │
└────────────┬─────────────┬─────────────┬─────────────┘
             │             │             │
    ┌────────▼─────┐ ┌────▼──────┐ ┌────▼──────────┐
    │ Auth :3001   │ │Composition│ │Museum Proxy   │
    │              │ │  :3002    │ │    :3010      │
    └──────┬───────┘ └─────┬─────┘ └───────┬───────┘
           │               │                │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │ MongoDB     │ │    Redis    │ │MET :3012    │
    │  :27017     │ │   :6379     │ │Harvard :3013│
    └─────────────┘ └─────────────┘ └─────────────┘
```

## ✨ Detalles Técnicos

### Dockerfiles
Todos los servicios usan una estructura simple de 8 pasos:

1. `FROM node:18-alpine` - Imagen base ligera
2. `WORKDIR /app` - Directorio de trabajo
3. `COPY package*.json ./` - Copiar dependencias
4. `RUN npm install` - Instalar dependencias
5. `RUN npm install -D @nestjs/cli typescript` - Herramientas de build
6. `COPY . .` - Copiar código fuente
7. `RUN npm run build` - Compilar TypeScript
8. `RUN npm prune --production` - Limpiar devDependencies
9. `EXPOSE <puerto>` - Exponer puerto
10. `CMD ["node", "dist/main.js"]` - Comando de ejecución

**Nota**: `composition-service` usa `dist/src/main.js` debido a su configuración de NestJS.

### Red Docker
- **Nombre**: `ar-network`
- **Tipo**: bridge
- **Propósito**: Permite comunicación entre contenedores usando nombres de servicio

### Volúmenes Persistentes
- `mongodb_data`: Datos de MongoDB (colecciones users, refreshtokens)

## 🎉 Resultado Final

**BUILD TIME**: ~2.5 minutos (primera vez)  
**STARTUP TIME**: ~15 segundos  
**TOTAL CONTAINERS**: 8  
**STATUS**: ✅ ALL SERVICES UP

El sistema completo está containerizado y listo para desarrollo/producción. Todos los servicios se comunican correctamente a través de la red Docker.
