import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { TenantPrismaService, MasterPrismaService } from '../../database/prisma.service';
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
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService
  ) {}

  private async getGatewayClient(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');

    return await this.tenantPrisma.getClient(dbUrl);
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

  async getAllDeviceHistory(tenantId: string, type?: string, startDate?: string, endDate?: string, page: number = 1, limit: number = 20) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);
      
      const where: any = {};
      if (type && type !== 'ALL') {
        where.type = type;
      }
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(`${startDate}T00:00:00.000Z`),
          lt: new Date(`${endDate}T23:59:59.999Z`)
        };
      } else if (startDate) {
        where.createdAt = {
          gte: new Date(`${startDate}T00:00:00.000Z`),
          lt: new Date(`${startDate}T23:59:59.999Z`)
        };
      }

      // Safe bypass for dangling records that crash Prisma include
      const validComputers = await gatewayClient.computer.findMany({ select: { id: true } });
      const validComputerIds = validComputers.map((c: any) => c.id);
      
      if (validComputerIds.length > 0) {
        where.computerId = { in: validComputerIds };
      } else {
        return { success: true, data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      }

      const skip = (page - 1) * limit;

      const [histories, total] = await Promise.all([
        gatewayClient.deviceHistory.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            computer: {
              select: { id: true, name: true }
            }
          }
        }),
        gatewayClient.deviceHistory.count({ where })
      ]);

      return { 
        success: true, 
        data: histories,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      };
    } catch (error) {
      console.error('Error fetching device histories:', error);
      throw new InternalServerErrorException('Error fetching device histories');
    }
  }
}
// forces recompile of service types
