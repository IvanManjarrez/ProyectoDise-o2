# Docker Setup - AR Art Gallery

## Inicio Rápido

### Opción 1: Script PowerShell (Recomendado para Windows)

```powershell
# Levantar todos los servicios
.\docker-manage.ps1 up

# Ver logs en tiempo real
.\docker-manage.ps1 logs

# Detener servicios
.\docker-manage.ps1 down

# Ver estado
.\docker-manage.ps1 status

# Ver ayuda
.\docker-manage.ps1 help
```

### Opción 2: Docker Compose Manual

```bash
# Levantar todos los servicios
docker-compose -f docker-compose.complete.yml up -d --build

# Ver logs
docker-compose -f docker-compose.complete.yml logs -f

# Detener servicios
docker-compose -f docker-compose.complete.yml down

# Ver estado
docker-compose -f docker-compose.complete.yml ps
```

## Servicios Incluidos

| Servicio | Puerto | URL | Swagger |
|----------|--------|-----|---------|
| **API Gateway** | 3000 | http://localhost:3000 | http://localhost:3000/api/docs |
| **Auth Service** | 3001 | http://localhost:3001 | http://localhost:3001/api/docs |
| **Composition** | 3002 | http://localhost:3002 | http://localhost:3002/api/docs |
| **Museum Proxy** | 3010 | http://localhost:3010 | http://localhost:3010/api/docs |
| **MET Adapter** | 3012 | http://localhost:3012 | http://localhost:3012/api/docs |
| **Harvard Adapter** | 3013 | http://localhost:3013 | http://localhost:3013/api/docs |
| **MongoDB** | 27017 | mongodb://localhost:27017 | - |
| **Redis** | 6379 | redis://localhost:6379 | - |

## Credenciales por Defecto

### MongoDB
- **Usuario**: artgallery
- **Contraseña**: secure123
- **Base de datos**: artgallery

### Redis
- Sin contraseña (producción debe configurarse)

## Health Checks

Todos los servicios tienen endpoints de health check:

```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health

# Composition Service
curl http://localhost:3002/api/v1/composition/health

# Museum Proxy
curl http://localhost:3010/api/v1/proxy/health
```

## Arquitectura

```
┌─────────────────┐
│   API GATEWAY   │ :3000
│  (Entry Point)  │
└────────┬────────┘
         │
    ┌────┴─────┬──────────┬─────────────┐
    │          │          │             │
┌───▼───┐ ┌───▼──────┐ ┌─▼──────────┐  │
│ Auth  │ │Composition│ │Museum Proxy│  │
│ :3001 │ │   :3002   │ │   :3010    │  │
└───┬───┘ └─────┬─────┘ └─────┬──────┘  │
    │           │              │         │
    │      ┌────┴────┐    ┌────┴─────┐  │
    │      │ MongoDB │    │  Redis   │  │
    │      │ :27017  │    │  :6379   │  │
    │      └─────────┘    └──────────┘  │
    │                          │         │
    │                     ┌────┴─────┐  │
    │                     │Adapters  │  │
    │                     │MET+Harvard│ │
    │                     └──────────┘  │
    └──────────────────────────────────┘
```

## Orden de Inicio

Docker Compose se encarga automáticamente del orden con `depends_on` y `healthcheck`:

1. **MongoDB** y **Redis** (infraestructura base)
2. **Adaptadores** (Harvard, MET)
3. **Museum Proxy** (depende de adaptadores + Redis)
4. **Auth Service** (depende de MongoDB)
5. **Composition Service** (depende de MongoDB + Redis + Museum Proxy)
6. **API Gateway** (depende de todos los servicios)

## Volúmenes Persistentes

Los datos se mantienen incluso después de `docker-compose down`:

- `mongodb_data` - Datos de MongoDB
- `mongodb_config` - Configuración de MongoDB
- `redis_data` - Datos de Redis

Para eliminar volúmenes (BORRA DATOS):
```bash
docker-compose down -v
```

## Troubleshooting

### Servicio no inicia
```bash
# Ver logs del servicio específico
docker-compose -f docker-compose.complete.yml logs [servicio]

# Ejemplo:
docker-compose -f docker-compose.complete.yml logs api-gateway
```

### Puerto ya en uso
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Detener proceso
Stop-Process -Id [PID] -Force
```

### Reconstruir imagen específica
```bash
docker-compose -f docker-compose.complete.yml build --no-cache [servicio]

# Ejemplo:
docker-compose -f docker-compose.complete.yml build --no-cache api-gateway
```

### Limpiar todo y empezar de cero
```bash
# Detener servicios
docker-compose -f docker-compose.complete.yml down -v

# Limpiar imágenes huérfanas
docker image prune -f

# Reconstruir todo
docker-compose -f docker-compose.complete.yml up -d --build
```

## Variables de Entorno

Las variables están configuradas en `docker-compose.yml`. Para producción:

1. Cambiar `JWT_SECRET` a valor seguro
2. Cambiar credenciales de MongoDB
3. Configurar contraseña de Redis
4. Usar variables de entorno del host con `.env` file

## Desarrollo vs Producción

### Desarrollo (actual)
- `docker-compose.yml` - Todos los servicios (desarrollo y producción)

### Producción (futuro)
- Separar bases de datos a servicios managed (MongoDB Atlas, Redis Cloud)
- Usar secrets de Docker para credenciales
- Configurar reverse proxy (nginx)
- Implementar SSL/TLS

## Comandos Útiles

```bash
# Ver uso de recursos
docker stats

# Entrar a un contenedor
docker exec -it ar-gateway sh

# Ver logs de múltiples servicios
docker-compose -f docker-compose.complete.yml logs -f api-gateway auth-service

# Escalar un servicio (si es stateless)
docker-compose -f docker-compose.complete.yml up -d --scale composition-service=3
```

## Próximos Pasos

Una vez todos los servicios estén corriendo:

1. Acceder a Swagger: http://localhost:3000/api/docs
2. Registrar un usuario en `/auth/register`
3. Hacer login en `/auth/login` para obtener JWT token
4. Usar el botón "Authorize" en Swagger para agregar el token
5. Probar endpoints protegidos de composición y búsqueda

## Soporte

Si encuentras problemas:
1. Revisa logs: `.\docker-manage.ps1 logs`
2. Verifica health checks: `curl http://localhost:3000/health`
3. Revisa que los puertos no estén en uso
4. Reconstruye las imágenes: `.\docker-manage.ps1 build`
