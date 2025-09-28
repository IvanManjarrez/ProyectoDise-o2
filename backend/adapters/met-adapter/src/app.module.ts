import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Use Cases
import { SearchMetArtworksUseCase } from './core/application/usecases/search-met-artworks.usecase';

// Infrastructure
import { MetHttpClient } from './core/infrastructure/external/met-http.client';

// Controllers
// import { MetController } from './interface/controllers/met.controller'; // TODO: Implementar controller

@Module({
  imports: [
    // 🌍 Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,          // Disponible en toda la app
      envFilePath: '.env',     // Lee el archivo .env
      cache: true,             // Cachea para mejor performance
    }),
    
    // 🌐 Módulo HTTP para hacer requests externos
    HttpModule.register({
      timeout: 5000,           // Timeout por defecto
      maxRedirects: 5,         // Máximo de redirects
    }),
  ],
  
  // 🎮 Controllers - puntos de entrada REST
  controllers: [
    // MetController, // TODO: Descomentar cuando se implemente el controller
  ],
  
  // 🔧 Providers - servicios y dependencias
  providers: [
    // Use Cases (lógica de aplicación)
    SearchMetArtworksUseCase,
    
    // 🔌 WIRING: Conectar interface con implementación
    {
      provide: 'MetApiRepository',    // 🏷️ Token/nombre de la dependencia
      useClass: MetHttpClient,        // 🔌 Implementación concreta
    },
    
    // También podemos registrar MetHttpClient directamente
    MetHttpClient,
  ],
  
  // 📤 Exports - qué servicios pueden usar otros módulos
  exports: [
    SearchMetArtworksUseCase,
    'MetApiRepository',
  ],
})
export class AppModule {}