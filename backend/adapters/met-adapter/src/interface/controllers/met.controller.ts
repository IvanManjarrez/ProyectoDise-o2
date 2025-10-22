import { Controller, Get, Query, Param, ValidationPipe, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery, 
  ApiParam,
  ApiResponse,
  ApiProduces
} from '@nestjs/swagger';
import { SearchMetArtworksUseCase } from '../../core/application/usecases/search-met-artworks.usecase';
import { MetSearchRequestDto } from '../../core/application/dto/met-request.dto';
import { MetSearchResponseDto, MetArtworkResponseDto } from '../../core/application/dto/met-response.dto';

/**
 * Metropolitan Museum of Art Controller
 * Endpoints REST para acceso a MET Museum API
 * 
 * Base path: /api/v1/met
 */
@ApiTags('met')
@Controller('api/v1/met')
export class MetController {
  private readonly logger = new Logger(MetController.name);

  constructor(
    private readonly searchUseCase: SearchMetArtworksUseCase
  ) {}

  /**
   * Buscar obras de arte en MET Museum
   * GET /api/v1/met/search?q=monet&limit=10
   */
  @Get('search')
  @ApiOperation({ 
    summary: 'Buscar obras de arte en MET Museum',
    description: `
      Permite buscar obras de arte en la colección del Metropolitan Museum of Art.
      
      **Ejemplos de búsqueda:**
      - \`van gogh\` - Busca obras de Vincent van Gogh
      - \`egyptian\` - Busca arte egipcio
      - \`sculpture\` - Busca esculturas
      - \`portrait\` - Busca retratos
      
      **Características:**
      - Búsqueda full-text en título, artista y descripción
      - Acceso a más de 480,000 obras de arte
      - Imágenes de alta calidad cuando están disponibles
      - Metadatos ricos incluidos
    `
  })
  @ApiQuery({ 
    name: 'q', 
    description: 'Término de búsqueda (artista, obra, estilo, etc.)',
    example: 'van gogh',
    required: true
  })
  @ApiQuery({ 
    name: 'limit', 
    description: 'Número máximo de resultados a devolver (1-100)',
    example: '20',
    required: false,
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de obras de arte encontradas'
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
  async searchArtworks(
    @Query('q') query: string,
    @Query('limit') limit?: string
  ): Promise<MetSearchResponseDto> {
    try {
      // Validar parámetros
      if (!query || query.trim().length === 0) {
        throw new HttpException('Query parameter "q" is required', HttpStatus.BAD_REQUEST);
      }

      const limitNumber = limit ? parseInt(limit, 10) : 20;
      
      if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
        throw new HttpException('Limit must be a number between 1 and 100', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Searching artworks with query: "${query}", limit: ${limitNumber}`);
      
      const result = await this.searchUseCase.execute(query.trim(), limitNumber);
      
      this.logger.log(`Search completed: ${result.artworks.length} artworks returned`);
      return result;

    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Internal server error during search',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener obra específica por ID
   * GET /api/v1/met/artwork/12345
   */
  @Get('artwork/:id')
  @ApiOperation({ 
    summary: 'Obtener obra de arte específica por ID',
    description: `
      Recupera información detallada de una obra de arte específica usando su ID único del MET.
      
      **Información incluida:**
      - Título y descripción de la obra
      - Información del artista
      - Fecha de creación
      - Dimensiones y materiales
      - Departamento y cultura
      - Imágenes en alta resolución
      - Ubicación en el museo
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único de la obra en el MET Museum',
    example: '436532',
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información detallada de la obra de arte'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID de obra inválido' 
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
  async getArtwork(@Param('id') id: string): Promise<MetArtworkResponseDto> {
    try {
      const objectId = parseInt(id, 10);
      
      if (isNaN(objectId) || objectId <= 0) {
        throw new HttpException('Invalid artwork ID', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Fetching artwork with ID: ${objectId}`);
      
      const artwork = await this.searchUseCase.getArtworkById(objectId);
      
      if (!artwork) {
        throw new HttpException('Artwork not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(`Artwork ${objectId} retrieved successfully`);
      return artwork;

    } catch (error) {
      this.logger.error(`Get artwork failed: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Internal server error retrieving artwork',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener departamentos del MET
   * GET /api/v1/met/departments
   */
  @Get('departments')
  @ApiOperation({ 
    summary: 'Obtener lista de departamentos del MET',
    description: `
      Recupera todos los departamentos disponibles en el Metropolitan Museum of Art.
      
      **Departamentos típicos incluyen:**
      - American Decorative Arts
      - Ancient Near Eastern Art
      - Arms and Armor
      - Asian Art
      - Egyptian Art
      - European Paintings
      - Greek and Roman Art
      - Islamic Art
      - Medieval Art
      - Modern Art
      - Musical Instruments
      - Photographs
      - Prints and Drawings
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de departamentos disponibles'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  @ApiProduces('application/json')
  async getDepartments() {
    try {
      this.logger.log('Fetching MET departments');
      
      const departments = await this.searchUseCase.getDepartments();
      
      this.logger.log(`Retrieved ${departments.length} departments`);
      return {
        departments,
        total: departments.length
      };

    } catch (error) {
      this.logger.error(`Get departments failed: ${error.message}`);
      
      throw new HttpException(
        'Internal server error retrieving departments',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Health check del microservicio
   * GET /api/v1/met/health
   */
  @Get('health')
  @ApiTags('health')
  @ApiOperation({ 
    summary: 'Verificar estado de salud del MET Adapter',
    description: `
      Endpoint de monitoreo que verifica:
      - Estado del microservicio
      - Conectividad con la API del MET
      - Tiempo de respuesta
      - Información de versión
      
      **Estados posibles:**
      - \`healthy\`: Servicio operacional
      - \`unhealthy\`: Problemas detectados
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de salud del servicio'
  })
  @ApiProduces('application/json')
  async healthCheck() {
    try {
      const isHealthy = await this.searchUseCase.checkHealth();
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'met-adapter',
        version: '1.0.0',
        metApiConnection: isHealthy
      };

    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'met-adapter',
        version: '1.0.0',
        metApiConnection: false,
        error: error.message
      };
    }
  }
}