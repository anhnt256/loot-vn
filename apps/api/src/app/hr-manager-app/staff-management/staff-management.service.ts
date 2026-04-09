import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import * as crypto from 'crypto';

@Injectable()
export class StaffManagementService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async findAll(tenantId: string, includeDeleted = false, type?: string) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.staff.findMany({
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

  async findOne(tenantId: string, id: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const staff = await gateway.staff.findUnique({
      where: { id },
    });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return staff;
  }

  async create(tenantId: string, createStaffDto: CreateStaffDto) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const { userName, password, ...rest } = createStaffDto;

    const existingStaff = await gateway.staff.findUnique({
      where: { userName },
    });

    if (existingStaff) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = this.hashPassword(password);

    return gateway.staff.create({
      data: {
        ...rest,
        userName,
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
  }

  async update(tenantId: string, id: number, updateStaffDto: UpdateStaffDto) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const { password, userName, ...rest } = updateStaffDto as any;

    const staff = await this.findOne(tenantId, id);

    if (userName && userName !== staff.userName) {
      const existingStaff = await gateway.staff.findUnique({
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

    const dateFields = ['dateOfBirth', 'hireDate', 'idCardExpiryDate', 'idCardIssueDate', 'resignDate'];
    for (const field of dateFields) {
      if (data[field]) {
        data[field] = new Date(data[field]);
      }
    }

    return gateway.staff.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: number) {
    const staff = await this.findOne(tenantId, id);
    if (staff.isAdmin) {
      throw new BadRequestException('Cannot delete admin accounts');
    }

    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.staff.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });
  }

  async resetPassword(tenantId: string, id: number, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    await this.findOne(tenantId, id);
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.staff.update({
      where: { id },
      data: {
        password: this.hashPassword(newPassword),
        updatedAt: new Date(),
      },
    });
  }
}
