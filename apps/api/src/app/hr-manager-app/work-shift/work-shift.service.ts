import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { dayjs } from '@gateway-workspace/shared/utils';

@Injectable()
export class WorkShiftService {
  constructor(private prisma: PrismaService) {}

  private prepareData(data: any) {
    const prepared = { ...data };
    if (typeof data.startTime === 'string' && data.startTime.includes(':')) {
      // Force the time to be interpreted as "literal" by using UTC format
      // This ensures 07:00 stays 07:00 in the DB regardless of server timezone
      prepared.startTime = dayjs(`1970-01-01T${data.startTime}:00`).toDate();
    }
    if (typeof data.endTime === 'string' && data.endTime.includes(':')) {
      prepared.endTime = dayjs(`1970-01-01T${data.endTime}:00`).toDate();
    }
    return prepared;
  }

  async findAll() {
    return this.prisma.workShift.findMany({
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.workShift.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.workShift.create({
      data: this.prepareData(data),
    });
  }

  async update(id: number, data: any) {
    return this.prisma.workShift.update({
      where: { id },
      data: this.prepareData(data),
    });
  }

  async remove(id: number) {
    return this.prisma.workShift.delete({
      where: { id },
    });
  }
}
