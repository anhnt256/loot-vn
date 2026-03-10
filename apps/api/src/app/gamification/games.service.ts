import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllResults(branch: string, limit = 100) {
    return this.prisma.$queryRawUnsafe(
      `SELECT gr.id, gr.userId, gr.itemId, gr.createdAt, gr.updatedAt,
              i.title, i.value,
              CONCAT(SUBSTRING(u.userName, 1, LENGTH(u.userName)-3), '***') as maskedUsername,
              MAX(ush.oldStars) as oldStars,
              MAX(ush.newStars) as newStars
       FROM GameResult gr
       INNER JOIN Item i ON gr.itemId = i.id
       INNER JOIN User u ON gr.userId = u.userId AND u.branch = ?
       LEFT JOIN UserStarHistory ush ON gr.userId = ush.userId 
         AND ush.targetId = gr.id 
         AND ush.branch = ?
         AND ush.type = 'GAME'
       WHERE gr.createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY gr.id, gr.userId, gr.itemId, gr.createdAt, gr.updatedAt, i.title, i.value, u.userName
       ORDER BY gr.createdAt DESC
       LIMIT ?`,
      branch,
      branch,
      limit,
    );
  }

  async getRankings(
    branch: string,
    type: 'STARS' | 'GAMES' = 'STARS',
    limit = 10,
  ) {
    if (type === 'STARS') {
      return this.prisma.$queryRawUnsafe(
        `SELECT userId, userName, stars, fullName
         FROM User WHERE branch = ? AND isDeleted = false
         ORDER BY stars DESC LIMIT ?`,
        branch,
        limit,
      );
    }
    // Add other ranking logic if needed
    return [];
  }
}
