# ProyectoDiseño2 - Galería de Arte Virtual

**Primera Entrega:** Estructura de proyecto inicial, esqueleto de servicios y docker-compose.dev con DB.

## 🏗️ Arquitectura del Sistema

```
ProyectoDiseño2/
├── backend/
│   ├── composition-service/           # 🎯 Servicio Principal (NestJS)
│   │   ├── src/
│   │   │   ├── main.ts               # Bootstrap de NestJS
│   │   │   ├── app.module.ts         # Módulo raíz
│   │   │   └── modules/
│   │   │       ├── composition/      # API Composition & Orchestration
│   │   │       ├── core/             # Domain Models (User, Artwork, Museum)
│   │   │       └── connectors/       # External API Adapters
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── proxy-service/                # 🚀 Proxy & Cache (NestJS)
│   │   ├── src/
│   │   │   ├── main.ts               # Bootstrap
│   │   │   ├── app.module.ts         # Módulo con cache y throttling
│   │   │   ├── proxy.controller.ts   # API Gateway endpoints
│   │   │   └── proxy.service.ts      # Cache, Circuit Breaker, Retries
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   └── common/                       # 📚 Shared Resources
│       └── init-mongo.js             # MongoDB initialization script
│
├── docker-compose.dev.yml            # 🐳 Complete Development Stack
└── README.md
```

## 🛠️ Stack Tecnológico

- **Backend Framework:** Node.js + NestJS + TypeScript
- **Base de Datos:** MongoDB 7.0
- **Cache:** Redis 7.0 (con password)
- **Containerización:** Docker + Docker Compose
- **API Design:** REST + Circuit Breaker + Rate Limiting

## 🚀 Servicios Implementados

### 1. **Composition Service** (Puerto 3001)
- **Función:** API principal y orquestador de datos
- **Módulos:**
  - `Core`: Schemas de dominio (User, Artwork, Museum, Favorite, ViewLog)
  - `Composition`: Controllers y servicios de búsqueda
  - `Connectors`: Preparado para adaptadores externos
- **Features:**
  - MongoDB con Mongoose
  - Cache con Redis
  - Rate limiting
  - Validación de datos

### 2. **Proxy Service** (Puerto 3002)
- **Función:** Gateway y proxy para APIs externas
- **Features:**
  - Circuit Breaker pattern
  - Retry con backoff exponencial
  - Cache distribuido
  - Rate limiting por cliente
  - Health checks

### 3. **Base de Datos**
- **MongoDB**: Persistencia principal con datos de ejemplo
- **Redis**: Cache y sesiones

## 📊 Datos de Ejemplo

El sistema viene pre-cargado con:
- **3 Museos**: Louvre, MET, Prado
- **5 Obras de Arte**: Mona Lisa, Starry Night, Las Meninas, etc.
- **Colecciones** listas para búsqueda

## 🔧 Instrucciones de Instalación

### Prerrequisitos
- Docker Desktop
- Git

### 1. Clonar el Repositorio
```bash
git clone <repo-url>
cd ProyectoDiseño2
```

### 2. Levantar el Stack Completo
```bash
# Construir y levantar todos los servicios
docker-compose -f docker-compose.dev.yml up --build

# En modo detached (background)
docker-compose -f docker-compose.dev.yml up --build -d
```

### 3. Verificar que Todo Funciona
```bash
# Health check composition service
curl http://localhost:3001/api/v1/health

# Health check proxy service  
curl http://localhost:3002/api/v1/health

# Buscar artworks
curl "http://localhost:3001/api/v1/search?q=mona"

# Ver museos
curl http://localhost:3001/api/v1/museums
```

### 4. Parar los Servicios
```bash
docker-compose -f docker-compose.dev.yml down
```

## 🌐 Endpoints Disponibles

### Composition Service (3001)
- `GET /api/v1/health` - Health check
- `GET /api/v1/search?q={term}` - Buscar artworks
- `GET /api/v1/artworks/{id}` - Detalle de artwork
- `GET /api/v1/museums` - Listar museos

### Proxy Service (3002)
- `GET /api/v1/health` - Health check
- `GET /api/v1/proxy/{provider}/search?q={term}` - Búsqueda proxy
- `GET /api/v1/proxy/{provider}/artwork/{id}` - Artwork por proxy

## 🔌 Puertos y Servicios

| Servicio | Puerto | URL |
|----------|--------|-----|
| Composition Service | 3001 | http://localhost:3001 |
| Proxy Service | 3002 | http://localhost:3002 |
| MongoDB | 27017 | mongodb://admin:password123@localhost:27017 |
| Redis | 6379 | redis://localhost:6379 (password: password123) |

## 📋 Estado de la Primera Entrega

### ✅ Completado
- [x] **Estructura de proyecto inicial** - Arquitectura modular definida
- [x] **Esqueleto de servicios** - NestJS con módulos core implementados
- [x] **docker-compose.dev con DB** - Stack completo con MongoDB y Redis
- [x] **Schemas de dominio** - User, Artwork, Museum, Favorite, ViewLog
- [x] **Servicios base** - Composition y Proxy services funcionales
- [x] **Cache distribuido** - Redis integrado con rate limiting
- [x] **Datos de ejemplo** - Base de datos inicializada
- [x] **Health checks** - Monitoring básico de servicios
- [x] **Documentación** - Setup y uso completo

### 🔜 Próximas Entregas
- [ ] Integración con APIs reales de museos
- [ ] Frontend con React + A-Frame
- [ ] Sistema de autenticación
- [ ] Favoritos y historial de usuario
- [ ] Métricas y observabilidad

## 🧪 Testing

Para verificar que la primera entrega funciona correctamente:

```bash
# 1. Levantar el stack
docker-compose -f docker-compose.dev.yml up --build -d

# 2. Esperar unos segundos y verificar servicios
curl http://localhost:3001/api/v1/health
curl http://localhost:3002/api/v1/health

# 3. Probar búsqueda
curl "http://localhost:3001/api/v1/search?q=leonardo"

# 4. Ver logs
docker-compose -f docker-compose.dev.yml logs composition-service
docker-compose -f docker-compose.dev.yml logs proxy-service
```

---

**Autor:** Equipo ProyectoDiseño2  
**Entrega:** 1/3 - Estructura Base y Servicios  
**Fecha:** Septiembre 2025
Plataforma backend para exploración de obras de museos y experiencias AR/3D. Backend NestJS, arquitectura API Composition y Proxy, integración con MongoDB, Redis y APIs externas de museos y Sketchfab.
