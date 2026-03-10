import { Module } from '@nestjs/common';
import { WorkShiftsController } from './work-shifts.controller';
import { WorkShiftsService } from './work-shifts.service';
import { HandoverReportsController } from './handover-reports.controller';
import { HandoverReportsService } from './handover-reports.service';
import { RevenueReportsController } from './revenue-reports.controller';
import { RevenueReportsService } from './revenue-reports.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [
    WorkShiftsController,
    HandoverReportsController,
    RevenueReportsController,
  ],
  providers: [WorkShiftsService, HandoverReportsService, RevenueReportsService],
})
export class WorkOperationsModule {}
