import { Controller, Get, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CompositionSearchUseCase } from '../../core/application/usecases/composition-search.usecase';
import { GetArtworkDetailUseCase } from '../../core/application/usecases/get-artwork-detail.usecase';
import { CompositionSearchDto } from '../../core/application/dto/composition-search.dto';

@Controller('api/v1/composition')
export class ArtworkController {
  constructor(
    private readonly compositionSearchUseCase: CompositionSearchUseCase,
    private readonly getArtworkDetailUseCase: GetArtworkDetailUseCase,
  ) {}

  @Get('health')
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'composition-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('search')
  async searchArtworks(@Query() query: CompositionSearchDto) {
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

      const result = await this.compositionSearchUseCase.execute(query);
      
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

  @Get('artworks/:id')
  async getArtworkDetail(
    @Param('id') id: string,
    @Query('museum') museum: 'met' = 'met',
  ) {
    try {
      if (!museum || museum !== 'met') {
        throw new HttpException(
          {
            error: 'Invalid museum parameter',
            message: 'Museum must be "met"',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.getArtworkDetailUseCase.execute({ id, museum });
      
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