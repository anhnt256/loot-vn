import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { verifyFfoodShifts } from '../lib/ffood-shift-verify';
import { verifyFnetShifts } from '../lib/fnet-shift-verify';
import {
  loginAndGetMomoToken,
  getMomoStatisticsByShift,
} from '../lib/momo-report';
import { mapWorkShiftNameToShiftEnum } from '../lib/work-shift-utils';
import dayjs from '../lib/dayjs';
import { getFnetDBByBranch } from '../lib/db';

@Injectable()
export class RevenueReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(branch: string, date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new BadRequestException('Invalid date format');

    const workShifts = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, startTime, endTime, isOvernight, FnetStaffId FROM WorkShift WHERE branch = ${branch} ORDER BY startTime, id
    `;
    if (!workShifts.length)
      throw new BadRequestException('No WorkShift found for branch');

    const ffoodResult = await verifyFfoodShifts(branch, date);
    const ffoodByShiftName = new Map();
    if (ffoodResult.success && ffoodResult.verified) {
      for (const v of ffoodResult.verified) {
        ffoodByShiftName.set(v.workShiftName, {
          totalFood: Math.round(v.totalFood / 100),
          deduction: Math.round(v.deduction / 100),
          actualFfood: Math.round(v.actualFfood / 100),
        });
      }
    }

    const incidentalRows = await this.prisma.$queryRaw<any[]>`
      SELECT r.shift, COALESCE(SUM(rd.value), 0) AS incidentalAmount
      FROM Report r LEFT JOIN ReportDetail rd ON rd.reportId = r.id AND rd.type = 'CHI'
      WHERE DATE(r.date) = ${date} AND r.branch = ${branch} GROUP BY r.shift
    `;
    const incidentalByShift = new Map();
    for (const row of incidentalRows)
      incidentalByShift.set(row.shift, Number(row.incidentalAmount) || 0);

    const momoCred = await this.prisma.momoCredential.findFirst({
      where: { branch },
    });
    let momoToken = momoCred?.token;
    if (
      momoCred &&
      (!momoToken ||
        !momoCred.expired ||
        new Date(momoCred.expired) <= new Date())
    ) {
      const login = await loginAndGetMomoToken({
        username: momoCred.username,
        password: momoCred.password,
      });
      if (login) {
        momoToken = login.token;
        await this.prisma.momoCredential.update({
          where: { id: momoCred.id },
          data: { token: login.token, expired: login.expired },
        });
      }
    }

    const results = [];
    for (const ws of workShifts) {
      const shiftType = this.workShiftNameToShiftRevenueType(ws.name);
      const reportShift = mapWorkShiftNameToShiftEnum(ws.name).toUpperCase();
      const ffood = ffoodByShiftName.get(ws.name) || {
        totalFood: 0,
        deduction: 0,
        actualFfood: 0,
      };
      const incidentalAmount = incidentalByShift.get(reportShift) || 0;

      let gamingRevenue = 0;
      if (ws.FnetStaffId) {
        const fnetDB = getFnetDBByBranch(branch);
        const sumResult = (await fnetDB.$queryRawUnsafe(
          `SELECT SUM(Amount) as total FROM fnet.paymenttb WHERE StaffId = ? AND ServeDate = ?`,
          Number(ws.FnetStaffId),
          date,
        )) as any[];
        gamingRevenue = Number(sumResult[0]?.total) || 0;
      }

      let momoRevenue = 0;
      if (momoToken && momoCred?.merchant_id && momoCred?.store_id) {
        const stats = await getMomoStatisticsByShift({
          token: momoToken,
          merchantId: String(momoCred.merchant_id),
          storeId: momoCred.store_id!,
          shift: {
            ...ws,
            isOvernight: ws.isOvernight === 1,
            startTime: this.formatTime(ws.startTime),
            endTime: this.formatTime(ws.endTime),
          },
          date,
        });
        if (stats) momoRevenue = stats.totalSuccessAmount;
      }

      const handoverAmount =
        ffood.totalFood +
        gamingRevenue -
        ffood.deduction -
        incidentalAmount -
        momoRevenue;

      let status = 'skipped';
      const existing = await this.prisma.workShiftRevenueReport.findFirst({
        where: { reportDate: new Date(date), branch, shift: shiftType },
      });
      const reportData = {
        totalFood: ffood.totalFood,
        deduction: ffood.deduction,
        actualFfood: ffood.actualFfood,
        gamingRevenue,
        momoRevenue,
        incidentalAmount,
        handoverAmount,
        updatedAt: new Date(),
      };

      if (existing) {
        await this.prisma.workShiftRevenueReport.update({
          where: { id: existing.id },
          data: reportData,
        });
        status = 'updated';
      } else {
        await this.prisma.workShiftRevenueReport.create({
          data: {
            reportDate: new Date(date),
            branch,
            shift: shiftType,
            ...reportData,
            createdAt: new Date(),
          },
        });
        status = 'inserted';
      }

      results.push({
        shift: shiftType,
        status,
        totalFood: ffood.totalFood,
        gamingRevenue,
        momoRevenue,
        incidentalAmount,
        handoverAmount,
      });
    }

    return results;
  }

  async verifyFfood(branch: string, reportDate: string) {
    return verifyFfoodShifts(branch, reportDate);
  }

  async verifyFnet(branch: string, serveDate: string) {
    return verifyFnetShifts(branch, serveDate);
  }

  private workShiftNameToShiftRevenueType(
    name: string,
  ): 'MORNING' | 'AFTERNOON' | 'EVENING' {
    const s = mapWorkShiftNameToShiftEnum(name).toUpperCase();
    if (s === 'CHIEU') return 'AFTERNOON';
    if (s === 'TOI') return 'EVENING';
    return 'MORNING';
  }

  private formatTime(time: Date | string) {
    if (!time) return '00:00:00';
    if (typeof time === 'string') return time;
    return time.toTimeString().slice(0, 8);
  }
}
