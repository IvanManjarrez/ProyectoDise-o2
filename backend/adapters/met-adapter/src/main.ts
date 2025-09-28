import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SearchMetArtworksUseCase } from './core/application/usecases/search-met-artworks.usecase';

async function testWiring() {
  const logger = new Logger('WiringTest');
  
  try {
    logger.log('# Starting NestJS application...');
    
    // Crear la aplicación NestJS
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn'],
    });
    
    logger.log('# Application created successfully');
    
    // Obtener el Use Case del container de dependencias
    const searchUseCase = app.get(SearchMetArtworksUseCase);
    logger.log('# SearchMetArtworksUseCase retrieved from DI container');
    
    // Probar health check (no requiere parámetros complejos)
    logger.log('# Testing health check...');
    const isHealthy = await searchUseCase.checkHealth();
    logger.log(`# Health check result: ${isHealthy}`);
    
    // Probar búsqueda simple
    logger.log('# Testing simple search...');
    const searchResult = await searchUseCase.execute('monet', 5);
    logger.log(`# Search completed - Found ${searchResult.total} results`);
    logger.log(`# Returned ${searchResult.artworks.length} detailed artworks`);
    logger.log(`# Execution time: ${searchResult.executionTimeMs}ms`);
    
    // Si llegamos aquí, el wiring funciona perfecto
    logger.log('# WIRING TEST SUCCESSFUL! All dependencies are properly injected');
    
    // Cerrar la aplicación
    await app.close();
    logger.log('# Application closed');
    
  } catch (error) {
    logger.error('# WIRING TEST FAILED!');
    logger.error(`Error: ${error.message}`);
    logger.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar el test
testWiring();