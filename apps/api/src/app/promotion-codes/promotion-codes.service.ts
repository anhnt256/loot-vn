import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PromotionCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    branch: string,
    eventId?: string,
    isUsed?: boolean,
    limit: number = 50,
    offset: number = 0,
  ) {
    try {
      let sqlQuery = `
        SELECT pc.*, e.name as eventName, e.branch as eventBranch
        FROM PromotionCode pc
        LEFT JOIN Event e ON pc.eventId = e.id
        WHERE (pc.branch = '${branch}' OR e.branch = 'ALL')
      `;

      if (eventId) sqlQuery += ` AND pc.eventId = '${eventId}'`;
      if (isUsed !== undefined)
        sqlQuery += ` AND pc.isUsed = ${isUsed ? 1 : 0}`;

      sqlQuery += ` ORDER BY pc.createdAt DESC LIMIT ${limit} OFFSET ${offset}`;

      const codes: any[] = await this.prisma.$queryRawUnsafe(sqlQuery);

      const whereConditions: any = {
        OR: [{ branch }, { event: { branch: 'ALL' } }],
      };
      if (eventId) whereConditions.eventId = eventId;
      if (isUsed !== undefined) whereConditions.isUsed = isUsed;

      const totalCount = await this.prisma.promotionCode.count({
        where: whereConditions,
      });

      const usedCountResult: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM PromotionCode pc
        LEFT JOIN Event e ON pc.eventId = e.id
        WHERE (pc.branch = '${branch}' OR e.branch = 'ALL') AND pc.isUsed = 1
      `);
      const usedCount = Number(usedCountResult[0].count);

      return {
        success: true,
        codes,
        totalCount,
        usedCount,
        pagination: { limit, offset, hasMore: codes.length === limit },
      };
    } catch (error: any) {
      console.error('Error fetching promotion codes:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }

  async create(branch: string, data: any) {
    const {
      name,
      code,
      value,
      eventId,
      rewardType,
      rewardValue,
      expirationDate,
    } = data;

    if (!name || !code)
      throw new BadRequestException('Name and code are required');

    const existingCode = await this.prisma.promotionCode.findFirst({
      where: { code, branch },
    });
    if (existingCode)
      throw new BadRequestException('Promotion code already exists');

    try {
      await this.prisma.promotionCode.create({
        data: {
          name,
          code,
          value: value || null,
          branch,
          isUsed: false,
          eventId: eventId || null,
          rewardType: rewardType || null,
          rewardValue: rewardValue || null,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
        },
      });

      return { success: true, message: 'Promotion code created successfully' };
    } catch (error: any) {
      console.error('Error creating promotion code:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }
}
