import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Query,
  Body,
} from '@nestjs/common';
import { PromotionCodesService } from './promotion-codes.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('promotion-codes')
export class PromotionCodesController {
  constructor(private readonly promotionCodesService: PromotionCodesService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query('branch') queryBranch: string,
    @Query('eventId') eventId: string,
    @Query('isUsed') isUsed: string,
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Req() req: any,
  ) {
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    const isUsedBool =
      isUsed === 'true' ? true : isUsed === 'false' ? false : undefined;
    return this.promotionCodesService.findAll(
      branch,
      eventId,
      isUsedBool,
      Number(limit || 50),
      Number(offset || 0),
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Query('branch') queryBranch: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.promotionCodesService.create(branch, data);
  }
}
