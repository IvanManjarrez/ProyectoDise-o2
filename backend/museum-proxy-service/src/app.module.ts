import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

// Controllers
import { ProxyController } from './interface/controllers/proxy.controller';

// Use Cases
import { ProxyMuseumRequestUseCase } from './core/application/usecases/proxy-museum-request.usecase';

// Infrastructure
import { LouvreHttpRepository, MetHttpRepository } from './core/infrastructure/external/http-museum-adapter.client';
import { CircuitBreakerService } from './core/infrastructure/circuit-breaker/circuit-breaker.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        }),
        ttl: 600000, // 10 minutes in milliseconds
      }),
    }),
  ],
  controllers: [ProxyController],
  providers: [
    ProxyMuseumRequestUseCase,
    {
      provide: 'LOUVRE_REPOSITORY',
      useClass: LouvreHttpRepository,
    },
    {
      provide: 'MET_REPOSITORY',
      useClass: MetHttpRepository,
    },
    {
      provide: 'CIRCUIT_BREAKER_PORT',
      useClass: CircuitBreakerService,
    },
  ],
})
export class AppModule {}