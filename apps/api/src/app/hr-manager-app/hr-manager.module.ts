import { Module } from '@nestjs/common';
import { AttendanceModule } from './attendance/attendance.module';
import { StaffManagementModule } from './staff-management/staff-management.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WorkShiftModule } from './work-shift/work-shift.module';
import { RewardPunishRulesModule } from './reward-punish-rules/reward-punish-rules.module';
import { StaffBonusPenaltyModule } from './staff-bonus-penalty/staff-bonus-penalty.module';
import { PayrollModule } from './payroll/payroll.module';
import { RegulationModule } from './regulation/regulation.module';

@Module({
  imports: [
    AttendanceModule,
    StaffManagementModule,
    DashboardModule,
    WorkShiftModule,
    RewardPunishRulesModule,
    StaffBonusPenaltyModule,
    PayrollModule,
    RegulationModule,
  ],
})
export class HrManagerModule {}
