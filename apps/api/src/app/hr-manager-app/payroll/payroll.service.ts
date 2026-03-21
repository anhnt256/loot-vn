import { Injectable } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { dayjs } from '@gateway-workspace/shared/utils';

@Injectable()
export class PayrollService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  async getPayrollList(tenantId: string, monthParam?: string, yearParam?: string) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    
    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const month = monthParam ? parseInt(monthParam, 10) : now.month() + 1;
    const year = yearParam ? parseInt(yearParam, 10) : now.year();

    const startOfMonth = dayjs(`${year}-${month}-01`).utcOffset(7).startOf('month').toDate();
    const endOfMonth = dayjs(startOfMonth).endOf('month').toDate();

    // 1. Fetch all active staffs and their base salary
    const activeStaffs = await gateway.staff.findMany({
      where: { isDeleted: false, isAdmin: false },
      select: {
        id: true,
        fullName: true,
        userName: true,
        baseSalary: true,
      },
    });

    const staffIds = activeStaffs.map(s => s.id);

    // 2. Fetch Time Tracking for accrued salary if not finalized
    const timeTrackingStats = await gateway.staffTimeTracking.findMany({
      where: {
        staffId: { in: staffIds },
        checkInTime: { gte: startOfMonth, lt: endOfMonth },
        checkOutTime: { not: null },
      },
      select: { staffId: true, checkInTime: true, checkOutTime: true },
    });

    // 3. Fetch Bonuses and Penalties
    const bonuses = await gateway.staffBonus.groupBy({
      by: ['staffId'],
      where: { staffId: { in: staffIds }, rewardDate: { gte: startOfMonth, lt: endOfMonth } },
      _sum: { amount: true },
    });

    const penalties = await gateway.staffPenalty.groupBy({
      by: ['staffId'],
      where: { staffId: { in: staffIds }, penaltyDate: { gte: startOfMonth, lt: endOfMonth } },
      _sum: { amount: true },
    });

    const bonusMap = new Map(bonuses.map(b => [b.staffId, b._sum.amount || 0]));
    const penaltyMap = new Map(penalties.map(p => [p.staffId, p._sum.amount || 0]));

    // 3.1 Fetch Salary Advances
    const salaryAdvances = await gateway.staffRequest.findMany({
      where: {
        staffId: { in: staffIds },
        request: {
          type: 'salary_advance',
          status: 'APPROVED',
          createdAt: { gte: startOfMonth, lt: endOfMonth },
        }
      },
      include: {
        request: true,
      }
    });

    const advanceMap = new Map<number, { total: number, details: any[] }>();
    staffIds.forEach(id => advanceMap.set(id, { total: 0, details: [] }));

    salaryAdvances.forEach(adv => {
      const amount = Number((adv.request.metadata as any)?.amount) || 0;
      if (amount > 0) {
        const staffMap = advanceMap.get(adv.staffId);
        if (staffMap) {
          staffMap.total += amount;
          staffMap.details.push({
            id: adv.request.id,
            amount,
            date: adv.request.createdAt,
          });
        }
      }
    });

    // 4. Fetch finalized StaffSalary (if any) to override calculated values
    const finalizedSalaries = await gateway.staffSalary.findMany({
      where: { month, year, staffId: { in: staffIds } },
    });
    const finalizedMap = new Map(finalizedSalaries.map(f => [f.staffId, f]));

    // Calculate details per staff
    const payrollList = activeStaffs.map(staff => {
      const finalized = finalizedMap.get(staff.id);

      const advance = advanceMap.get(staff.id) || { total: 0, details: [] };

      if (finalized) {
        return {
          staffId: staff.id,
          fullName: staff.fullName,
          userName: staff.userName,
          baseSalary: staff.baseSalary,
          totalHours: finalized.totalHours,
          salaryFromHours: finalized.salaryFromHours,
          bonus: finalized.bonus,
          penalty: finalized.penalty,
          advanceSalary: advance.total,
          advanceDetails: advance.details,
          // Since finalized total did not include advance before, we assume the finalized 'total' needs to be subtracted by advance if it wasn't. Let's subtract it or pass it independently.
          // Wait, 'total' in StaffSalary doesn't have an advance column. We probably want Net Salary = finalized.total - advance.total
          netSalary: Number(finalized.total) - advance.total,
          isFinalized: true,
        };
      }

      // If not finalized, calculate dynamically
      const staffTimeTracks = timeTrackingStats.filter(t => t.staffId === staff.id);
      let totalHours = 0;
      staffTimeTracks.forEach(record => {
        const hours = dayjs(record.checkOutTime).diff(dayjs(record.checkInTime), 'hour', true);
        totalHours += hours;
      });

      const baseSalary = staff.baseSalary || 0;
      let salaryFromHours = totalHours * baseSalary;
      salaryFromHours = Math.ceil(salaryFromHours / 1000) * 1000;

      const bonus = bonusMap.get(staff.id) || 0;
      const penalty = penaltyMap.get(staff.id) || 0;
      const netSalary = salaryFromHours + bonus - penalty - advance.total;

      return {
        staffId: staff.id,
        fullName: staff.fullName,
        userName: staff.userName,
        baseSalary,
        totalHours: Math.round(totalHours * 100) / 100,
        salaryFromHours,
        bonus,
        penalty,
        advanceSalary: advance.total,
        advanceDetails: advance.details,
        netSalary,
        isFinalized: false,
      };
    });

    return payrollList;
  }
}
