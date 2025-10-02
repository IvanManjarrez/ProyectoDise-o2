import { Module } from '@nestjs/common';
import { ArtworkController } from './interface/controllers/artwork.controller';
import { CompositionSearchUseCase } from './core/application/usecases/composition-search.usecase';
import { GetArtworkDetailUseCase } from './core/application/usecases/get-artwork-detail.usecase';
import { MuseumProxyHttpRepository } from './core/infrastructure/repositories/museum-proxy-http.repository';
import { MemoryCacheRepository } from './core/infrastructure/repositories/memory-cache.repository';
import { MUSEUM_PROXY_PORT, CACHE_PORT } from './core/tokens';

@Module({
  imports: [],
  controllers: [ArtworkController],
  providers: [
    // Use cases
    CompositionSearchUseCase,
    GetArtworkDetailUseCase,
    
    // Repositories con tokens de inyección
    {
      provide: MUSEUM_PROXY_PORT,
      useClass: MuseumProxyHttpRepository,
    },
    {
      provide: CACHE_PORT,
      useClass: MemoryCacheRepository,
    },
  ],
})
export class AppModule {}