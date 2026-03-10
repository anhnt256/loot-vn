import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getCurrentTimeVNDB } from '../lib/timezone-utils';
import dayjs from '../lib/dayjs';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkGatewayBonus(userId: number, branch: string) {
    const claimDeadline = process.env.GATEWAY_BONUS_DEADLINE || '2025-07-15';
    const accountCreationDeadline = '2025-07-05';

    const now = dayjs().add(7, 'hour'); // Simple UTC+7
    const deadline = dayjs(claimDeadline).add(7, 'hour').endOf('day');
    const accountDeadline = dayjs(accountCreationDeadline).add(7, 'hour');

    if (now.isAfter(deadline)) {
      return {
        available: false,
        reason: 'expired',
        message: 'Chương trình Gateway Bonus đã kết thúc',
      };
    }

    const user = await this.prisma.user.findFirst({
      where: { userId, branch },
    });

    if (!user) throw new NotFoundException('User not found');

    const userCreatedAt = dayjs(user.createdAt).add(7, 'hour');
    if (userCreatedAt.isAfter(accountDeadline)) {
      return {
        available: false,
        reason: 'new_account',
        message: 'Chỉ áp dụng cho tài khoản tạo trước ngày 05/07/2025',
      };
    }

    const existingClaim = await this.prisma.giftRound.findFirst({
      where: { userId, reason: 'Gateway Bonus' },
    });

    if (existingClaim) {
      return {
        available: false,
        reason: 'already_claimed',
        message: 'Bạn đã nhận Gateway Bonus rồi',
      };
    }

    return { available: true, message: 'Bạn có thể nhận 3 lượt quay miễn phí' };
  }

  async claimGatewayBonus(userId: number, branch: string) {
    const status = await this.checkGatewayBonus(userId, branch);
    if (!status.available) throw new BadRequestException(status.message);

    return this.prisma.$transaction(async (tx) => {
      const expirationDate = dayjs().add(1, 'week').toDate();
      const now = getCurrentTimeVNDB();

      await tx.giftRound.create({
        data: {
          userId,
          amount: 3,
          reason: 'Gateway Bonus',
          staffId: 0,
          branch,
          expiredAt: expirationDate,
          isUsed: false,
          createdAt: now,
          updatedAt: now,
        },
      });

      const user = await tx.user.findFirst({ where: { userId, branch } });
      await tx.user.update({
        where: { id: user.id },
        data: { magicStone: { increment: 3 }, updatedAt: now },
      });

      return { success: true, message: 'Nhận Gateway Bonus thành công!' };
    });
  }
}
