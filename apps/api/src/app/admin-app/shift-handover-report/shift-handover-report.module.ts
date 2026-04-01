import { Module } from '@nestjs/common';
import { ShiftHandoverReportController } from './shift-handover-report.controller';
import { ShiftHandoverReportService } from './shift-handover-report.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ShiftHandoverReportController],
  providers: [ShiftHandoverReportService],
})
export class ShiftHandoverReportModule {}
