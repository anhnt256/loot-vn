import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { calculateActiveUsersInfo } from '../lib/user-calculator';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(userId: number, branch: string) {
    const users = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM User WHERE userId = ${userId} AND branch = ${branch} LIMIT 1
    `;
    if (users.length === 0) return null;
    return users[0];
  }

  async getWallet(userId: number, branch: string) {
    const { getFnetDB } = await import('../lib/db');
    const fnetDB = await getFnetDB(branch);
    const walletResult = await fnetDB.$queryRaw<any[]>`
      SELECT main, sub FROM wallettb WHERE userid = ${userId} LIMIT 1
    `;
    if (walletResult.length === 0) return null;
    const wallet = walletResult[0];
    const main = Number(wallet.main) || 0;
    const sub = Number(wallet.sub) || 0;
    return { main, sub, total: main + sub };
  }

  async search(query: string, branch: string) {
    const users = await this.prisma.$queryRaw<any[]>`
      SELECT id, userId, userName FROM User
      WHERE (userId = ${parseInt(query, 10) || 0} OR userName LIKE ${`%${query}%` || ''})
        AND branch = ${branch}
      ORDER BY userName LIMIT 10
    `;
    return users;
  }

  async createUser(data: {
    userId: number;
    branch: string;
    rankId?: number;
    stars?: number;
  }) {
    const { userId, branch, rankId = 1, stars = 0 } = data;
    const existing = await this.findOne(userId, branch);
    if (existing) throw new BadRequestException('User already exists.');

    await this.prisma.$executeRaw`
      INSERT INTO User (userId, branch, rankId, stars, createdAt, updatedAt)
      VALUES (${userId}, ${branch}, ${rankId}, ${stars}, NOW(), NOW())
    `;
    return this.findOne(userId, branch);
  }

  async updateUser(data: {
    id: number;
    branch: string;
    rankId?: number;
    magicStone?: number;
    stars?: number;
    userName?: string;
  }) {
    const { id, branch, ...updateData } = data;
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0)
      throw new BadRequestException('No fields to update');

    const query = `UPDATE User SET ${updateFields.join(', ')}, updatedAt = NOW() WHERE id = ? AND branch = ?`;
    updateValues.push(id, branch);

    await this.prisma.$executeRawUnsafe(query, ...updateValues);
    const result = await this.prisma.$queryRaw<
      any[]
    >`SELECT * FROM User WHERE id = ${id} AND branch = ${branch} LIMIT 1`;
    return result[0];
  }

  async calculateActiveUsers(listUsers: number[], branch: string) {
    return calculateActiveUsersInfo(listUsers, branch);
  }
}
