import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { StaffManagementService } from './staff-management.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('hr-manager/staff')
export class StaffManagementController {
  constructor(private readonly staffManagementService: StaffManagementService) {}

  private getTenantId(req: any): string {
    const id = getTenantIdFromRequest(req);
    if (!id) throw new BadRequestException('Missing x-tenant-id or invalid Origin/Referer');
    return id;
  }

  @Get()
  findAll(@Req() req: any, @Query('includeDeleted') includeDeleted?: string, @Query('type') type?: string) {
    return this.staffManagementService.findAll(this.getTenantId(req), includeDeleted === 'true', type);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.staffManagementService.findOne(this.getTenantId(req), id);
  }

  @Post()
  create(@Req() req: any, @Body() createStaffDto: CreateStaffDto) {
    return this.staffManagementService.create(this.getTenantId(req), createStaffDto);
  }

  @Put(':id')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffDto: UpdateStaffDto
  ) {
    return this.staffManagementService.update(this.getTenantId(req), id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.staffManagementService.remove(this.getTenantId(req), id);
  }

  @Post(':id/reset-password')
  resetPassword(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.staffManagementService.resetPassword(this.getTenantId(req), id);
  }
}
