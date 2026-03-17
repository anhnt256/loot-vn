import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TenantPrismaService, GatewayPrismaService } from './prisma.service';
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

/** Returns gateway Prisma client for tenant. Uses tenant.dbUrl from DB, not env. */
@Injectable()
export class TenantGatewayService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly gatewayPrisma: GatewayPrismaService,
  ) {}

  async getGatewayClient(tenantId: string): Promise<PrismaClient> {
    let tenant = await this.tenantPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
      select: { dbUrl: true, clients: true },
    });
    if (!tenant) {
      tenant = await this.tenantPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
        select: { dbUrl: true, clients: true },
      });
    }
    if (!tenant) throw new UnauthorizedException('Tenant không hợp lệ');
    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) {
      throw new BadRequestException('Tenant chưa cấu hình DB URL. Vui lòng cập nhật trong quản lý tenant.');
    }
    return this.gatewayPrisma.getClient(dbUrl);
  }
}
