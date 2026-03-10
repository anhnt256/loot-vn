import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { GiftRoundsService } from './gift-rounds.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('gift-rounds')
@UseGuards(AuthGuard)
export class GiftRoundsController {
  constructor(private readonly giftRoundsService: GiftRoundsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.giftRoundsService.findAll(req.user.branch);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    // Only admin can create gift rounds manually if needed,
    // but the monolith had a role check.
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    return this.giftRoundsService.create(req.user.branch, body);
  }
}
