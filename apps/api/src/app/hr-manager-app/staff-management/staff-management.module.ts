import { Module } from '@nestjs/common';
import { StaffManagementService } from './staff-management.service';
import { StaffManagementController } from './staff-management.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StaffManagementController],
  providers: [StaffManagementService],
  exports: [StaffManagementService],
})
export class StaffManagementModule {}
