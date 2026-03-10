import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getCurrentTimeVNDB } from '../lib/timezone-utils';

@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllBonuses(
    branch: string,
    staffId?: number,
    month?: number,
    year?: number,
  ) {
    let query = `
      SELECT b.*, s.fullName, s.userName
      FROM StaffBonus b
      JOIN Staff s ON b.staffId = s.id
      WHERE s.branch = ?
    `;
    const params: any[] = [branch];

    if (staffId) {
      query += ` AND b.staffId = ?`;
      params.push(staffId);
    }

    if (month && year) {
      query += ` AND YEAR(b.rewardDate) = ? AND MONTH(b.rewardDate) = ?`;
      params.push(year, month);
    }

    query += ` ORDER BY b.rewardDate DESC LIMIT 100`;

    return this.prisma.$queryRawUnsafe(query, ...params);
  }

  async createBonus(data: any, branch: string) {
    const { staffId, amount, reason, ...rest } = data;

    // Check if staff exists in branch
    const staff = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM Staff WHERE id = ? AND branch = ? AND isDeleted = false`,
      staffId,
      branch,
    );
    if (!staff.length)
      throw new BadRequestException('Staff not found in this branch');

    const now = getCurrentTimeVNDB();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO StaffBonus (staffId, amount, reason, description, imageUrl, note, rewardDate, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      staffId,
      parseFloat(amount),
      reason,
      rest.description || null,
      rest.imageUrl || null,
      rest.note || null,
      rest.rewardDate || now,
      now,
      now,
    );
    return { success: true };
  }

  async findAllPenalties(
    branch: string,
    staffId?: number,
    month?: number,
    year?: number,
  ) {
    let query = `
      SELECT p.*, s.fullName, s.userName
      FROM StaffPenalty p
      JOIN Staff s ON p.staffId = s.id
      WHERE s.branch = ?
    `;
    const params: any[] = [branch];

    if (staffId) {
      query += ` AND p.staffId = ?`;
      params.push(staffId);
    }

    if (month && year) {
      query += ` AND YEAR(p.penaltyDate) = ? AND MONTH(p.penaltyDate) = ?`;
      params.push(year, month);
    }

    query += ` ORDER BY p.penaltyDate DESC LIMIT 100`;

    return this.prisma.$queryRawUnsafe(query, ...params);
  }

  async createPenalty(data: any, branch: string) {
    const { staffId, amount, reason, ...rest } = data;

    const staff = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM Staff WHERE id = ? AND branch = ? AND isDeleted = false`,
      staffId,
      branch,
    );
    if (!staff.length)
      throw new BadRequestException('Staff not found in this branch');

    const now = getCurrentTimeVNDB();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO StaffPenalty (staffId, amount, reason, description, imageUrl, note, penaltyDate, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      staffId,
      parseFloat(amount),
      reason,
      rest.description || null,
      rest.imageUrl || null,
      rest.note || null,
      rest.penaltyDate || now,
      now,
      now,
    );
    return { success: true };
  }

  async findAllTransactions(branch: string, month?: number, year?: number) {
    let query = `
      SELECT m.*, s.fullName as createdByName, s.userName as createdByUserName
      FROM ManagerIncomeExpense m
      LEFT JOIN Staff s ON m.createdBy = s.id
      WHERE m.branch = ?
    `;
    const params: any[] = [branch];

    if (month && year) {
      query += ` AND YEAR(m.transactionDate) = ? AND MONTH(m.transactionDate) = ?`;
      params.push(year, month);
    }

    query += ` ORDER BY m.transactionDate DESC LIMIT 100`;

    return this.prisma.$queryRawUnsafe(query, ...params);
  }

  async createTransaction(data: any, branch: string, createdBy: number) {
    const { type, amount, reason, transactionDate, ...rest } = data;
    if (type !== 'INCOME' && type !== 'EXPENSE')
      throw new BadRequestException('Invalid type');

    const now = getCurrentTimeVNDB();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO ManagerIncomeExpense (type, amount, reason, description, transactionDate, branch, createdBy, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      type,
      parseFloat(amount),
      reason,
      rest.description || null,
      transactionDate || now,
      branch,
      createdBy,
      now,
    );
    return { success: true };
  }
}
