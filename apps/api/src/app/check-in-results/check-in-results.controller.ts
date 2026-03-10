import { Controller, Post, Body, Req } from '@nestjs/common';
import { CheckInResultsService } from './check-in-results.service';

@Controller('check-in-results')
export class CheckInResultsController {
  constructor(private readonly checkInResultsService: CheckInResultsService) {}

  @Post('create')
  async create(@Body() dto: { userId: number; branch: string; token: string }) {
    return this.checkInResultsService.create(dto);
  }
}
