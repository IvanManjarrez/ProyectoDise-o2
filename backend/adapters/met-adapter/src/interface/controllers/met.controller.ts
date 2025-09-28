import { Controller, Get, Query, Param, ValidationPipe, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SearchMetArtworksUseCase } from '../../core/application/usecases/search-met-artworks.usecase';
import { MetSearchRequestDto } from '../../core/application/dto/met-request.dto';
import { MetSearchResponseDto, MetArtworkResponseDto } from '../../core/application/dto/met-response.dto';

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