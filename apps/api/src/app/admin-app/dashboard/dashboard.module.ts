import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [OrderModule],
  controllers: [DashboardController],
  providers: [TenantGatewayService],
})
export class ClientDashboardModule {}
