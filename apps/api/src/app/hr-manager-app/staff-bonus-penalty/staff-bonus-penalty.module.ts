import { Module } from '@nestjs/common';
import { StaffBonusPenaltyController } from './staff-bonus-penalty.controller';
import { StaffBonusPenaltyService } from './staff-bonus-penalty.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StaffBonusPenaltyController],
  providers: [StaffBonusPenaltyService],
})
export class StaffBonusPenaltyModule {}
