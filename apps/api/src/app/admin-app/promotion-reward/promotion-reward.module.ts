import { Module } from '@nestjs/common';
import { PromotionRewardController } from './promotion-reward.controller';
import { PromotionRewardService } from './promotion-reward.service';
import { DatabaseModule } from '../../database/database.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [PromotionRewardController],
  providers: [PromotionRewardService],
})
export class PromotionRewardModule {}
