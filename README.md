# Galería de Arte Virtual - MVP

Proyecto que permitirá explorar obras de arte de museos famosos. Sistema distribuido con API Composition Pattern y Proxy Pattern.

## Arquitectura de Microservicios

### Backend Services (Puertos de Desarrollo)
- **Auth Service** (3004) - Autenticación JWT, gestión de usuarios estudiantes  
- **Composition Service** (3001) - Orquestador principal, búsqueda unificada
- **Museum Proxy Service** (3010) - Proxy con circuit breaker para APIs externas
- **Harvard Adapter** (3013) - Integración específica con API del museo de Harvard
- **MET Adapter** (3012) - Integración específica con API del Metropolitan Museum

### Infraestructura
- **MongoDB** (27017) - Base de datos principal
- **Redis** (6379) - Cache distribuido y sesiones
- **Nginx** - Load balancer y reverse proxy

## Documentación API (Swagger/OpenAPI)

Todos los microservicios incluyen documentación interactiva completa con Swagger UI:

### URLs de Documentación
- **Harvard Adapter**: http://localhost:3013/api/docs
- **MET Adapter**: http://localhost:3012/api/docs  
- **Composition Service**: http://localhost:3001/api/docs
- **Museum Proxy Service**: http://localhost:3010/api/docs

### Funcionalidades Documentadas
- **Búsqueda de obras de arte** - Endpoints de búsqueda con filtros avanzados
- **Información detallada** - Endpoints para obtener obras específicas
- **Metadatos de museos** - Departamentos, clasificaciones, divisiones
- **Health checks** - Monitoreo de estado de servicios
- **Circuit breaker** - Estados y métricas del proxy resiliente
- **Orquestación** - Endpoints de composición multi-museo

## Estructura del Proyecto

### General

```
backend/
├── api-gateway/              # Puerto 3000
├── auth-service/             # Puerto 3004
├── composition-service/      # Puerto 3001
├── museum-proxy-service/     # Puerto 3010
├── adapters/
│   ├── harvard-adapter/      # Puerto 3013
│   └── met-adapter/          # Puerto 3012
└── shared/
    ├── common/               # DTOs compartidos
    └── database/             # Configuración DB

infrastructure/
├── docker-compose.dev.yml
└── nginx/
```
### Por Microservicios:
- Auth Service: 
```
src/core/
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts         
│   │   └── session.entity.ts   
│   ├── repositories/
│   │   └── user.repository.ts 
│   └── value-objects/
│       ├── email.vo.ts         
│       └── password.vo.ts  
├── application/
│   ├── usecases/
│   │   ├── login.usecase.ts    
│   │   └── register.usecase.ts 
│   ├── dto/
│   │   └── auth.dto.ts   
│   └── ports/
│       └── jwt.port.ts  
└── infrastructure/ (carpetas creadas)
```

- API Gateway:
```
src/core/
├── domain/
│   └── entities/
│       ├── route.entity.ts  
│       └── rate-limit.entity.ts  
├── application/
│   ├── usecases/
│   │   ├── route-request.usecase.ts 
│   │   └── validate-rate-limit.usecase.ts 
│   └── dto/
│       └── gateway.dto.ts 
└── interface/
    └── controllers/
        └── gateway.controller.ts 
```

- Harvard Adapter
```
src/core/
├── domain/
│   ├── entities/
│   │   └── harvard-artwork.entity.ts 
│   └── repositories/
│       └── harvard-api.repository.ts 
├── application/
│   ├── usecases/
│   │   └── search-harvard-artworks.usecase.ts 
│   └── dto/
│       └── harvard-api.dto.ts    
├── infrastructure/
│   └── external/
│       └── harvard-http.client.ts  
└── interface/
    └── controllers/
        └── harvard.controller.ts 
```

- MET Adapter:
```
src/core/
├── domain/
│   └── entities/
│       └── met-artwork.entity.ts 
├── application/
│   └── usecases/
│       └── search-met-artworks.usecase.ts 
└── interface/
    └── controllers/
        └── met.controller.ts 
```

- Museum Proxy Service:
```
src/core/
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts    
│   │   └── session.entity.ts  
│   ├── repositories/
│   │   └── user.repository.ts
│   └── value-objects/
│       ├── email.vo.ts     
│       └── password.vo.ts    
├── application/
│   ├── usecases/
│   │   ├── login.usecase.ts   
│   │   └── register.usecase.ts  
│   ├── dto/
│   │   └── auth.dto.ts    
│   └── ports/
│       └── jwt.port.ts   
└── infrastructure/ (carpetas creadas)
```

- Composition Service:
```
src/core/
├── domain/
│   └── entities/
│       ├── route.entity.ts 
│       └── rate-limit.entity.ts   
├── application/
│   ├── usecases/
│   │   ├── route-request.usecase.ts  
│   │   └── validate-rate-limit.usecase.ts 
│   └── dto/
│       └── gateway.dto.ts   
└── interface/
    └── controllers/
        └── gateway.controller.ts 
```

## Desarrollo

### Prerrequisitos
- Docker & Docker Compose
- Node.js 18+ (para desarrollo individual)
- Git

## Ejecución con Docker (Recomendado)

### Inicio Rápido

1. **Clonar el repositorio:**
```bash
git clone https://github.com/IvanManjarrez/ProyectoDise-o2.git
cd ProyectoDise-o2
```

2. **Levantar todo el sistema:**
```bash
# Construye las imágenes y levanta todos los servicios
docker-compose up -d

# Ver el estado de los servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f
```

3. **Verificar que todo funciona:**
```bash
# Health check de los servicios principales
curl http://localhost:3013/api/v1/harvard/health
curl http://localhost:3012/api/v1/met/health
curl http://localhost:3010/api/v1/proxy/health

# Búsquedas funcionales (acceso directo a adapters)
curl "http://localhost:3013/api/v1/harvard/search?q=monet&limit=5"
curl "http://localhost:3012/api/v1/met/search?q=monet&limit=5"
```

4. **Parar el sistema:**
```bash
docker-compose down
```

### URLs de Desarrollo (Docker)
- **Composition Service**: http://localhost:3001 (Orquestador principal)
- **Museum Proxy**: http://localhost:3010 (Proxy con circuit breaker)
- **Harvard Adapter**: http://localhost:3013 (API Harvard Art Museums)
- **MET Adapter**: http://localhost:3012 (API Metropolitan Museum)
- **MongoDB**: http://localhost:27017 (Base de datos)
- **Redis**: http://localhost:6379 (Cache)

### Endpoints de Prueba

#### Harvard Adapter 
```bash
# Búsqueda de obras de arte (Devuelve datos reales)
GET http://localhost:3013/api/v1/harvard/search?q=monet&limit=10
GET http://localhost:3013/api/v1/harvard/search?q=picasso&limit=5

# Detalle de obra específica
GET http://localhost:3013/api/v1/harvard/artwork/331916

# Obtener clasificaciones disponibles
GET http://localhost:3013/api/v1/harvard/classifications

# Obtener culturas disponibles
GET http://localhost:3013/api/v1/harvard/cultures

# Health check del servicio
GET http://localhost:3013/api/v1/harvard/health
```

#### MET Adapter 
```bash
# Búsqueda de obras de arte (Devuelve datos reales)
GET http://localhost:3012/api/v1/met/search?q=monet&limit=10
GET http://localhost:3012/api/v1/met/search?q=van%20gogh&limit=5

# Detalle de objeto específico
GET http://localhost:3012/api/v1/met/object/437853

# Departamentos disponibles
GET http://localhost:3012/api/v1/met/departments

# Health check del servicio
GET http://localhost:3012/api/v1/met/health
```

#### Museum Proxy Service
```bash
# Health check 
GET http://localhost:3010/api/v1/proxy/health

#### Composition Service
```bash
# Health check
GET http://localhost:3001/api/v1/composition/health

# Búsqueda unificada - Harvard
GET http://localhost:3001/api/v1/composition/search?query=monet&museums=harvard&limit=3

# Búsqueda unificada - MET
GET http://localhost:3001/api/v1/composition/search?query=van+gogh&museums=met&limit=2

# Búsqueda en múltiples museos (cuando esté implementado)
GET http://localhost:3001/api/v1/composition/search?query=picasso&museums=harvard,met&limit=5
```

## Desarrollo Local (Sin Docker)

### Configuración Manual

1. **Instalar dependencias y ejecutar servicios:**
```bash
# Para cada microservicio
cd backend/[service-name]
npm install
npm run start:dev
```

2. **Servicios de infraestructura:**
```bash
# MongoDB (puerto 27017)
# Redis (puerto 6379)
# Configurar manualmente o usar Docker solo para estos
```

- **Orden recomendado**: (Harvard + MET Adapters) → Museum Proxy → Composition

### URLs de Desarrollo (Local)
- Auth Service: http://localhost:3004 *(pendiente implementación)*
- API Gateway: http://localhost:3000 *(pendiente implementación)*
- Composition Service: http://localhost:3001
- Museum Proxy: http://localhost:3010
- Harvard Adapter: http://localhost:3013
- MET Adapter: http://localhost:3012

## Estado del Proyecto

### Primera Entrega (Semana 1)
- Se escogieron las arquitecturas que se usarán para el proyecto
- Se creó el esqueleto base del cual partirá el desarrollo
- Se identificaron los Microservicios junto con sus funciones y responsabilidades

### Segunda Entrega (Semana 2)
- **Harvard Adapter**: 100% funcional con API real de Harvard Art Museums
- **MET Adapter**: 100% funcional con API del Metropolitan Museum
- **Composition Service**: Orquestador principal implementado con patrón Composition
- **Museum Proxy Service**: Proxy con Circuit Breaker para APIs externas

### Tercera Entrega (Semana 3)
- **Microservicios containerizados**: Dockerfiles optimizados para cada servicio
- **Orquestación completa**: docker-compose.yml funcional con networking
- **Comunicación entre servicios**: Containers conectados correctamente
- **Base de datos**: MongoDB con persistencia de datos
- **Cache distribuido**: Redis para optimización de rendimiento  
- **APIs externas integradas**: Harvard y MET APIs funcionando con datos reales
- **Validación individual**: Cada adapter probado y funcional
- **Documentación API completa**: Swagger/OpenAPI implementado en todos los microservicios 
- **Documentación Swagger completa**: OpenAPI 3.0 en todos los microservicios

### Objetivos Completados
1. **Microservicios containerizados** - 4 Dockerfiles optimizados funcionando
2. **Orquestación completa** - docker-compose.yml levanta todo el sistema
3. **Integración con APIs externas** - Harvard y MET APIs devolviendo datos reales  
4. **Infraestructura de datos** - MongoDB y Redis operativos con persistencia
5. **Networking entre containers** - Comunicación interna configurada
6. **Validación funcional** - Health checks y endpoints probados exitosamente
7. **Documentación API completa** - Swagger/OpenAPI implementado en todos los microservicios
