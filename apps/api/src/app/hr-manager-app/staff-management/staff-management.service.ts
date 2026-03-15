import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import * as crypto from 'crypto';

@Injectable()
export class StaffManagementService {
  constructor(private prisma: PrismaService) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async findAll(includeDeleted = false, type?: string) {
    return this.prisma.staff.findMany({
      where: {
        ...(includeDeleted ? {} : { isDeleted: false }),
        ...(type ? { staffType: type as any } : {}),
        isAdmin: false,
      },
      include: {
        workShift: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
    });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return staff;
  }

  async create(createStaffDto: CreateStaffDto) {
    const { userName, password, ...rest } = createStaffDto;

    const existingStaff = await this.prisma.staff.findUnique({
      where: { userName },
    });

    if (existingStaff) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = this.hashPassword(password);

    return this.prisma.staff.create({
      data: {
        ...rest,
        userName,
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
  }

  async update(id: number, updateStaffDto: UpdateStaffDto) {
    const { password, userName, ...rest } = updateStaffDto as any;

    const staff = await this.findOne(id);

    if (userName && userName !== staff.userName) {
      const existingStaff = await this.prisma.staff.findUnique({
        where: { userName },
      });
      if (existingStaff) {
        throw new BadRequestException('Username already exists');
      }
    }

    const data: any = {
      ...rest,
      updatedAt: new Date(),
    };

    if (userName) {
      data.userName = userName;
    }

    if (password && password.trim() !== '') {
      data.password = this.hashPassword(password);
    }

    // Convert string dates to Date objects if they exist
    const dateFields = ['dateOfBirth', 'hireDate', 'idCardExpiryDate', 'idCardIssueDate', 'resignDate'];
    for (const field of dateFields) {
      if (data[field]) {
        data[field] = new Date(data[field]);
      }
    }

    return this.prisma.staff.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const staff = await this.findOne(id);
    if (staff.isAdmin) {
      throw new BadRequestException('Cannot delete admin accounts');
    }

    return this.prisma.staff.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });
  }

  async resetPassword(id: number) {
    await this.findOne(id);
    const resetPasswordHash = this.hashPassword(`RESET_PASSWORD_REQUIRED_${id}`);
    
    return this.prisma.staff.update({
      where: { id },
      data: {
        password: resetPasswordHash,
        updatedAt: new Date(),
      },
    });
  }
}
