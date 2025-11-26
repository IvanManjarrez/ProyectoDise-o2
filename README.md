# Galería de Arte Virtual

Sistema de microservicios para explorar obras de arte de museos internacionales (Harvard Art Museums y Metropolitan Museum). Implementa patrones de API Composition y Proxy con Circuit Breaker.

## Arquitectura

### Servicios Backend
- **API Gateway** (3000) - Punto de entrada unificado
- **Auth Service** (3001) - Autenticación JWT y gestión de usuarios
- **Composition Service** (3002) - Orquestador de búsquedas multi-museo
- **Museum Proxy Service** (3010) - Proxy resiliente con circuit breaker
- **Harvard Adapter** (3013) - Integración con Harvard Art Museums API
- **MET Adapter** (3012) - Integración con Metropolitan Museum API

### Infraestructura
- **MongoDB** (27017) - Base de datos
- **Redis** (6379) - Cache y sesiones

## Estructura del Proyecto

```
backend/
├── api-gateway/              # Puerto 3000 - Punto de entrada
├── auth-service/             # Puerto 3001 - Autenticación
├── composition-service/      # Puerto 3002 - Orquestador
├── museum-proxy-service/     # Puerto 3010 - Proxy resiliente
├── adapters/
│   ├── harvard-adapter/      # Puerto 3013 - API Harvard
│   └── met-adapter/          # Puerto 3012 - API MET
└── shared/
    ├── common/               # DTOs compartidos
    └── database/             # Configuración MongoDB

infrastructure/
└── docker-compose.yml        # Orquestación de servicios
```

### Clean Architecture

Cada microservicio sigue los principios de Clean Architecture:

```
src/core/
├── domain/
│   ├── entities/         # Modelos de negocio
│   ├── repositories/     # Interfaces de persistencia
│   └── value-objects/    # Objetos de valor
├── application/
│   ├── usecases/         # Casos de uso
│   ├── dto/              # Objetos de transferencia
│   └── ports/            # Interfaces de adaptadores
├── infrastructure/
│   └── external/         # Clientes HTTP externos
└── interface/
    └── controllers/      # Controladores REST
```

## Inicio Rápido

### Prerrequisitos
- Docker & Docker Compose
- Git

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/IvanManjarrez/ProyectoDise-o2.git
cd ProyectoDise-o2

# Iniciar todos los servicios
docker-compose up -d

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Verificación

```bash
# Health checks
curl http://localhost:3013/api/v1/harvard/health
curl http://localhost:3012/api/v1/met/health
curl http://localhost:3010/api/v1/proxy/health
```

## Endpoints Principales

### Composition Service (Puerto 3002)

**Búsqueda Unificada**
```bash
# Buscar en Harvard
GET http://localhost:3002/api/v1/composition/search?query=monet&museums=harvard&limit=5

# Buscar en MET
GET http://localhost:3002/api/v1/composition/search?query=picasso&museums=met&limit=5

# Buscar en ambos museos
GET http://localhost:3002/api/v1/composition/search?query=art&museums=harvard,met&limit=10
```

**Detalle de Obra**
```bash
GET http://localhost:3002/api/v1/composition/artworks/331916?museum=harvard
GET http://localhost:3002/api/v1/composition/artworks/437853?museum=met
```

### Auth Service (Puerto 3001)

**Autenticación**
```bash
# Registro
POST http://localhost:3001/api/v1/auth/register
Content-Type: application/json

{
  "name": "Usuario",
  "email": "usuario@ejemplo.com",
  "password": "password123"
}

# Login
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Favoritos**
```bash
# Agregar favorito
POST http://localhost:3001/api/v1/users/:userId/favorites
Authorization: Bearer {token}
Content-Type: application/json

{
  "artworkId": "harvard_331916",
  "title": "Water Lilies",
  "artist": "Claude Monet",
  "museum": "harvard",
  "imageUrl": "https://...",
  "year": 1906
}

# Obtener favoritos
GET http://localhost:3001/api/v1/users/:userId/favorites
Authorization: Bearer {token}

# Eliminar favorito
DELETE http://localhost:3001/api/v1/users/:userId/favorites/:artworkId
Authorization: Bearer {token}
```

**Historial de Búsqueda**
```bash
# Agregar búsqueda
POST http://localhost:3001/api/v1/users/:userId/search-history
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "monet",
  "museum": "harvard",
  "resultsCount": 15
}

# Obtener historial
GET http://localhost:3001/api/v1/users/:userId/search-history
Authorization: Bearer {token}

# Limpiar historial
DELETE http://localhost:3001/api/v1/users/:userId/search-history
Authorization: Bearer {token}
```

### Museum Proxy (Puerto 3010)

```bash
# Búsqueda con circuit breaker
GET http://localhost:3010/api/v1/proxy/artworks/search?query=monet&museum=harvard&limit=10

# Detalle de obra
GET http://localhost:3010/api/v1/proxy/artworks/harvard/331916
GET http://localhost:3010/api/v1/proxy/artworks/met/437853
```

### Harvard Adapter (Puerto 3013)

```bash
# Búsqueda
GET http://localhost:3013/api/v1/harvard/search?q=monet&limit=10

# Detalle
GET http://localhost:3013/api/v1/harvard/artwork/331916

# Clasificaciones
GET http://localhost:3013/api/v1/harvard/classifications

# Culturas
GET http://localhost:3013/api/v1/harvard/cultures
```

### MET Adapter (Puerto 3012)

```bash
# Búsqueda
GET http://localhost:3012/api/v1/met/search?q=van%20gogh&limit=10

# Detalle
GET http://localhost:3012/api/v1/met/object/437853

# Departamentos
GET http://localhost:3012/api/v1/met/departments
```

## Documentación Swagger

Cada servicio incluye documentación interactiva en:

- **API Gateway**: http://localhost:3000/api/docs
- **Auth Service**: http://localhost:3001/api/docs
- **Composition Service**: http://localhost:3002/api/docs
- **Museum Proxy**: http://localhost:3010/api/docs
- **Harvard Adapter**: http://localhost:3013/api/docs
- **MET Adapter**: http://localhost:3012/api/docs
