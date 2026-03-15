import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { dayjs } from '@gateway-workspace/shared/utils';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { startDate?: string; endDate?: string; staffId?: number }) {
    const { startDate, endDate, staffId } = filters;
    
    const where: any = {};
    
    if (staffId) {
      where.staffId = staffId;
    }
    
    if (startDate || endDate) {
      where.checkInTime = {};
      if (startDate) {
        where.checkInTime.gte = dayjs(startDate).toDate();
      }
      if (endDate) {
        where.checkInTime.lte = dayjs(endDate).toDate();
      }
    }

    return (this.prisma as any).staffTimeTracking.findMany({
      where,
      include: {
        staff: true,
      },
      orderBy: {
        checkInTime: 'desc',
      },
    });
  }

  async findAggregated(filters: { startDate?: string; endDate?: string }) {
    const records = await this.findAll(filters);

    const aggregation = records.reduce((acc: any, record: any) => {
      const staffId = record.staffId;
      if (!acc[staffId]) {
        acc[staffId] = {
          key: staffId,
          staffId,
          fullName: record.staff?.fullName || `Staff #${staffId}`,
          totalMinutes: 0,
          recordCount: 0,
        };
      }
      
      if (record.checkInTime && record.checkOutTime) {
        const duration = dayjs(record.checkOutTime).diff(dayjs(record.checkInTime), 'minute');
        acc[staffId].totalMinutes += Math.max(0, duration);
      }
      acc[staffId].recordCount += 1;
      return acc;
    }, {});

    return Object.values(aggregation);
  }

  async exportToExcel(filters: { startDate?: string; endDate?: string; staffId?: number }) {
    const records = await this.findAll(filters);
    
    // Create CSV content with UTF-8 BOM
    const header = '\ufeffNhân viên,ID,Ngày,Giờ vào,Giờ ra,Tổng giờ (phút)\n';
    const rows = records.map((r: any) => {
      const staffName = r.staff?.fullName || `Staff #${r.staffId}`;
      const date = dayjs(r.checkInTime).format('DD/MM/YYYY');
      const inTime = dayjs(r.checkInTime).format('HH:mm:ss');
      const outTime = r.checkOutTime ? dayjs(r.checkOutTime).format('HH:mm:ss') : 'Chưa ra ca';
      let duration = 0;
      if (r.checkInTime && r.checkOutTime) {
        duration = dayjs(r.checkOutTime).diff(dayjs(r.checkInTime), 'minute');
      }
      return `"${staffName}",${r.staffId},${date},${inTime},${outTime},${duration}`;
    }).join('\n');
    
    return header + rows;
  }

  async create(data: any) {
    return (this.prisma as any).staffTimeTracking.create({
      data: {
        staffId: parseInt(data.staffId, 10),
        checkInTime: data.checkInTime ? dayjs(data.checkInTime).toDate() : new Date(),
        checkOutTime: data.checkOutTime ? dayjs(data.checkOutTime).toDate() : null,
      },
    });
  }

  async update(id: number, data: any) {
    const updateData: any = {};
    if (data.checkInTime) updateData.checkInTime = dayjs(data.checkInTime).toDate();
    if (data.checkOutTime) updateData.checkOutTime = dayjs(data.checkOutTime).toDate();
    if (data.staffId) updateData.staffId = parseInt(data.staffId, 10);

    return (this.prisma as any).staffTimeTracking.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    return (this.prisma as any).staffTimeTracking.delete({
      where: { id },
    });
  }
}
