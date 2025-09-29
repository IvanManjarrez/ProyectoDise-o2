import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Use Cases
import { SearchHarvardArtworksUseCase } from './core/application/usecases/search-harvard-artworks.usecase';

// Infrastructure
import { HarvardHttpClient } from './core/infrastructure/external/harvard-http.client';

// Controllers
import { HarvardController } from './interface/controllers/harvard.controller';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,          // Disponible en toda la app
      envFilePath: '.env',     // Lee el archivo .env
      cache: true,             // Cachea para mejor performance
    }),
    
    // Módulo HTTP para hacer requests externos
    HttpModule.register({
      timeout: 5000,           // Timeout por defecto
      maxRedirects: 5,         // Máximo de redirects
    }),
  ],
  
  // Controllers - puntos de entrada REST
  controllers: [
    HarvardController, //  REST endpoints habilitados
  ],
  
  // Providers - servicios y dependencias
  providers: [
    // Use Cases (lógica de aplicación)
    SearchHarvardArtworksUseCase,
    
    // WIRING: Conectar interface con implementación
    {
      provide: 'HarvardApiRepository',    //  Token/nombre de la dependencia
      useClass: HarvardHttpClient,        //  Implementación concreta
    },
    
    // También registramos HarvardHttpClient directamente
    HarvardHttpClient,
  ],
  
  // Exports - qué servicios pueden usar otros módulos
  exports: [
    SearchHarvardArtworksUseCase,
    'HarvardApiRepository',
  ],
})
export class AppModule {}