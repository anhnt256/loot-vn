import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getCurrentTimeVNDB } from '../lib/timezone-utils';
import { randomBytes } from 'crypto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(branch: string, options: { limit: number; offset: number }) {
    const events = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM Event 
      WHERE (branch = ${branch} OR branch = 'ALL') AND isActive = true
      ORDER BY createdAt DESC
      LIMIT ${options.limit} OFFSET ${options.offset}
    `;

    const totalCount = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM Event 
      WHERE (branch = ${branch} OR branch = 'ALL') AND isActive = true
    `;

    return {
      events: this.serializeEvents(events),
      totalCount: totalCount[0].count.toString(),
      pagination: {
        limit: options.limit,
        offset: options.offset,
        hasMore: events.length === options.limit,
      },
    };
  }

  async create(branch: string, data: any) {
    const { name, type, startDate, endDate, ...rest } = data;
    if (!name || !type || !startDate || !endDate)
      throw new BadRequestException('Missing required fields');

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end)
      throw new BadRequestException('Start date must be before end date');

    const eventId = this.generateCuid();
    const now = getCurrentTimeVNDB();

    await this.prisma.$executeRaw`
      INSERT INTO Event (
        id, name, description, type, status, startDate, endDate, 
        registrationStart, registrationEnd, targetAudience, 
        conditions, rules, budget, expectedParticipants, 
        createdBy, branch, isActive, createdAt, updatedAt
      )
      VALUES (
        ${eventId}, ${name}, ${rest.description || null}, ${type}, 'DRAFT', ${start}, ${end},
        ${rest.registrationStart ? new Date(rest.registrationStart) : null},
        ${rest.registrationEnd ? new Date(rest.registrationEnd) : null},
        ${rest.targetAudience ? JSON.stringify(rest.targetAudience) : null},
        ${rest.conditions ? JSON.stringify(rest.conditions) : null},
        ${rest.rules ? JSON.stringify(rest.rules) : null},
        ${rest.budget || null}, ${rest.expectedParticipants || null},
        ${rest.createdBy || null}, ${branch}, true, ${now}, ${now}
      )
    `;

    const result = await this.prisma.$queryRaw<
      any[]
    >`SELECT * FROM Event WHERE id = ${eventId} LIMIT 1`;
    return this.serializeEvents(result)[0];
  }

  private generateCuid() {
    const timestamp = Date.now().toString(36);
    const randomStr = randomBytes(12)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 16);
    return `${timestamp}${randomStr}`;
  }

  private serializeEvents(events: any[]) {
    return events.map((event) => ({
      ...event,
      id: event.id.toString(),
      budget: event.budget?.toString() || null,
      expectedParticipants: event.expectedParticipants?.toString() || null,
      totalParticipants: event.totalParticipants?.toString() || '0',
      totalCodesGenerated: event.totalCodesGenerated?.toString() || '0',
      totalCodesUsed: event.totalCodesUsed?.toString() || '0',
      totalRewardsDistributed: event.totalRewardsDistributed?.toString() || '0',
      createdAt: event.createdAt?.toISOString(),
      updatedAt: event.updatedAt?.toISOString(),
      startDate: event.startDate?.toISOString(),
      endDate: event.endDate?.toISOString(),
    }));
  }
}
