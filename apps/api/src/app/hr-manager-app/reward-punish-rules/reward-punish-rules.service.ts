import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ResetCycle, RewardPunishType, RuleActionType } from '../../../../../../libs/database/src/index';
import { dayjs } from '@gateway-workspace/shared/utils';

@Injectable()
export class RewardPunishRulesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rewardPunishRule.findMany({
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

  async findOne(id: number) {
    const rule = await this.prisma.rewardPunishRule.findUnique({
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

  async create(data: any) {
    const { severities, ...ruleData } = data;
    return this.prisma.rewardPunishRule.create({
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

  async update(id: number, data: any) {
    const { severities, ...ruleData } = data;
    
    // Simple approach: delete existing severities and recreate
    // This is safe for configuration rules
    await this.prisma.ruleSeverity.deleteMany({
      where: { ruleId: id },
    });

    return this.prisma.rewardPunishRule.update({
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

  async remove(id: number) {
    return this.prisma.rewardPunishRule.delete({
      where: { id },
    });
  }

  /**
   * Core logic to process a violation and determine the penalty
   */
  async processStaffViolation(staffId: number, ruleId: number, date: Date = new Date()) {
    const rule = await this.findOne(ruleId);
    if (!rule.isActive) return null;

    const cycleStartDate = this.calculateCycleStartDate(rule.resetCycle, date);

    // Count existing violations in current cycle (Soft Reset)
    const currentCount = await this.prisma.staffViolation.count({
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

    // Record the violation
    const violation = await this.prisma.staffViolation.create({
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
