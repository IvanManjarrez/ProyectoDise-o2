import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Starting Composition Service...');
  
  try {
    const app = await NestFactory.create(AppModule);

    // Configurar validación global
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Configurar CORS si es necesario
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Configuración de Swagger/OpenAPI
    console.log('Configurando documentación OpenAPI...');
    
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Composition Service API')
      .setDescription('Servicio principal de composición para AR Art Gallery - Orquesta búsquedas entre múltiples museos')
      .setVersion('1.0.0')
      .addTag('composition', 'Endpoints de composición y orquestación')
      .addTag('health', 'Endpoints de monitoreo y salud')
      .build();
    
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, swaggerDocument, {
      jsonDocumentUrl: '/api/docs-json',
    });
    
    console.log('Swagger configurado en /api/docs');

    const port = process.env.PORT || 3002;
    await app.listen(port);

    console.log(`Composition Service running on port ${port}`);
    console.log(`Museum Proxy URL: ${process.env.MUSEUM_PROXY_URL || 'http://localhost:3010'}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Documentation: http://localhost:${port}/api/docs`);
    console.log(`Available endpoints:`);
    console.log(`GET http://localhost:${port}/api/v1/composition/health`);
    console.log(`GET http://localhost:${port}/api/v1/composition/search?query=monet&museums=met&limit=20`);
    console.log(`GET http://localhost:${port}/api/v1/composition/artworks/:id?museum=met`);
    console.log(`Service ready to handle requests!`);

  } catch (error) {
    console.error('Failed to start Composition Service:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap();