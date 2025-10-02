# Composition Service

Servicio de composición y orquestación para la Galería de Arte Virtual. Este servicio se encarga de:

- **Orquestar búsquedas** entre múltiples museos (MET, Louvre)
- **Combinar y agregar resultados** de diferentes fuentes
- **Cachear respuestas** para mejorar performance
- **Proporcionar una API unificada** para el frontend

## Arquitectura

### Clean Architecture
```
src/
├── core/
│   ├── application/
│   │   ├── dto/                    # Data Transfer Objects
│   │   ├── ports/                  # Interfaces/Contratos
│   │   └── usecases/              # Casos de uso de negocio
│   ├── domain/
│   │   └── entities/              # Entidades de dominio
│   └── infrastructure/
│       └── repositories/          # Implementaciones concretas
├── interface/
│   └── controllers/              # Controladores REST
└── main.ts                       # Punto de entrada
```

## API Endpoints

### Búsqueda de obras de arte
```http
GET /api/v1/composition/search?query=monet&museums=met,louvre&limit=20&sortBy=relevance
```

**Parámetros:**
- `query` (requerido): Término de búsqueda
- `museums` (opcional): Museos a consultar (`met`, `louvre` o ambos)
- `limit` (opcional): Límite de resultados (default: 20)
- `sortBy` (opcional): Ordenamiento (`relevance`, `date`, `title`, `museum`)
- `artist` (opcional): Filtro por artista
- `period` (opcional): Filtro por período

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "artworks": [
      {
        "id": "12345",
        "title": "Water Lilies",
        "artist": "Claude Monet",
        "imageUrl": "https://...",
        "museum": "Metropolitan Museum of Art",
        "source": "met",
        "date": "1919",
        "description": "..."
      }
    ],
    "metadata": {
      "totalCount": 15,
      "sources": [
        {
          "source": "met",
          "count": 10,
          "responseTime": 245,
          "success": true
        },
        {
          "source": "louvre",
          "count": 5,
          "responseTime": 312,
          "success": true
        }
      ],
      "query": "monet",
      "searchTime": 456
    }
  }
}
```

### Detalle de obra de arte
```http
GET /api/v1/composition/artworks/:id?museum=met
```

### Health Check
```http
GET /api/v1/composition/health
```

## Dependencias

- **Museum Proxy Service** (puerto 3010): Para obtener datos de museos
- **Cache en memoria**: Para mejorar performance de búsquedas repetidas

## Configuración

### Variables de entorno
```bash
PORT=3013                           # Puerto del servicio
MUSEUM_PROXY_URL=http://localhost:3010  # URL del Museum Proxy Service
CACHE_TTL=300                      # TTL del cache en segundos (5 min)
```

## Características

### ✅ **Orquestación paralela**
- Consulta múltiples museos simultáneamente
- Manejo de errores por museo independiente
- Agregación inteligente de resultados

### ✅ **Cache inteligente**
- Cache en memoria con TTL configurable
- Limpieza automática de entradas expiradas
- Keys específicos por query y parámetros

### ✅ **Resilencia**
- Health checks antes de consultar servicios
- Timeouts configurables
- Degradación elegante ante fallos

### ✅ **Flexibilidad**
- Consulta selectiva de museos
- Múltiples opciones de ordenamiento
- Filtros avanzados por artista y período

## Uso

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run build
npm run start
```

### Producción
```bash
npm run build
npm run start:prod
```

## Próximas características

- [ ] Persistencia con Redis para cache distribuido
- [ ] Métricas y monitoring
- [ ] Rate limiting
- [ ] Autenticación
- [ ] Filtros avanzados por período, técnica, etc.
- [ ] Soporte para más museos
- [ ] API GraphQL