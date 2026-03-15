import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { WorkShiftService } from './work-shift.service';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('hr-manager/work-shifts')
@UseGuards(AuthGuard)
export class WorkShiftController {
  constructor(private readonly workShiftService: WorkShiftService) {}

  @Get()
  async findAll() {
    return this.workShiftService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workShiftService.findOne(+id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.workShiftService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.workShiftService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.workShiftService.remove(+id);
  }
}
