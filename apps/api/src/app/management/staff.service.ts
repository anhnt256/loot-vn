import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getBranchFromCookie } from '../lib/server-utils';
import { getCurrentTimeVNDB, getCurrentTimeVNISO } from '../lib/timezone-utils';
import dayjs from '../lib/dayjs';
import * as crypto from 'crypto';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async findAll(branch: string, type?: string, includeDeleted = false) {
    let query = `
      SELECT 
        id, fullName, userName, staffType, phone, email,
        isDeleted, isAdmin, branch, address, dateOfBirth,
        gender, hireDate, idCard, idCardExpiryDate, idCardIssueDate,
        note, resignDate, needCheckMacAddress, bankAccountName,
        bankAccountNumber, bankName, baseSalary, createdAt, updatedAt
      FROM Staff 
      WHERE branch = ? AND isAdmin = false
    `;
    const params: any[] = [branch];

    if (!includeDeleted) {
      query += ` AND isDeleted = false`;
    }

    if (type) {
      query += ` AND staffType = ?`;
      params.push(type.toUpperCase());
    }

    query += ` ORDER BY fullName ASC`;

    return this.prisma.$queryRawUnsafe(query, ...params);
  }

  async findOne(id: number, branch: string) {
    const staff = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Staff WHERE id = ? AND branch = ? AND isDeleted = false LIMIT 1`,
      id,
      branch,
    );
    if (!staff.length) return null;
    return staff[0];
  }

  async findByUsername(userName: string, branch: string) {
    const staff = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Staff WHERE userName = ? AND branch = ? AND isDeleted = false LIMIT 1`,
      userName,
      branch,
    );
    if (!staff.length) return null;
    return staff[0];
  }

  async create(data: any, branch: string) {
    const { userName, password, fullName, ...rest } = data;

    const existing = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM Staff WHERE userName = ?`,
      userName,
    );
    if (existing.length > 0)
      throw new BadRequestException('Username already exists');

    const hashedPassword = this.hashPassword(password);
    const now = getCurrentTimeVNDB();

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO Staff (
        userName, password, fullName, staffType, phone, email,
        address, dateOfBirth, gender, hireDate, idCard,
        idCardExpiryDate, idCardIssueDate, note, needCheckMacAddress,
        bankAccountName, bankAccountNumber, bankName, baseSalary,
        branch, isDeleted, isAdmin, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, false, ?, ?)`,
      userName,
      hashedPassword,
      fullName,
      rest.staffType || 'STAFF',
      rest.phone || null,
      rest.email || null,
      rest.address || null,
      rest.dateOfBirth ? new Date(rest.dateOfBirth) : null,
      rest.gender || 'OTHER',
      rest.hireDate ? new Date(rest.hireDate) : null,
      rest.idCard || null,
      rest.idCardExpiryDate ? new Date(rest.idCardExpiryDate) : null,
      rest.idCardIssueDate ? new Date(rest.idCardIssueDate) : null,
      rest.note || null,
      rest.needCheckMacAddress ?? true,
      rest.bankAccountName || null,
      rest.bankAccountNumber || null,
      rest.bankName || null,
      parseFloat(rest.baseSalary) || 0,
      branch,
      now,
      now,
    );

    return this.findByUsername(userName, branch);
  }

  async update(id: number, branch: string, data: any) {
    const existing = await this.findOne(id, branch);
    if (!existing) throw new NotFoundException('Staff not found');

    if (data.userName && data.userName !== existing.userName) {
      const nameCheck = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id FROM Staff WHERE userName = ? AND id != ?`,
        data.userName,
        id,
      );
      if (nameCheck.length > 0)
        throw new BadRequestException('Username already exists');
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    const allowedFields = [
      'userName',
      'fullName',
      'staffType',
      'phone',
      'email',
      'address',
      'dateOfBirth',
      'gender',
      'hireDate',
      'idCard',
      'idCardExpiryDate',
      'idCardIssueDate',
      'note',
      'resignDate',
      'needCheckMacAddress',
      'bankAccountName',
      'bankAccountNumber',
      'bankName',
      'baseSalary',
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        if (
          [
            'dateOfBirth',
            'hireDate',
            'idCardExpiryDate',
            'idCardIssueDate',
            'resignDate',
          ].includes(field)
        ) {
          updateValues.push(data[field] ? new Date(data[field]) : null);
        } else if (field === 'baseSalary') {
          updateValues.push(parseFloat(data[field]) || 0);
        } else {
          updateValues.push(data[field]);
        }
      }
    }

    if (data.password) {
      updateFields.push('password = ?');
      updateValues.push(this.hashPassword(data.password));
    }

    if (updateFields.length === 0) return existing;

    updateFields.push('updatedAt = ?');
    updateValues.push(getCurrentTimeVNDB());

    updateValues.push(id, branch);

    const query = `UPDATE Staff SET ${updateFields.join(', ')} WHERE id = ? AND branch = ?`;
    await this.prisma.$executeRawUnsafe(query, ...updateValues);

    return this.findOne(id, branch);
  }

  async remove(id: number, branch: string) {
    const existing = await this.findOne(id, branch);
    if (!existing) throw new NotFoundException('Staff not found');
    if (existing.isAdmin)
      throw new BadRequestException('Cannot delete admin accounts');

    await this.prisma.$executeRawUnsafe(
      `UPDATE Staff SET isDeleted = true, updatedAt = ? WHERE id = ? AND branch = ?`,
      getCurrentTimeVNDB(),
      id,
      branch,
    );
    return { success: true };
  }

  async getTimeTracking(
    staffId: number,
    date?: string,
    month?: number,
    year?: number,
  ) {
    if (date) {
      const startOfDay = dayjs(date)
        .startOf('day')
        .format('YYYY-MM-DD HH:mm:ss');
      const endOfDay = dayjs(date).endOf('day').format('YYYY-MM-DD HH:mm:ss');

      const records = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id, checkInTime, checkOutTime, 
         CASE WHEN checkOutTime IS NOT NULL THEN 'COMPLETED' ELSE 'WORKING' END as status
         FROM StaffTimeTracking WHERE staffId = ? AND checkInTime >= ? AND checkInTime <= ?
         ORDER BY checkInTime DESC`,
        staffId,
        startOfDay,
        endOfDay,
      );

      const now = dayjs().tz('Asia/Ho_Chi_Minh');
      let todayHours = 0;
      records.forEach((r) => {
        const start = dayjs(r.checkInTime);
        const end = r.checkOutTime ? dayjs(r.checkOutTime) : now;
        todayHours += Math.abs(end.diff(start, 'hour', true));
      });

      return {
        records,
        stats: { todayHours: parseFloat(todayHours.toFixed(2)) },
      };
    }

    const startOfMonth = dayjs()
      .year(year || dayjs().year())
      .month((month || dayjs().month() + 1) - 1)
      .startOf('month')
      .format('YYYY-MM-DD');
    const endOfMonth = dayjs(startOfMonth).endOf('month').format('YYYY-MM-DD');

    const history = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, checkInTime, checkOutTime, 
       CASE WHEN checkOutTime IS NULL THEN 'WORKING' ELSE 'COMPLETED' END as status
       FROM StaffTimeTracking WHERE staffId = ? AND DATE(checkInTime) >= ? AND DATE(checkInTime) <= ?
       ORDER BY checkInTime ASC`,
      staffId,
      startOfMonth,
      endOfMonth,
    );

    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    let monthHours = 0;
    const formattedHistory = history.map((r) => {
      const start = dayjs(r.checkInTime);
      const end = r.checkOutTime ? dayjs(r.checkOutTime) : now;
      const hours = Math.abs(end.diff(start, 'hour', true));
      monthHours += hours;
      return { ...r, totalHours: parseFloat(hours.toFixed(2)) };
    });

    return {
      history: formattedHistory,
      stats: { monthHours: parseFloat(monthHours.toFixed(2)) },
    };
  }

  async checkIn(staffId: number) {
    const existing = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM StaffTimeTracking WHERE staffId = ? AND checkOutTime IS NULL LIMIT 1`,
      staffId,
    );
    if (existing.length > 0)
      throw new BadRequestException('Already checked in');

    const now = getCurrentTimeVNDB();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO StaffTimeTracking (staffId, checkInTime, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
      staffId,
      now,
      now,
      now,
    );
    return { success: true };
  }

  async checkOut(staffId: number, recordId: number) {
    const existing = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM StaffTimeTracking WHERE id = ? AND staffId = ? AND checkOutTime IS NULL LIMIT 1`,
      recordId,
      staffId,
    );
    if (existing.length === 0)
      throw new BadRequestException(
        'No active session found or already checked out',
      );

    const now = getCurrentTimeVNDB();
    await this.prisma.$executeRawUnsafe(
      `UPDATE StaffTimeTracking SET checkOutTime = ?, updatedAt = ? WHERE id = ?`,
      now,
      now,
      recordId,
    );
    return { success: true };
  }

  async getSalary(
    staffId: number,
    branch: string,
    month: number,
    year: number,
  ) {
    const startOfMonth = dayjs(`${year}-${month}-01`)
      .startOf('month')
      .format('YYYY-MM-DD');
    const endOfMonth = dayjs(startOfMonth).endOf('month').format('YYYY-MM-DD');

    const records = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT checkInTime, checkOutTime FROM StaffTimeTracking 
       WHERE staffId = ? AND DATE(checkInTime) >= ? AND DATE(checkInTime) <= ?`,
      staffId,
      startOfMonth,
      endOfMonth,
    );

    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    let totalHours = 0;
    records.forEach((r) => {
      const start = dayjs(r.checkInTime);
      const end = r.checkOutTime ? dayjs(r.checkOutTime) : now;
      totalHours += Math.abs(end.diff(start, 'hour', true));
    });

    const staff = await this.findOne(staffId, branch);
    const baseSalary = staff?.baseSalary || 0;
    const salaryFromHours = Math.ceil((totalHours * baseSalary) / 1000) * 1000;

    const bonuses = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT amount FROM StaffBonus WHERE staffId = ? AND YEAR(rewardDate) = ? AND MONTH(rewardDate) = ?`,
      staffId,
      year,
      month,
    );
    const totalBonus = bonuses.reduce((sum, b) => sum + (b.amount || 0), 0);

    const penalties = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT amount FROM StaffPenalty WHERE staffId = ? AND YEAR(penaltyDate) = ? AND MONTH(penaltyDate) = ?`,
      staffId,
      year,
      month,
    );
    const totalPenalty = penalties.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      summary: {
        totalHours: parseFloat(totalHours.toFixed(2)),
        salary: salaryFromHours,
        bonus: totalBonus,
        penalty: totalPenalty,
        netSalary: salaryFromHours + totalBonus - totalPenalty,
      },
    };
  }
}
