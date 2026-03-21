import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { GatewayPrismaService, TenantPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';

export interface UpdateDeviceDto {
  monitorStatus?: string;
  keyboardStatus?: string;
  mouseStatus?: string;
  headphoneStatus?: string;
  chairStatus?: string;
  networkStatus?: string;
  computerStatus?: string;
  note?: string;
  type?: string;
  issue?: string;
  status?: string;
}

@Injectable()
export class DeviceService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly gatewayPrisma: GatewayPrismaService
  ) {}

  private async getGatewayClient(tenantId: string) {
    let tenant = await this.tenantPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.tenantPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');

    return await this.gatewayPrisma.getClient(dbUrl);
  }

  async reportOrUpdateDevice(tenantId: string, computerId: number, body: UpdateDeviceDto) {
    try {
      const {
        monitorStatus,
        keyboardStatus,
        mouseStatus,
        headphoneStatus,
        chairStatus,
        networkStatus,
        computerStatus,
        note,
        type = 'REPORT',
        issue,
        status = 'PENDING',
      } = body;

      const validateDeviceStatus = (statusVal: string | undefined): any => {
        const validStatuses = ['GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED'];
        if (statusVal && !validStatuses.includes(statusVal)) {
          throw new BadRequestException(`Invalid device status: ${statusVal}`);
        }
        return (statusVal as any) || 'GOOD';
      };

      const gatewayClient = await this.getGatewayClient(tenantId);
      
      const computer = await gatewayClient.computer.findUnique({
        where: { id: computerId },
      });

      if (!computer) {
        throw new NotFoundException('Computer not found');
      }

      let device = await gatewayClient.device.findFirst({
        where: { computerId },
      });

      const updateData = {
        monitorStatus: validateDeviceStatus(monitorStatus),
        keyboardStatus: validateDeviceStatus(keyboardStatus),
        mouseStatus: validateDeviceStatus(mouseStatus),
        headphoneStatus: validateDeviceStatus(headphoneStatus),
        chairStatus: validateDeviceStatus(chairStatus),
        networkStatus: validateDeviceStatus(networkStatus),
        computerStatus: validateDeviceStatus(computerStatus),
        note,
      };

      if (!device) {
        device = await gatewayClient.device.create({
          data: {
            computerId,
            ...updateData,
          },
        });
      } else {
        device = await gatewayClient.device.update({
          where: { id: device.id },
          data: updateData,
        });
      }

      const deviceHistory = await gatewayClient.deviceHistory.create({
        data: {
          computerId,
          deviceId: device.id,
          type,
          issue,
          status,
          monitorStatus: updateData.monitorStatus,
          keyboardStatus: updateData.keyboardStatus,
          mouseStatus: updateData.mouseStatus,
          headphoneStatus: updateData.headphoneStatus,
          chairStatus: updateData.chairStatus,
          networkStatus: updateData.networkStatus,
        },
      });

      return { success: true, data: { device, deviceHistory } };
    } catch (error) {
      console.error('Error updating device:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message || 'Error updating device details');
    }
  }
}
