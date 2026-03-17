import { Injectable } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { dayjs } from '@gateway-workspace/shared/utils';

@Injectable()
export class WorkShiftService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  private prepareData(data: any) {
    const prepared = { ...data };
    if (typeof data.startTime === 'string' && data.startTime.includes(':')) {
      prepared.startTime = dayjs(`1970-01-01T${data.startTime}:00`).toDate();
    }
    if (typeof data.endTime === 'string' && data.endTime.includes(':')) {
      prepared.endTime = dayjs(`1970-01-01T${data.endTime}:00`).toDate();
    }
    return prepared;
  }

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
      data: this.prepareData(data),
    });
  }

  async update(tenantId: string, id: number, data: any) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.workShift.update({
      where: { id },
      data: this.prepareData(data),
    });
  }

  async remove(tenantId: string, id: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.workShift.delete({
      where: { id },
    });
  }
}
