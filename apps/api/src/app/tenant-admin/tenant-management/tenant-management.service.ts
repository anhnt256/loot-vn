import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { TenantPrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantManagementService {
  constructor(private prisma: TenantPrismaService) {}

  async findAll() {
    const list = await this.prisma.tenant.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((t) => {
      const normalized = this.normalizeClients(t.clients);
      return this.toTenantResponse(t, normalized);
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return null;
    const normalized = this.normalizeClients(tenant.clients);
    return this.toTenantResponse(tenant, normalized);
  }

  private generateStripeStyleKey(): { keyId: string; secret: string; fullKey: string; secretHash: string } {
    const keyId = crypto.randomBytes(4).toString('hex'); // 8 characters
    const secret = crypto.randomBytes(16).toString('hex'); // 32 characters
    const fullKey = `gms_${keyId}.${secret}`;
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');
    return { keyId, secret, fullKey, secretHash };
  }

  private normalizeClients(raw: unknown): { list: unknown[]; dbUrl: string | null; fnetUrl: string | null } {
    if (Array.isArray(raw)) return { list: raw, dbUrl: null, fnetUrl: null };
    const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    return {
      list: Array.isArray(o.list) ? o.list : [],
      dbUrl: typeof o.dbUrl === 'string' ? o.dbUrl : null,
      fnetUrl: typeof o.fnetUrl === 'string' ? o.fnetUrl : null,
    };
  }

  private toTenantResponse(tenant: { clients?: unknown; [k: string]: unknown }, normalized: { list: unknown[]; dbUrl: string | null; fnetUrl: string | null }) {
    return {
      ...tenant,
      clients: normalized,
      dbUrl: normalized.dbUrl,
      fnetUrl: normalized.fnetUrl,
    };
  }

  async create(data: any) {
    const { status, dbUrl, fnetUrl, ...rest } = data;
    const { keyId, fullKey, secretHash } = this.generateStripeStyleKey();
    const clients: Record<string, unknown> = {};
    if (dbUrl !== undefined) clients.dbUrl = dbUrl;
    if (fnetUrl !== undefined) clients.fnetUrl = fnetUrl;

    const tenant = await this.prisma.tenant.create({
      data: {
        ...rest,
        clients: Object.keys(clients).length > 0 ? clients : undefined,
        apiKey: fullKey,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.prisma.apiKey.create({
      data: {
        keyId,
        secretHash,
        tenantId: tenant.id,
        name: `Default Key for ${tenant.name}`,
      },
    });

    return {
      ...tenant,
      fullApiKey: fullKey, // Return the full key only once
    };
  }

  async update(id: string, data: any) {
    const { status, dbUrl, fnetUrl, clients: clientsPayload, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
    const existing = await this.prisma.tenant.findUnique({ where: { id }, select: { clients: true } });
    const current = this.normalizeClients(existing?.clients);

    const shouldUpdateClients =
      dbUrl !== undefined ||
      fnetUrl !== undefined ||
      (Array.isArray(clientsPayload) && clientsPayload.length >= 0);
    if (shouldUpdateClients) {
      const next: Record<string, unknown> = {
        list: Array.isArray(clientsPayload) ? clientsPayload : current.list,
        dbUrl: dbUrl !== undefined ? dbUrl : current.dbUrl,
        fnetUrl: fnetUrl !== undefined ? fnetUrl : current.fnetUrl,
      };
      updateData.clients = next;
    }
    return this.prisma.tenant.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async generateApiKey(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new Error('Tenant not found');

    const { keyId, fullKey, secretHash } = this.generateStripeStyleKey();

    // Revoke old keys for this tenant if needed, or just add a new one
    // For now, we'll just add a new one and update the tenant's primary key
    await this.prisma.tenant.update({
      where: { id },
      data: {
        apiKey: fullKey,
        updatedAt: new Date(),
      },
    });

    await this.prisma.apiKey.create({
      data: {
        keyId,
        secretHash,
        tenantId: id,
        name: `Key generated at ${new Date().toISOString()}`,
      },
    });

    return {
      apiKey: fullKey,
    };
  }
}
