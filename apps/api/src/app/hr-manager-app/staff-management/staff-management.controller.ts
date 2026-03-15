import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  ParseIntPipe 
} from '@nestjs/common';
import { StaffManagementService } from './staff-management.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Controller('hr-manager/staff')
export class StaffManagementController {
  constructor(private readonly staffManagementService: StaffManagementService) {}

  @Get()
  findAll(
    @Query('includeDeleted') includeDeleted?: string,
    @Query('type') type?: string,
  ) {
    return this.staffManagementService.findAll(includeDeleted === 'true', type);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffManagementService.findOne(id);
  }

  @Post()
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffManagementService.create(createStaffDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffDto: UpdateStaffDto
  ) {
    return this.staffManagementService.update(id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffManagementService.remove(id);
  }

  @Post(':id/reset-password')
  resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.staffManagementService.resetPassword(id);
  }
}
