import { IsDateString, IsNumber, IsOptional, Min, IsString } from 'class-validator';

export class CreateShiftReportDto {
  @IsDateString()
  date: string;

  @IsNumber()
  workShiftId: number;

  @IsNumber()
  @Min(0)
  fnetRevenue: number;

  @IsNumber()
  @Min(0)
  gcpRevenue: number;

  @IsNumber()
  @Min(0)
  momoRevenue: number;

  @IsNumber()
  @Min(0)
  cashRevenue: number;

  @IsNumber()
  @Min(0)
  cashExpense: number;

  @IsNumber()
  @Min(0)
  actualReceived: number;

  @IsOptional()
  @IsString()
  note?: string;
}
