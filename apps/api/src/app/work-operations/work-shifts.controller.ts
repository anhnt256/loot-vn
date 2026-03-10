import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Req,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkShiftsService } from './work-shifts.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('work-shifts')
export class WorkShiftsController {
  constructor(private readonly workShiftsService: WorkShiftsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Req() req: any) {
    const branch = req.headers['x-branch'] || 'GoVap';
    const data = await this.workShiftsService.findAll(branch);
    return { success: true, data };
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Req() req: any, @Body() body: any) {
    const branch = req.headers['x-branch'] || 'GoVap';
    const data = await this.workShiftsService.create(branch, body);
    return { success: true, data };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() body: any,
  ) {
    const branch = req.headers['x-branch'] || 'GoVap';
    const data = await this.workShiftsService.update(id, branch, body);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const branch = req.headers['x-branch'] || 'GoVap';
    await this.workShiftsService.delete(id, branch);
    return { success: true, message: 'Deleted' };
  }
}
