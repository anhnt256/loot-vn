import { Module } from '@nestjs/common';
import { GiftRoundsService } from './gift-rounds.service';
import { GiftRoundsController } from './gift-rounds.controller';

@Module({
  controllers: [GiftRoundsController],
  providers: [GiftRoundsService],
  exports: [GiftRoundsService],
})
export class GiftRoundsModule {}
