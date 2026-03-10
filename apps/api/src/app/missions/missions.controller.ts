import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Param,
  Query,
} from '@nestjs/common';
import { MissionsService } from './missions.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Req() req: any, @Query('branch') queryBranch: string) {
    const userId = Number(req.user.userId);
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.missionsService.findAll(userId, branch);
  }

  @Post(':id/claim')
  @UseGuards(AuthGuard)
  async claim(
    @Req() req: any,
    @Param('id') id: string,
    @Query('branch') queryBranch: string,
  ) {
    const userId = Number(req.user.userId);
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.missionsService.claim(userId, branch, Number(id));
  }
}
