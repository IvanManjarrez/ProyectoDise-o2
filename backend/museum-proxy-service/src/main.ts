import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for development
  app.enableCors();
  
  // Global prefix
  app.setGlobalPrefix('api/v1');
  
  await app.listen(3010);
  console.log('Museum Proxy Service is running on port 3010');
}
bootstrap();