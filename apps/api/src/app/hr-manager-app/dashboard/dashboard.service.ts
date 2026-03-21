import { Injectable } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { dayjs } from '@gateway-workspace/shared/utils';

@Injectable()
export class DashboardService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  async getStats(tenantId: string) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    try {
      const now = dayjs().tz('Asia/Ho_Chi_Minh');
      const startOfMonth = now.startOf('month').toDate();
      const currentMonth = now.month() + 1;
      const currentYear = now.year();

      // 1. Total Staff
      const totalStaff = await gateway.staff.count({
        where: { isDeleted: false, isAdmin: false },
      });

      const staffLastMonth = await gateway.staff.count({
        where: { isDeleted: false, isAdmin: false, createdAt: { lt: startOfMonth } },
      });
      const staffChange = staffLastMonth === 0 ? 0 : ((totalStaff - staffLastMonth) / staffLastMonth) * 100;

      // 2. Financial Metrics (Real-time calculation if StaffSalary is empty)
      // Fetch all staff in branch to get base salaries
      const staffInBranch = await gateway.staff.findMany({
        where: { isDeleted: false, isAdmin: false },
        select: { id: true, baseSalary: true },
      });
      const staffIds = staffInBranch.map(s => s.id);
      const staffBaseSalaryMap = new Map(staffInBranch.map(s => [s.id, s.baseSalary || 0]));

      // Get finalized salary stats if any (for history or current if generated)
      const finalizedSalaryStats = await gateway.staffSalary.aggregate({
        where: {
          month: currentMonth,
          year: currentYear,
          staffId: { in: staffIds },
        },
        _sum: { total: true, bonus: true, penalty: true },
      });

      // Get real-time bonuses and penalties for the month
      const realTimeBonuses = await gateway.staffBonus.aggregate({
        where: {
          staffId: { in: staffIds },
          rewardDate: { gte: startOfMonth, lt: dayjs(startOfMonth).add(1, 'month').toDate() },
        },
        _sum: { amount: true },
      });

      const realTimePenalties = await gateway.staffPenalty.aggregate({
        where: {
          staffId: { in: staffIds },
          penaltyDate: { gte: startOfMonth, lt: dayjs(startOfMonth).add(1, 'month').toDate() },
        },
        _sum: { amount: true },
      });

      // 3. Working Hours and Real-time accrued salary
      const timeTrackingStats = await gateway.staffTimeTracking.findMany({
        where: {
          staffId: { in: staffIds },
          checkInTime: { gte: startOfMonth, lt: dayjs(startOfMonth).add(1, 'month').toDate() },
          checkOutTime: { not: null },
        },
        select: { staffId: true, checkInTime: true, checkOutTime: true },
      });

      let totalHours = 0;
      let realTimeAccruedSalary = 0;
      
      timeTrackingStats.forEach(record => {
        const hours = dayjs(record.checkOutTime).diff(dayjs(record.checkInTime), 'hour', true);
        totalHours += hours;
        const base = staffBaseSalaryMap.get(record.staffId) || 0;
        realTimeAccruedSalary += hours * base;
      });

      // Round accrued salary like in HrAppService
      realTimeAccruedSalary = Math.ceil(realTimeAccruedSalary / 1000) * 1000;

      const totalBonus = finalizedSalaryStats._sum.bonus || realTimeBonuses._sum.amount || 0;
      const totalPenalty = finalizedSalaryStats._sum.penalty || realTimePenalties._sum.amount || 0;
      const totalSalary = finalizedSalaryStats._sum.total || (realTimeAccruedSalary + totalBonus - totalPenalty);

      // 4. Calculate last month's salary for trend
      const lastMonthDate = now.subtract(1, 'month');
      const lm = lastMonthDate.month() + 1;
      const ly = lastMonthDate.year();
      const startOfLastMonth = lastMonthDate.startOf('month').toDate();
      const endOfLastMonth = lastMonthDate.endOf('month').toDate();

      const finalizedSalaryLastMonth = await gateway.staffSalary.aggregate({
        where: { month: lm, year: ly, staffId: { in: staffIds } },
        _sum: { total: true },
      });

      let salaryLastMonth = finalizedSalaryLastMonth._sum.total || 0;
      if (salaryLastMonth === 0) {
        // Fallback to real-time calculation for last month if no payroll finalized
        const timeTrackingLastMonth = await gateway.staffTimeTracking.findMany({
          where: {
            staffId: { in: staffIds },
            checkInTime: { gte: startOfLastMonth, lt: endOfLastMonth },
            checkOutTime: { not: null },
          },
          select: { staffId: true, checkInTime: true, checkOutTime: true },
        });

        const bonusesLastMonth = await gateway.staffBonus.aggregate({
          where: { staffId: { in: staffIds }, rewardDate: { gte: startOfLastMonth, lt: endOfLastMonth } },
          _sum: { amount: true },
        });

        const penaltiesLastMonth = await gateway.staffPenalty.aggregate({
          where: { staffId: { in: staffIds }, penaltyDate: { gte: startOfLastMonth, lt: endOfLastMonth } },
          _sum: { amount: true },
        });

        let accruedLastMonth = 0;
        timeTrackingLastMonth.forEach(record => {
          const hours = dayjs(record.checkOutTime).diff(dayjs(record.checkInTime), 'hour', true);
          const base = staffBaseSalaryMap.get(record.staffId) || 0;
          accruedLastMonth += hours * base;
        });
        salaryLastMonth = Math.ceil(accruedLastMonth / 1000) * 1000 + (bonusesLastMonth._sum.amount || 0) - (penaltiesLastMonth._sum.amount || 0);
      }

      const salaryChange = salaryLastMonth === 0 ? 0 : Math.round(((totalSalary - salaryLastMonth) / salaryLastMonth) * 100 * 10) / 10;

      // 5. Chart Data (Salary History)
      const chartData = [];
      for (let i = 5; i >= 0; i--) {
        const d = now.subtract(i, 'month');
        const m = d.month() + 1;
        const y = d.year();
        const label = `${m}/${y}`;
        
        const monthSalary = await gateway.staffSalary.aggregate({
          where: { month: m, year: y, staffId: { in: staffIds } },
          _sum: { total: true },
        });

        chartData.push({ label, salaryValue: monthSalary._sum.total || 0 });
      }

      return {
        totalStaff,
        staffChange: Math.round(staffChange * 10) / 10,
        totalSalary,
        salaryChange,
        totalBonus,
        totalPenalty,
        totalHours: Math.round(totalHours * 10) / 10,
        chartData,
      };
    } catch (error) {
      console.error('[DashboardService] Error fetching stats:', error);
      throw error;
    }
  }
}
