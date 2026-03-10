import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { GamesService } from './games.service';
import { MissionsService } from './missions.service';
import { BattlePassService } from './battle-pass.service';
import { GamificationController } from './gamification.controller';

@Module({
  controllers: [GamificationController],
  providers: [RewardsService, GamesService, MissionsService, BattlePassService],
  exports: [RewardsService, GamesService, MissionsService, BattlePassService],
})
export class GamificationModule {}
