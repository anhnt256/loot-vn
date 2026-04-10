import { Injectable } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';

@Injectable()
export class WorkShiftService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  async findAll(tenantId: string) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.workShift.findMany({
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(tenantId: string, id: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.workShift.findUnique({
      where: { id },
    });
  }

  async create(tenantId: string, data: any) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.workShift.create({
      data,
    });
  }

  async update(tenantId: string, id: number, data: any) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.workShift.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.workShift.delete({
      where: { id },
    });
  }
}
