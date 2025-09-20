import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import { CompositionModule } from './modules/composition/composition.module';
import { CoreModule } from './modules/core/core.module';
import { ConnectorsModule } from './modules/connectors/connectors.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    // MongoDB Connection
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/artgallery',
    ),
    
    // Redis Cache
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 300, // 5 minutes default
    }),
    
    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    
    // HTTP Client
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    
    // Application Modules
    CompositionModule,
    CoreModule,
    ConnectorsModule,
  ],
})
export class AppModule {}