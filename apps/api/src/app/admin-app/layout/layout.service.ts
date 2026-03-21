import { Injectable, BadRequestException } from '@nestjs/common';
import { TenantPrismaService, GatewayPrismaService, FnetPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';

import { ConfigService } from '../config/config.service';

@Injectable()
export class LayoutService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly gatewayPrisma: GatewayPrismaService,
    private readonly fnetPrisma: FnetPrismaService,
    private readonly configService: ConfigService,
  ) {}

  private async getClients(tenantId: string) {
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
    
    const gateway = await this.gatewayPrisma.getClient(dbUrl);
    
    const fnetUrl = tenant.fnetUrl;
    if (!fnetUrl) throw new BadRequestException('Tenant chưa cấu hình fnetUrl');
    
    const fnet = await this.fnetPrisma.getClient(fnetUrl);

    return { gateway: gateway as any, fnet };
  }

  // Zone CRUD
  async getZones(tenantId: string) {
    const { gateway } = await this.getClients(tenantId);
    return gateway.zone.findMany({
      orderBy: { createdAt: 'asc' }
    });
  }

  async createZone(tenantId: string, data: { name: string; description?: string }) {
    const { gateway } = await this.getClients(tenantId);
    return gateway.zone.create({ data });
  }

  async deleteZone(tenantId: string, zoneId: number) {
    const { gateway } = await this.getClients(tenantId);
    return gateway.zone.delete({ where: { id: zoneId } });
  }

  // Computers & Layout
  async getComputers(tenantId: string) {
    const { gateway, fnet } = await this.getClients(tenantId);
    
    const configs = await this.configService.getConfigs(tenantId);
    const prefix = configs['COMPUTER_PREFIX'] || 'MAY';

    const query = `
      SELECT u.UserName as ComputerName, u.MAC as macAddress, m.MachineGroupName
      FROM usertb u 
      LEFT JOIN machinegrouptb m ON m.MachineGroupId = u.MachineGroupId
      WHERE u.UserName REGEXP '^${prefix}[0-9]+'
      ORDER BY LENGTH(u.UserName) ASC, u.UserName ASC
    `;
    const fnetComputers: any[] = await fnet.$queryRawUnsafe(query);
    
    const layouts = await gateway.computerLayout.findMany();
    
    return fnetComputers.map(c => {
      const layout = layouts.find((l: any) => l.macAddress === c.macAddress);
      return {
        computerName: c.ComputerName,
        macAddress: c.macAddress,
        groupName: c.MachineGroupName,
        zoneId: layout ? layout.zoneId : null,
        layout: layout ? {
          id: layout.id,
          x: layout.x,
          y: layout.y,
          w: layout.w,
          h: layout.h
        } : null
      };
    });
  }

  async moveComputersToZone(tenantId: string, body: { zoneId: number | null; macAddresses: string[] }) {
    const { gateway } = await this.getClients(tenantId);
    
    await gateway.computerLayout.deleteMany({
      where: { macAddress: { in: body.macAddresses } }
    });

    if (body.zoneId === null) {
      return { success: true };
    }

    const existingCount = await gateway.computerLayout.count({ where: { zoneId: body.zoneId } });

    const data = body.macAddresses.map((mac, idx) => {
      const index = existingCount + idx;
      return {
        zoneId: body.zoneId,
        macAddress: mac,
        x: (index * 2) % 24,
        y: Math.floor(index / 12) * 2,
        w: 2, 
        h: 2
      };
    });
    if (data.length > 0) {
      await gateway.computerLayout.createMany({ data });
    }
    return { success: true };
  }

  async saveLayouts(tenantId: string, body: { layouts: { macAddress: string; x: number; y: number; w: number; h: number }[] }) {
    const { gateway } = await this.getClients(tenantId);
    
    const ops = body.layouts.map(l => gateway.computerLayout.update({
      where: { macAddress: l.macAddress },
      data: { x: l.x, y: l.y, w: l.w, h: l.h }
    }));
    await gateway.$transaction(ops);
    return { success: true };
  }
}
