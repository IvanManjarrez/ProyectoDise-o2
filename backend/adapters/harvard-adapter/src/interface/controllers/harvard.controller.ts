import { 
  Controller, 
  Get, 
  Query, 
  Param, 
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery, 
  ApiParam,
  ApiResponse,
  ApiProduces
} from '@nestjs/swagger';
import { SearchHarvardArtworksUseCase } from '../../core/application/usecases/search-harvard-artworks.usecase';
import { 
  HarvardSearchResponseDTO,
  HarvardArtworkResponseDTO,
  HarvardDivisionDTO,
  HarvardClassificationDTO,
  HarvardCultureDTO,
  HarvardHealthResponseDTO,
} from '../../core/application/dto/harvard-search.dto';

/**
 * Harvard Art Museums Controller
 * Endpoints REST para acceso a Harvard Art Museums API
 * 
 * Base path: /api/v1/harvard
 */
@ApiTags('harvard')
@Controller('api/v1/harvard')
export class HarvardController {
  private readonly logger = new Logger(HarvardController.name);

  constructor(
    private readonly searchHarvardArtworksUseCase: SearchHarvardArtworksUseCase,
  ) {}

  /**
   * Buscar obras de arte
   * GET /api/v1/harvard/search?q=monet&limit=10
   */
  @Get('search')
  @ApiOperation({ 
    summary: 'Buscar obras de arte',
    description: `
      Permite buscar obras de arte en la colección del Harvard Art Museums.
      
      **Ejemplos de búsqueda:**
      - \`monet\` - Busca obras de Claude Monet
      - \`paintings\` - Busca pinturas
      - \`impressionist\` - Busca arte impresionista
      - \`portrait\` - Busca retratos
      
      **Características:**
      - Búsqueda full-text en título, artista y descripción
      - Resultados ordenados por relevancia
      - Incluye imágenes cuando están disponibles
      - Respuesta optimizada para AR Gallery
    `
  })
  @ApiQuery({ 
    name: 'q', 
    description: 'Término de búsqueda (artista, obra, estilo, etc.)',
    example: 'monet',
    required: true
  })
  @ApiQuery({ 
    name: 'limit', 
    description: 'Número máximo de resultados a devolver',
    example: '10',
    required: false,
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de obras de arte encontradas',
    type: HarvardSearchResponseDTO
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
    @Query('q') q: string,
    @Query('limit') limit?: string
  ): Promise<HarvardSearchResponseDTO> {
    try {
      this.logger.log(`🔍 Searching artworks with query: "${q}", limit: ${limit || '10'}`);
      
      // Validar parámetros básicos
      if (!q || q.trim().length < 2) {
        throw new HttpException(
          'Query parameter "q" must be at least 2 characters long',
          HttpStatus.BAD_REQUEST
        );
      }

      // Convertir limit a número
      const numLimit = limit ? parseInt(limit, 10) : 10;
      if (isNaN(numLimit) || numLimit < 1 || numLimit > 100) {
        throw new HttpException(
          'Limit must be a number between 1 and 100',
          HttpStatus.BAD_REQUEST
        );
      }

      // Ejecutar búsqueda básica
      const result = await this.searchHarvardArtworksUseCase.execute(q.trim(), numLimit);

      // Convertir entidades a DTOs
      const artworksDTO = result.artworks.map(artwork => new HarvardArtworkResponseDTO({
        objectId: artwork.objectId,
        title: artwork.title,
        artistName: artwork.artistName,
        imageUrl: artwork.imageUrl,
        department: artwork.department,
        culture: artwork.culture,
        period: artwork.period,
        century: artwork.century,
        dated: artwork.dated,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        isPublicDomain: artwork.isPublicDomain,
        objectURL: artwork.objectURL,
        tags: artwork.tags,
        description: artwork.description,
        accessionNumber: artwork.accessionNumber,
        classification: artwork.classification,
        technique: artwork.technique,
        provenance: artwork.provenance,
        copyright: artwork.copyright,
        museum: 'Harvard Art Museums',
        hasImage: artwork.hasImage(),
      }));

      const response = new HarvardSearchResponseDTO({
        query: result.query,
        total: result.total,
        objectIDs: result.objectIDs,
        artworks: artworksDTO,
        executionTimeMs: result.executionTimeMs,
        limit: numLimit,
      });

      this.logger.log(`Search completed: ${artworksDTO.length} artworks returned`);
      return response;

    } catch (error) {
      this.logger.error(`Search failed:`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Search failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener obra específica por ID
   * GET /api/v1/harvard/artwork/123456
   */
  @Get('artwork/:id')
  async getArtworkById(@Param('id') id: string): Promise<HarvardArtworkResponseDTO> {
    try {
      this.logger.log(` Fetching artwork with ID: ${id}`);

      // Validar ID
      if (!id || isNaN(parseInt(id))) {
        throw new HttpException(
          'Invalid artwork ID. Must be a number.',
          HttpStatus.BAD_REQUEST
        );
      }

      const artwork = await this.searchHarvardArtworksUseCase.getArtworkById(id);

      if (!artwork) {
        throw new HttpException(
          `Artwork with ID ${id} not found`,
          HttpStatus.NOT_FOUND
        );
      }

      const response = new HarvardArtworkResponseDTO({
        objectId: artwork.objectId,
        title: artwork.title,
        artistName: artwork.artistName,
        imageUrl: artwork.imageUrl,
        department: artwork.department,
        culture: artwork.culture,
        period: artwork.period,
        century: artwork.century,
        dated: artwork.dated,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        isPublicDomain: artwork.isPublicDomain,
        objectURL: artwork.objectURL,
        tags: artwork.tags,
        description: artwork.description,
        accessionNumber: artwork.accessionNumber,
        classification: artwork.classification,
        technique: artwork.technique,
        provenance: artwork.provenance,
        copyright: artwork.copyright,
        museum: 'Harvard Art Museums',
        hasImage: artwork.hasImage(),
      });

      this.logger.log(` Artwork retrieved: "${artwork.title}"`);
      return response;

    } catch (error) {
      this.logger.error(` Failed to fetch artwork ${id}:`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Failed to fetch artwork: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener divisiones disponibles
   * GET /api/v1/harvard/divisions
   */
  @Get('divisions')
  async getDivisions(): Promise<HarvardDivisionDTO[]> {
    try {
      this.logger.log(' Fetching Harvard divisions');

      const divisions = await this.searchHarvardArtworksUseCase.getDivisions();
      const response = divisions.map(div => new HarvardDivisionDTO(div.divisionId, div.name));

      this.logger.log(` Retrieved ${response.length} divisions`);
      return response;

    } catch (error) {
      this.logger.error(' Failed to fetch divisions:', error.message);
      throw new HttpException(
        `Failed to fetch divisions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener clasificaciones disponibles
   * GET /api/v1/harvard/classifications
   */
  @Get('classifications')
  async getClassifications(): Promise<HarvardClassificationDTO[]> {
    try {
      this.logger.log('Fetching Harvard classifications');

      const classifications = await this.searchHarvardArtworksUseCase.getClassifications();
      const response = classifications.map(cls => new HarvardClassificationDTO(cls.classificationId, cls.name));

      this.logger.log(`Retrieved ${response.length} classifications`);
      return response;

    } catch (error) {
      this.logger.error('Failed to fetch classifications:', error.message);
      throw new HttpException(
        `Failed to fetch classifications: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener culturas disponibles
   * GET /api/v1/harvard/cultures
   */
  @Get('cultures')
  async getCultures(): Promise<HarvardCultureDTO[]> {
    try {
      this.logger.log('Fetching Harvard cultures');

      const cultures = await this.searchHarvardArtworksUseCase.getCultures();
      const response = cultures.map(culture => new HarvardCultureDTO(culture.cultureId, culture.name));

      this.logger.log(`Retrieved ${response.length} cultures`);
      return response;

    } catch (error) {
      this.logger.error('Failed to fetch cultures:', error.message);
      throw new HttpException(
        `Failed to fetch cultures: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Health Check del servicio
   * GET /api/v1/harvard/health
   */
  @Get('health')
  @ApiTags('health')
  @ApiOperation({ 
    summary: 'Health check del servicio',
    description: `
      Verifica el estado de salud del adaptador Harvard y su conectividad con la API externa.
      
      **Qué verifica:**
      - Conectividad con Harvard Art Museums API
      - Tiempo de respuesta del servicio
      - Estado general del microservicio
      
      **Respuesta típica:**
      - \`healthy\`: Servicio funcionando correctamente
      - \`unhealthy\`: Problemas de conectividad o configuración
      - \`responseTime\`: Tiempo en millisegundos de la verificación
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de salud del servicio',
    type: HarvardHealthResponseDTO
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error al verificar estado de salud' 
  })
  @ApiProduces('application/json')
  async healthCheck(): Promise<HarvardHealthResponseDTO> {
    try {
      const startTime = Date.now();
      this.logger.log('Performing health check');

      const isHealthy = await this.searchHarvardArtworksUseCase.checkHealth();
      const responseTime = Date.now() - startTime;

      const response = new HarvardHealthResponseDTO(isHealthy, responseTime);

      this.logger.log(`Health check completed: ${response.status} (${responseTime}ms)`);
      return response;

    } catch (error) {
      this.logger.error('Health check failed:', error.message);
      
      const response = new HarvardHealthResponseDTO(false);
      return response;
    }
  }
}