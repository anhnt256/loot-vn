import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { MasterPrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantManagementService {
  constructor(private masterPrisma: MasterPrismaService) {}

  async findAll() {
    const list = await this.masterPrisma.tenant.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((t) => {
      const normalized = this.normalizeClients(t.clients);
      return this.toTenantResponse(t, normalized);
    });
  }

  async findOne(id: string) {
    const tenant = await this.masterPrisma.tenant.findUnique({ where: { id } });
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

  private toTenantResponse(tenant: { clients?: unknown; dbUrl?: string | null; fnetUrl?: string | null; domainPrefix?: string | null; [k: string]: unknown }, normalized: { list: unknown[]; dbUrl: string | null; fnetUrl: string | null }) {
    const { dbUrl, fnetUrl, ...safeTenant } = tenant as any;
    return {
      ...safeTenant,
      dbUrl: tenant.dbUrl ?? normalized.dbUrl ?? null,
      fnetUrl: tenant.fnetUrl ?? normalized.fnetUrl ?? null,
      domainPrefix: tenant.domainPrefix ?? null,
      clients: { list: normalized.list },
    };
  }

  async create(data: any) {
    const { status, dbUrl, fnetUrl, domainPrefix, ...rest } = data;
    const { keyId, fullKey, secretHash } = this.generateStripeStyleKey();

    const tenant = await this.masterPrisma.tenant.create({
      data: {
        ...rest,
        dbUrl: dbUrl !== undefined && dbUrl !== '' ? dbUrl : null,
        fnetUrl: fnetUrl !== undefined && fnetUrl !== '' ? fnetUrl : null,
        domainPrefix: domainPrefix !== undefined && domainPrefix !== '' ? domainPrefix : null,
        clients: { list: [] },
        apiKey: fullKey,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.masterPrisma.apiKey.create({
      data: {
        keyId,
        secretHash,
        tenantId: tenant.id,
        name: `Default Key for ${tenant.name}`,
      },
    });

    const { dbUrl: _dbUrl, fnetUrl: _fnetUrl, clients: _clients, ...safeTenant } = tenant as any;

    return {
      ...safeTenant,
      clients: { list: [] },
      fullApiKey: fullKey, // Return the full key only once
    };
  }

  async update(id: string, data: any) {
    const { status, dbUrl, fnetUrl, domainPrefix, clients: clientsPayload, ...rest } = data;
    const existing = await this.masterPrisma.tenant.findUnique({ where: { id }, select: { clients: true } });
    const current = this.normalizeClients(existing?.clients);

    const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };

    // Persist to DB columns (db_url, fnet_url, domainPrefix)
    if (dbUrl !== undefined) updateData.dbUrl = dbUrl === '' ? null : dbUrl;
    if (fnetUrl !== undefined) updateData.fnetUrl = fnetUrl === '' ? null : fnetUrl;
    if (domainPrefix !== undefined) updateData.domainPrefix = domainPrefix === '' ? null : domainPrefix;

    const shouldUpdateClients = Array.isArray(clientsPayload);
    if (shouldUpdateClients) {
      updateData.clients = {
        list: clientsPayload,
        dbUrl: dbUrl !== undefined ? dbUrl : current.dbUrl,
        fnetUrl: fnetUrl !== undefined ? fnetUrl : current.fnetUrl,
      };
    } else if (dbUrl !== undefined || fnetUrl !== undefined) {
      updateData.clients = {
        list: current.list,
        dbUrl: dbUrl !== undefined ? dbUrl : current.dbUrl,
        fnetUrl: fnetUrl !== undefined ? fnetUrl : current.fnetUrl,
      };
    }

    await this.masterPrisma.tenant.update({
      where: { id },
      data: updateData,
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    return this.masterPrisma.tenant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async generateApiKey(id: string) {
    const tenant = await this.masterPrisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new Error('Tenant not found');

    const { keyId, fullKey, secretHash } = this.generateStripeStyleKey();

    // Revoke old keys for this tenant if needed, or just add a new one
    // For now, we'll just add a new one and update the tenant's primary key
    await this.masterPrisma.tenant.update({
      where: { id },
      data: {
        apiKey: fullKey,
        updatedAt: new Date(),
      },
    });

    await this.masterPrisma.apiKey.create({
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
