import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

// Controllers
import { ProxyController } from './interface/controllers/proxy.controller';

// Use Cases
import { ProxyMuseumRequestUseCase } from './core/application/usecases/proxy-museum-request.usecase';

// Infrastructure - Using HTTP repositories to connect with real adapters
import { MetHttpRepository } from './core/infrastructure/external/met-http.repository';
import { LouvreHttpRepository } from './core/infrastructure/external/louvre-http.repository';
import { MockLouvreRepository } from './core/infrastructure/external/mock-louvre.repository';
import { CircuitBreakerService } from './core/infrastructure/circuit-breaker/circuit-breaker.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.registerAsync({
      useFactory: async () => {
        try {
          return {
            store: await redisStore({
              socket: {
                host: 'localhost',
                port: 6379,
              },
            }),
            ttl: 600000, // 10 minutes in milliseconds
          };
        } catch (error) {
          console.warn('Redis not available, using memory cache:', error.message);
          // Fallback to memory cache if Redis is not available
          return {
            ttl: 600000,
          };
        }
      },
    }),
  ],
  controllers: [ProxyController],
  providers: [
    ProxyMuseumRequestUseCase,
    {
      provide: 'LOUVRE_REPOSITORY',
      useClass: LouvreHttpRepository, // HTTP repo with fallback to mock for missing adapter
    },
    {
      provide: 'MET_REPOSITORY', 
      useClass: MetHttpRepository, // HTTP repo connected to real MET adapter
    },
    {
      provide: 'CIRCUIT_BREAKER_PORT',
      useClass: CircuitBreakerService,
    },
  ],
})
export class AppModule {}