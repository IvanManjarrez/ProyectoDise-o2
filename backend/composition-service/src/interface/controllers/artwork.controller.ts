import { Controller, Get, Query, Param, HttpException, HttpStatus, Headers } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery, 
  ApiParam,
  ApiResponse,
  ApiProduces
} from '@nestjs/swagger';
import { CompositionSearchUseCase } from '../../core/application/usecases/composition-search.usecase';
import { GetArtworkDetailUseCase } from '../../core/application/usecases/get-artwork-detail.usecase';
import { CompositionSearchDto } from '../../core/application/dto/composition-search.dto';

/**
 * Composition Service Controller
 * Orquesta búsquedas entre múltiples museos y servicios de arte
 * 
 * Base path: /api/v1/composition
 */
@ApiTags('composition')
@Controller('api/v1/composition')
export class ArtworkController {
  constructor(
    private readonly compositionSearchUseCase: CompositionSearchUseCase,
    private readonly getArtworkDetailUseCase: GetArtworkDetailUseCase,
  ) {}

  /**
   * Health check del Composition Service
   * GET /api/v1/composition/health
   */
  @Get('health')
  @ApiTags('health')
  @ApiOperation({ 
    summary: 'Verificar estado de salud del Composition Service',
    description: `
      Endpoint de monitoreo que verifica el estado del servicio de composición.
      
      Información proporcionada:
      - Estado del servicio
      - Timestamp actual
      - Versión del servicio
      - Información del entorno
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de salud del servicio'
  })
  @ApiProduces('application/json')
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'composition-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Buscar obras de arte en múltiples museos
   * GET /api/v1/composition/search?query=monet&museums=met,harvard&limit=20
   */
  @Get('search')
  @ApiOperation({ 
    summary: 'Buscar obras de arte en múltiples museos',
    description: `
      Orquesta búsquedas simultáneas en múltiples museos y consolida los resultados.
      
      Características:
      - Búsqueda paralela en múltiples APIs de museos
      - Consolidación y unificación de resultados
      - Filtrado por museos específicos
      - Cache inteligente para optimizar rendimiento
      - Ranking y ordenamiento de relevancia
      
      Museos soportados:
      - MET (Metropolitan Museum of Art)
      - Harvard Art Museums
    `
  })
  @ApiQuery({ 
    name: 'query', 
    description: 'Término de búsqueda para encontrar obras de arte',
    example: 'monet',
    required: true
  })
  @ApiQuery({ 
    name: 'museums', 
    description: 'Museos a incluir en la búsqueda (separados por coma)',
    example: 'met,harvard',
    required: false
  })
  @ApiQuery({ 
    name: 'limit', 
    description: 'Número máximo de resultados por museo',
    example: '20',
    required: false,
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados consolidados de múltiples museos'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de búsqueda inválidos' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  @ApiProduces('application/json')
  async searchArtworks(@Query() query: CompositionSearchDto, @Headers('authorization') authorization?: string) {
    try {
      // Validación básica
      if (!query.query || query.query.trim() === '') {
        throw new HttpException(
          {
            error: 'Query parameter is required',
            message: 'Please provide a search query',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

  const result = await this.compositionSearchUseCase.execute(query, authorization);
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Error in searchArtworks:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      throw new HttpException(
        {
          error: 'Internal server error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener detalles de obra específica
   * GET /api/v1/composition/artworks/12345?museum=met
   */
  @Get('artworks/:id')
  @ApiOperation({ 
    summary: 'Obtener información detallada de una obra específica',
    description: `
      Recupera información completa de una obra de arte específica desde el museo indicado.
      
      Información incluida:
      - Detalles completos de la obra
      - Información del artista
      - Historia y proveniencia
      - Imágenes en alta resolución
      - Metadatos técnicos
      - Información de exhibición
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único de la obra de arte',
    example: '436532',
    type: 'string'
  })
  @ApiQuery({ 
    name: 'museum', 
    description: 'Museo del cual obtener la obra',
    example: 'met',
    enum: ['met', 'harvard'],
    required: false
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información detallada de la obra de arte'
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
    status: 500, 
    description: 'Error interno del servidor' 
  })
  @ApiProduces('application/json')
  async getArtworkDetail(
    @Param('id') id: string,
    @Query('museum') museum: 'met' | 'harvard' = 'met',
    @Headers('authorization') authorization?: string,
  ) {
    try {
      if (!museum || (museum !== 'met' && museum !== 'harvard')) {
        throw new HttpException(
          {
            error: 'Invalid museum parameter',
            message: 'Museum must be "met" or "harvard"',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

  const result = await this.getArtworkDetailUseCase.execute({ id, museum }, authorization);
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Error in getArtworkDetail:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      if (error instanceof Error && error.message?.includes('not found')) {
        throw new HttpException(
          {
            error: 'Artwork not found',
            message: `Artwork with id ${id} not found`,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      throw new HttpException(
        {
          error: 'Internal server error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}