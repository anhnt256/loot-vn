import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffDto } from './create-staff.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  @IsString()
  @IsOptional()
  resignDate?: string;
}
