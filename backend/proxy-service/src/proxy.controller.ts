import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ProxyService } from './proxy.service';

@Controller('proxy')
@UseGuards(ThrottlerGuard)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      service: 'proxy-service',
      timestamp: new Date().toISOString()
    };
  }

  @Get(':provider/search')
  async proxySearch(
    @Param('provider') provider: string,
    @Query('q') query: string,
    @Query() filters: Record<string, any>
  ) {
    return this.proxyService.proxyRequest(provider, 'search', {
      query,
      filters
    });
  }

  @Get(':provider/artwork/:id')
  async getArtwork(
    @Param('provider') provider: string,
    @Param('id') id: string
  ) {
    return this.proxyService.proxyRequest(provider, 'artwork', { id });
  }
}