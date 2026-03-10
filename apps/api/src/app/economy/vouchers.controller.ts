import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post('redeem')
  @UseGuards(AuthGuard)
  async redeem(@Req() req: any, @Body() body: any) {
    const userId = req.user.userId;
    const branch = req.headers['x-branch'] || 'GoVap';
    const { promotionCodeId } = body;
    return this.vouchersService.redeem(userId, branch, promotionCodeId);
  }
}
