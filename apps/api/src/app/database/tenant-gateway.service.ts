import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { MasterPrismaService, TenantPrismaService } from './prisma.service';
import type { PrismaClient } from '@gateway-workspace/database';

/** Resolve gateway DB URL from tenant (table column or clients JSON). Never use env. */
export function getTenantDbUrl(tenant: { dbUrl?: string | null; clients?: unknown }): string | null {
  if (tenant.dbUrl?.trim()) return tenant.dbUrl.trim();
  const c = tenant.clients;
  if (c && typeof c === 'object' && !Array.isArray(c) && 'dbUrl' in c && typeof (c as { dbUrl?: string }).dbUrl === 'string') {
    return ((c as { dbUrl: string }).dbUrl).trim();
  }
  return null;
}

/** Returns tenant Prisma client. Uses tenant.dbUrl from MasterDB, not env. */
@Injectable()
export class TenantGatewayService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService,
  ) {}

  async getGatewayClient(tenantId: string): Promise<PrismaClient> {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
      select: { dbUrl: true, clients: true },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
        select: { dbUrl: true, clients: true },
      });
    }
    if (!tenant) throw new UnauthorizedException('Tenant không hợp lệ');
    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) {
      throw new BadRequestException('Tenant chưa cấu hình DB URL. Vui lòng cập nhật trong quản lý tenant.');
    }
    return this.tenantPrisma.getClient(dbUrl);
  }
}
