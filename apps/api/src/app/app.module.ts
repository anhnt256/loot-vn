import { Module } from '@nestjs/common';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
