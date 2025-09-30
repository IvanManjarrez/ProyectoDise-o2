import { Injectable } from '@nestjs/common';
import { MuseumProxyPort } from '../../application/ports/museum-proxy.port';
import { CompositionArtwork } from '../../domain/entities/composition-artwork.entity';

@Injectable()
export class MuseumProxyHttpRepository implements MuseumProxyPort {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = process.env.MUSEUM_PROXY_URL || 'http://localhost:3010';
    this.timeout = parseInt(process.env.MUSEUM_PROXY_TIMEOUT || '5000', 10);
  }

  async searchArtworks(
    query: string, 
    museum: 'met', 
    limit: number = 20
  ): Promise<CompositionArtwork[]> {
    try {
      const url = `${this.baseUrl}/api/v1/proxy/artworks/search?query=${encodeURIComponent(query)}&museum=${museum}&limit=${limit}`;
      
      console.log(`🔍 Making request to: ${url}`);
      
      const response = await this.fetchWithTimeout(url);
      const data = await response.json();

      console.log(`📦 Raw response for ${museum}:`, JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(`Museum Proxy API error: ${response.status} - ${data.message || 'Unknown error'}`);
      }

      // La respuesta del Museum Proxy ahora tiene estructura directa: { success: true, data: [...], source: 'museum' }
      console.log(`🏛️ Museum data for ${museum}:`, JSON.stringify(data, null, 2));
      
      if (!data || !data.success) {
        console.warn(`❌ No data or failed response for museum ${museum}:`, data);
        return [];
      }

      // Convertir respuesta a entidades de dominio
      const artworks = data.data?.map((artwork: any) => 
        CompositionArtwork.fromMuseumProxy(artwork, museum)
      ) || [];

      console.log(`🎨 Processed artworks for ${museum}:`, artworks.length);
      
      return artworks;

    } catch (error) {
      console.error(`Error searching artworks in ${museum}:`, error);
      throw new Error(`Failed to search artworks in ${museum}: ${error.message}`);
    }
  }

  async getArtworkById(id: string, museum: 'met'): Promise<CompositionArtwork> {
    try {
      const url = `${this.baseUrl}/api/v1/proxy/artworks/${id}?museum=${museum}`;
      
      const response = await this.fetchWithTimeout(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Museum Proxy API error: ${response.status} - ${data.message || 'Unknown error'}`);
      }

      return CompositionArtwork.fromMuseumProxy(data, museum);

    } catch (error) {
      console.error(`Error getting artwork ${id} from ${museum}:`, error);
      throw new Error(`Failed to get artwork ${id} from ${museum}: ${error.message}`);
    }
  }

  async healthCheck(museum: 'met'): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/api/v1/proxy/health`;
      
      const response = await this.fetchWithTimeout(url);
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      console.log(`💊 Health check response for ${museum}:`, JSON.stringify(data, null, 2));
      
      // El Museum Proxy devuelve { status: "ok" } para indicar que está healthy
      // Asumimos que si el proxy está healthy, ambos museos están disponibles
      const isHealthy = data.status === 'ok' || data.status === 'healthy';
      
      console.log(`💊 Health check result for ${museum}: ${isHealthy}`);
      
      return isHealthy;

    } catch (error) {
      console.error(`Health check failed for ${museum}:`, error);
      return false;
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }
}