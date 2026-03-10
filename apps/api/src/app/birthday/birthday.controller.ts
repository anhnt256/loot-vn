import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { BirthdayService } from './birthday.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('birthday')
@UseGuards(AuthGuard)
export class BirthdayController {
  constructor(private readonly birthdayService: BirthdayService) {}

  @Get('progress')
  async getProgress(@Req() req: any) {
    return this.birthdayService.getProgress(req.user.userId, req.user.branch);
  }

  @Post('claim')
  async claim(@Req() req: any, @Body() body: any) {
    return this.birthdayService.claim(
      req.user.userId,
      req.user.branch,
      body.tierId,
    );
  }
}
