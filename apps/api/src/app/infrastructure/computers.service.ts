import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getFnetDB, getFnetPrisma } from '../lib/db';
import { calculateActiveUsersInfo } from '../lib/user-calculator';
import { getStartOfDayVNISO, getCurrentTimeVNISO } from '../lib/timezone-utils';

@Injectable()
export class ComputersService {
  private readonly logger = new Logger(ComputersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(branch: string) {
    try {
      const fnetDB = await getFnetDB(branch);
      const fnetPrisma = await getFnetPrisma(branch);

      // 1. Fetch computer status from Fnet (systemlogtb)
      const computerStatus = (await this.executeQueryWithTimeout(async () => {
        return await fnetDB.$queryRawUnsafe(`
          SELECT 
            s.MachineName, s.EnterDate, s.EnterTime, s.Status, s.UserId,
            u.UserType, cs.NetInfo, mg.MachineGroupName, mg.PriceDefault, pm.Price
          FROM systemlogtb s
          LEFT JOIN usertb u ON s.UserId = u.UserId
          LEFT JOIN clientsystb cs ON s.MachineName = cs.PCName
          LEFT JOIN machinegrouptb mg ON u.MachineGroupId = mg.MachineGroupId
          LEFT JOIN pricemachinetb pm ON mg.MachineGroupId = pm.MachineGroupId AND pm.PriceId = 1
          INNER JOIN (
            SELECT MachineName, MAX(SystemLogId) AS MaxSystemLogId
            FROM systemlogtb
            WHERE MachineName NOT LIKE 'MAY-%'
            AND EnterDate >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            GROUP BY MachineName
          ) latest_log ON s.MachineName = latest_log.MachineName AND s.SystemLogId = latest_log.MaxSystemLogId
          WHERE s.MachineName NOT LIKE 'MAY-%'
          AND s.EnterDate >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
          ORDER BY s.MachineName ASC;
        `);
      }, 8000)) as any[];

      // 2. Fetch device histories (latest REPORT and REPAIR)
      const deviceHistoriesRaw = await this.prisma.$queryRaw<any[]>`
        SELECT h.*, CONVERT_TZ(h.createdAt, '+00:00', '+07:00') as createdAtLocal
        FROM (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY deviceId, type ORDER BY createdAt DESC) as rn
          FROM DeviceHistory
          WHERE type IN ('REPORT', 'REPAIR')
        ) h WHERE h.rn = 1
      `;

      // 3. Fetch computers and their devices from local DB
      const computers = (await this.prisma.computer.findMany({
        where: { branch, name: { not: 'ADMIN' } },
        include: { devices: true },
      })) as any[];

      // 4. Fetch machine details from Fnet DB
      const machineDetailsRaw = (await this.executeQueryWithTimeout(
        async () => {
          return await fnetDB.$queryRawUnsafe(`
          SELECT cs.PCName as machineName, cs.NetInfo, mg.MachineGroupName, mg.PriceDefault, pm.Price
          FROM clientsystb cs
          LEFT JOIN usertb u ON cs.PCName = u.UserName
          LEFT JOIN machinegrouptb mg ON u.MachineGroupId = mg.MachineGroupId
          LEFT JOIN pricemachinetb pm ON mg.MachineGroupId = pm.MachineGroupId AND pm.PriceId = 1
          WHERE cs.PCName IS NOT NULL
          ORDER BY cs.PCName ASC;
        `);
        },
        5000,
      )) as any[];

      // Process lookup maps
      const deviceIdToHistories: any = {};
      for (const h of deviceHistoriesRaw) {
        if (!deviceIdToHistories[h.deviceId])
          deviceIdToHistories[h.deviceId] = { REPORT: null, REPAIR: null };
        deviceIdToHistories[h.deviceId][h.type] = h;
      }

      const activeUserIds =
        computerStatus
          ?.filter((s) => s.UserId)
          .map((s) => parseInt(s.UserId, 10)) || [];
      const usersInfo =
        activeUserIds.length > 0
          ? await calculateActiveUsersInfo(activeUserIds, branch)
          : [];
      const userInfoMap = new Map(usersInfo.map((u) => [u.userId, u]));

      const machineDetailsMap = new Map();
      if (Array.isArray(machineDetailsRaw)) {
        machineDetailsRaw.forEach((m) => {
          let netInfo = null;
          try {
            netInfo = m.NetInfo ? JSON.parse(m.NetInfo) : null;
          } catch (e) {}
          machineDetailsMap.set(m.machineName, { ...m, netInfo });
        });
      }

      // Consolidate results
      const results = computers.map((c) => {
        const statusData = computerStatus?.find(
          (s) => s.MachineName === c.name,
        );
        const userInfo = statusData?.UserId
          ? userInfoMap.get(parseInt(statusData.UserId, 10))
          : null;
        const machineDetail = machineDetailsMap.get(c.name) || {};

        let netInfoData = null;
        try {
          netInfoData = statusData?.NetInfo
            ? JSON.parse(statusData.NetInfo)
            : null;
        } catch (e) {}

        return {
          id: c.id,
          name: c.name,
          status: statusData?.Status || 'UNKNOWN',
          userId: statusData?.UserId || null,
          userName: userInfo?.userName || null,
          userType: userInfo?.userType ?? statusData?.UserType ?? null,
          totalCheckIn: userInfo?.totalCheckIn || 0,
          claimedCheckIn: userInfo?.claimedCheckIn || 0,
          availableCheckIn: userInfo?.availableCheckIn || 0,
          round: userInfo?.round || 0,
          stars: userInfo?.stars || 0,
          magicStone: userInfo?.magicStone || 0,
          isUseApp: userInfo?.isUseApp ?? true,
          note: userInfo?.note || '',
          totalPayment: userInfo?.totalPayment || 0,
          giftRound: userInfo?.giftRound || 0,
          battlePass: userInfo?.battlePass || {
            isUsed: false,
            isPremium: false,
            data: null,
          },
          machineDetails: {
            netInfo: machineDetail.netInfo || netInfoData,
            machineGroupName: machineDetail.MachineGroupName || 'Default',
            pricePerHour:
              machineDetail.Price || machineDetail.PriceDefault || 0,
          },
          devices: c.devices.map((d) => ({
            ...d,
            histories: [
              deviceIdToHistories[d.id]?.REPORT || null,
              deviceIdToHistories[d.id]?.REPAIR || null,
            ],
          })),
        };
      });

      return this.convertBigIntToString(results);
    } catch (error) {
      this.logger.error('Error fetching computer data:', error);
      throw new InternalServerErrorException('Unable to fetch computer data');
    }
  }

  private async executeQueryWithTimeout(
    queryFn: () => Promise<any>,
    timeoutMs: number,
  ) {
    return Promise.race([
      queryFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), timeoutMs),
      ),
    ]).catch((err) => {
      this.logger.warn(`Query failed or timed out: ${err.message}`);
      return null;
    });
  }

  private convertBigIntToString(obj: any): any {
    if (Array.isArray(obj))
      return obj.map((o) => this.convertBigIntToString(o));
    if (obj && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        if (typeof obj[key] === 'bigint') newObj[key] = obj[key].toString();
        else if (typeof obj[key] === 'object')
          newObj[key] = this.convertBigIntToString(obj[key]);
        else newObj[key] = obj[key];
      }
      return newObj;
    }
    return obj;
  }
}
