import { Module } from '@nestjs/common';
import { OrderGateway } from './order.gateway';
import { OrderController } from './order.controller';
import { TenantGatewayService } from '../../database/tenant-gateway.service';

@Module({
  providers: [OrderGateway, TenantGatewayService],
  controllers: [OrderController],
  exports: [OrderGateway],
})
export class OrderModule {}
