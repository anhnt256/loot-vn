import { Module } from '@nestjs/common';
import { OrderGateway } from './order.gateway';
import { OrderController } from './order.controller';
import { StockService } from './stock.service';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [MenuModule],
  providers: [OrderGateway, TenantGatewayService, StockService],
  controllers: [OrderController],
  exports: [OrderGateway],
})
export class OrderModule {}
