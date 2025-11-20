import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Reenvía una petición al servicio destino
   * @param serviceUrl URL base del servicio (ej: http://localhost:3002)
   * @param path Ruta completa de la petición original
   * @param method Método HTTP (GET, POST, PUT, DELETE, etc.)
   * @param body Cuerpo de la petición
   * @param headers Headers de la petición original
   * @param query Query parameters
   * @returns Respuesta del servicio destino
   */
  async forwardRequest(
    serviceUrl: string,
    path: string,
    method: string,
    body?: any,
    headers?: Record<string, any>,
    query?: Record<string, any>,
  ): Promise<any> {
    try {
      // Construir la URL completa
      const targetUrl = `${serviceUrl}${path}`;

      this.logger.log(`Proxying ${method} ${targetUrl}`);

      // Filtrar headers que no deben reenviarse
      const filteredHeaders = this.filterHeaders(headers);

      // Configuración de la petición
      const config: AxiosRequestConfig = {
        method: method.toLowerCase(),
        url: targetUrl,
        headers: filteredHeaders,
        params: query,
        data: body,
        timeout: 30000, // 30 segundos
        validateStatus: () => true, // No lanzar error por códigos de estado
      };

      // Realizar la petición
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.request(config),
      );

      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
      };
    } catch (error: any) {
      this.logger.error(
        `Error proxying request to ${serviceUrl}${path}`,
        error?.stack,
      );

      // Manejo de errores específicos
      if (error?.code === 'ECONNREFUSED') {
        throw new HttpException(
          {
            statusCode: 503,
            message: 'Service temporarily unavailable',
            error: 'Service Unavailable',
          },
          503,
        );
      }

      if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNABORTED') {
        throw new HttpException(
          {
            statusCode: 504,
            message: 'Gateway timeout',
            error: 'Gateway Timeout',
          },
          504,
        );
      }

      // Error genérico
      throw new HttpException(
        {
          statusCode: 502,
          message: 'Bad gateway',
          error: 'Bad Gateway',
        },
        502,
      );
    }
  }

  /**
   * Filtra headers que no deben reenviarse
   * @param headers Headers originales
   * @returns Headers filtrados
   */
  private filterHeaders(headers?: Record<string, any>): Record<string, any> {
    if (!headers) return {};

    const excludedHeaders = [
      'host',
      'connection',
      'content-length',
      'transfer-encoding',
    ];

    const filtered: Record<string, any> = {};

    Object.keys(headers).forEach((key) => {
      if (!excludedHeaders.includes(key.toLowerCase())) {
        filtered[key] = headers[key];
      }
    });

    return filtered;
  }

  /**
   * Obtiene la URL de un servicio desde la configuración
   * @param serviceName Nombre del servicio
   * @returns URL del servicio
   */
  getServiceUrl(serviceName: string): string {
    const serviceUrlMap: Record<string, string> = {
      auth: this.configService.get<string>('AUTH_SERVICE_URL') || '',
      composition:
        this.configService.get<string>('COMPOSITION_SERVICE_URL') || '',
      'museum-proxy':
        this.configService.get<string>('MUSEUM_PROXY_SERVICE_URL') || '',
    };

    const url = serviceUrlMap[serviceName];

    if (!url) {
      throw new Error(`Service URL not configured for: ${serviceName}`);
    }

    return url;
  }
}
