import { Module } from '@nestjs/common'
import { GatewayController } from './interface/controllers/gateway.controller'

@Module({
  controllers: [GatewayController],
})
export class AppModule {}
// API Gateway module using axios for outgoing HTTP requests