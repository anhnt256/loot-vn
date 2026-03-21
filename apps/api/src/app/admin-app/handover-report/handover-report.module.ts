import { Module } from '@nestjs/common';
import { HandoverReportController } from './handover-report.controller';
import { HandoverReportService } from './handover-report.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HandoverReportController],
  providers: [HandoverReportService],
})
export class HandoverReportModule {}
