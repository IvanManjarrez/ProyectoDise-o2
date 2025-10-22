import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as dotenv from 'dotenv'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
	dotenv.config()
	const app = await NestFactory.create(AppModule)
	// enable global validation
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
	const port = process.env.PORT || 3001
	await app.listen(port)
}
bootstrap()