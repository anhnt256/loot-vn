import { IsString, IsEnum, IsOptional, IsEmail, IsBoolean, IsNumber, Min, MinLength } from 'class-validator';
import { Staff_gender, Staff_staffType } from '../../../../../../../libs/database/src/index';

export class CreateStaffDto {
  @IsString()
  @MinLength(3)
  userName: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsEnum(Staff_staffType)
  @IsOptional()
  staffType?: Staff_staffType;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Staff_gender)
  @IsOptional()
  gender?: Staff_gender;

  @IsString()
  @IsOptional()
  hireDate?: string;

  @IsString()
  @IsOptional()
  idCard?: string;

  @IsString()
  @IsOptional()
  idCardExpiryDate?: string;

  @IsString()
  @IsOptional()
  idCardIssueDate?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsBoolean()
  @IsOptional()
  needCheckMacAddress?: boolean;

  @IsString()
  @IsOptional()
  bankAccountName?: string;

  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseSalary?: number;

  @IsNumber()
  @IsOptional()
  workShiftId?: number;
}
