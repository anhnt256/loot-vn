import { Module } from '@nestjs/common';
import { WelcomeRewardsService } from './welcome-rewards.service';
import { WelcomeRewardsController } from './welcome-rewards.controller';

@Module({
  controllers: [WelcomeRewardsController],
  providers: [WelcomeRewardsService],
  exports: [WelcomeRewardsService],
})
export class WelcomeRewardsModule {}
