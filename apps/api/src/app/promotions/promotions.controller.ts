import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('promotions')
@UseGuards(AuthGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get('gateway-bonus/status')
  async getGatewayStatus(@Req() req: any) {
    return this.promotionsService.checkGatewayBonus(
      req.user.userId,
      req.user.branch,
    );
  }

  @Post('gateway-bonus/claim')
  async claimGateway(@Req() req: any) {
    return this.promotionsService.claimGatewayBonus(
      req.user.userId,
      req.user.branch,
    );
  }
}
