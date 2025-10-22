import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Iniciando aplicación...');
  
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();

  console.log('Intentando cargar Swagger...');
  
  try {
    const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
    console.log('@nestjs/swagger cargado correctamente');
    
    const config = new DocumentBuilder()
      .setTitle('Harvard API')
      .setDescription('API simple')
      .setVersion('1.0')
      .build();
    
    console.log('DocumentBuilder configurado');
    
    const document = SwaggerModule.createDocument(app, config);
    console.log('Documento Swagger creado');
    
    SwaggerModule.setup('api/docs', app, document);
    console.log('Swagger UI configurado en /api/docs');
    
  } catch (error) {
    console.error('ERROR con Swagger:', error);
  }

  await app.listen(3013);
  console.log('Servidor corriendo en puerto 3013');
  console.log('Documentación: http://localhost:3013/api/docs');
}

bootstrap().catch(error => {
  console.error('Error fatal:', error);
});