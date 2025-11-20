import {
  Controller,
  All,
  Req,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { ProxyService } from '../../core/application/services/proxy.service';

@Controller()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(
    private readonly proxyService: ProxyService,
  ) {}

  @All('composition/*')
  @ApiBearerAuth('JWT-auth')
  @ApiTags('Composition')
  @ApiOperation({ summary: 'Proxy to Composition Service (Protected)' })
  @ApiResponse({ status: 200, description: 'Request forwarded successfully' })
  @ApiResponse({ status: 502, description: 'Bad Gateway' })
  @ApiResponse({ status: 503, description: 'Service Unavailable' })
  @ApiResponse({ status: 504, description: 'Gateway Timeout' })
  async proxyComposition(@Req() req: Request, @Res() res: Response) {
    try {
      const serviceUrl = this.proxyService.getServiceUrl('composition');
      
      // Extraer la ruta después de "composition/"
      const path = req.url.replace('/composition', '');

      const result = await this.proxyService.forwardRequest(
        serviceUrl,
        path,
        req.method,
        req.body,
        req.headers as Record<string, any>,
        req.query as Record<string, any>,
      );

      res.status(result.status).json(result.data);
    } catch (error: any) {
      this.logger.error('Error proxying to composition service', error);
      res.status(error?.status || HttpStatus.BAD_GATEWAY).json(error?.response);
    }
  }

  @All('proxy/*')
  @ApiBearerAuth('JWT-auth')
  @ApiTags('Museum Proxy')
  @ApiOperation({ summary: 'Proxy to Museum Proxy Service (Protected)' })
  @ApiResponse({ status: 200, description: 'Request forwarded successfully' })
  @ApiResponse({ status: 502, description: 'Bad Gateway' })
  @ApiResponse({ status: 503, description: 'Service Unavailable' })
  @ApiResponse({ status: 504, description: 'Gateway Timeout' })
  async proxyMuseum(@Req() req: Request, @Res() res: Response) {
    try {
      const serviceUrl = this.proxyService.getServiceUrl('museum-proxy');
      
      // Extraer la ruta después de "proxy/"
      const path = req.url.replace('/proxy', '');

      const result = await this.proxyService.forwardRequest(
        serviceUrl,
        path,
        req.method,
        req.body,
        req.headers as Record<string, any>,
        req.query as Record<string, any>,
      );

      res.status(result.status).json(result.data);
    } catch (error: any) {
      this.logger.error('Error proxying to museum proxy service', error);
      res.status(error?.status || HttpStatus.BAD_GATEWAY).json(error?.response);
    }
  }

  @All('auth/register')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Register new user (Public) - Rate limit: 3/min' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  async authRegister(@Req() req: Request, @Res() res: Response) {
    return this.proxyAuth(req, res);
  }

  @All('auth/login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Login user (Public) - Rate limit: 5/min' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  async authLogin(@Req() req: Request, @Res() res: Response) {
    return this.proxyAuth(req, res);
  }

  @All('auth/*')
  @ApiBearerAuth('JWT-auth')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Proxy to Auth Service (Protected)' })
  @ApiResponse({ status: 200, description: 'Request forwarded successfully' })
  @ApiResponse({ status: 502, description: 'Bad Gateway' })
  @ApiResponse({ status: 503, description: 'Service Unavailable' })
  @ApiResponse({ status: 504, description: 'Gateway Timeout' })
  async proxyAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const serviceUrl = this.proxyService.getServiceUrl('auth');
      
      // Extraer la ruta después de "auth/"
      const path = req.url.replace('/auth', '');

      const result = await this.proxyService.forwardRequest(
        serviceUrl,
        path,
        req.method,
        req.body,
        req.headers as Record<string, any>,
        req.query as Record<string, any>,
      );

      res.status(result.status).json(result.data);
    } catch (error: any) {
      this.logger.error('Error proxying to auth service', error);
      res.status(error?.status || HttpStatus.BAD_GATEWAY).json(error?.response);
    }
  }
}
