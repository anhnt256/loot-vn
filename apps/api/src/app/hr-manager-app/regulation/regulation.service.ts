import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';

@Injectable()
export class RegulationService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  async findAll(tenantId: string) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.regulation.findMany({
      orderBy: { version: 'desc' },
      include: {
        acknowledgments: {
          include: { staff: { select: { id: true, fullName: true, userName: true } } },
        },
      },
    });
  }

  async findLatest(tenantId: string) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.regulation.findFirst({
      where: { publishedAt: { not: null } },
      orderBy: { version: 'desc' },
      include: {
        acknowledgments: {
          include: { staff: { select: { id: true, fullName: true, userName: true } } },
        },
      },
    });
  }

  async create(tenantId: string, data: { title: string; content: string; createdBy?: string }) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);

    // Auto-increment version
    const latest = await gateway.regulation.findFirst({
      orderBy: { version: 'desc' },
    });
    const nextVersion = latest ? latest.version + 1 : 1;

    return gateway.regulation.create({
      data: {
        title: data.title,
        content: data.content,
        version: nextVersion,
        createdBy: data.createdBy || null,
      },
    });
  }

  async update(tenantId: string, id: number, data: { title?: string; content?: string; createdBy?: string }) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const existing = await gateway.regulation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy nội quy');

    // Nếu đã phát hành → tạo version mới thay vì sửa in-place
    if (existing.publishedAt) {
      const latest = await gateway.regulation.findFirst({ orderBy: { version: 'desc' } });
      const nextVersion = latest ? latest.version + 1 : 1;
      return gateway.regulation.create({
        data: {
          title: data.title ?? existing.title,
          content: data.content ?? existing.content,
          version: nextVersion,
          createdBy: data.createdBy || existing.createdBy || null,
        },
      });
    }

    return gateway.regulation.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
      },
    });
  }

  async publish(tenantId: string, id: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const existing = await gateway.regulation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy nội quy');

    // Hủy phát hành tất cả version cũ → chỉ 1 version active tại 1 thời điểm
    await gateway.regulation.updateMany({
      where: { publishedAt: { not: null } },
      data: { publishedAt: null },
    });

    return gateway.regulation.update({
      where: { id },
      data: { publishedAt: new Date() },
    });
  }

  async remove(tenantId: string, id: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.regulation.delete({ where: { id } });
  }

  async getAcknowledgments(tenantId: string, regulationId: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.regulationAcknowledgment.findMany({
      where: { regulationId },
      include: {
        staff: { select: { id: true, fullName: true, userName: true, phone: true } },
      },
      orderBy: { acknowledgedAt: 'desc' },
    });
  }

  async getUnacknowledgedStaff(tenantId: string, regulationId: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const acknowledged = await gateway.regulationAcknowledgment.findMany({
      where: { regulationId },
      select: { staffId: true },
    });
    const acknowledgedIds = acknowledged.map(a => a.staffId);
    return gateway.staff.findMany({
      where: {
        isDeleted: false,
        id: { notIn: acknowledgedIds.length > 0 ? acknowledgedIds : [0] },
      },
      select: { id: true, fullName: true, userName: true, phone: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async acknowledge(tenantId: string, regulationId: number, staffId: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);

    const regulation = await gateway.regulation.findUnique({ where: { id: regulationId } });
    if (!regulation) throw new NotFoundException('Không tìm thấy nội quy');

    return gateway.regulationAcknowledgment.upsert({
      where: {
        regulationId_staffId: { regulationId, staffId },
      },
      update: { acknowledgedAt: new Date() },
      create: { regulationId, staffId },
    });
  }
}
