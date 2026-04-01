import { IsString, IsNumberString, IsOptional } from 'class-validator';

export class FilterShiftReportDto {
  @IsOptional()
  @IsString()
  filterDate?: string;

  @IsOptional()
  @IsNumberString()
  filterShiftId?: string;
}
