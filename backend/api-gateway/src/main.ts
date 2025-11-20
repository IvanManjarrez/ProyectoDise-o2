import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // Enable CORS
  app.enableCors()
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }))
  
  // Swagger configuration - Gateway endpoints only
  const config = new DocumentBuilder()
    .setTitle('AR Art Gallery API Gateway')
    .setDescription('API Gateway for AR Art Gallery microservices architecture. Use individual service Swagger docs for detailed endpoint information:\n- Auth Service: http://localhost:3001/api/docs\n- Composition Service: http://localhost:3002/api/docs\n- Museum Proxy: http://localhost:3010/api/docs')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('health', 'Health check endpoints')
    .build()
  
  const document = SwaggerModule.createDocument(app, config)
  
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'AR Art Gallery API Gateway',
    customfavIcon: 'https://swagger.io/swagger/media/assets/images/swagger_logo.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  })
  
  const port = process.env.PORT || 3000
  await app.listen(port)
  
  console.log(`API Gateway running on http://localhost:${port}`)
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`)
}

bootstrap()