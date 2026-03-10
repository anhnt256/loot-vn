import { Controller, Post, Body } from '@nestjs/common';
import { GameResultsService } from './game-results.service';
import { CreateGameResultInput } from './game-results.dto';

@Controller('game-results')
export class GameResultsController {
  constructor(private readonly gameResultsService: GameResultsService) {}

  @Post('create')
  async create(
    @Body()
    dto: CreateGameResultInput & {
      userId: number;
      branch: string;
      token: string;
    },
  ) {
    return this.gameResultsService.create(dto);
  }
}
