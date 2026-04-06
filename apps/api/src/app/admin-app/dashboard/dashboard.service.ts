import { Injectable, BadRequestException } from '@nestjs/common';
import { MasterPrismaService, TenantPrismaService, FnetPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { ConfigService } from '../config/config.service';
import {
  convertBigIntToNumber,
  getStartOfDayVNISO,
  getCurrentTimeVNISO,
  getStartOfWeekVNISO,
  getEndOfWeekVNISO,
  getCurrentDayOfWeekVN,
  isUserUsingCombo,
  calculateCheckInMinutes,
  parseBoolean,
} from '../computer/computer.utils';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/** In-memory rate limit store */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkInMemoryRateLimit(
  key: string,
  windowMs: number,
  maxRequests: number,
): { allowed: boolean; resetTime: number } {
  const now = Date.now();
  // Cleanup expired
  for (const [k, v] of rateLimitStore.entries()) {
    if (now > v.resetTime) rateLimitStore.delete(k);
  }
  const current = rateLimitStore.get(key);
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, resetTime: now + windowMs };
  }
  if (current.count >= maxRequests) {
    return { allowed: false, resetTime: current.resetTime };
  }
  current.count++;
  return { allowed: true, resetTime: current.resetTime };
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService,
    private readonly fnetPrisma: FnetPrismaService,
    private readonly configService: ConfigService,
  ) {}

  private async getClients(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');
    const gateway = await this.tenantPrisma.getClient(dbUrl);

    const fnetUrl = tenant.fnetUrl;
    if (!fnetUrl) throw new BadRequestException('Tenant chưa cấu hình fnetUrl');
    const fnet = await this.fnetPrisma.getClient(fnetUrl);

    return { gateway: gateway as any, fnet };
  }

  // ─── POST /dashboard/user-calculator ───
  async getUserCalculator(tenantId: string, listUsers: number[]) {
    if (!listUsers?.length) return [];

    const { gateway, fnet } = await this.getClients(tenantId);
    const configs = await this.configService.getConfigs(tenantId);
    const spendPerRound = Number(configs['SPEND_PER_ROUND']) || 5000;

    return this.calculateActiveUsersInfo(fnet, gateway, listUsers, spendPerRound);
  }

  // ─── POST /dashboard/check-in ───
  async createCheckIn(tenantId: string, userId: number) {
    const { gateway } = await this.getClients(tenantId);

    // 1. In-memory rate limit: 1 lần/giờ
    const rlKey = `checkin:${tenantId}:${userId}`;
    const rl = checkInMemoryRateLimit(rlKey, 60 * 60 * 1000, 1);
    if (!rl.allowed) {
      const resetTime = new Date(rl.resetTime).toLocaleString('vi-VN');
      throw new BadRequestException(
        `Bạn chỉ có thể check-in 1 lần mỗi giờ. Vui lòng thử lại sau ${resetTime}`,
      );
    }

    // 2. Daily limit: max 10 lần/ngày
    const startOfDayVN = getStartOfDayVNISO();
    const dailyCountRes = await gateway.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM CheckInResult WHERE userId = ${userId} AND createdAt >= '${startOfDayVN}'`,
    );
    const dailyCount = Number(dailyCountRes[0]?.count || 0);
    const maxDailyCheckIns = 10;
    if (dailyCount >= maxDailyCheckIns) {
      throw new BadRequestException(
        `Bạn đã check-in ${dailyCount}/${maxDailyCheckIns} lần hôm nay. Vui lòng thử lại vào ngày mai!`,
      );
    }

    // 3. Lấy user info → tính availableCheckIn
    const configs = await this.configService.getConfigs(tenantId);
    const spendPerRound = Number(configs['SPEND_PER_ROUND']) || 5000;
    const { gateway: gw2, fnet } = await this.getClients(tenantId);
    const usersInfo = await this.calculateActiveUsersInfo(fnet, gw2, [userId], spendPerRound);
    if (!usersInfo.length) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng');
    }
    const userInfo = usersInfo[0];
    const { availableCheckIn } = userInfo;
    if (availableCheckIn <= 0) {
      throw new BadRequestException('Bạn chưa có sao để nhận, hãy chơi thêm để nhận sao nhé!');
    }

    // 4. Kiểm tra tổng điểm đã claim trong ngày (tối đa 24k/ngày)
    const totalClaimedRes = await gateway.$queryRawUnsafe(
      `SELECT COALESCE(SUM(newStars - oldStars), 0) as totalClaimed FROM UserStarHistory WHERE userId = ${userId} AND type = 'CHECK_IN' AND createdAt >= '${startOfDayVN}'`,
    );
    const totalClaimedToday = Number(totalClaimedRes[0]?.totalClaimed || 0);
    const maxDailyCheckInPoints = 24000;
    const remainingDailyLimit = maxDailyCheckInPoints - totalClaimedToday;

    if (remainingDailyLimit <= 0) {
      throw new BadRequestException(
        `Bạn đã nhận tối đa ${maxDailyCheckInPoints.toLocaleString()} điểm danh hôm nay. Vui lòng thử lại vào ngày mai!`,
      );
    }

    const actualPointsToClaim = Math.min(availableCheckIn, remainingDailyLimit);
    const nowDB = dayjs().utcOffset(7).format('YYYY-MM-DD HH:mm:ss');

    // 5. Transaction với locking (chống race condition / double click)
    const result = await gateway.$transaction(async (tx: any) => {
      // Anti-spam: 55 phút giữa các lần check-in
      const lastCheckIns = await tx.$queryRawUnsafe(
        `SELECT * FROM CheckInResult WHERE userId = ${userId} ORDER BY createdAt DESC LIMIT 1 FOR UPDATE`,
      );
      const lastCheckIn = lastCheckIns[0];
      if (lastCheckIn) {
        const now = dayjs().utcOffset(7);
        const last = dayjs(lastCheckIn.createdAt);
        const minutesSinceLastCheckIn = now.diff(last, 'minute');
        if (minutesSinceLastCheckIn < 55) {
          const remainingMinutes = 55 - minutesSinceLastCheckIn;
          throw new Error(
            `Bạn vừa check-in xong, vui lòng chờ ${remainingMinutes} phút trước khi check-in tiếp!`,
          );
        }
      }

      // Insert CheckInResult
      await tx.$executeRawUnsafe(
        `INSERT INTO CheckInResult (userId, createdAt) VALUES (${userId}, '${nowDB}')`,
      );
      const idRes = await tx.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as id`);
      const checkInId = idRes[0]?.id;

      // Lấy user row + lock
      const users = await tx.$queryRawUnsafe(
        `SELECT * FROM User WHERE userId = ${userId} LIMIT 1 FOR UPDATE`,
      );
      const user = users[0];
      if (user) {
        const oldStars = Number(user.stars || 0);
        const newStars = oldStars + actualPointsToClaim;

        await tx.$executeRawUnsafe(
          `INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt) VALUES (${userId}, 'CHECK_IN', ${oldStars}, ${newStars}, ${checkInId}, '${nowDB}')`,
        );
        await tx.$executeRawUnsafe(
          `UPDATE User SET stars = ${newStars}, updatedAt = '${nowDB}' WHERE userId = ${userId}`,
        );
      }

      const checkInRecords = await tx.$queryRawUnsafe(
        `SELECT * FROM CheckInResult WHERE id = ${checkInId}`,
      );
      return checkInRecords[0];
    });

    return result;
  }

  // ─── GET /dashboard/check-in-result/:userId ───
  async getCheckInResults(tenantId: string, userId: number) {
    const { gateway } = await this.getClients(tenantId);

    const startOfMonth = dayjs().utcOffset(7).startOf('month').format('YYYY-MM-DD HH:mm:ss');
    const endOfMonth = dayjs().utcOffset(7).endOf('month').format('YYYY-MM-DD HH:mm:ss');

    const results = await gateway.$queryRawUnsafe(
      `SELECT * FROM UserStarHistory WHERE userId = ${userId} AND type = 'CHECK_IN' AND createdAt >= '${startOfMonth}' AND createdAt <= '${endOfMonth}' ORDER BY createdAt DESC`,
    );

    return results;
  }

  // ─── calculateActiveUsersInfo (reuse from ComputerService pattern) ───
  private async calculateActiveUsersInfo(
    fnetDB: any,
    gatewayDB: any,
    listUsers: number[],
    spendPerRound: number,
  ) {
    if (listUsers.length === 0) return [];

    const startOfDayVN = getStartOfDayVNISO();
    const curDate = getCurrentTimeVNISO().split('T')[0];
    const startOfWeekVN = getStartOfWeekVNISO();
    const endOfWeekVN = getEndOfWeekVNISO();
    const todayDayOfWeek = getCurrentDayOfWeekVN();
    const userIdsStr = listUsers.join(',');

    const [userSessionsAndTopUps, userDataAndClaims, userGameRounds, userBattlePassData] =
      await Promise.all([
        (async () => {
          const q = `
          SELECT s.UserId, s.EnterDate, s.EndDate, s.EnterTime, s.EndTime, s.status, u.UserType, s.MachineName, s.TimeUsed,
            COALESCE(CAST(SUM(p.AutoAmount) AS DECIMAL(18,2)), 0) AS totalTopUp
          FROM systemlogtb s
          JOIN usertb u ON s.UserId = u.UserId
          LEFT JOIN paymenttb p ON s.UserId = p.UserId
            AND p.PaymentType = 4 AND p.Note = N'Thời gian phí'
            AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) >= '${startOfWeekVN}'
            AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) <= NOW()
          WHERE FIND_IN_SET(s.UserId, '${userIdsStr}') AND s.status = 3
            AND (s.EnterDate = '${curDate}' OR (s.EndDate = '${curDate}' AND s.EnterDate = DATE_SUB('${curDate}', INTERVAL 1 DAY)))
          GROUP BY s.UserId, s.EnterDate, s.EnterTime, s.EndDate, s.EndTime, s.status, u.UserType, s.MachineName, s.TimeUsed
          ORDER BY s.UserId, s.EnterDate DESC, s.EnterTime DESC`;
          return await fnetDB.$queryRawUnsafe(q);
        })(),
        (async () => {
          const q = `
          SELECT u.userId, u.userName, u.stars, u.magicStone, u.isUseApp, u.note, u.createdAt, u.updatedAt,
            COALESCE(SUM(CASE WHEN ush.type = 'CHECK_IN' THEN ush.newStars - ush.oldStars ELSE 0 END), 0) AS totalClaimed,
            COALESCE(SUM(CASE WHEN gr.expiredAt >= NOW() THEN gr.amount - gr.usedAmount ELSE 0 END), 0) AS totalGiftRounds
          FROM User u
          LEFT JOIN UserStarHistory ush ON u.userId = ush.userId AND ush.type = 'CHECK_IN' AND ush.createdAt >= '${startOfDayVN}'
          LEFT JOIN GiftRound gr ON u.userId = gr.userId AND gr.expiredAt >= NOW()
          WHERE u.userId IN (${userIdsStr})
          GROUP BY u.userId, u.userName, u.stars, u.magicStone, u.isUseApp, u.note, u.createdAt, u.updatedAt`;
          return await gatewayDB.$queryRawUnsafe(q);
        })(),
        (async () => {
          const q = `
          SELECT userId, COUNT(*) as gameRounds FROM UserStarHistory
          WHERE userId IN (${userIdsStr}) AND type = 'GAME' AND createdAt >= '${startOfWeekVN}' AND createdAt <= '${endOfWeekVN}'
          GROUP BY userId`;
          return await gatewayDB.$queryRawUnsafe(q);
        })(),
        (async () => {
          const seasonRes: any = await gatewayDB.$queryRawUnsafe(
            `SELECT id FROM BattlePassSeason WHERE isActive = true AND startDate <= DATE(NOW()) AND endDate >= DATE(NOW()) LIMIT 1`,
          );
          if (!seasonRes?.length) return [];
          const seasonId = seasonRes[0].id;
          return await gatewayDB.$queryRawUnsafe(
            `SELECT userId, level, experience, isPremium FROM UserBattlePass WHERE userId IN (${userIdsStr}) AND seasonId = ${seasonId}`,
          );
        })(),
      ]);

    // Combo data
    const comboData: any = await fnetDB.$queryRawUnsafe(
      `SELECT Ownerid, FromDate, FromTime, ToDate, ToTime FROM combodetailtb
       WHERE FIND_IN_SET(Ownerid, '${userIdsStr}')
         AND ((FromDate + INTERVAL FromTime HOUR_SECOND) <= NOW() AND (ToDate + INTERVAL ToTime HOUR_SECOND) >= DATE_SUB(NOW(), INTERVAL 1 DAY))`,
    );
    const userComboMap = new Map<number, any[]>();
    comboData.forEach((combo: any) => {
      const uid = convertBigIntToNumber(combo.Ownerid);
      if (!userComboMap.has(uid)) userComboMap.set(uid, []);
      userComboMap.get(uid)!.push(combo);
    });

    // CheckInItem config
    const todayCheckInRes: any = await gatewayDB.$queryRawUnsafe(
      `SELECT id, dayName, stars FROM CheckInItem WHERE dayName = '${todayDayOfWeek}' LIMIT 1`,
    );
    const starsPerHour = todayCheckInRes[0]?.stars || 1000;

    // Build maps
    const userSessionsMap = new Map<number, any[]>();
    const userTopUpsMap = new Map<number, number>();

    (userSessionsAndTopUps as any[]).forEach((s: any) => {
      const uid = s.UserId;
      if (!userSessionsMap.has(uid)) userSessionsMap.set(uid, []);
      userSessionsMap.get(uid)!.push(s);
      if (s.totalTopUp > 0) userTopUpsMap.set(uid, convertBigIntToNumber(s.totalTopUp));
    });

    const userDataMap = new Map();
    const userClaimsMap = new Map();
    const userGiftRoundsMap = new Map();
    (userDataAndClaims as any[]).forEach((u: any) => {
      userDataMap.set(u.userId, u);
      userClaimsMap.set(u.userId, convertBigIntToNumber(u.totalClaimed));
      userGiftRoundsMap.set(u.userId, convertBigIntToNumber(u.totalGiftRounds));
    });

    const userGameRoundsMap = new Map();
    (userGameRounds as any[]).forEach((r: any) => {
      userGameRoundsMap.set(r.userId, convertBigIntToNumber(r.gameRounds));
    });

    const userBattlePassMap = new Map();
    (userBattlePassData as any[]).forEach((bp: any) => {
      userBattlePassMap.set(bp.userId, {
        level: convertBigIntToNumber(bp.level),
        experience: convertBigIntToNumber(bp.experience),
        isPremium: parseBoolean(bp.isPremium),
      });
    });

    // Calculate per user
    const results: any[] = [];
    for (const userId of listUsers) {
      if (typeof userId !== 'number' || isNaN(userId)) continue;

      const sessions = userSessionsMap.get(userId) || [];
      const session = sessions[0];
      const userCombos = userComboMap.get(userId) || [];
      const usingCombo = isUserUsingCombo(userCombos, userId);
      const userType = usingCombo ? 5 : (session?.UserType ?? null);

      let machineName: string | undefined;
      if (sessions.length > 0) {
        const latest = sessions.reduce((a: any, b: any) => {
          const at = new Date(`${a.EnterDate}T${a.EnterTime || '00:00:00'}`).getTime();
          const bt = new Date(`${b.EnterDate}T${b.EnterTime || '00:00:00'}`).getTime();
          return bt > at ? b : a;
        });
        machineName = latest.MachineName;
      }

      const totalPlayMinutes = calculateCheckInMinutes(sessions, userCombos, userId);
      const totalPlayHours = Math.floor(totalPlayMinutes / 60);
      const totalCheckIn = Math.floor(totalPlayHours * starsPerHour);

      const totalClaimed = userClaimsMap.get(userId) || 0;
      const userData = userDataMap.get(userId);
      const claimedCheckIn = totalClaimed;

      const maxDailyPoints = 24000;
      const remainingDaily = Math.max(0, maxDailyPoints - totalClaimed);
      const availableCheckIn = Math.min(Math.max(0, totalCheckIn - totalClaimed), remainingDaily);

      const userTopUp = userTopUpsMap.get(userId) || 0;
      const round = Math.floor(userTopUp ? userTopUp / spendPerRound : 0);
      const totalGiftRounds = userGiftRoundsMap.get(userId) || 0;
      const usedRounds = userGameRoundsMap.get(userId) || 0;
      const totalRound = userData?.userId ? round + totalGiftRounds - usedRounds : round + totalGiftRounds;

      const bp = userBattlePassMap.get(userId);
      const battlePass = bp
        ? { isUsed: true, isPremium: bp.isPremium, data: { level: bp.level, exp: bp.experience } }
        : { isUsed: false, isPremium: false, data: null };

      results.push({
        userId,
        userName: userData?.userName,
        userType,
        totalPlayMinutes,
        totalCheckIn,
        claimedCheckIn,
        availableCheckIn,
        round: totalRound,
        stars: userData?.stars || 0,
        magicStone: userData?.magicStone || 0,
        isUseApp: userData ? parseBoolean(userData.isUseApp) : true,
        note: userData?.note || '',
        totalPayment: userTopUp,
        giftRound: totalGiftRounds,
        machineName,
        battlePass,
      });
    }

    return results;
  }

  // ─── GET /dashboard/rewards — danh sách reward khả dụng ───
  async getRewards(tenantId: string) {
    const { gateway } = await this.getClients(tenantId);

    const now = dayjs().utcOffset(7).format('YYYY-MM-DD HH:mm:ss');

    // Lấy danh sách reward còn hiệu lực + đếm số promotion code chưa dùng
    const rewards = await gateway.$queryRawUnsafe(`
      SELECT r.id, r.name, r.stars, r.value, r.startDate, r.endDate,
        (SELECT COUNT(*) FROM PromotionCode pc
         WHERE pc.promotionSettingId = r.id AND pc.isUsed = false
        ) AS totalPromotion
      FROM Reward r
      WHERE (r.startDate IS NULL OR r.startDate <= '${now}')
        AND (r.endDate IS NULL OR r.endDate >= '${now}')
      ORDER BY r.stars ASC
    `);

    return (rewards as any[]).map((r: any) => ({
      ...r,
      stars: Number(r.stars || 0),
      value: Number(r.value || 0),
      totalPromotion: Number(r.totalPromotion || 0),
    }));
  }

  // ─── POST /dashboard/reward-exchange — đổi sao lấy thưởng ───
  async exchangeReward(
    tenantId: string,
    userId: number,
    rewardId: number,
  ) {
    const { gateway } = await this.getClients(tenantId);
    const nowDB = dayjs().utcOffset(7).format('YYYY-MM-DD HH:mm:ss');

    return await gateway.$transaction(async (tx: any) => {
      // 1. Lock user row
      const users = await tx.$queryRawUnsafe(
        `SELECT * FROM User WHERE userId = ${userId} LIMIT 1 FOR UPDATE`,
      );
      const user = users[0];
      if (!user) throw new BadRequestException('Không tìm thấy thông tin người dùng');

      const currentStars = Number(user.stars || 0);

      // 2. Lock reward row
      const rewards = await tx.$queryRawUnsafe(
        `SELECT * FROM Reward WHERE id = ${rewardId} LIMIT 1 FOR UPDATE`,
      );
      const reward = rewards[0];
      if (!reward) throw new BadRequestException('Phần thưởng không tồn tại');

      const requiredStars = Number(reward.stars || 0);
      if (currentStars < requiredStars) {
        throw new BadRequestException(
          `Bạn chỉ có ${currentStars.toLocaleString()} sao, không đủ để đổi (cần ${requiredStars.toLocaleString()} sao).`,
        );
      }

      // 3. Tìm promotion code chưa dùng
      const codes = await tx.$queryRawUnsafe(
        `SELECT * FROM PromotionCode WHERE promotionSettingId = ${rewardId} AND isUsed = false LIMIT 1 FOR UPDATE`,
      );
      if (!codes.length) {
        throw new BadRequestException('Số lượng mã đã hết. Vui lòng liên hệ admin để bổ sung.');
      }
      const promoCode = codes[0];

      // 4. Đánh dấu code đã dùng
      await tx.$executeRawUnsafe(
        `UPDATE PromotionCode SET isUsed = true, updatedAt = '${nowDB}' WHERE id = ${promoCode.id}`,
      );

      // 5. Tạo UserRewardMap
      await tx.$executeRawUnsafe(
        `INSERT INTO UserRewardMap (userId, rewardId, promotionCodeId, status, type, createdAt, updatedAt)
         VALUES (${userId}, ${rewardId}, ${promoCode.id}, 'INITIAL', 'STARS', '${nowDB}', '${nowDB}')`,
      );

      // 6. Trừ sao + ghi lịch sử
      const newStars = currentStars - requiredStars;
      await tx.$executeRawUnsafe(
        `INSERT INTO UserStarHistory (userId, type, oldStars, newStars, createdAt)
         VALUES (${userId}, 'REWARD', ${currentStars}, ${newStars}, '${nowDB}')`,
      );
      await tx.$executeRawUnsafe(
        `UPDATE User SET stars = ${newStars}, updatedAt = '${nowDB}' WHERE userId = ${userId}`,
      );

      return { success: true, newStars };
    });
  }

  // ─── GET /dashboard/reward-history — lịch sử đổi thưởng ───
  async getRewardHistory(
    tenantId: string,
    userId: number,
    page: number,
    limit: number,
  ) {
    const { gateway } = await this.getClients(tenantId);
    const offset = (page - 1) * limit;

    const [rewards, countRes] = await Promise.all([
      gateway.$queryRawUnsafe(`
        SELECT urm.id, urm.createdAt, urm.updatedAt, urm.status, urm.note, urm.type,
          r.id AS reward_id, r.name AS reward_name, r.value AS reward_value, r.stars AS reward_stars,
          pc.id AS promotionCode_id, pc.code AS promotionCode_code, pc.name AS promotionCode_name, pc.value AS promotionCode_value
        FROM UserRewardMap urm
        LEFT JOIN Reward r ON urm.rewardId = r.id
        LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id
        WHERE urm.userId = ${userId}
        ORDER BY urm.createdAt DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      gateway.$queryRawUnsafe(
        `SELECT COUNT(*) as total FROM UserRewardMap WHERE userId = ${userId}`,
      ),
    ]);

    const total = Number(countRes[0]?.total || 0);
    return {
      rewards: (rewards as any[]).map((r: any) => ({
        ...r,
        reward_stars: Number(r.reward_stars || 0),
        reward_value: Number(r.reward_value || 0),
        promotionCode_value: Number(r.promotionCode_value || 0),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
