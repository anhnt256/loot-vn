import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';

@Injectable()
export class StaffBonusPenaltyService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  async findAll(tenantId: string, staffId?: number) {
    const client = await this.tenantGateway.getGatewayClient(tenantId);

    const matchClause = staffId ? { staffId } : {};

    const [bonuses, penalties] = await Promise.all([
      client.staffBonus.findMany({
        where: matchClause,
        orderBy: { rewardDate: 'desc' },
      }),
      client.staffPenalty.findMany({
        where: matchClause,
        orderBy: { penaltyDate: 'desc' },
      }),
    ]);

    return { bonuses, penalties };
  }

  async createBonus(tenantId: string, data: { staffId: number; amount: number; reason: string; note?: string; rewardDate?: string }) {
    const client = await this.tenantGateway.getGatewayClient(tenantId);
    
    // Verify staff exists
    const staff = await client.staff.findUnique({ where: { id: data.staffId } });
    if (!staff) throw new NotFoundException('Staff not found');

    return client.staffBonus.create({
      data: {
        staffId: data.staffId,
        amount: data.amount,
        reason: data.reason,
        note: data.note,
        rewardDate: data.rewardDate ? new Date(data.rewardDate) : new Date(),
        status: 'APPROVED', // Assuming direct manager action is immediately approved
      },
    });
  }

  async createPenalty(tenantId: string, data: { staffId: number; amount: number; reason: string; note?: string; penaltyDate?: string }) {
    const client = await this.tenantGateway.getGatewayClient(tenantId);
    
    // Verify staff exists
    const staff = await client.staff.findUnique({ where: { id: data.staffId } });
    if (!staff) throw new NotFoundException('Staff not found');

    return client.staffPenalty.create({
      data: {
        staffId: data.staffId,
        amount: data.amount,
        reason: data.reason,
        note: data.note,
        penaltyDate: data.penaltyDate ? new Date(data.penaltyDate) : new Date(),
        status: 'APPROVED', // Assuming direct manager action is immediately approved
      },
    });
  }

  async removeBonus(tenantId: string, id: number) {
    const client = await this.tenantGateway.getGatewayClient(tenantId);
    try {
      await client.staffBonus.delete({ where: { id } });
      return { success: true };
    } catch (e) {
      throw new NotFoundException('Bonus not found');
    }
  }

  async removePenalty(tenantId: string, id: number) {
    const client = await this.tenantGateway.getGatewayClient(tenantId);
    try {
      await client.staffPenalty.delete({ where: { id } });
      return { success: true };
    } catch (e) {
      throw new NotFoundException('Penalty not found');
    }
  }
}
