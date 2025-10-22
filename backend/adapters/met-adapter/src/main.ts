import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SearchMetArtworksUseCase } from './core/application/usecases/search-met-artworks.usecase';

/**
 * PRODUCTION SERVER - Microservicio HTTP completo
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('# Starting MET Adapter microservice...');
    
    // Crear aplicación NestJS
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });
    
    // Obtener configuración
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3012);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    
    // Configurar pipes de validación global
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: nodeEnv === 'production',
    }));
    
    // Configurar CORS
    app.enableCors({
      origin: nodeEnv === 'development' ? '*' : false,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    
    // CONFIGURACIÓN DE SWAGGER/OPENAPI
    logger.log('# Configurando documentación OpenAPI...');
    
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Metropolitan Museum of Art API')
      .setDescription('Adaptador para búsqueda de obras de arte del Metropolitan Museum of Art')
      .setVersion('1.0.0')
      .addTag('met', 'Endpoints del Metropolitan Museum')
      .addTag('health', 'Endpoints de monitoreo y salud')
      .build();
    
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, swaggerDocument);
    
    logger.log('# Swagger configurado en /api/docs');

    // Iniciar servidor
    await app.listen(port);
    
    logger.log(`# MET Adapter running on port ${port}`);
    logger.log(`# Environment: ${nodeEnv}`);
    logger.log(`# MET API URL: ${configService.get('MET_API_BASE_URL')}`);
    logger.log(`# API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`# Available endpoints:`);
    logger.log(`  GET /api/v1/met/health`);
    logger.log(`  GET /api/v1/met/search?q=monet&limit=10`);
    logger.log(`  GET /api/v1/met/artwork/:id`);
    logger.log(`  GET /api/v1/met/departments`);
    
  } catch (error) {
    logger.error('# Failed to start MET Adapter:', error);
    process.exit(1);
  }
}

/**
 * WIRING TEST - Para verificar que todo funciona
 * Descomenta esta función y comenta bootstrap() para probar
 */
/*
async function testWiring() {
  const logger = new Logger('WiringTest');
  
  try {
    logger.log('# Starting NestJS application...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn'],
    });
    
    logger.log('# Application created successfully');
    
    const searchUseCase = app.get(SearchMetArtworksUseCase);
    logger.log('# SearchMetArtworksUseCase retrieved from DI container');
    
    logger.log('# Testing health check...');
    const isHealthy = await searchUseCase.checkHealth();
    logger.log(`# Health check result: ${isHealthy}`);
    
    logger.log('# Testing simple search...');
    const searchResult = await searchUseCase.execute('monet', 5);
    logger.log(`# Search completed - Found ${searchResult.total} results`);
    logger.log(`# Returned ${searchResult.artworks.length} detailed artworks`);
    logger.log(`# Execution time: ${searchResult.executionTimeMs}ms`);
    
    logger.log('# WIRING TEST SUCCESSFUL! All dependencies are properly injected');
    
    await app.close();
    logger.log('# Application closed');
    
  } catch (error) {
    logger.error('# WIRING TEST FAILED!');
    logger.error(`Error: ${error.message}`);
    logger.error('Stack:', error.stack);
    process.exit(1);
  }
}
*/

// # Iniciar servidor de producción
bootstrap();

// # Para probar wiring, descomenta la línea siguiente y comenta bootstrap():
// testWiring();