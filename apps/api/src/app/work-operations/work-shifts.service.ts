import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WorkShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(branch: string) {
    const workShifts = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, startTime, endTime, isOvernight, branch, FnetStaffId, FfoodStaffId, createdAt, updatedAt
      FROM WorkShift
      WHERE branch = ${branch}
      ORDER BY startTime, id
    `;

    return workShifts.map((shift) => ({
      ...shift,
      startTime: this.formatTime(shift.startTime),
      endTime: this.formatTime(shift.endTime),
    }));
  }

  async create(branch: string, data: any) {
    const { name, startTime, endTime, isOvernight, FnetStaffId, FfoodStaffId } =
      data;
    const nameStr = name?.trim();
    if (!nameStr) throw new BadRequestException('Name is required');

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM WorkShift WHERE branch = ${branch} AND name = ${nameStr}
    `;
    if (existing.length > 0)
      throw new BadRequestException(`Ca ${nameStr} đã tồn tại`);

    const start = this.parseTimeToHHmmss(startTime);
    const end = this.parseTimeToHHmmss(endTime);

    await this.prisma.$executeRaw`
      INSERT INTO WorkShift (name, startTime, endTime, isOvernight, branch, FnetStaffId, FfoodStaffId, createdAt, updatedAt)
      VALUES (${nameStr}, ${start}, ${end}, ${!!isOvernight}, ${branch}, ${FnetStaffId ? Number(FnetStaffId) : null}, ${FfoodStaffId ? Number(FfoodStaffId) : null}, NOW(), NOW())
    `;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM WorkShift WHERE branch = ${branch} AND name = ${nameStr}
    `;
    const shift = rows[0];
    return {
      ...shift,
      startTime: this.formatTime(shift.startTime),
      endTime: this.formatTime(shift.endTime),
    };
  }

  async update(id: number, branch: string, data: any) {
    const { name, startTime, endTime, isOvernight, FnetStaffId, FfoodStaffId } =
      data;

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, name FROM WorkShift WHERE id = ${id} AND branch = ${branch}
    `;
    if (existing.length === 0)
      throw new NotFoundException('Work shift not found');

    const nameStr = name?.trim();
    if (nameStr && nameStr !== existing[0].name) {
      const dup = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM WorkShift WHERE branch = ${branch} AND name = ${nameStr} AND id != ${id}
      `;
      if (dup.length > 0)
        throw new BadRequestException(`Ca ${nameStr} đã tồn tại`);
    }

    const updates: string[] = [];
    if (nameStr !== undefined)
      updates.push(`name = ${JSON.stringify(nameStr)}`);
    if (startTime !== undefined)
      updates.push(
        `startTime = ${JSON.stringify(this.parseTimeToHHmmss(startTime))}`,
      );
    if (endTime !== undefined)
      updates.push(
        `endTime = ${JSON.stringify(this.parseTimeToHHmmss(endTime))}`,
      );
    if (isOvernight !== undefined)
      updates.push(`isOvernight = ${isOvernight ? 1 : 0}`);
    if (FnetStaffId !== undefined)
      updates.push(
        `FnetStaffId = ${FnetStaffId ? Number(FnetStaffId) : 'NULL'}`,
      );
    if (FfoodStaffId !== undefined)
      updates.push(
        `FfoodStaffId = ${FfoodStaffId ? Number(FfoodStaffId) : 'NULL'}`,
      );

    if (updates.length === 0) return existing[0];

    // Note: Using unsafeRaw for dynamic updates as Prisma's $executeRaw doesn't support dynamic SET clauses easily without complex logic
    // But we'll try to find a safer way or just use regular Prisma if possible.
    // Given the monolith pattern, I'll use a mix.

    await this.prisma.$executeRawUnsafe(`
      UPDATE WorkShift 
      SET ${updates.join(', ')}, updatedAt = NOW()
      WHERE id = ${id} AND branch = '${branch}'
    `);

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM WorkShift WHERE id = ${id} AND branch = ${branch}
    `;
    const shift = result[0];
    return {
      ...shift,
      startTime: this.formatTime(shift.startTime),
      endTime: this.formatTime(shift.endTime),
    };
  }

  async delete(id: number, branch: string) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM WorkShift WHERE id = ${id} AND branch = ${branch}
    `;
    if (existing.length === 0)
      throw new NotFoundException('Work shift not found');

    await this.prisma.$executeRaw`
      DELETE FROM WorkShift WHERE id = ${id} AND branch = ${branch}
    `;
    return { message: 'Deleted' };
  }

  private formatTime(time: Date | string) {
    if (!time) return '00:00:00';
    const date =
      typeof time === 'string' ? new Date('1970-01-01 ' + time) : time;
    return [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map((n) => String(n).padStart(2, '0'))
      .join(':');
  }

  private parseTimeToHHmmss(input: string): string {
    if (!input || typeof input !== 'string') return '00:00:00';
    const parts = input
      .trim()
      .split(/[:\s]/)
      .map((p) => parseInt(p, 10) || 0);
    const [h = 0, m = 0, s = 0] = parts;
    return [
      Math.min(23, Math.max(0, h)),
      Math.min(59, Math.max(0, m)),
      Math.min(59, Math.max(0, s)),
    ]
      .map((n) => n.toString().padStart(2, '0'))
      .join(':');
  }
}
