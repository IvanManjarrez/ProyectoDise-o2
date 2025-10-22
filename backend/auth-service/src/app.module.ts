import { Module, Provider } from '@nestjs/common'
// import { MongooseModule } from '@nestjs/mongoose'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule } from '@nestjs/config'
// MongoDB initialization is commented out to force in-memory mode during local dev
// import { MongoMemoryServer } from 'mongodb-memory-server'
import { AuthController } from './interface/controllers/auth.controller'
import { UsersController } from './interface/controllers/users.controller'
import { UserSchema } from './core/domain/schemas/user.schema'
import { MongoUserRepository } from './core/infrastructure/repositories/mongo-user.repository'
import { InMemoryUserRepository } from './core/infrastructure/repositories/in-memory-user.repository'
import { JwtServicePort } from './core/application/ports/jwt.port'
import { JwtStrategy } from './core/application/ports/jwt.strategy'
import { RegisterUseCase } from './core/application/usecases/register.usecase'
import { LoginUseCase } from './core/application/usecases/login.usecase'

const imports: any[] = [
	ConfigModule.forRoot({ isGlobal: true }),
	JwtModule.register({
		secret: process.env.JWT_SECRET || 'secret',
		signOptions: { expiresIn: process.env.JWT_EXPIRATION || '3600s' },
	}),
	PassportModule.register({ defaultStrategy: 'jwt' }),
]

const providers: Provider[] = [JwtServicePort, RegisterUseCase, LoginUseCase, JwtStrategy]

// NOTE: Mongoose initialization commented out so the service will not attempt to
// connect to a MongoDB instance during local development. The project contains a
// `InMemoryUserRepository` which will be used instead. If you want to enable
// MongoDB, uncomment the Mongoose import above and the block below, and provide
// a valid MONGO_URI in the environment or .env file.

// if (process.env.MONGO_URI && process.env.MONGO_URI.trim().length > 0) {
//     imports.push(
//         MongooseModule.forRootAsync({
//             useFactory: async () => ({ uri: process.env.MONGO_URI }),
//         }),
//         MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
//     )
//     providers.push({ provide: 'UserRepository', useClass: MongoUserRepository })
// } else {
//     // Use in-memory repo (no external Mongo required)
//     providers.push({ provide: 'UserRepository', useClass: InMemoryUserRepository })
// }

// Force in-memory repository for local development / CI runs.
providers.push({ provide: 'UserRepository', useClass: InMemoryUserRepository })

@Module({
	imports,
	controllers: [AuthController, UsersController],
	providers,
})
export class AppModule {}