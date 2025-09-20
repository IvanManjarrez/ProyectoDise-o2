import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom, retry, timeout, catchError } from 'rxjs';
import { AxiosResponse } from 'axios';

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

@Injectable()
export class ProxyService {
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private readonly FAILURE_THRESHOLD = 5;
  private readonly RESET_TIMEOUT = 60000; // 1 minute

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async proxyRequest(provider: string, endpoint: string, params: any): Promise<any> {
    const cacheKey = `${provider}:${endpoint}:${JSON.stringify(params)}`;
    
    // Check cache first
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Check circuit breaker
    if (!this.canExecute(provider)) {
      throw new Error(`Circuit breaker is OPEN for ${provider}`);
    }

    try {
      const result = await this.executeRequest(provider, endpoint, params);
      
      // Cache successful result
      await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes
      
      // Reset circuit breaker on success
      this.onSuccess(provider);
      
      return result;
    } catch (error) {
      this.onFailure(provider);
      throw error;
    }
  }

  private async executeRequest(provider: string, endpoint: string, params: any): Promise<any> {
    const url = this.buildUrl(provider, endpoint, params);
    
    const response$ = this.httpService.get(url).pipe(
      timeout(10000), // 10 second timeout
      retry({
        count: 3,
        delay: (error, retryIndex) => {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, retryIndex) * 1000;
          return new Promise(resolve => setTimeout(resolve, delay));
        }
      }),
      catchError((error) => {
        throw new Error(`External API error: ${error.message}`);
      })
    );

    const response: AxiosResponse = await firstValueFrom(response$);
    return response.data;
  }

  private buildUrl(provider: string, endpoint: string, params: any): string {
    const baseUrls = {
      louvre: process.env.LOUVRE_API_URL || 'https://api.louvre.fr',
      met: process.env.MET_API_URL || 'https://collectionapi.metmuseum.org/public/collection/v1',
      prado: process.env.PRADO_API_URL || 'https://api.museodelprado.es',
      sketchfab: process.env.SKETCHFAB_API_URL || 'https://api.sketchfab.com/v3',
      smithsonian: process.env.SMITHSONIAN_API_URL || 'https://api.si.edu/openaccess/api/v1.0'
    };

    const baseUrl = baseUrls[provider];
    if (!baseUrl) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    // Build URL based on endpoint and params
    switch (endpoint) {
      case 'search':
        return `${baseUrl}/search?q=${encodeURIComponent(params.query)}`;
      case 'artwork':
        return `${baseUrl}/objects/${params.id}`;
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  }

  private canExecute(provider: string): boolean {
    const breaker = this.getCircuitBreaker(provider);
    
    switch (breaker.state) {
      case 'CLOSED':
        return true;
      case 'OPEN':
        if (Date.now() - breaker.lastFailureTime > this.RESET_TIMEOUT) {
          breaker.state = 'HALF_OPEN';
          return true;
        }
        return false;
      case 'HALF_OPEN':
        return true;
      default:
        return true;
    }
  }

  private onSuccess(provider: string): void {
    const breaker = this.getCircuitBreaker(provider);
    breaker.failures = 0;
    breaker.state = 'CLOSED';
  }

  private onFailure(provider: string): void {
    const breaker = this.getCircuitBreaker(provider);
    breaker.failures++;
    breaker.lastFailureTime = Date.now();
    
    if (breaker.failures >= this.FAILURE_THRESHOLD) {
      breaker.state = 'OPEN';
    }
  }

  private getCircuitBreaker(provider: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(provider)) {
      this.circuitBreakers.set(provider, {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED'
      });
    }
    return this.circuitBreakers.get(provider)!;
  }
}