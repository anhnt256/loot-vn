import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { HrAppModule } from './hr-app/hr-app.module';
import { HrManagerModule } from './hr-manager-app/hr-manager.module';
import { TenantManagementModule } from './tenant-admin/tenant-management/tenant-management.module';
import { OrgManagementModule } from './tenant-admin/org-management/org-management.module';
import { LayoutModule } from './admin-app/layout/layout.module';
import { ComputerModule } from './admin-app/computer/computer.module';
import { ConfigModule } from './admin-app/config/config.module';
import { UserModule } from './admin-app/user/user.module';
import { DeviceModule } from './admin-app/device/device.module';
import { HandoverReportModule } from './admin-app/handover-report/handover-report.module';
import { GameModule } from './admin-app/game/game.module';
import { ShiftHandoverReportModule } from './admin-app/shift-handover-report/shift-handover-report.module';
import { MaterialModule } from './admin-app/material/material.module';
import { MenuModule } from './admin-app/menu/menu.module';
import { FeedbackModule } from './admin-app/feedback/feedback.module';
import { ClientDashboardModule } from './admin-app/dashboard/dashboard.module';
import { OrderModule } from './admin-app/order/order.module';
import { PromotionRewardModule } from './admin-app/promotion-reward/promotion-reward.module';
import { ChatModule } from './admin-app/chat/chat.module';
import { EventPromotionModule } from './admin-app/event-promotion/event-promotion.module';
import { MenuCampaignModule } from './admin-app/menu-campaign/menu-campaign.module';
import { MaintenanceModule } from './admin-app/maintenance/maintenance.module';
import { TodoTaskModule } from './admin-app/todo-task/todo-task.module';
import { MaintenanceMiddleware } from './middleware/maintenance.middleware';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    HrAppModule,
    HrManagerModule,
    TenantManagementModule,
    OrgManagementModule,
    LayoutModule,
    ComputerModule,
    ConfigModule,
    UserModule,
    DeviceModule,
    HandoverReportModule,
    GameModule,
    ShiftHandoverReportModule,
    MaterialModule,
    MenuModule,
    FeedbackModule,
    ClientDashboardModule,
    OrderModule,
    PromotionRewardModule,
    ChatModule,
    EventPromotionModule,
    MenuCampaignModule,
    MaintenanceModule,
    TodoTaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MaintenanceMiddleware).forRoutes('*');
  }
}
