import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { ResetCycle } from '../../../../../../libs/database/src/index';
import { dayjs } from '@gateway-workspace/shared/utils';

@Injectable()
export class RewardPunishRulesService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  async findAll(tenantId: string) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.rewardPunishRule.findMany({
      include: {
        severities: {
          orderBy: {
            occurrenceNumber: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(tenantId: string, id: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const rule = await gateway.rewardPunishRule.findUnique({
      where: { id },
      include: {
        severities: {
          orderBy: {
            occurrenceNumber: 'asc',
          },
        },
      },
    });
    if (!rule) throw new NotFoundException(`Rule with ID ${id} not found`);
    return rule;
  }

  async create(tenantId: string, data: any) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const { severities, ...ruleData } = data;
    return gateway.rewardPunishRule.create({
      data: {
        ...ruleData,
        severities: {
          create: severities || [],
        },
      },
      include: {
        severities: true,
      },
    });
  }

  async update(tenantId: string, id: number, data: any) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const { severities, ...ruleData } = data;
    await gateway.ruleSeverity.deleteMany({
      where: { ruleId: id },
    });
    return gateway.rewardPunishRule.update({
      where: { id },
      data: {
        ...ruleData,
        severities: {
          create: severities || [],
        },
      },
      include: {
        severities: true,
      },
    });
  }

  async remove(tenantId: string, id: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.rewardPunishRule.delete({
      where: { id },
    });
  }

  async processStaffViolation(tenantId: string, staffId: number, ruleId: number, date: Date = new Date()) {
    const rule = await this.findOne(tenantId, ruleId);
    if (!rule.isActive) return null;

    const cycleStartDate = this.calculateCycleStartDate(rule.resetCycle, date);
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const currentCount = await gateway.staffViolation.count({
      where: {
        staffId,
        ruleId,
        violationDate: {
          gte: cycleStartDate,
        },
      },
    });

    const occurrenceNumber = currentCount + 1;

    // Find custom severity for this occurrence
    let severity = rule.severities.find(s => s.occurrenceNumber === occurrenceNumber);
    
    // If not found, take the highest level available
    if (!severity && rule.severities.length > 0) {
      severity = rule.severities[rule.severities.length - 1];
    }

    const amount = severity?.amount || null;
    const violation = await gateway.staffViolation.create({
      data: {
        staffId,
        ruleId,
        violationDate: date,
        occurrenceNumber,
        amount,
      },
    });

    // Check threshold for emergency notification
    if (occurrenceNumber >= rule.maxViolations) {
      // TODO: Trigger notification system
      console.warn(`CRITICAL: Staff ${staffId} reached violation threshold for rule ${rule.name}`);
    }

    return violation;
  }

  private calculateCycleStartDate(cycle: ResetCycle, date: Date): Date {
    const d = dayjs(date);
    switch (cycle) {
      case ResetCycle.DAILY:
        return d.startOf('day').toDate();
      case ResetCycle.MONTHLY:
        return d.startOf('month').toDate();
      case ResetCycle.QUARTERLY:
        return d.startOf('quarter').toDate();
      case ResetCycle.YEARLY:
        return d.startOf('year').toDate();
      case ResetCycle.NEVER:
      default:
        return new Date(0); // Beginning of time
    }
  }
}
