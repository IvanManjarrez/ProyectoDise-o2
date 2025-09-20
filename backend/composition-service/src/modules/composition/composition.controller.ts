import { Controller, Get, Query, Param } from '@nestjs/common';
import { CompositionService } from './composition.service';

@Controller()
export class CompositionController {
  constructor(private readonly compositionService: CompositionService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      service: 'composition-service',
      timestamp: new Date().toISOString()
    };
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) {
      return {
        error: 'Query parameter "q" is required',
        results: [],
        total: 0
      };
    }

    return this.compositionService.searchArtworks(query);
  }

  @Get('artworks/:id')
  async getArtwork(@Param('id') id: string) {
    return this.compositionService.getArtworkById(id);
  }

  @Get('museums')
  async getMuseums() {
    return this.compositionService.getAllMuseums();
  }
}