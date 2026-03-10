import { Module } from '@nestjs/common';
import { BattlePassController } from './battle-pass.controller';
import { BattlePassService } from './battle-pass.service';

@Module({
  controllers: [BattlePassController],
  providers: [BattlePassService],
})
export class BattlePassModule {}
