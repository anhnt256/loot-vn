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
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async findAll(
    @Req() req: any,
    @Query('date') date?: string,
    @Query('shift') shift?: string,
  ) {
    return this.reportsService.findAll(req.user.branch, date, shift);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reportsService.findOne(parseInt(id));
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.reportsService.create(req.user.branch, body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.reportsService.update(parseInt(id), body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reportsService.remove(parseInt(id));
  }
}
