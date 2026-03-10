import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getFnetDB } from '../lib/db';
import { getCurrentTimeVNDB } from '../lib/timezone-utils';
import { isTimeInAnyShift } from '../lib/work-shift-utils';
import dayjs from '../lib/dayjs';

@Injectable()
export class FraudService {
  constructor(private readonly prisma: PrismaService) {}

  private formatTimeToHHmmss(t: any): string {
    if (!t) return '00:00:00';
    const d = typeof t === 'string' ? new Date('1970-01-01T' + t + 'Z') : t;
    const h = d.getUTCHours?.() ?? d.getHours?.() ?? 0;
    const m = d.getUTCMinutes?.() ?? d.getMinutes?.() ?? 0;
    const s = d.getUTCSeconds?.() ?? d.getSeconds?.() ?? 0;
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
  }

  async getLoginAlerts(branch: string, from?: string, to?: string) {
    const fromDate = from || dayjs().subtract(1, 'month').format('YYYY-MM-DD');
    const toDate = to || dayjs().format('YYYY-MM-DD');
    const fromDateTime = `${fromDate} 00:00:00`;
    const toDateTime = `${toDate} 23:59:59`;

    const fnet = await getFnetDB(branch);

    // 1. Get shifts
    const shifts = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT name, startTime, endTime, isOvernight FROM WorkShift WHERE branch = ?`,
      branch,
    );
    const workShifts = shifts.map((s) => ({
      ...s,
      startTime: this.formatTimeToHHmmss(s.startTime),
      endTime: this.formatTimeToHHmmss(s.endTime),
    }));

    // 2. Get Fnet logs
    const logs = await fnet.$queryRawUnsafe<any[]>(
      `SELECT ServerLogId, Status, RecordDate, RecordTime, Note, Actor 
       FROM serverlogtb WHERE Status = N'Đăng nhập' ORDER BY RecordDate DESC, RecordTime DESC LIMIT 200`,
    );

    // 3. Sync alerts
    const existingAlerts = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT serverLogId FROM FraudLoginAlert WHERE branch = ?`,
      branch,
    );
    const existingSet = new Set(
      existingAlerts.map((a) => String(a.serverLogId)),
    );

    for (const log of logs) {
      const recordDate =
        log.RecordDate instanceof Date
          ? log.RecordDate.toISOString().slice(0, 10)
          : String(log.RecordDate).slice(0, 10);
      const recordTime = this.formatTimeToHHmmss(log.RecordTime);
      const inShift = isTimeInAnyShift(workShifts, recordDate, recordTime);

      if (!inShift && !existingSet.has(String(log.ServerLogId))) {
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO FraudLoginAlert (branch, serverLogId, actor, loginAt, note, createdAt)
           VALUES (?, ?, ?, ?, ?, ?)`,
          branch,
          log.ServerLogId,
          log.Actor || 'Unknown',
          `${recordDate} ${recordTime}`,
          log.Note,
          getCurrentTimeVNDB(),
        );
      }
    }

    // 4. Return alerts
    return this.prisma.$queryRawUnsafe(
      `SELECT * FROM FraudLoginAlert WHERE branch = ? AND loginAt >= ? AND loginAt <= ? ORDER BY loginAt DESC`,
      branch,
      fromDateTime,
      toDateTime,
    );
  }

  async getRevenueAlerts(branch: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const reports = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT reportDate, handoverAmount, actualShiftRevenue, confirmedHeldAmount, shift
       FROM WorkShiftRevenueReport WHERE branch = ? AND reportDate >= ? AND reportDate <= ?`,
      branch,
      startDate,
      endDate,
    );

    const managerIncomes = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT DATE(transactionDate) as dt, SUM(amount) as total
       FROM ManagerIncomeExpense WHERE branch = ? AND transactionDate >= ? AND transactionDate <= ? GROUP BY DATE(transactionDate)`,
      branch,
      startDate,
      endDate,
    );

    const managerMap = new Map(
      managerIncomes.map((m) => [
        m.dt instanceof Date
          ? m.dt.toISOString().slice(0, 10)
          : String(m.dt).slice(0, 10),
        Number(m.total),
      ]),
    );

    const dayResults = [];
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayReports = reports.filter(
        (r) =>
          (r.reportDate instanceof Date
            ? r.reportDate.toISOString().slice(0, 10)
            : String(r.reportDate).slice(0, 10)) === dateStr,
      );

      const totalHandover = dayReports.reduce(
        (sum, r) => sum + Number(r.handoverAmount),
        0,
      );
      const managerAmount = managerMap.get(dateStr) || 0;
      const hasAlert = Math.abs(managerAmount - totalHandover) > 1000;

      dayResults.push({
        date: dateStr,
        totalHandover,
        managerAmount,
        hasAlert,
        shifts: dayReports.map((r) => ({
          shift: r.shift,
          handover: r.handoverAmount,
          actual: r.actualShiftRevenue,
          held: r.confirmedHeldAmount,
        })),
      });
    }

    return dayResults;
  }
}
