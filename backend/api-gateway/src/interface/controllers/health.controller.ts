import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../decorators/public.decorator';
import axios from 'axios';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @SkipThrottle()
  @ApiOperation({ 
    summary: 'Health Check',
    description: 'Verifica el estado del API Gateway y la conectividad con servicios downstream'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API Gateway está funcionando correctamente',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-11-19T00:00:00.000Z',
        uptime: 123.456,
        services: {
          'auth-service': { status: 'up', url: 'http://localhost:3001' },
          'composition-service': { status: 'up', url: 'http://localhost:3002' },
          'museum-proxy-service': { status: 'up', url: 'http://localhost:3010' }
        }
      }
    }
  })
  async check() {
    const services = {
      'auth-service': {
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        healthPath: '/health'
      },
      'composition-service': {
        url: process.env.COMPOSITION_SERVICE_URL || 'http://localhost:3002',
        healthPath: '/api/v1/composition/health'
      },
      'museum-proxy-service': {
        url: process.env.MUSEUM_PROXY_SERVICE_URL || 'http://localhost:3010',
        healthPath: '/api/v1/proxy/health'
      }
    };

    const serviceStatus: Record<string, any> = {};

    for (const [name, config] of Object.entries(services)) {
      try {
        const response = await axios.get(`${config.url}${config.healthPath}`, { timeout: 2000 });
        serviceStatus[name] = {
          status: response.status === 200 ? 'up' : 'down',
          url: config.url
        };
      } catch (error: any) {
        serviceStatus[name] = {
          status: 'down',
          url: config.url,
          error: error.message
        };
      }
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: serviceStatus
    };
  }
}
