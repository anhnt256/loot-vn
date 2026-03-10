import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class GiftRoundsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(branch: string) {
    return this.prisma.giftRound.findMany({
      where: { branch },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(branch: string, data: any) {
    const { userId, amount, reason, expiredAt } = data;

    const user = await this.prisma.user.findFirst({
      where: { userId, branch },
    });

    if (!user) throw new NotFoundException('User not found');

    return this.prisma.giftRound.create({
      data: {
        userId,
        amount,
        reason,
        staffId: 0,
        expiredAt: expiredAt ? new Date(expiredAt) : null,
        isUsed: false,
        branch,
      },
    });
  }
}
