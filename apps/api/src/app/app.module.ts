import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { HrAppModule } from './hr-app/hr-app.module';
import { HrManagerModule } from './hr-manager-app/hr-manager.module';
import { TenantManagementModule } from './tenant-admin/tenant-management/tenant-management.module';
import { OrgManagementModule } from './tenant-admin/org-management/org-management.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    HrAppModule,
    HrManagerModule,
    TenantManagementModule,
    OrgManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
