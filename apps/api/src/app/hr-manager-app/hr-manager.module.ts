import { Module } from '@nestjs/common';
import { AttendanceModule } from './attendance/attendance.module';
import { StaffManagementModule } from './staff-management/staff-management.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WorkShiftModule } from './work-shift/work-shift.module';
import { RewardPunishRulesModule } from './reward-punish-rules/reward-punish-rules.module';

@Module({
  imports: [
    AttendanceModule,
    StaffManagementModule,
    DashboardModule,
    WorkShiftModule,
    RewardPunishRulesModule,
  ],
})
export class HrManagerModule {}
