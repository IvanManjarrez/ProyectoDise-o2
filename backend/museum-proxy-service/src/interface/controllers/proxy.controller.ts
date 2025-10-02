import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProxyMuseumRequestUseCase } from '../../core/application/usecases/proxy-museum-request.usecase';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyMuseumRequestUseCase: ProxyMuseumRequestUseCase) {}

  @Get('artworks/search')
  async searchArtworks(
    @Query('query') query: string,
    @Query('museum') museum: 'met' | 'harvard',
    @Query('limit') limit: string = '20'
  ) {
    const parsedLimit = parseInt(limit, 10) || 20;
    return await this.proxyMuseumRequestUseCase.searchArtworks(query, museum, parsedLimit);
  }

  @Get('artworks/:museum/:id')
  async getArtworkById(
    @Param('museum') museum: 'met' | 'harvard',
    @Param('id') id: string
  ) {
    return await this.proxyMuseumRequestUseCase.getArtworkById(id, museum);
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'museum-proxy-service',
      timestamp: new Date().toISOString()
    };
  }
}