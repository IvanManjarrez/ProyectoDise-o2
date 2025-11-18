import { Module, Provider } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AuthController } from './interface/controllers/auth.controller'
import { UsersController } from './interface/controllers/users.controller'
import { HealthController } from './interface/controllers/health.controller'
import { UserSchema } from './core/domain/schemas/user.schema'
import { RefreshTokenSchema } from './core/domain/schemas/refresh-token.schema'
import { MongoUserRepository } from './core/infrastructure/repositories/mongo-user.repository'
import { InMemoryUserRepository } from './core/infrastructure/repositories/in-memory-user.repository'
import { MongoRefreshTokenRepository } from './core/infrastructure/repositories/mongo-refresh-token.repository'
import { InMemoryRefreshTokenRepository } from './core/infrastructure/repositories/in-memory-refresh-token.repository'
import { JwtServicePort } from './core/application/ports/jwt.port'
import { JwtStrategy } from './core/application/ports/jwt.strategy'
import { RegisterUseCase } from './core/application/usecases/register.usecase'
import { LoginUseCase } from './core/application/usecases/login.usecase'
import { RefreshTokenUseCase } from './core/application/usecases/refresh-token.usecase'
import { LogoutUseCase } from './core/application/usecases/logout.usecase'

const imports: any[] = [
	ConfigModule.forRoot({ isGlobal: true }),
	ThrottlerModule.forRoot([{
		ttl: 60000, // 60 seconds
		limit: 30, // 30 requests per ttl (default global)
	}]),
	JwtModule.register({
		secret: process.env.JWT_SECRET || 'secret',
		signOptions: { expiresIn: process.env.JWT_EXPIRATION || '3600s' },
	}),
	PassportModule.register({ defaultStrategy: 'jwt' }),
]

const providers: Provider[] = [
	JwtServicePort,
	RegisterUseCase,
	LoginUseCase,
	RefreshTokenUseCase,
	LogoutUseCase,
	JwtStrategy,
	{
		provide: APP_GUARD,
		useClass: ThrottlerGuard,
	},
]

// If a MONGO_URI is provided in the environment, configure Mongoose and
// use the Mongo-backed repository. Otherwise fall back to the in-memory
// repository implementation for local development / CI.
if (process.env.MONGO_URI && process.env.MONGO_URI.trim().length > 0) {
	imports.push(
		MongooseModule.forRootAsync({
			useFactory: async () => ({ uri: process.env.MONGO_URI }),
		}),
		MongooseModule.forFeature([
			{ name: 'User', schema: UserSchema },
			{ name: 'RefreshToken', schema: RefreshTokenSchema },
		]),
	)
	providers.push(
		{ provide: 'UserRepository', useClass: MongoUserRepository },
		{ provide: 'RefreshTokenRepository', useClass: MongoRefreshTokenRepository },
	)
} else {
	// Use in-memory repo (no external Mongo required)
	providers.push(
		{ provide: 'UserRepository', useClass: InMemoryUserRepository },
		{ provide: 'RefreshTokenRepository', useClass: InMemoryRefreshTokenRepository },
	)
}

@Module({
	imports,
	controllers: [AuthController, UsersController, HealthController],
	providers,
})
export class AppModule {}