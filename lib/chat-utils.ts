import { db } from "./db";
import { getCurrentTimeVNDB } from "./timezone-utils";

export interface ChatMessageData {
  content: string;
  userId?: number;
  machineName: string;
  branch: string;
  staffId?: number;
}

export interface ChatMessageWithUser {
  id: number;
  content: string;
  userId?: number;
  machineName: string;
  branch: string;
  createdAt: string;
  staffId?: number;
  userName?: string;
}

/**
 * Save a chat message to database using raw query
 */
export async function saveChatMessage(data: ChatMessageData): Promise<number> {
  // Handle integer userId (admin uses -99)
  const userIdValue = data.userId || null;

  const result = await db.$queryRaw<any[]>`
    INSERT INTO ChatMessage (content, userId, machineName, branch, staffId, createdAt)
    VALUES (${data.content}, ${userIdValue}, ${data.machineName}, ${data.branch}, ${data.staffId || null}, ${getCurrentTimeVNDB()})
  `;

  // Get the inserted ID
  const idResult = await db.$queryRaw<any[]>`
    SELECT LAST_INSERT_ID() as id
  `;

  return idResult[0]?.id || 0;
}

/**
 * Get chat message with user info by ID
 */
export async function getChatMessageById(
  id: number,
  branch: string,
): Promise<ChatMessageWithUser | null> {
  const result = await db.$queryRaw<any[]>`
    SELECT 
      cm.id,
      cm.content,
      cm.userId,
      cm.machineName,
      cm.branch,
      cm.createdAt,
      cm.staffId,
      u.userName
    FROM ChatMessage cm
    LEFT JOIN User u ON cm.userId = u.userId AND u.branch = ${branch}
    WHERE cm.id = ${id}
  `;

  return result[0] || null;
}

/**
 * Get chat messages with pagination using raw query
 */
export async function getChatMessages(
  branch: string | null,
  options: {
    page?: number;
    limit?: number;
    machineName?: string;
    userId?: number;
    staffId?: number;
  } = {},
): Promise<{
  messages: ChatMessageWithUser[];
  total: number;
  hasMore: boolean;
}> {
  const { page = 1, limit = 50, machineName, userId, staffId } = options;

  const offset = (page - 1) * limit;

  // Get messages using Prisma raw query with proper parameter binding
  let messages: any[];
  let countResult: any[];

  if (branch) {
    // Branch-specific chat
    if (machineName || userId || staffId) {
      // Build dynamic conditions
      const conditions = [];
      const params = [branch];

      if (machineName) {
        conditions.push("cm.machineName = ?");
        params.push(machineName);
      }

      if (userId) {
        conditions.push("cm.userId = ?");
        params.push(userId.toString());
      }

      if (staffId) {
        conditions.push("cm.staffId = ?");
        params.push(staffId.toString());
      }

      const whereClause =
        conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

      // Get messages
      const messagesQuery = `
        SELECT 
          cm.id,
          cm.content,
          cm.userId,
          cm.machineName,
          cm.branch,
          cm.createdAt,
          cm.staffId,
          u.userName
        FROM ChatMessage cm
        LEFT JOIN User u ON cm.userId = u.userId AND u.branch = ?
        WHERE cm.branch = ? ${whereClause}
        ORDER BY cm.createdAt DESC
        LIMIT ? OFFSET ?
      `;

      messages = await db.$queryRawUnsafe<any[]>(
        messagesQuery,
        branch,
        branch,
        ...params.slice(1),
        limit,
        offset,
      );

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ChatMessage cm
        WHERE cm.branch = ? ${whereClause}
      `;

      countResult = await db.$queryRawUnsafe<any[]>(
        countQuery,
        branch,
        ...params.slice(1),
      );
    } else {
      // Simple case - just branch filter
      const messagesQuery = `
        SELECT 
          cm.id,
          cm.content,
          cm.userId,
          cm.machineName,
          cm.branch,
          cm.createdAt,
          cm.staffId,
          u.userName
        FROM ChatMessage cm
        LEFT JOIN User u ON cm.userId = u.userId AND u.branch = ?
        WHERE cm.branch = ?
        ORDER BY cm.createdAt DESC
        LIMIT ? OFFSET ?
      `;

      messages = await db.$queryRawUnsafe<any[]>(
        messagesQuery,
        branch,
        branch,
        limit,
        offset,
      );

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ChatMessage cm
        WHERE cm.branch = ?
      `;

      countResult = await db.$queryRawUnsafe<any[]>(countQuery, branch);
    }
  } else {
    // ALL chat - no branch filter, get all messages from all branches
    const messagesQuery = `
      SELECT 
        cm.id,
        cm.content,
        cm.userId,
        cm.machineName,
        cm.branch,
        cm.createdAt,
        cm.staffId,
        u.userName
      FROM ChatMessage cm
      LEFT JOIN User u ON cm.userId = u.userId AND u.branch = cm.branch
      ORDER BY cm.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    messages = await db.$queryRawUnsafe<any[]>(messagesQuery, limit, offset);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ChatMessage cm
    `;

    countResult = await db.$queryRawUnsafe<any[]>(countQuery);
  }

  const total = Number(countResult[0]?.total || 0);
  const hasMore = offset + limit < total;

  return {
    messages: messages.reverse(), // Reverse to show oldest first
    total,
    hasMore,
  };
}

/**
 * Get recent chat messages for a machine
 */
export async function getRecentChatMessages(
  branch: string,
  machineName: string,
  limit: number = 10,
): Promise<ChatMessageWithUser[]> {
  const result = await db.$queryRaw<any[]>`
    SELECT 
      cm.id,
      cm.content,
      cm.userId,
      cm.machineName,
      cm.branch,
      cm.createdAt,
      cm.staffId,
      u.userName,
      u.userType
    FROM ChatMessage cm
    LEFT JOIN User u ON cm.userId = u.userId AND u.branch = ${branch}
    WHERE cm.branch = ${branch} AND cm.machineName = ${machineName}
    ORDER BY cm.createdAt DESC
    LIMIT ${limit}
  `;

  return result.reverse(); // Return oldest first
}

/**
 * Get chat statistics for a branch
 */
export async function getChatStats(branch: string): Promise<{
  totalMessages: number;
  messagesToday: number;
  activeMachines: number;
  staffMessages: number;
  userMessages: number;
}> {
  const today = getCurrentTimeVNDB().split("T")[0];

  const [totalResult, todayResult, machinesResult, staffResult, userResult] =
    await Promise.all([
      // Total messages
      db.$queryRaw<any[]>`
      SELECT COUNT(*) as total
      FROM ChatMessage
      WHERE branch = ${branch}
    `,

      // Messages today
      db.$queryRaw<any[]>`
      SELECT COUNT(*) as total
      FROM ChatMessage
      WHERE branch = ${branch} AND DATE(createdAt) = ${today}
    `,

      // Active machines
      db.$queryRaw<any[]>`
      SELECT COUNT(DISTINCT machineName) as total
      FROM ChatMessage
      WHERE branch = ${branch} AND DATE(createdAt) = ${today}
    `,

      // Staff messages
      db.$queryRaw<any[]>`
      SELECT COUNT(*) as total
      FROM ChatMessage
      WHERE branch = ${branch} AND staffId IS NOT NULL
    `,

      // User messages
      db.$queryRaw<any[]>`
      SELECT COUNT(*) as total
      FROM ChatMessage
      WHERE branch = ${branch} AND userId IS NOT NULL
    `,
    ]);

  return {
    totalMessages: totalResult[0]?.total || 0,
    messagesToday: todayResult[0]?.total || 0,
    activeMachines: machinesResult[0]?.total || 0,
    staffMessages: staffResult[0]?.total || 0,
    userMessages: userResult[0]?.total || 0,
  };
}

/**
 * Clean up old chat messages (older than 30 days)
 */
export async function cleanupOldMessages(
  branch: string,
  daysOld: number = 30,
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await db.$queryRaw<any[]>`
    DELETE FROM ChatMessage
    WHERE branch = ${branch} AND createdAt < ${cutoffDate.toISOString()}
  `;

  return (result as any).affectedRows || 0;
}
