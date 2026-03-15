import { Module } from '@nestjs/common';
import { RewardPunishRulesService } from './reward-punish-rules.service';
import { RewardPunishRulesController } from './reward-punish-rules.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [RewardPunishRulesController],
  providers: [RewardPunishRulesService, PrismaService],
  exports: [RewardPunishRulesService],
})
export class RewardPunishRulesModule {}
