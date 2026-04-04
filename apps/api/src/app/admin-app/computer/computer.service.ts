import { Injectable, BadRequestException } from '@nestjs/common';
import { MasterPrismaService, TenantPrismaService, FnetPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { ConfigService } from '../config/config.service';
import {
  convertBigIntToString,
  safeDateToString,
  executeQueryWithTimeout,
  getStartOfDayVNISO,
  getCurrentTimeVNISO,
  getStartOfWeekVNISO,
  getEndOfWeekVNISO,
  getCurrentDayOfWeekVN,
  isUserUsingCombo,
  calculateCheckInMinutes,
  convertBigIntToNumber,
  parseBoolean,
} from './computer.utils';

@Injectable()
export class ComputerService {
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
        where: { tenantId: tenantId, deletedAt: null },
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

  private async calculateActiveUsersInfo(fnetDB: any, gatewayDB: any, listUsers: number[], spendPerRound: number, isDebug = false, debugUsers: number[] = []) {
    const finalListUsers = isDebug ? [...new Set([...listUsers, ...debugUsers])] : listUsers;
    if (finalListUsers.length === 0) return [];

    const startOfDayVN = getStartOfDayVNISO();
    const curDate = getCurrentTimeVNISO().split("T")[0];
    const startOfWeekVN = getStartOfWeekVNISO();
    const endOfWeekVN = getEndOfWeekVNISO();
    const todayDayOfWeek = getCurrentDayOfWeekVN();
    const userIdsStr = finalListUsers.join(",");

    const [
      userSessionsAndTopUps,
      userDataAndClaims,
      userGameRounds,
      userBattlePassData,
    ] = await Promise.all([
      (async () => {
        const queryString = `
        SELECT 
          s.UserId, s.EnterDate, s.EndDate, s.EnterTime, s.EndTime, s.status, u.UserType, s.MachineName, s.TimeUsed,
          COALESCE(CAST(SUM(p.AutoAmount) AS DECIMAL(18,2)), 0) AS totalTopUp
        FROM systemlogtb s
        JOIN usertb u ON s.UserId = u.UserId
        LEFT JOIN paymenttb p ON s.UserId = p.UserId 
          AND p.PaymentType = 4 
          AND p.Note = N'Thời gian phí'
          AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) >= '${startOfWeekVN}'
          AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) <= NOW()
        WHERE FIND_IN_SET(s.UserId, '${userIdsStr}')
          AND s.status = 3
          AND (
            s.EnterDate = '${curDate}'
            OR (s.EndDate = '${curDate}' AND s.EnterDate = DATE_SUB('${curDate}', INTERVAL 1 DAY))
          )
        GROUP BY s.UserId, s.EnterDate, s.EnterTime, s.EndDate, s.EndTime, s.status, u.UserType, s.MachineName, s.TimeUsed
        ORDER BY s.UserId, s.EnterDate DESC, s.EnterTime DESC
        `;
        return await fnetDB.$queryRawUnsafe(queryString);
      })(),
      (async () => {
        const queryString = `
        SELECT 
          u.id, u.userId, u.userName, u.stars, u.magicStone, u.isUseApp, u.note, u.createdAt, u.updatedAt,
          COALESCE(SUM(CASE WHEN ush.type = 'CHECK_IN' THEN ush.newStars - ush.oldStars ELSE 0 END), 0) AS totalClaimed,
          COALESCE(SUM(CASE WHEN gr.expiredAt >= NOW() THEN gr.amount - gr.usedAmount ELSE 0 END), 0) AS totalGiftRounds
        FROM User u
        LEFT JOIN UserStarHistory ush ON u.userId = ush.userId 
          AND ush.type = 'CHECK_IN' 
          AND ush.createdAt >= '${startOfDayVN}'
        LEFT JOIN GiftRound gr ON u.userId = gr.userId 
          AND gr.expiredAt >= NOW()
        WHERE u.userId IN (${userIdsStr})
        GROUP BY u.id, u.userId, u.userName, u.stars, u.magicStone, u.isUseApp, u.note, u.createdAt, u.updatedAt
        `;
        return await gatewayDB.$queryRawUnsafe(queryString);
      })(),
      (async () => {
        const queryString = `
        SELECT userId, COUNT(*) as gameRounds
        FROM UserStarHistory
        WHERE userId IN (${userIdsStr}) AND type = 'GAME' AND createdAt >= '${startOfWeekVN}' AND createdAt <= '${endOfWeekVN}'
        GROUP BY userId
        `;
        return await gatewayDB.$queryRawUnsafe(queryString);
      })(),
      (async () => {
        const currentSeasonQuery = `
          SELECT id FROM BattlePassSeason 
          WHERE isActive = true AND startDate <= DATE(NOW()) AND endDate >= DATE(NOW()) LIMIT 1
        `;
        const currentSeasonResult: any = await gatewayDB.$queryRawUnsafe(currentSeasonQuery);
        if (!currentSeasonResult || currentSeasonResult.length === 0) return [];
        const currentSeasonId = currentSeasonResult[0].id;

        const queryString = `
        SELECT userId, level, experience, isPremium
        FROM UserBattlePass
        WHERE userId IN (${userIdsStr}) AND seasonId = ${currentSeasonId}
        `;
        return await gatewayDB.$queryRawUnsafe(queryString);
      })(),
    ]);

    const machineNames = [...new Set((userSessionsAndTopUps as any[]).map((s) => s.MachineName))];
    if (machineNames.length > 0) {
      const machineNamesStr = machineNames.map((name) => `'${name}'`).join(",");
      const deviceQueryString = `
        SELECT c.*, c.PCName as machineName
        FROM clientsystb c
        WHERE c.PCName IN (${machineNamesStr})
      `;
      // We perform this query to keep compatibility, though deviceData is not heavily used below.
      await fnetDB.$queryRawUnsafe(deviceQueryString);
    }

    const comboQueryString = `
      SELECT Ownerid, FromDate, FromTime, ToDate, ToTime
      FROM combodetailtb
      WHERE FIND_IN_SET(Ownerid, '${userIdsStr}')
        AND ((FromDate + INTERVAL FromTime HOUR_SECOND) <= NOW() AND (ToDate + INTERVAL ToTime HOUR_SECOND) >= DATE_SUB(NOW(), INTERVAL 1 DAY))
    `;
    const comboData: any = await fnetDB.$queryRawUnsafe(comboQueryString);
    const userComboMap = new Map<number, any[]>();
    comboData.forEach((combo) => {
      const userId = convertBigIntToNumber(combo.Ownerid);
      if (!userComboMap.has(userId)) userComboMap.set(userId, []);
      userComboMap.get(userId)!.push(combo);
    });

    const todayCheckInResult: any = await gatewayDB.$queryRawUnsafe(`
      SELECT id, dayName, stars FROM CheckInItem WHERE dayName = '${todayDayOfWeek}' LIMIT 1
    `);
    const todayCheckIn = todayCheckInResult[0];
    const starsPerHour = todayCheckIn ? todayCheckIn.stars : 1000;

    const userSessionsMap = new Map<number, any[]>();
    const userTopUpsMap = new Map<number, number>();
    const activeUsersMap = new Map();

    (userSessionsAndTopUps as any[]).forEach((session) => {
      const userId = session.UserId;
      if (!userSessionsMap.has(userId)) userSessionsMap.set(userId, []);
      userSessionsMap.get(userId)!.push(session);

      if (session.totalTopUp && session.totalTopUp > 0) {
        userTopUpsMap.set(userId, convertBigIntToNumber(session.totalTopUp));
      }

      if (!activeUsersMap.has(userId)) {
        const userCombos = userComboMap.get(userId) || [];
        const isUsingCombo = isUserUsingCombo(userCombos, userId, isDebug && debugUsers.includes(userId));
        activeUsersMap.set(userId, { userId, userType: isUsingCombo ? 5 : session.UserType });
      }
    });

    const userDataMap = new Map();
    const userClaimsMap = new Map();
    const userGiftRoundsMap = new Map();

    (userDataAndClaims as any[]).forEach((user) => {
      userDataMap.set(user.userId, user);
      userClaimsMap.set(user.userId, convertBigIntToNumber(user.totalClaimed));
      userGiftRoundsMap.set(user.userId, convertBigIntToNumber(user.totalGiftRounds));
    });

    const userGameRoundsMap = new Map();
    (userGameRounds as any[]).forEach((round) => {
      userGameRoundsMap.set(round.userId, convertBigIntToNumber(round.gameRounds));
    });

    const userBattlePassMap = new Map();
    (userBattlePassData as any[]).forEach((battlePass) => {
      userBattlePassMap.set(battlePass.userId, {
        level: convertBigIntToNumber(battlePass.level),
        experience: convertBigIntToNumber(battlePass.experience),
        isPremium: parseBoolean(battlePass.isPremium),
      });
    });

    const activeUsers = finalListUsers.map(userId => {
      // Find session to determine if using combo and to get user type
      const session = userSessionsMap.get(userId)?.[0];
      const userCombos = userComboMap.get(userId) || [];
      const isUsingCombo = isUserUsingCombo(userCombos, userId, isDebug && debugUsers.includes(userId));
      
      return { 
        userId, 
        userType: isUsingCombo ? 5 : (session?.UserType ?? null) 
      };
    });
    const results: any[] = [];

    for (const activeUser of activeUsers) {
      const { userType, userId } = activeUser;
      if (typeof userId !== "number" || isNaN(userId)) continue;

      let checkIn = 0;
      let totalCheckIn = 0;
      let claimedCheckIn = 0;
      let availableCheckIn = 0;
      let totalRound = 0;
      let userData = null;
      let userTopUp = 0;
      let totalGiftRounds = 0;
      let machineName: string | undefined;

      if (userId) {
        const sessions = userSessionsMap.get(userId) || [];
        if (sessions.length > 0) {
          const latestSession = sessions.reduce((latest, current) => {
            const latestTime = new Date(`${latest.EnterDate}T${latest.EnterTime || "00:00:00"}`).getTime();
            const currentTime = new Date(`${current.EnterDate}T${current.EnterTime || "00:00:00"}`).getTime();
            return currentTime > latestTime ? current : latest;
          });
          machineName = latestSession.MachineName;
        }

        const userCombos = userComboMap.get(userId) || [];
        const totalPlayTimeMinutes = calculateCheckInMinutes(sessions, userCombos, userId, isDebug && debugUsers.includes(userId));
        const totalPlayTimeHours = Math.floor(totalPlayTimeMinutes / 60);
        totalCheckIn = Math.floor(totalPlayTimeHours * starsPerHour);

        const totalClaimed = userClaimsMap.get(userId) || 0;
        userData = userDataMap.get(userId);
        claimedCheckIn = totalClaimed;

        const maxDailyCheckInPoints = 24000;
        const remainingDailyLimit = Math.max(0, maxDailyCheckInPoints - totalClaimed);
        availableCheckIn = Math.min(Math.max(0, totalCheckIn - totalClaimed), remainingDailyLimit);
        checkIn = userData?.id ? availableCheckIn : totalCheckIn;
      }

      userTopUp = userTopUpsMap.get(userId) || 0;
      const round = Math.floor(userTopUp ? userTopUp / spendPerRound : 0);
      totalGiftRounds = userGiftRoundsMap.get(userId) || 0;

      if (userData?.id) {
        const usedRounds = userGameRoundsMap.get(userId) || 0;
        totalRound = round + totalGiftRounds - usedRounds;
      } else {
        totalRound = round + totalGiftRounds;
      }

      const battlePassData = userBattlePassMap.get(userId);
      const battlePass = battlePassData
        ? { isUsed: true, isPremium: battlePassData.isPremium, data: { level: battlePassData.level, exp: battlePassData.experience } }
        : { isUsed: false, isPremium: false, data: null };

      results.push({
        userId,
        userName: userData?.userName,
        userType,
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

  async getComputers(tenantId: string) {
    const { gateway, fnet } = await this.getClients(tenantId);
    
    const configs = await this.configService.getConfigs(tenantId);
    const computerPrefix = configs['COMPUTER_PREFIX'] || 'MAY';
    const spendPerRound = Number(configs['SPEND_PER_ROUND']) || Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND || 5000);
    
    // Using string interpolation for queries directly inside methods
    const startOfDayVN = getStartOfDayVNISO();

    const queryResults = await Promise.allSettled([
      executeQueryWithTimeout(async () => {
        return (await fnet.$queryRawUnsafe(`
        SELECT 
          s.MachineName, s.EnterDate, s.EnterTime, s.Status, s.UserId, u.UserType, cs.NetInfo, mg.MachineGroupName, mg.PriceDefault, pm.Price, d.Status as DeviceStatus
        FROM systemlogtb s
        LEFT JOIN usertb u ON s.UserId = u.UserId
        LEFT JOIN clientsystb cs ON s.MachineName = cs.PCName
        LEFT JOIN machinegrouptb mg ON u.MachineGroupId = mg.MachineGroupId
        LEFT JOIN pricemachinetb pm ON mg.MachineGroupId = pm.MachineGroupId AND pm.PriceId = 1
        LEFT JOIN dptb d ON s.MachineName = d.ComputerName
        INNER JOIN (
          SELECT MachineName, MAX(SystemLogId) AS MaxSystemLogId
          FROM systemlogtb
          WHERE MachineName NOT LIKE '${computerPrefix}-%' AND EnterDate >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
          GROUP BY MachineName
        ) latest_log ON s.MachineName = latest_log.MachineName AND s.SystemLogId = latest_log.MaxSystemLogId
        ORDER BY s.MachineName ASC;
      `)) as any[];
      }, 8000),

      executeQueryWithTimeout(async () => {
        return (await gateway.$queryRawUnsafe(`
        SELECT h.*, CONVERT_TZ(h.createdAt, '+00:00', '+07:00') as createdAt, CONVERT_TZ(h.updatedAt, '+00:00', '+07:00') as updatedAt
        FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY deviceId, type ORDER BY createdAt DESC) as rn FROM DeviceHistory WHERE type IN ('REPORT', 'REPAIR')) h
        WHERE h.rn = 1
      `)) as any[];
      }, 5000),

      executeQueryWithTimeout(async () => {
        return (await fnet.$queryRawUnsafe(`
        select u.UserName as name, u.MAC as macAddress, m.MachineGroupName
        FROM usertb u 
        left join machinegrouptb m on m.MachineGroupId = u.MachineGroupId
        where u.UserName REGEXP '^${computerPrefix}[0-9]+'
        ORDER BY LENGTH(u.UserName) ASC, u.UserName ASC
      `)) as any[];
      }, 5000),

      executeQueryWithTimeout(async () => {
        return (await gateway.$queryRawUnsafe(`SELECT * FROM CheckInItem`)) as any[];
      }, 3000),

      executeQueryWithTimeout(async () => {
        return (await fnet.$queryRawUnsafe(`
        SELECT cs.PCName as machineName, cs.NetInfo, mg.MachineGroupName, mg.PriceDefault, pm.Price
        FROM clientsystb cs
        LEFT JOIN usertb u ON cs.PCName = u.UserName
        LEFT JOIN machinegrouptb mg ON u.MachineGroupId = mg.MachineGroupId
        LEFT JOIN pricemachinetb pm ON mg.MachineGroupId = pm.MachineGroupId AND pm.PriceId = 1
        WHERE cs.PCName IS NOT NULL
        ORDER BY cs.PCName ASC;
      `)) as any[];
      }, 5000),
      executeQueryWithTimeout(async () => {
        return (await gateway.computer.findMany({
          select: { id: true, name: true, macAddress: true, devices: true }
        }));
      }, 5000),
    ]);

    const computerStatus: any[] = queryResults[0].status === "fulfilled" ? (queryResults[0].value || []) : [];
    const deviceHistoriesRaw: any[] = queryResults[1].status === "fulfilled" ? (queryResults[1].value || []) : [];
    const computers: any[] = queryResults[2].status === "fulfilled" ? (queryResults[2].value || []) : [];
    const checkInItems: any[] = queryResults[3].status === "fulfilled" ? (queryResults[3].value || []) : [];
    const machineDetailsRaw: any[] = queryResults[4].status === "fulfilled" ? (queryResults[4].value || []) : [];
    const gatewayComputers: any[] = queryResults[5].status === "fulfilled" ? (queryResults[5].value || []) : [];

    if (!Array.isArray(computers) || computers.length === 0) {
      return [];
    }

    const deviceIdToHistories: { [key: number]: any } = {};
    for (const h of deviceHistoriesRaw) {
      if (!deviceIdToHistories[h.deviceId]) deviceIdToHistories[h.deviceId] = { REPORT: null, REPAIR: null };
      if (h.type === "REPORT" && !deviceIdToHistories[h.deviceId].REPORT) deviceIdToHistories[h.deviceId].REPORT = h;
      if (h.type === "REPAIR" && !deviceIdToHistories[h.deviceId].REPAIR) deviceIdToHistories[h.deviceId].REPAIR = h;
    }

    const activeUserIds = Array.isArray(computerStatus) && computerStatus.length > 0
      ? computerStatus.filter((status: any) => status.UserId).map((status: any) => parseInt(status.UserId, 10))
      : [];

    let usersInfo: any[] = [];
    if (activeUserIds.length > 0) {
      try {
        usersInfo = (await executeQueryWithTimeout(() => this.calculateActiveUsersInfo(fnet, gateway, activeUserIds, spendPerRound), 10000)) || [];
      } catch (error) {
        usersInfo = [];
      }
    }

    const userInfoMap = new Map();
    usersInfo.forEach((userInfo) => userInfoMap.set(userInfo.userId, userInfo));

    const machineDetailsMap = new Map();
    if (Array.isArray(machineDetailsRaw)) {
      machineDetailsRaw.forEach((machineDetail: any) => {
        if (machineDetail.machineName) {
          let netInfoData = null;
          try {
            netInfoData = machineDetail.NetInfo ? JSON.parse(machineDetail.NetInfo) : null;
          } catch (e) { netInfoData = null; }
          machineDetailsMap.set(machineDetail.machineName, { ...machineDetail, netInfo: netInfoData });
        }
      });
    }

    const results = [];
    for (const computer of computers) {
      const { name, macAddress } = computer || {};
      const computerStatusData = Array.isArray(computerStatus) && computerStatus.length > 0
        ? computerStatus.find((status: any) => status.MachineName === name)
        : null;
      const { UserId, Status, UserType, NetInfo, DeviceStatus } = computerStatusData || {};

      const userInfo = UserId ? userInfoMap.get(parseInt(UserId, 10)) : null;
      const machineDetail = machineDetailsMap.get(name) || {};

      const gatewayComputer = gatewayComputers.find((c: any) => c.name === name);
      const devices = gatewayComputer?.devices || [];

      let netInfoData = null;
      try {
        netInfoData = NetInfo ? JSON.parse(NetInfo) : null;
      } catch (e) { netInfoData = null; }

      results.push({
        id: gatewayComputer?.id || null,
        name: computer.name,
        macAddress: gatewayComputer?.macAddress || macAddress || null,
        status: Status !== undefined && Status !== null ? Status : (DeviceStatus !== undefined && DeviceStatus !== null ? DeviceStatus : "UNKNOWN"),
        userId: UserId || null,
        userName: userInfo?.userName || null,
        userType: userInfo?.userType ?? UserType ?? null,
        totalCheckIn: userInfo?.totalCheckIn || 0,
        claimedCheckIn: userInfo?.claimedCheckIn || 0,
        availableCheckIn: userInfo?.availableCheckIn || 0,
        round: userInfo?.round || 0,
        stars: userInfo?.stars || 0,
        magicStone: userInfo?.magicStone || 0,
        isUseApp: userInfo?.isUseApp !== undefined ? parseBoolean(userInfo.isUseApp) : true,
        note: userInfo?.note || "",
        totalPayment: userInfo?.totalPayment || 0,
        giftRound: userInfo?.giftRound || 0,
        battlePass: userInfo?.battlePass || { isUsed: false, isPremium: false, data: null },
        machineDetails: {
          netInfo: machineDetail.netInfo || netInfoData,
          machineGroupName: machineDetail.MachineGroupName || "Default",
          pricePerHour: machineDetail.Price || machineDetail.PriceDefault || 0,
        },
        devices: devices.filter((d: any) => d && d.id).map((device: any) => ({
          ...device,
          histories: [
            deviceIdToHistories[device.id]?.REPORT ? { ...deviceIdToHistories[device.id].REPORT, createdAt: safeDateToString(deviceIdToHistories[device.id].REPORT.createdAt), updatedAt: safeDateToString(deviceIdToHistories[device.id].REPORT.updatedAt) } : null,
            deviceIdToHistories[device.id]?.REPAIR ? { ...deviceIdToHistories[device.id].REPAIR, createdAt: safeDateToString(deviceIdToHistories[device.id].REPAIR.createdAt), updatedAt: safeDateToString(deviceIdToHistories[device.id].REPAIR.updatedAt) } : null,
          ],
        })),
      });
    }

    return convertBigIntToString(results);
  }
}
