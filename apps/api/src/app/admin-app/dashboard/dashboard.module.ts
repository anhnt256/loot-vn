import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { OrderModule } from '../order/order.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [OrderModule, ConfigModule],
  controllers: [DashboardController],
  providers: [TenantGatewayService, DashboardService],
})
export class ClientDashboardModule {}
