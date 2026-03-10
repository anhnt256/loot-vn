import { Module } from '@nestjs/common';
import { GameResultsController } from './game-results.controller';
import { GameResultsService } from './game-results.service';

@Module({
  controllers: [GameResultsController],
  providers: [GameResultsService],
})
export class GameResultsModule {}
