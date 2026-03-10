import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('management/staff')
@UseGuards(AuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async findAll(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const branch = req.user.branch;
    return this.staffService.findAll(branch, type, includeDeleted === 'true');
  }

  @Get('my-info')
  async getMyInfo(@Req() req: any) {
    const branch = req.user.branch;
    const userName = req.user.userName;
    return this.staffService.findByUsername(userName, branch);
  }

  @Get('time-tracking')
  async getTimeTracking(
    @Query('staffId') staffId: string,
    @Query('date') date?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.staffService.getTimeTracking(
      parseInt(staffId),
      date,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Post('time-tracking/check-in')
  async checkIn(@Body('staffId') staffId: number) {
    return this.staffService.checkIn(staffId);
  }

  @Post('time-tracking/check-out')
  async checkOut(
    @Body('staffId') staffId: number,
    @Body('recordId') recordId: number,
  ) {
    return this.staffService.checkOut(staffId, recordId);
  }

  @Get('salary')
  async getSalary(
    @Req() req: any,
    @Query('staffId') staffId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const branch = req.user.branch;
    return this.staffService.getSalary(
      parseInt(staffId),
      branch,
      parseInt(month),
      parseInt(year),
    );
  }

  @Post()
  async create(@Req() req: any, @Body() data: any) {
    const branch = req.user.branch;
    return this.staffService.create(data, branch);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    const branch = req.user.branch;
    return this.staffService.update(parseInt(id), branch, data);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const branch = req.user.branch;
    return this.staffService.remove(parseInt(id), branch);
  }
}
