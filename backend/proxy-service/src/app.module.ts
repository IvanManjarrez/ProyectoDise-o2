import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 600, // 10 minutes
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 50, // 50 requests per minute
      },
    ]),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class AppModule {}