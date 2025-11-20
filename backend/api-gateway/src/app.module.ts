import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { GatewayController } from './interface/controllers/gateway.controller'
import { HealthController } from './interface/controllers/health.controller'
import { ProxyController } from './interface/controllers/proxy.controller'
import { ProxyService } from './core/application/services/proxy.service'
import { JwtStrategy } from './core/infrastructure/auth/jwt.strategy'
import { JwtAuthGuard } from './interface/guards/jwt-auth.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([
        {
          ttl: config.get<number>('THROTTLE_TTL') || 60000,
          limit: config.get<number>('THROTTLE_LIMIT') || 10,
        },
      ]),
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      signOptions: { expiresIn: '1h' },
    }),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [GatewayController, HealthController, ProxyController],
  providers: [
    ProxyService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}