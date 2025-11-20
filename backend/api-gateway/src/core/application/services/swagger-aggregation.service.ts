import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SwaggerAggregationService {
  private readonly logger = new Logger(SwaggerAggregationService.name);

  constructor(private readonly httpService: HttpService) {}

  async aggregateSwaggerDocs(): Promise<any> {
    this.logger.log('Starting Swagger documentation aggregation...');
    
    const services = [
      {
        name: 'Auth Service',
        url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
        basePath: '/auth',
      },
      {
        name: 'Composition Service',
        url: process.env.COMPOSITION_SERVICE_URL || 'http://composition-service:3002',
        basePath: '/composition',
      },
      {
        name: 'Museum Proxy Service',
        url: process.env.MUSEUM_PROXY_SERVICE_URL || 'http://museum-proxy:3010',
        basePath: '/proxy',
      },
    ];

    // Base Gateway Swagger document
    const aggregatedDoc: any = {
      openapi: '3.0.0',
      info: {
        title: 'AR Art Gallery API Gateway',
        description: 'Unified API Gateway aggregating all microservices',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'API Gateway',
        },
      ],
      tags: [
        { name: 'health', description: 'Health check endpoints' },
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'users', description: 'User management endpoints' },
        { name: 'composition', description: 'Artwork composition endpoints' },
        { name: 'proxy', description: 'Museum proxy endpoints' },
      ],
      paths: {},
      components: {
        securitySchemes: {
          'JWT-auth': {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter JWT token',
          },
        },
        schemas: {},
      },
    };

    // Add Gateway's own health endpoint
    aggregatedDoc.paths['/health'] = {
      get: {
        tags: ['health'],
        summary: 'API Gateway Health Check',
        description: 'Check the health status of API Gateway and all microservices',
        responses: {
          '200': {
            description: 'Health status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number' },
                    services: {
                      type: 'object',
                      additionalProperties: {
                        type: 'object',
                        properties: {
                          status: { type: 'string', enum: ['up', 'down'] },
                          url: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    // Fetch and merge Swagger docs from each microservice
    for (const service of services) {
      try {
        this.logger.log(`Fetching Swagger docs from ${service.name} at ${service.url}/api/docs-json`);
        
        const response = await firstValueFrom(
          this.httpService.get(`${service.url}/api/docs-json`, {
            timeout: 5000,
          })
        );

        const serviceDocs = response.data;
        this.logger.log(`Received ${JSON.stringify(serviceDocs).length} bytes from ${service.name}`);

        // Merge paths with basePath prefix
        if (serviceDocs.paths) {
          const pathCount = Object.keys(serviceDocs.paths).length;
          this.logger.log(`Merging ${pathCount} paths from ${service.name}`);
          Object.keys(serviceDocs.paths).forEach((path) => {
            const prefixedPath = `${service.basePath}${path}`;
            aggregatedDoc.paths[prefixedPath] = serviceDocs.paths[path];
          });
        }

        // Merge schemas
        if (serviceDocs.components?.schemas) {
          const schemaCount = Object.keys(serviceDocs.components.schemas).length;
          this.logger.log(`Merging ${schemaCount} schemas from ${service.name}`);
          aggregatedDoc.components.schemas = {
            ...aggregatedDoc.components.schemas,
            ...serviceDocs.components.schemas,
          };
        }

        this.logger.log(`Successfully aggregated Swagger docs from ${service.name}`);
      } catch (error: any) {
        this.logger.error(`Failed to fetch Swagger docs from ${service.name}: ${error?.message || 'Unknown error'}`, error?.stack);
        
        // Add placeholder for unavailable service
        aggregatedDoc.paths[`${service.basePath}/health`] = {
          get: {
            tags: [service.basePath.replace('/', '')],
            summary: `${service.name} Health Check`,
            description: `Service currently unavailable. Check ${service.url}`,
            responses: {
              '503': {
                description: 'Service unavailable',
              },
            },
          },
        };
      }
    }

    const totalPaths = Object.keys(aggregatedDoc.paths).length;
    this.logger.log(`Aggregation complete. Total paths: ${totalPaths}`);
    
    return aggregatedDoc;
  }
}
