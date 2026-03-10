import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';

@Module({
  controllers: [StaffController, ManagerController],
  providers: [StaffService, ManagerService],
  exports: [StaffService, ManagerService],
})
export class ManagementModule {}
