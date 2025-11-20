import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for development
  app.enableCors();
  
  // Global prefix
  app.setGlobalPrefix('api/v1');
  
  // Configuración de Swagger/OpenAPI
  console.log('Configurando documentación OpenAPI...');
  
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Museum Proxy Service API')
    .setDescription('Servicio proxy con circuit breaker para APIs de museos - Proporciona acceso resiliente a múltiples servicios de arte')
    .setVersion('1.0.0')
    .addTag('proxy', 'Endpoints de proxy con circuit breaker')
    .addTag('health', 'Endpoints de monitoreo y salud')
    .addTag('circuit-breaker', 'Información de circuit breaker')
    .build();
  
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    jsonDocumentUrl: '/api/docs-json',
  });
  
  console.log('Swagger configurado en /api/docs');
  
  await app.listen(3010);
  console.log('Museum Proxy Service is running on port 3010');
  console.log('API Documentation: http://localhost:3010/api/docs');
}
bootstrap();