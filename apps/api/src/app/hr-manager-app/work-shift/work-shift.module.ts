import { Module } from '@nestjs/common';
import { WorkShiftService } from './work-shift.service';
import { WorkShiftController } from './work-shift.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WorkShiftController],
  providers: [WorkShiftService],
  exports: [WorkShiftService],
})
export class WorkShiftModule {}
