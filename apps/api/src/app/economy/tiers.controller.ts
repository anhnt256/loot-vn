import { Controller, Get, UseGuards } from '@nestjs/common';
import { TiersService } from './tiers.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('tiers')
export class TiersController {
  constructor(private readonly tiersService: TiersService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    const data = await this.tiersService.findAll();
    return { success: true, data };
  }
}
