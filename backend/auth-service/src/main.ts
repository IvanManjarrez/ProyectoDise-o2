import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as dotenv from 'dotenv'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
	dotenv.config()
	const app = await NestFactory.create(AppModule)
	
	// Enable global validation
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
	
	// Swagger Configuration
	const config = new DocumentBuilder()
		.setTitle('Auth Service API')
		.setDescription('API de Autenticación y Gestión de Usuarios para AR Art Gallery')
		.setVersion('1.0')
		.addTag('auth', 'Endpoints de autenticación (registro y login)')
		.addTag('users', 'Endpoints de gestión de usuarios y favoritos')
		.addTag('health', 'Health check del servicio')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'Ingresa el token JWT obtenido del endpoint /auth/login'
			},
			'JWT-auth'
		)
		.build()
	
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api/docs', app, document, {
		customSiteTitle: 'Auth Service - API Documentation',
		customCss: '.swagger-ui .topbar { display: none }',
		jsonDocumentUrl: '/api/docs-json',
	})
	
	const port = process.env.PORT || 3001
	await app.listen(port)
	console.log(`Auth Service running on http://localhost:${port}`)
	console.log(`Swagger documentation available at http://localhost:${port}/api/docs`)
}
bootstrap()