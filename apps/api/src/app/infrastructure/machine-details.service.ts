import { Injectable, Logger } from '@nestjs/common';
import { getFnetDB } from '../lib/db';

@Injectable()
export class MachineDetailsService {
  private readonly logger = new Logger(MachineDetailsService.name);

  async getMachineDetails(branch: string) {
    try {
      const fnetDB = await getFnetDB(branch);
      const query = `
        SELECT u.UserName as machineName, cs.NetInfo as netInfo, pm.Price as price,
               mg.MachineGroupName as machineGroupName, mg.MachineGroupId as machineGroupId
        FROM usertb u
        LEFT JOIN machinegrouptb mg ON u.MachineGroupId = mg.MachineGroupId
        LEFT JOIN pricemachinetb pm ON mg.MachineGroupId = pm.MachineGroupId AND pm.PriceId = 1
        LEFT JOIN clientsystb cs ON u.UserName = cs.PCName
        WHERE pm.Price > 0 AND cs.NetInfo IS NOT NULL
        ORDER BY mg.MachineGroupId, u.UserName
      `;

      const result = (await fnetDB.$queryRawUnsafe(query)) as any[];

      return result.map((row) => {
        let netInfo = null;
        let macAddress = null;
        try {
          if (row.netInfo) {
            netInfo = JSON.parse(row.netInfo);
            macAddress = netInfo.macAddress || null;
          }
        } catch (e) {}

        return {
          machineName: row.machineName,
          macAddress,
          price: Number(row.price),
          netInfo,
          machineGroupName: row.machineGroupName,
          machineGroupId: Number(row.machineGroupId),
        };
      });
    } catch (error) {
      this.logger.error('Error fetching machine details:', error);
      throw error;
    }
  }
}
