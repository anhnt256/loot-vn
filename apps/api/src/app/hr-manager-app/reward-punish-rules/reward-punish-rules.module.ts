import { Module } from '@nestjs/common';
import { RewardPunishRulesService } from './reward-punish-rules.service';
import { RewardPunishRulesController } from './reward-punish-rules.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RewardPunishRulesController],
  providers: [RewardPunishRulesService],
  exports: [RewardPunishRulesService],
})
export class RewardPunishRulesModule {}
