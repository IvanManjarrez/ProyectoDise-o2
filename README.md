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
- Node.js 18+
- Docker & Docker Compose
- Git

### Desarrollo Local

1. **Instalar dependencias y ejecutar servicios:**
```bash
# Para cada microservicio
cd backend/[service-name]
npm install
npm run start:dev
```
- Orden recomendado: (Harvard + Met Adapters) -> Museum proxy -> Composition

### URLs de Desarrollo
- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3004
- Composition Service: http://localhost:3001
- Museum Proxy: http://localhost:3010
- Harvard Adapter: http://localhost:3013
- MET Adapter: http://localhost:3012

## Estado de la Primera Entrega

- Se escogieron las arquitecturas que se usarán para el proyecto.
- Se creó el esqueleto base del cual partirá el desarollo.
- Se identificaron los Microservicios junto con sus funciones y responsabilidades.
