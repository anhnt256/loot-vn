import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getFnetDB, getFnetPrisma } from '../lib/db';
import { getCurrentTimeVNDB } from '../lib/timezone-utils';

@Injectable()
export class UserRewardMapService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: number;
    rewardId: number;
    duration?: number;
    isUsed?: boolean;
    value?: number;
    oldStars: number;
    newStars: number;
    branch: string;
    token: string;
  }) {
    const {
      userId,
      rewardId,
      duration = 7,
      isUsed: isUsedParam = true,
      branch,
    } = data;

    if (!rewardId || typeof rewardId !== 'number' || rewardId <= 0) {
      throw new BadRequestException('Invalid reward ID');
    }

    if (typeof duration !== 'number' || duration <= 0) {
      throw new BadRequestException('Invalid duration');
    }

    if (typeof isUsedParam !== 'boolean') {
      throw new BadRequestException('Invalid isUsed value');
    }

    const users = await this.prisma.$queryRaw`
      SELECT * FROM User 
      WHERE userId = ${userId} AND branch = ${branch}
      LIMIT 1
    `;
    const user = (users as any[])[0];

    if (!user) {
      throw new BadRequestException(
        `User with userId ${userId} and branch ${branch} not found`,
      );
    }

    const allUserAccounts = await this.prisma.$queryRaw`
      SELECT * FROM User 
      WHERE userId = ${userId} AND branch = ${branch}
      ORDER BY createdAt DESC
    `;

    if ((allUserAccounts as any[]).length > 1) {
      throw new BadRequestException(
        'Tài khoản của bạn đã được sử dụng ở nhiều nơi. Vui lòng liên hệ admin để được hỗ trợ.',
      );
    }

    try {
      const fnetDB = await getFnetDB(branch);

      const fnetUserCount = await fnetDB.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM fnet.usertb 
        WHERE UserId = ${userId}
      `;

      if (fnetUserCount[0].count === 0) {
        throw new BadRequestException(
          'Tài khoản không tồn tại trong hệ thống Fnet. Vui lòng liên hệ admin để được hỗ trợ.',
        );
      }

      if (fnetUserCount[0].count > 1) {
        throw new BadRequestException(
          'Tài khoản của bạn đã được sử dụng ở nhiều nơi trong hệ thống Fnet. Vui lòng liên hệ admin để được hỗ trợ.',
        );
      }

      const recentSession = await fnetDB.$queryRaw<any[]>`
        SELECT 
          s.UserId,
          s.EnterDate,
          s.EndDate,
          s.EnterTime,
          s.EndTime,
          s.status,
          u.UserType,
          s.MachineName
        FROM fnet.systemlogtb s
        JOIN fnet.usertb u ON s.UserId = u.UserId
        WHERE s.UserId = ${userId}
          AND s.status = 3
        ORDER BY s.EnterDate DESC, s.EnterTime DESC
        LIMIT 1
      `;

      if (!recentSession[0]) {
        throw new BadRequestException(
          'Không tìm thấy hoạt động gần đây của tài khoản trong hệ thống Fnet. Vui lòng liên hệ admin để được hỗ trợ.',
        );
      }
    } catch (error: any) {
      throw new BadRequestException(
        error?.message ||
          'Không thể kiểm tra thông tin tài khoản với hệ thống Fnet. Vui lòng liên hệ admin để được hỗ trợ.',
      );
    }

    let oldStars = user.stars;
    let newStars = user.stars;

    const pendingRewardExchanges = await this.prisma.$queryRaw`
      SELECT * FROM UserRewardMap 
      WHERE userId = ${user.userId} AND branch = ${branch} AND status = 'INITIAL'
      LIMIT 1
    `;
    const pendingRewardExchange = (pendingRewardExchanges as any[])[0];

    if (pendingRewardExchange) {
      throw new BadRequestException(
        'Bạn đang có yêu cầu đổi thưởng đang chờ duyệt. Vui lòng đợi admin xử lý xong trước khi đổi thưởng tiếp.',
      );
    }

    const promotionRewards = await this.prisma.$queryRaw`
      SELECT * FROM PromotionReward 
      WHERE id = ${rewardId} AND branch = ${branch} AND isActive = true
      LIMIT 1
    `;
    const promotionReward = (promotionRewards as any[])[0];

    if (!promotionReward) {
      throw new BadRequestException(
        'Promotion reward không tồn tại hoặc đã bị vô hiệu hóa.',
      );
    }

    if (promotionReward.quantity <= 0) {
      throw new BadRequestException('Thẻ cào này đã hết hàng.');
    }

    if (user.stars < promotionReward.starsValue) {
      throw new BadRequestException(
        `User chỉ có ${user.stars.toLocaleString()} sao, không đủ để đổi thưởng này (cần ${promotionReward.starsValue.toLocaleString()} sao).`,
      );
    }

    newStars = oldStars - promotionReward.starsValue;
    let createUserRewardMap;

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE PromotionReward 
          SET quantity = quantity - 1, updatedAt = ${getCurrentTimeVNDB()}
          WHERE id = ${rewardId}
        `;

        await tx.$executeRaw`
          INSERT INTO UserRewardMap (userId, rewardId, promotionCodeId, duration, isUsed, branch, createdAt, updatedAt)
          VALUES (${user.userId}, ${rewardId}, ${rewardId}, ${duration}, ${isUsedParam}, ${branch}, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
        `;

        const userRewardMapResults =
          await tx.$queryRaw`SELECT LAST_INSERT_ID() as id`;
        const userRewardMapId = (userRewardMapResults as any[])[0]?.id;

        const userRewardMapRecords = await tx.$queryRaw`
          SELECT * FROM UserRewardMap WHERE id = ${userRewardMapId}
        `;
        createUserRewardMap = (userRewardMapRecords as any[])[0];

        const fnetDB = await getFnetDB(branch);
        const walletResult = await fnetDB.$queryRaw<any[]>`
          SELECT main, sub FROM fnet.wallettb 
          WHERE userid = ${user.userId}
          LIMIT 1
        `;

        if (walletResult.length === 0) {
          throw new Error(`Wallet not found for userId: ${user.userId}`);
        }

        const oldMain = Number(walletResult[0].main) || 0;
        const oldSub = Number(walletResult[0].sub) || 0;
        const newSub = oldSub + promotionReward.value;
        const newMain = oldMain;

        await tx.$executeRaw`
          INSERT INTO FnetHistory (userId, branch, oldSubMoney, newSubMoney, oldMainMoney, newMainMoney, moneyType, targetId, type, createdAt, updatedAt)
          VALUES (${user.userId}, ${branch}, ${oldSub}, ${newSub}, ${oldMain}, ${newMain}, 'SUB', ${userRewardMapId}, 'REWARD', ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
        `;

        await tx.$executeRaw`
          UPDATE User 
          SET stars = ${newStars}, updatedAt = ${getCurrentTimeVNDB()}
          WHERE id = ${user.id} AND branch = ${branch}
        `;
      });
      return { success: true, data: createUserRewardMap };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Failed to create.');
    }
  }
}
