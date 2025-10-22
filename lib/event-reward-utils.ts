import { db } from "./db";

/**
 * Check if user has already used a specific event reward
 */
export async function hasUserUsedEventReward(
  userId: number,
  rewardId: number,
  branch: string,
): Promise<boolean> {
  try {
    const result = await db.$queryRaw<any[]>`
      SELECT COUNT(*) as count 
      FROM UserRewardMap 
      WHERE userId = ${userId} 
        AND rewardId = ${rewardId} 
        AND type = 'EVENT' 
        AND isUsed = true
        AND branch = ${branch}
    `;

    return Number(result[0]?.count) > 0;
  } catch (error) {
    console.error("[hasUserUsedEventReward] Error:", error);
    return false;
  }
}

/**
 * Check if user has already used NEW_USER_WELCOME reward
 * Special logic: Only 1 record per user per branch for NEW_USER_WELCOME
 */
export async function hasUserUsedNewUserWelcomeReward(
  userId: number,
  branch: string,
): Promise<boolean> {
  try {
    const result = await db.$queryRaw<any[]>`
      SELECT COUNT(*) as count 
      FROM UserRewardMap urm
      LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id
      WHERE urm.userId = ${userId} 
        AND urm.type = 'EVENT' 
        AND pc.rewardType = 'NEW_USER_WELCOME'
        AND urm.branch = ${branch}
    `;

    return Number(result[0]?.count) > 0;
  } catch (error) {
    console.error("[hasUserUsedNewUserWelcomeReward] Error:", error);
    return false;
  }
}

/**
 * Check if user has used any event reward today
 */
export async function hasUserUsedEventRewardToday(
  userId: number,
  branch: string,
): Promise<boolean> {
  try {
    const result = await db.$queryRaw<any[]>`
      SELECT COUNT(*) as count 
      FROM UserRewardMap 
      WHERE userId = ${userId} 
        AND type = 'EVENT' 
        AND isUsed = true
        AND branch = ${branch}
        AND DATE(updatedAt) = CURDATE()
    `;

    return Number(result[0]?.count) > 0;
  } catch (error) {
    console.error("[hasUserUsedEventRewardToday] Error:", error);
    return false;
  }
}

/**
 * Get all used event rewards for a user
 */
export async function getUserUsedEventRewards(
  userId: number,
  branch: string,
): Promise<any[]> {
  try {
    const result = await db.$queryRaw<any[]>`
      SELECT 
        urm.id,
        urm.rewardId,
        urm.promotionCodeId,
        urm.duration,
        urm.updatedAt as usedAt,
        er.name as eventRewardName,
        pc.name as promotionCodeName,
        pc.code as promotionCodeCode
      FROM UserRewardMap urm
      LEFT JOIN EventReward er ON urm.rewardId = er.id
      LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id
      WHERE urm.userId = ${userId} 
        AND urm.type = 'EVENT' 
        AND urm.isUsed = true
        AND urm.branch = ${branch}
      ORDER BY urm.updatedAt DESC
    `;

    return result;
  } catch (error) {
    console.error("[getUserUsedEventRewards] Error:", error);
    return [];
  }
}
