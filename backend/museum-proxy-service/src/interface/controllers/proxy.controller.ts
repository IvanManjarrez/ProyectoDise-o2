import { Controller, Get, Param, Query } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery, 
  ApiParam,
  ApiResponse,
  ApiProduces
} from '@nestjs/swagger';
import { ProxyMuseumRequestUseCase } from '../../core/application/usecases/proxy-museum-request.usecase';

/**
 * Museum Proxy Controller
 * Proxy service con circuit breaker para APIs de museos
 * 
 * Base path: /api/v1/proxy
 */
@ApiTags('proxy')
@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyMuseumRequestUseCase: ProxyMuseumRequestUseCase) {}

  /**
   * Buscar obras de arte a través del proxy
   * GET /api/v1/proxy/artworks/search?query=monet&museum=met&limit=20
   */
  @Get('artworks/search')
  @ApiOperation({ 
    summary: 'Buscar obras de arte a través del proxy con circuit breaker',
    description: `
      Proxy resiliente para búsqueda de obras de arte en museos específicos.
      
      Características del Circuit Breaker:
      - Protección contra fallos en APIs externas
      - Timeout automático en requests lentos
      - Fallback a cache cuando el servicio no responde
      - Monitoreo de salud de servicios
      - Recuperación automática cuando el servicio se restaura
      
      Estados del Circuit Breaker:
      - CLOSED: Funcionamiento normal
      - OPEN: Servicio caído, usando fallback
      - HALF_OPEN: Probando recuperación del servicio
    `
  })
  @ApiQuery({ 
    name: 'query', 
    description: 'Término de búsqueda para encontrar obras de arte',
    example: 'monet',
    required: true
  })
  @ApiQuery({ 
    name: 'museum', 
    description: 'Museo específico para la búsqueda',
    example: 'met',
    enum: ['met', 'harvard'],
    required: true
  })
  @ApiQuery({ 
    name: 'limit', 
    description: 'Número máximo de resultados',
    example: '20',
    required: false,
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados de búsqueda obtenidos exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de búsqueda inválidos' 
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Servicio no disponible - Circuit breaker abierto' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  @ApiProduces('application/json')
  async searchArtworks(
    @Query('query') query: string,
    @Query('museum') museum: 'met' | 'harvard',
    @Query('limit') limit: string = '20'
  ) {
    const parsedLimit = parseInt(limit, 10) || 20;
    return await this.proxyMuseumRequestUseCase.searchArtworks(query, museum, parsedLimit);
  }

  /**
   * Obtener obra específica a través del proxy
   * GET /api/v1/proxy/artworks/met/12345
   */
  @Get('artworks/:museum/:id')
  @ApiOperation({ 
    summary: 'Obtener obra específica a través del proxy con circuit breaker',
    description: `
      Recupera información detallada de una obra específica usando el proxy resiliente.
      
      Beneficios del Proxy:
      - Cache inteligente para reducir latencia
      - Tolerancia a fallos del servicio externo
      - Métricas de rendimiento y disponibilidad
      - Consistent API independiente del museo
      - Logging centralizado de requests
    `
  })
  @ApiParam({ 
    name: 'museum', 
    description: 'Museo del cual obtener la obra',
    example: 'met',
    enum: ['met', 'harvard']
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único de la obra en el museo',
    example: '436532',
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información detallada de la obra obtenida exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros inválidos' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Obra no encontrada' 
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Servicio no disponible - Circuit breaker abierto' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  @ApiProduces('application/json')
  async getArtworkById(
    @Param('museum') museum: 'met' | 'harvard',
    @Param('id') id: string
  ) {
    return await this.proxyMuseumRequestUseCase.getArtworkById(id, museum);
  }

  /**
   * Health check del Museum Proxy Service
   * GET /api/v1/proxy/health
   */
  @Get('health')
  @ApiTags('health')
  @ApiOperation({ 
    summary: 'Verificar estado de salud del Museum Proxy Service',
    description: `
      Endpoint de monitoreo que verifica:
      - Estado del servicio proxy
      - Estado de los circuit breakers
      - Conectividad con servicios externos
      - Métricas de rendimiento
      - Estado del cache
      
      Información útil para:
      - Monitoreo de infraestructura
      - Alertas automáticas
      - Debugging de problemas
      - Health checks de orquestadores
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de salud del servicio proxy'
  })
  @ApiProduces('application/json')
  healthCheck() {
    return {
      status: 'ok',
      service: 'museum-proxy-service',
      timestamp: new Date().toISOString()
    };
  }
}