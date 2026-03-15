import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantPrismaService } from '../../database/prisma.service';

@Injectable()
export class OrgManagementService {
  constructor(private prisma: TenantPrismaService) {}

  async findAll() {
    return this.prisma.organization.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        _count: {
          select: { tenants: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        tenants: true,
      },
    });

    if (!org || org.deletedAt) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return org;
  }

  /** Get org by rootDomain (for master-app init). Returns org with tenants and normalized clients. */
  async findByRootDomain(rootDomain: string) {
    if (!rootDomain?.trim()) {
      throw new NotFoundException('rootDomain is required');
    }
    const org = await this.prisma.organization.findFirst({
      where: {
        rootDomain: rootDomain.trim(),
        deletedAt: null,
      },
      include: {
        tenants: {
          where: { deletedAt: null },
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!org) {
      throw new NotFoundException(`Organization with rootDomain "${rootDomain}" not found`);
    }
    const tenantsWithClients = org.tenants.map((t) => {
      const raw = (t as { clients?: unknown }).clients;
      let list: unknown[] = [];
      if (Array.isArray(raw)) list = raw;
      else if (raw && typeof raw === 'object' && Array.isArray((raw as { list?: unknown[] }).list)) {
        list = (raw as { list: unknown[] }).list;
      }
      return { ...t, clients: { list } };
    });
    return { ...org, tenants: tenantsWithClients };
  }

  async create(data: any) {
    const tenantIds: string[] = data.tenantIds ?? [];
    const org = await this.prisma.organization.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        status: data.status || 'Active',
        rootDomain: data.rootDomain ?? null,
      },
    });
    if (tenantIds.length > 0) {
      await this.prisma.tenant.updateMany({
        where: { id: { in: tenantIds }, deletedAt: null },
        data: { organizationId: org.id, updatedAt: new Date() },
      });
    }
    return this.findOne(org.id);
  }

  async update(id: string, data: any) {
    await this.findOne(id);

    const tenantIds: string[] | undefined = data.tenantIds;
    if (Array.isArray(tenantIds)) {
      await this.prisma.tenant.updateMany({
        where: { organizationId: id },
        data: { organizationId: null, updatedAt: new Date() },
      });
      if (tenantIds.length > 0) {
        await this.prisma.tenant.updateMany({
          where: { id: { in: tenantIds }, deletedAt: null },
          data: { organizationId: id, updatedAt: new Date() },
        });
      }
    }

    const orgData: { name?: string; description?: string | null; status?: string; rootDomain?: string | null } = {};
    if (data.name != null) orgData.name = data.name;
    if (data.description !== undefined) orgData.description = data.description;
    if (data.status != null) orgData.status = data.status;
    if (data.rootDomain !== undefined) orgData.rootDomain = data.rootDomain ?? null;
    if (Object.keys(orgData).length > 0) {
      await this.prisma.organization.update({ where: { id }, data: orgData });
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    // Ensure org exists and is not deleted
    await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'Deleted',
      },
    });
  }
}
