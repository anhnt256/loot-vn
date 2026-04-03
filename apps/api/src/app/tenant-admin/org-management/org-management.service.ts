import { Injectable, NotFoundException } from '@nestjs/common';
import { MasterPrismaService } from '../../database/prisma.service';

@Injectable()
export class OrgManagementService {
  constructor(private masterPrisma: MasterPrismaService) {}

  async findAll() {
    return this.masterPrisma.organization.findMany({
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
    const org = await this.masterPrisma.organization.findUnique({
      where: { id },
      include: {
        tenants: {
          select: {
            id: true,
            name: true,
            apiKey: true,
            dbUrl: false,
            fnetUrl: false,
            domain: true,
            createdAt: true,
            updatedAt: true,
            organizationId: true,
            deletedAt: true,
            createdBy: true,
            updatedBy: true,
            tenantId: true,
            altName: true,
            description: true,
            altDescription: true,
            clients: true,
            logo: true,
            domainPrefix: true,
            isWorkflowEnabled: true,
          }
        },
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
    const org = await this.masterPrisma.organization.findFirst({
      where: {
        rootDomain: rootDomain.trim(),
        deletedAt: null,
      },
      include: {
        tenants: {
          select: {
            id: true,
            name: true,
            apiKey: true,
            dbUrl: false,
            fnetUrl: false,
            domain: true,
            createdAt: true,
            updatedAt: true,
            organizationId: true,
            deletedAt: true,
            createdBy: true,
            updatedBy: true,
            tenantId: true,
            altName: true,
            description: true,
            altDescription: true,
            clients: true,
            logo: true,
            domainPrefix: true,
            isWorkflowEnabled: true,
          },
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
    const org = await this.masterPrisma.organization.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        status: data.status || 'Active',
        rootDomain: data.rootDomain ?? null,
        primaryColor: data.primaryColor ?? null,
        secondaryColor: data.secondaryColor ?? null,
      },
    });
    if (tenantIds.length > 0) {
      await this.masterPrisma.tenant.updateMany({
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
      await this.masterPrisma.tenant.updateMany({
        where: { organizationId: id },
        data: { organizationId: null, updatedAt: new Date() },
      });
      if (tenantIds.length > 0) {
        await this.masterPrisma.tenant.updateMany({
          where: { id: { in: tenantIds }, deletedAt: null },
          data: { organizationId: id, updatedAt: new Date() },
        });
      }
    }

    const orgData: { name?: string; description?: string | null; status?: string; rootDomain?: string | null; primaryColor?: string | null; secondaryColor?: string | null } = {};
    if (data.name != null) orgData.name = data.name;
    if (data.description !== undefined) orgData.description = data.description;
    if (data.status != null) orgData.status = data.status;
    if (data.rootDomain !== undefined) orgData.rootDomain = data.rootDomain ?? null;
    if (data.primaryColor !== undefined) orgData.primaryColor = data.primaryColor ?? null;
    if (data.secondaryColor !== undefined) orgData.secondaryColor = data.secondaryColor ?? null;
    if (Object.keys(orgData).length > 0) {
      await this.masterPrisma.organization.update({ where: { id }, data: orgData });
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    // Ensure org exists and is not deleted
    await this.findOne(id);

    return this.masterPrisma.organization.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'Deleted',
      },
    });
  }
}
