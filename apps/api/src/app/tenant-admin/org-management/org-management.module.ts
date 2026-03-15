import { Module } from '@nestjs/common';
import { OrgManagementController } from './org-management.controller';
import { OrgManagementService } from './org-management.service';

@Module({
  controllers: [OrgManagementController],
  providers: [OrgManagementService],
})
export class OrgManagementModule {}
