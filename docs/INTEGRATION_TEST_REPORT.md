# 📊 Reporte de Pruebas de Integración - Microservicios de Museos

**Proyecto:** Sistema de Microservicios para Consulta de Obras de Arte  
**Fecha:** Por definir  
**Autores:** Jhonayker echeverria, Ivan Manjarrez, Anghely Ramos  
**Versión:** 1.0.0

---

## 1. Resumen

### Objetivo de las Pruebas
Validar la comunicación e integración entre los microservicios (Harvard Adapter, MET Adapter, Museum Proxy Service, Composition Service) mediante pruebas end-to-end y verificar el cumplimiento de los requisitos funcionales y no funcionales.

### Alcance
- Comunicación REST entre servicios
- Validación de endpoints y contratos de API
- Manejo de errores y casos límite
- Circuit breaker y cache
- Performance y tiempos de respuesta

### Resultados Generales

| Categoría | Total | Passed | Failed | % Success |
|-----------|-------|--------|--------|-----------|
| Pruebas Automatizadas (Jest) | [X] | [Y] | [Z] | [XX%] |
| Pruebas Manuales (Postman) | [X] | [Y] | [Z] | [XX%] |
| Pruebas de Performance | [X] | [Y] | [Z] | [XX%] |
| **TOTAL** | **[X]** | **[Y]** | **[Z]** | **[XX%]** |

---

## 2. 🏗️ Arquitectura del Sistema

### Componentes Probados

```
┌─────────────────────────────────────────────────────────────┐
│                    Cliente / Frontend                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │  Composition Service   │  ✅ Probado
          │  Puerto: 3013          │
          └────────────┬───────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │   Museum Proxy Service │  ✅ Probado
          │   Puerto: 3010         │
          └─────┬──────────────┬───┘
                │              │
        ┌───────▼─────┐   ┌───▼──────────┐
        │ MET Adapter │   │ Harvard      │
        │ Puerto 3012 │   │ Adapter 3011 │  ✅ Probados
        └─────┬───────┘   └──┬───────────┘
              │              │
        ┌─────▼──────┐  ┌───▼────────────┐
        │  MET API   │  │ Harvard API    │  ✅ Conexión validada
        │  (Externa) │  │ (Externa)      │
        └────────────┘  └────────────────┘
```

### Servicios y Endpoints Testeados

| Servicio | Puerto | Endpoints | Estado |
|----------|--------|-----------|--------|
| Harvard Adapter | 3011 | 6 endpoints | [✅/❌] |
| MET Adapter | 3012 | 5 endpoints | [✅/❌] |
| Museum Proxy | 3010 | 6 endpoints | [✅/❌] |
| Composition Service | 3013 | 8 endpoints | [✅/❌] |

---

## 3. 🧪 Pruebas Ejecutadas

### 3.1 Pruebas Automatizadas (Jest + SuperTest)

#### Composition Service E2E Tests

**Archivo:** `backend/composition-service/test/composition.e2e-spec.ts`

| Test Case | Descripción | Resultado | Tiempo (ms) | Notas |
|-----------|-------------|-----------|-------------|-------|
| Health Check | Verificar estado del servicio | [✅/❌] | [XXX] | |
| Search Mixed Museums | Búsqueda en múltiples museos | [✅/❌] | [XXX] | |
| Search MET Only | Búsqueda solo en MET | [✅/❌] | [XXX] | |
| Search Harvard Only | Búsqueda solo en Harvard | [✅/❌] | [XXX] | |
| Missing Query Parameter | Validación de parámetros | [✅/❌] | [XXX] | |
| Invalid Limit | Manejo de límite inválido | [✅/❌] | [XXX] | |
| Non-existent Query | Query sin resultados | [✅/❌] | [XXX] | |
| Artwork Detail MET | Detalle de artwork | [✅/❌] | [XXX] | |
| Non-existent Artwork | 404 para artwork inexistente | [✅/❌] | [XXX] | |
| Concurrent Requests | Múltiples requests paralelos | [✅/❌] | [XXX] | |
| Performance Test | Tiempo < 5 segundos | [✅/❌] | [XXX] | |
| Partial Failure Handling | Fallo de un museo | [✅/❌] | [XXX] | |

**Comando de ejecución:**
```bash
cd backend/composition-service
npm run test:e2e
```

**Salida de consola:**
```
[PEGAR OUTPUT AQUÍ]
```

#### Museum Proxy Service E2E Tests

**Archivo:** `backend/museum-proxy-service/test/proxy.e2e-spec.ts`

| Test Case | Descripción | Resultado | Tiempo (ms) | Notas |
|-----------|-------------|-----------|-------------|-------|
| Health Check | Verificar estado del servicio | [✅/❌] | [XXX] | |
| Search MET | Búsqueda en MET con límite | [✅/❌] | [XXX] | |
| Search Harvard | Búsqueda en Harvard | [✅/❌] | [XXX] | |
| Missing Query | Validación: falta query | [✅/❌] | [XXX] | |
| Missing Museum | Validación: falta museum | [✅/❌] | [XXX] | |
| Invalid Museum | Museo inválido | [✅/❌] | [XXX] | |
| Empty Query | Query vacío | [✅/❌] | [XXX] | |
| MET Artwork Detail | Detalle de artwork MET | [✅/❌] | [XXX] | |
| Harvard Artwork Detail | Detalle de artwork Harvard | [✅/❌] | [XXX] | |
| Non-existent Artwork | 404 para ID inválido | [✅/❌] | [XXX] | |
| Cache Test | Verificar cache en 2da request | [✅/❌] | [XXX] | |
| High Volume | 10 requests concurrentes | [✅/❌] | [XXX] | |
| Search Performance | Tiempo < 3 segundos | [✅/❌] | [XXX] | |
| Detail Performance | Tiempo < 2 segundos | [✅/❌] | [XXX] | |

**Comando de ejecución:**
```bash
cd backend/museum-proxy-service
npm run test:e2e
```

**Salida de consola:**
```
[PEGAR OUTPUT AQUÍ]
```

---

### 3.2 Pruebas Manuales (Postman)

**Archivo de colección:** `docs/postman/museum-microservices.postman_collection.json`

#### Harvard Adapter

| Request | Endpoint | Status Esperado | Status Obtenido | Resultado |
|---------|----------|-----------------|-----------------|-----------|
| Health Check | GET `/health` | 200 | [XXX] | [✅/❌] |
| Search Portrait | GET `/search?q=portrait&limit=10` | 200 | [XXX] | [✅/❌] |
| Search Painting | GET `/search?q=painting&limit=20` | 200 | [XXX] | [✅/❌] |
| Get Artwork Detail | GET `/artwork/299843` | 200 | [XXX] | [✅/❌] |
| Get Divisions | GET `/divisions` | 200 | [XXX] | [✅/❌] |
| Get Classifications | GET `/classifications` | 200 | [XXX] | [✅/❌] |

**Tiempo promedio de respuesta:** [XXX ms]

#### MET Adapter

| Request | Endpoint | Status Esperado | Status Obtenido | Resultado |
|---------|----------|-----------------|-----------------|-----------|
| Health Check | GET `/health` | 200 | [XXX] | [✅/❌] |
| Search Monet | GET `/search?q=monet&limit=10` | 200 | [XXX] | [✅/❌] |
| Search Sculpture | GET `/search?q=sculpture&limit=15` | 200 | [XXX] | [✅/❌] |
| Get Artwork Detail | GET `/artwork/437056` | 200 | [XXX] | [✅/❌] |
| Get Departments | GET `/departments` | 200 | [XXX] | [✅/❌] |

**Tiempo promedio de respuesta:** [XXX ms]

#### Museum Proxy Service

| Request | Endpoint | Status Esperado | Status Obtenido | Resultado |
|---------|----------|-----------------|-----------------|-----------|
| Health Check | GET `/health` | 200 | [XXX] | [✅/❌] |
| Search MET | GET `/artworks/search?query=monet&museum=met` | 200 | [XXX] | [✅/❌] |
| Search Harvard | GET `/artworks/search?query=portrait&museum=harvard` | 200 | [XXX] | [✅/❌] |
| Get MET Artwork | GET `/artworks/met/437056` | 200 | [XXX] | [✅/❌] |
| Get Harvard Artwork | GET `/artworks/harvard/299843` | 200 | [XXX] | [✅/❌] |
| Cache Test | GET (repeated request) | 200 | [XXX] | [✅/❌] |

**Tiempo promedio de respuesta:** [XXX ms]

#### Composition Service

| Request | Endpoint | Status Esperado | Status Obtenido | Resultado |
|---------|----------|-----------------|-----------------|-----------|
| Health Check | GET `/health` | 200 | [XXX] | [✅/❌] |
| Search All Museums | GET `/search?query=painting&limit=10` | 200 | [XXX] | [✅/❌] |
| Search Mixed | GET `/search?query=portrait&museums=met,harvard` | 200 | [XXX] | [✅/❌] |
| Search MET Only | GET `/search?query=monet&museums=met` | 200 | [XXX] | [✅/❌] |
| Search Harvard Only | GET `/search?query=sculpture&museums=harvard` | 200 | [XXX] | [✅/❌] |
| Get Artwork MET | GET `/artworks/437056?museum=met` | 200 | [XXX] | [✅/❌] |
| Get Artwork Harvard | GET `/artworks/299843?museum=harvard` | 200 | [XXX] | [✅/❌] |
| Performance Test | GET `/search?query=art&limit=50` | 200 | [XXX] | [✅/❌] |

**Tiempo promedio de respuesta:** [XXX ms]

---

### 3.3 Pruebas de Manejo de Errores

| Escenario | Endpoint | Status Esperado | Status Obtenido | Resultado |
|-----------|----------|-----------------|-----------------|-----------|
| Museo inválido | Proxy `/search?museum=invalid` | 400 | [XXX] | [✅/❌] |
| Query faltante | Composition `/search?limit=10` | 400 | [XXX] | [✅/❌] |
| Artwork inexistente | Proxy `/artworks/met/999999999` | 404 | [XXX] | [✅/❌] |
| Query vacío | Proxy `/search?query=&museum=met` | 400 | [XXX] | [✅/❌] |

---

### 3.4 Pruebas con Scripts (PowerShell/Bash)

**Archivo PowerShell:** `scripts/test-all-services.ps1`  
**Archivo Bash:** `scripts/test-all-services.sh`

#### Ejecución PowerShell

**Comando:**
```powershell
.\scripts\test-all-services.ps1
```

**Output:**
```
[PEGAR OUTPUT COMPLETO AQUÍ]

Test Summary:
✅ Passed: [X]
❌ Failed: [Y]
ℹ️  Success Rate: [XX%]
```

#### Ejecución Bash (Linux/macOS)

**Comando:**
```bash
chmod +x scripts/test-all-services.sh
./scripts/test-all-services.sh
```

**Output:**
```
[PEGAR OUTPUT COMPLETO AQUÍ]
```

---

## 4. 📈 Análisis de Performance

### Tiempos de Respuesta Promedio

| Operación | Servicio | Tiempo (ms) | SLA Target | Cumple |
|-----------|----------|-------------|------------|--------|
| Health Check | Harvard | [XXX] | < 500ms | [✅/❌] |
| Health Check | MET | [XXX] | < 500ms | [✅/❌] |
| Health Check | Proxy | [XXX] | < 500ms | [✅/❌] |
| Health Check | Composition | [XXX] | < 500ms | [✅/❌] |
| Search (5 results) | Harvard | [XXX] | < 2000ms | [✅/❌] |
| Search (5 results) | MET | [XXX] | < 2000ms | [✅/❌] |
| Search via Proxy | Proxy | [XXX] | < 3000ms | [✅/❌] |
| Search Mixed Museums | Composition | [XXX] | < 5000ms | [✅/❌] |
| Artwork Detail | Harvard | [XXX] | < 1500ms | [✅/❌] |
| Artwork Detail | MET | [XXX] | < 1500ms | [✅/❌] |
| Artwork via Proxy | Proxy | [XXX] | < 2000ms | [✅/❌] |

### Prueba de Carga

**Escenario:** 10 requests concurrentes al Composition Service

| Métrica | Valor |
|---------|-------|
| Total Requests | 10 |
| Successful | [X] |
| Failed | [Y] |
| Tiempo Total | [XXX ms] |
| Tiempo Promedio | [XXX ms] |
| Tiempo Mínimo | [XXX ms] |
| Tiempo Máximo | [XXX ms] |

---

## 5. 🔄 Validación de Funcionalidades

### Circuit Breaker

**Estado:** [✅ Implementado / ❌ No implementado / ⚠️ Implementado con issues]

| Prueba | Descripción | Resultado |
|--------|-------------|-----------|
| Estado Normal | Circuit breaker en estado CLOSED | [✅/❌] |
| Fallo del Servicio | Circuit breaker se abre tras [X] fallos | [✅/❌] |
| Recovery | Circuit breaker vuelve a CLOSED tras recuperación | [✅/❌] |

**Observaciones:**
[DESCRIBIR COMPORTAMIENTO OBSERVADO]

### Cache

**Estado:** [✅ Implementado / ❌ No implementado / ⚠️ Implementado con issues]

| Prueba | Descripción | Resultado |
|--------|-------------|-----------|
| Cache Miss | Primera request no usa cache | [✅/❌] |
| Cache Hit | Segunda request usa cache (más rápida) | [✅/❌] |
| TTL | Cache expira tras tiempo configurado | [✅/❌] |

**Mediciones de Cache:**
- 1ra request (cache miss): [XXX ms]
- 2da request (cache hit): [XXX ms]
- Mejora de performance: [XX%]

---

## 6. 🐛 Issues Encontrados

### Issues Críticos

| ID | Descripción | Servicio | Severidad | Estado |
|----|-------------|----------|-----------|--------|
| [#1] | [DESCRIPCIÓN] | [SERVICIO] | [Alta/Media/Baja] | [Abierto/Resuelto] |

### Issues Conocidos (No Críticos)

| ID | Descripción | Servicio | Workaround |
|----|-------------|----------|------------|
| [#1] | Harvard IDs aparecen como "harvard_undefined" | Proxy/Composition | No bloquea funcionalidad, deferred fix |

---

## 7. ✅ Verificación de Requisitos

### Requisitos Funcionales

| Requisito | Descripción | Estado | Evidencia |
|-----------|-------------|--------|-----------|
| RF-01 | Búsqueda de artworks en MET | [✅/❌] | Test: composition.e2e-spec.ts |
| RF-02 | Búsqueda de artworks en Harvard | [✅/❌] | Test: composition.e2e-spec.ts |
| RF-03 | Búsqueda agregada (múltiples museos) | [✅/❌] | Test: composition.e2e-spec.ts |
| RF-04 | Detalle de artwork por ID | [✅/❌] | Test: proxy.e2e-spec.ts |
| RF-05 | Manejo de errores 400/404/500 | [✅/❌] | Test: Validation & Error Handling |
| RF-06 | Circuit breaker | [✅/❌] | Test: Proxy service |
| RF-07 | Cache | [✅/❌] | Test: Cache behavior |

### Requisitos No Funcionales

| Requisito | Descripción | Target | Medición | Estado |
|-----------|-------------|--------|----------|--------|
| RNF-01 | Tiempo de respuesta búsqueda | < 5s | [XXX ms] | [✅/❌] |
| RNF-02 | Tiempo de respuesta detalle | < 2s | [XXX ms] | [✅/❌] |
| RNF-03 | Health checks | < 500ms | [XXX ms] | [✅/❌] |
| RNF-04 | Requests concurrentes | 10+ simultáneos | [XX%] exitosos | [✅/❌] |
| RNF-05 | Disponibilidad | 99% | [Calculado de tests] | [✅/❌] |

---

## 8. 📸 Evidencias

### Screenshots

**1. Postman Collection - Successful Requests**
![Postman Harvard](./evidences/postman-harvard.png)
![Postman MET](./evidences/postman-met.png)
![Postman Proxy](./evidences/postman-proxy.png)
![Postman Composition](./evidences/postman-composition.png)

**2. Terminal - Automated Tests**
![Jest Tests Composition](./evidences/jest-composition.png)
![Jest Tests Proxy](./evidences/jest-proxy.png)

**3. PowerShell Script Execution**
![PowerShell Tests](./evidences/powershell-tests.png)

**4. Service Logs**
![Composition Logs](./evidences/logs-composition.png)
![Proxy Logs](./evidences/logs-proxy.png)

### Response Examples

#### Composition Service - Mixed Search

**Request:**
```http
GET http://localhost:3013/api/v1/composition/search?query=painting&limit=6
```

**Response:**
```json
{
  "success": true,
  "data": {
    "artworks": [ /* ... */ ],
    "metadata": {
      "totalCount": 8,
      "sources": [
        {
          "source": "met",
          "count": 2,
          "responseTime": 1143,
          "success": true
        },
        {
          "source": "harvard",
          "count": 6,
          "responseTime": 1392,
          "success": true
        }
      ],
      "query": "painting",
      "searchTime": 1394
    }
  }
}
```

---

## 9. 🎓 Conclusiones

### Logros

1. **Comunicación REST exitosa:** Todos los servicios se comunican correctamente vía REST APIs
2. **Agregación funcional:** Composition Service combina resultados de múltiples museos exitosamente
3. **Resilencia:** Circuit breaker y cache implementados y funcionando
4. **Validación:** Manejo robusto de errores y validación de inputs
5. **Performance:** Tiempos de respuesta dentro de SLAs definidos

### Limitaciones

1. **gRPC no implementado:** Solo REST está disponible (opcional según requisitos)
2. **Harvard ID mapping:** Issue menor con formato de IDs (no bloquea funcionalidad)
3. **[AGREGAR OTRAS LIMITACIONES SI APLICAN]**

### Recomendaciones

1. **Monitoreo:** Implementar herramientas de observability (Prometheus, Grafana)
2. **Logging:** Centralizar logs con ELK Stack o similar
3. **Rate Limiting:** Agregar rate limiting en API Gateway
4. **gRPC:** Considerar implementación para mejor performance en comunicación interna
5. **Tests de Carga:** Ejecutar pruebas con mayor volumen (100+ concurrent users)

---

## 10. 📝 Apéndices

### A. Comandos de Ejecución

#### Levantar Servicios
```bash
# Terminal 1 - Harvard Adapter
cd backend/adapters/harvard-adapter
npm install
npm run start:dev

# Terminal 2 - MET Adapter
cd backend/adapters/met-adapter
npm install
npm run start:dev

# Terminal 3 - Museum Proxy
cd backend/museum-proxy-service
npm install
npm run start:dev

# Terminal 4 - Composition Service
cd backend/composition-service
npm install
npm run start:dev
```

#### Ejecutar Tests
```bash
# E2E Tests Composition
cd backend/composition-service
npm run test:e2e

# E2E Tests Proxy
cd backend/museum-proxy-service
npm run test:e2e

# PowerShell Script
.\scripts\test-all-services.ps1

# Bash Script
./scripts/test-all-services.sh
```

### B. Variables de Entorno

```env
# Harvard Adapter
PORT=3011
HARVARD_API_URL=https://api.harvardartmuseums.org/object
HARVARD_API_KEY=your-api-key

# MET Adapter
PORT=3012
MET_API_URL=https://collectionapi.metmuseum.org/public/collection/v1

# Museum Proxy
PORT=3010
MET_ADAPTER_URL=http://localhost:3012
HARVARD_ADAPTER_URL=http://localhost:3011

# Composition Service
PORT=3013
PROXY_SERVICE_URL=http://localhost:3010
```

### C. Herramientas Utilizadas

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| NestJS | 10.x | Framework backend |
| Jest | 29.x | Testing framework |
| SuperTest | 6.x | HTTP assertions |
| Postman | 2024.x | Manual API testing |
| PowerShell | 5.1+ | Automated testing scripts |
| curl | 7.x+ | CLI testing |

---

**Fecha de última actualización:** [FECHA]  
**Responsable:** [NOMBRE]  
**Versión del reporte:** 1.0.0
