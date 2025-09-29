import { Module } from '@nestjs/common';
import { GatewayController } from './interface/controllers/gateway.controller';
@Module({
    controllers: [GatewayController],
    providers: [],
})
export class AppModule {}