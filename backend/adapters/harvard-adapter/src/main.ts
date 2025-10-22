import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * PRODUCTION SERVER - Microservicio HTTP completo
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('# Starting Harvard Art Museums Adapter microservice...');
    
    // Crear aplicación NestJS
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });
    
    // Obtener configuración
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3013);
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
    
    // ===== CONFIGURACIÓN DE SWAGGER/OPENAPI =====
    logger.log('# Configurando documentación OpenAPI...');
    
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Harvard Art Museums API')
      .setDescription('Adaptador para búsqueda de obras de arte del Harvard Art Museums')
      .setVersion('1.0.0')
      .addTag('harvard', 'Endpoints del Harvard Art Museums')
      .addTag('health', 'Endpoints de monitoreo y salud')
      .build();
    
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, swaggerDocument);
    
    logger.log('# Swagger configurado en /api/docs');
    
    // Iniciar servidor
    await app.listen(port);
    
    logger.log(`# Harvard Art Museums Adapter running on port ${port}`);
    logger.log(`# Environment: ${nodeEnv}`);
    logger.log(`# Harvard API URL: ${configService.get('HARVARD_API_BASE_URL')}`);
    logger.log(`# API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`# Available endpoints:`);
    logger.log(`  GET /api/v1/harvard/health`);
    logger.log(`  GET /api/v1/harvard/search?q=monet&limit=10`);
    logger.log(`  GET /api/v1/harvard/artwork/:id`);
    logger.log(`  GET /api/v1/harvard/divisions`);
    logger.log(`  GET /api/v1/harvard/classifications`);
    logger.log(`  GET /api/v1/harvard/cultures`);
    
  } catch (error) {
    logger.error('# Failed to start Harvard Adapter:', error);
    process.exit(1);
  }
}

// Iniciar servidor de producción
bootstrap();