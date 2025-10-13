import { db } from "@/lib/db";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";

export interface RewardCalculationResult {
  applicable: boolean;
  discountAmount: number;
  freeItems: Array<{
    type: string;
    quantity: number;
    value: number;
  }>;
  bonusItems: Array<{
    type: string;
    quantity: number;
    value: number;
  }>;
  error?: string;
}

export interface OrderData {
  amount: number;
  items: Array<{
    type: string;
    quantity: number;
    value: number;
  }>;
  userId?: number;
  branch?: string;
}

/**
 * Calculate reward based on reward configuration and order data
 */
export async function calculateReward(
  rewardId: number,
  orderData: OrderData,
): Promise<RewardCalculationResult> {
  try {
    const reward = await db.$queryRaw<any[]>`
      SELECT * FROM EventReward 
      WHERE id = ${rewardId} AND isActive = true
    `;

    if (reward.length === 0) {
      return {
        applicable: false,
        discountAmount: 0,
        freeItems: [],
        bonusItems: [],
        error: "Reward not found or inactive",
      };
    }

    const rewardData = reward[0];
    const rewardConfig = JSON.parse(rewardData.rewardConfig);

    // Check eligibility if provided
    if (rewardData.eligibility && orderData.userId) {
      const eligibility = JSON.parse(rewardData.eligibility);
      if (
        !(await checkEligibility(
          orderData.userId,
          orderData.branch || "",
          eligibility,
        ))
      ) {
        return {
          applicable: false,
          discountAmount: 0,
          freeItems: [],
          bonusItems: [],
          error: "User not eligible for this reward",
        };
      }
    }

    // Check usage limits
    if (orderData.userId) {
      const usageCount = await db.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM EventRewardUsage 
        WHERE rewardId = ${rewardId} 
          AND userId = ${orderData.userId}
          AND DATE(usedAt) = CURDATE()
      `;

      if (rewardData.maxPerDay && usageCount[0].count >= rewardData.maxPerDay) {
        return {
          applicable: false,
          discountAmount: 0,
          freeItems: [],
          bonusItems: [],
          error: "Daily usage limit reached",
        };
      }
    }

    // Check if reward is still available
    if (rewardData.maxQuantity && rewardData.used >= rewardData.maxQuantity) {
      return {
        applicable: false,
        discountAmount: 0,
        freeItems: [],
        bonusItems: [],
        error: "Reward quantity exhausted",
      };
    }

    // Calculate based on reward type
    switch (rewardData.rewardType) {
      case "PERCENTAGE_DISCOUNT":
        return calculatePercentageDiscount(rewardConfig, orderData);

      case "FIXED_DISCOUNT":
        return calculateFixedDiscount(rewardConfig, orderData);

      case "FREE_ITEM":
        return calculateFreeItem(rewardConfig, orderData);

      case "BONUS_ITEM":
        return calculateBonusItem(rewardConfig, orderData);

      case "MULTIPLIER":
        return calculateMultiplier(rewardConfig, orderData);

      default:
        return {
          applicable: false,
          discountAmount: 0,
          freeItems: [],
          bonusItems: [],
          error: "Unknown reward type",
        };
    }
  } catch (error) {
    console.error("Error calculating reward:", error);
    return {
      applicable: false,
      discountAmount: 0,
      freeItems: [],
      bonusItems: [],
      error: "Calculation error",
    };
  }
}

/**
 * Calculate percentage discount
 */
function calculatePercentageDiscount(
  config: any,
  orderData: OrderData,
): RewardCalculationResult {
  const {
    discountPercent,
    maxDiscountAmount,
    minOrderAmount,
    applicableItems,
  } = config;

  if (orderData.amount < minOrderAmount) {
    return {
      applicable: false,
      discountAmount: 0,
      freeItems: [],
      bonusItems: [],
      error: `Minimum order amount ${minOrderAmount.toLocaleString()} VND required`,
    };
  }

  // Check if items are applicable
  if (applicableItems && applicableItems !== "ALL") {
    const hasApplicableItem = orderData.items.some((item) =>
      applicableItems.includes(item.type),
    );

    if (!hasApplicableItem) {
      return {
        applicable: false,
        discountAmount: 0,
        freeItems: [],
        bonusItems: [],
        error: "No applicable items in order",
      };
    }
  }

  const calculatedDiscount = Math.floor(
    (orderData.amount * discountPercent) / 100,
  );
  const actualDiscount = Math.min(calculatedDiscount, maxDiscountAmount);

  return {
    applicable: true,
    discountAmount: actualDiscount,
    freeItems: [],
    bonusItems: [],
  };
}

/**
 * Calculate fixed discount
 */
function calculateFixedDiscount(
  config: any,
  orderData: OrderData,
): RewardCalculationResult {
  const { discountAmount, minOrderAmount, applicableItems } = config;

  if (orderData.amount < minOrderAmount) {
    return {
      applicable: false,
      discountAmount: 0,
      freeItems: [],
      bonusItems: [],
      error: `Minimum order amount ${minOrderAmount.toLocaleString()} VND required`,
    };
  }

  // Check if items are applicable
  if (applicableItems && applicableItems !== "ALL") {
    const hasApplicableItem = orderData.items.some((item) =>
      applicableItems.includes(item.type),
    );

    if (!hasApplicableItem) {
      return {
        applicable: false,
        discountAmount: 0,
        freeItems: [],
        bonusItems: [],
        error: "No applicable items in order",
      };
    }
  }

  return {
    applicable: true,
    discountAmount: discountAmount,
    freeItems: [],
    bonusItems: [],
  };
}

/**
 * Calculate free item
 */
function calculateFreeItem(
  config: any,
  orderData: OrderData,
): RewardCalculationResult {
  const {
    itemType,
    discountPercent,
    maxFreeAmount,
    minOrderAmount,
    requirePurchase,
  } = config;

  if (requirePurchase && orderData.amount < minOrderAmount) {
    return {
      applicable: false,
      discountAmount: 0,
      freeItems: [],
      bonusItems: [],
      error: `Minimum order amount ${minOrderAmount.toLocaleString()} VND required`,
    };
  }

  const freeAmount = Math.min(orderData.amount, maxFreeAmount);

  return {
    applicable: true,
    discountAmount: 0,
    freeItems: [
      {
        type: itemType,
        quantity: 1,
        value: freeAmount,
      },
    ],
    bonusItems: [],
  };
}

/**
 * Calculate bonus item (BOGO)
 */
function calculateBonusItem(
  config: any,
  orderData: OrderData,
): RewardCalculationResult {
  const { itemType, buyQuantity, freeQuantity, maxFreeItems } = config;

  // Find applicable items
  const applicableItems = orderData.items.filter(
    (item) => item.type === itemType,
  );
  const totalQuantity = applicableItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  if (totalQuantity < buyQuantity) {
    return {
      applicable: false,
      discountAmount: 0,
      freeItems: [],
      bonusItems: [],
      error: `Need to buy at least ${buyQuantity} ${itemType} items`,
    };
  }

  const bonusQuantity = Math.min(
    Math.floor(totalQuantity / buyQuantity) * freeQuantity,
    maxFreeItems,
  );

  return {
    applicable: true,
    discountAmount: 0,
    freeItems: [],
    bonusItems: [
      {
        type: itemType,
        quantity: bonusQuantity,
        value: 0, // Free items have no value
      },
    ],
  };
}

/**
 * Calculate multiplier
 */
function calculateMultiplier(
  config: any,
  orderData: OrderData,
): RewardCalculationResult {
  const { multiplier, targetType, conditions } = config;

  // Check conditions (minPlayTime, minSpending, etc.)
  if (conditions) {
    if (conditions.minSpending && orderData.amount < conditions.minSpending) {
      return {
        applicable: false,
        discountAmount: 0,
        freeItems: [],
        bonusItems: [],
        error: `Minimum spending ${conditions.minSpending.toLocaleString()} VND required`,
      };
    }
  }

  // This would typically multiply stars or other rewards
  // For now, return a bonus item representing the multiplier
  return {
    applicable: true,
    discountAmount: 0,
    freeItems: [],
    bonusItems: [
      {
        type: targetType,
        quantity: multiplier,
        value: 0, // Multiplier doesn't have direct value
      },
    ],
  };
}

/**
 * Check user eligibility for reward
 */
async function checkEligibility(
  userId: number,
  branch: string,
  eligibility: any,
): Promise<boolean> {
  try {
    // Check user type eligibility
    if (eligibility.userTypes) {
      const user = await db.$queryRaw<any[]>`
        SELECT * FROM User 
        WHERE userId = ${userId} AND branch = ${branch}
      `;

      if (user.length === 0) {
        return false;
      }

      // Check if user meets criteria (new user, verified, etc.)
      if (eligibility.userTypes.includes("NEW_USER")) {
        const userAge = Date.now() - new Date(user[0].createdAt).getTime();
        const daysOld = userAge / (1000 * 60 * 60 * 24);

        if (daysOld > 7) {
          // Not a new user if older than 7 days
          return false;
        }
      }
    }

    // Check registration period
    if (eligibility.registrationPeriod) {
      const user = await db.$queryRaw<any[]>`
        SELECT * FROM User 
        WHERE userId = ${userId} AND branch = ${branch}
      `;

      if (user.length === 0) {
        return false;
      }

      const userAge = Date.now() - new Date(user[0].createdAt).getTime();
      const daysOld = userAge / (1000 * 60 * 60 * 24);

      if (eligibility.registrationPeriod === "within_7_days" && daysOld > 7) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking eligibility:", error);
    return false;
  }
}

/**
 * Apply reward and track usage
 */
export async function applyReward(
  rewardId: number,
  userId: number,
  branch: string,
  orderData: OrderData,
  calculationResult: RewardCalculationResult,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!calculationResult.applicable) {
      return { success: false, error: calculationResult.error };
    }

    // Record usage
    await db.$executeRaw`
      INSERT INTO EventRewardUsage (
        eventId, rewardId, userId, branch, orderAmount, 
        discountApplied, freeItems, usedAt
      )
      VALUES (
        (SELECT eventId FROM EventReward WHERE id = ${rewardId}),
        ${rewardId},
        ${userId},
        ${branch},
        ${orderData.amount},
        ${calculationResult.discountAmount},
        ${JSON.stringify(calculationResult.freeItems)},
        ${getCurrentTimeVNDB()}
      )
    `;

    // Update reward usage count
    await db.$executeRaw`
      UPDATE EventReward 
      SET used = used + 1, updatedAt = ${getCurrentTimeVNDB()}
      WHERE id = ${rewardId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Error applying reward:", error);
    return { success: false, error: "Failed to apply reward" };
  }
}
