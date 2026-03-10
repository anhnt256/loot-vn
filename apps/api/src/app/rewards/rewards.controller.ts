import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query('branch') queryBranch: string,
    @Query('eventId') eventId: string,
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Req() req: any,
  ) {
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.rewardsService.findAll(
      branch,
      eventId,
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
    return this.rewardsService.create(branch, data);
  }

  @Get('pending-exchanges')
  @UseGuards(AuthGuard)
  async findPendingExchanges(
    @Query('branch') queryBranch: string,
    @Query('userId') userId: string,
    @Req() req: any,
  ) {
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.rewardsService.findPendingExchanges(
      branch,
      userId ? Number(userId) : undefined,
    );
  }

  @Post('process-exchange')
  @UseGuards(AuthGuard)
  async processExchange(
    @Query('branch') queryBranch: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    const { rewardMapId, action, note } = body;
    if (!rewardMapId || !action)
      throw new BadRequestException('RewardMapId and action are required');
    return this.rewardsService.processExchange(
      branch,
      Number(rewardMapId),
      action,
      note,
    );
  }
}
