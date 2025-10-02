import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
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

    const port = process.env.PORT || 3013;
    await app.listen(port);

    console.log(`Composition Service running on port ${port}`);
    console.log(`Museum Proxy URL: ${process.env.MUSEUM_PROXY_URL || 'http://localhost:3010'}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
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