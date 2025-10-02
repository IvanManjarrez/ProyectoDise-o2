import { Injectable } from '@nestjs/common';
import { CachePort } from '../../application/ports/cache.port';

interface CacheItem<T> {
  value: T;
  expiry: number;
}

@Injectable()
export class MemoryCacheRepository implements CachePort {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTtl: number;

  constructor() {
    this.defaultTtl = parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10); // 5 minutos por defecto
    
    // Limpiar cache expirado cada 5 minutos
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiryTime = Date.now() + (ttl || this.defaultTtl) * 1000;
    
    this.cache.set(key, {
      value,
      expiry: expiryTime,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  // Método utilitario para limpiar entradas expiradas
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Método utilitario para obtener estadísticas del cache
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}