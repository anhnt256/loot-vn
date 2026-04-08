import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { OrderModule } from '../order/order.module';
import { ConfigModule } from '../config/config.module';
import { MenuCampaignModule } from '../menu-campaign/menu-campaign.module';

@Module({
  imports: [OrderModule, ConfigModule, MenuCampaignModule],
  controllers: [DashboardController],
  providers: [TenantGatewayService, DashboardService],
})
export class ClientDashboardModule {}
