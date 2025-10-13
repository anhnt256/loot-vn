import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";

export async function GET() {
  try {
    // First, try to find any active season
    const currentSeason = await db.$queryRaw<any[]>`
      SELECT * FROM BattlePassSeason 
      WHERE isActive = true
        AND startDate <= DATE(${getCurrentTimeVNDB()})
        AND endDate >= DATE(${getCurrentTimeVNDB()})
      LIMIT 1
    `;

    // If no active season found, check if there are ANY seasons at all
    if (currentSeason.length === 0) {
      const existingSeasonsResult = await db.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM BattlePassSeason
      `;
      const existingSeasons = Number(existingSeasonsResult[0].count);

      if (existingSeasons === 0) {
        // Only create default season if NO seasons exist at all
        await db.$executeRaw`
          INSERT INTO BattlePassSeason (name, description, startDate, endDate, isActive, maxLevel, createdAt, updatedAt)
          VALUES (
            'Season 1',
            'Default battle pass season',
            '2024-01-01',
            '2024-12-31',
            true,
            30,
            ${getCurrentTimeVNDB()},
            ${getCurrentTimeVNDB()}
          )
        `;

        // Get the created season
        const defaultSeason = await db.$queryRaw<any[]>`
          SELECT * FROM BattlePassSeason 
          WHERE name = 'Season 1' 
          AND isActive = true
          ORDER BY id DESC
          LIMIT 1
        `;

        // Create rewards for the default season
        const seasonId = defaultSeason[0].id;

        // Create 30 regular rewards
        for (let i = 1; i <= 30; i++) {
          const level = i;
          const isFree = level % 2 === 1; // Odd levels are free, even levels are premium
          const rewardType =
            level <= 10 ? "stars" : level <= 20 ? "coins" : "voucher";

          await db.$executeRaw`
            INSERT INTO BattlePassReward (seasonId, level, name, description, type, rewardType, rewardValue, isBonus, createdAt, updatedAt)
            VALUES (
              ${seasonId},
              ${level},
              ${isFree ? `Free Reward Lv.${level}` : `Premium Reward Lv.${level}`},
              ${isFree ? `Free tier reward for level ${level}` : `Premium tier reward for level ${level}`},
              ${isFree ? "free" : "premium"},
              ${rewardType},
              ${isFree ? level * 50 : level * 150},
              false,
              ${getCurrentTimeVNDB()},
              ${getCurrentTimeVNDB()}
            )
          `;
        }

        // Create 3 bonus rewards
        await db.$executeRaw`
          INSERT INTO BattlePassReward (seasonId, level, name, description, type, rewardType, rewardValue, isBonus, createdAt, updatedAt)
          VALUES 
            (${seasonId}, 31, 'Ultimate Bonus 1', 'Free ultimate reward for completing all levels', 'free', 'stars', 5000, true, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()}),
            (${seasonId}, 32, 'Ultimate Bonus 2', 'Premium ultimate reward for completing all levels', 'premium', 'coins', 10000, true, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()}),
            (${seasonId}, 33, 'Ultimate Bonus 3', 'Premium ultimate reward for completing all levels', 'premium', 'voucher', 1, true, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
        `;

        // Get the complete season with rewards
        const completeSeason = await db.$queryRaw<any[]>`
          SELECT 
            bs.*,
            bpr.id as reward_id,
            bpr.level as reward_level,
            bpr.name as reward_name,
            bpr.description as reward_description,
            bpr.type as reward_type,
            bpr.rewardType as reward_rewardType,
            bpr.rewardValue as reward_rewardValue,
            bpr.isBonus as reward_isBonus
          FROM BattlePassSeason bs
          LEFT JOIN BattlePassReward bpr ON bs.id = bpr.seasonId
          WHERE bs.id = ${seasonId}
          ORDER BY bpr.level ASC
        `;

        // Transform to match expected format
        const transformedSeason = {
          ...completeSeason[0],
          rewards: completeSeason
            .filter((row) => row.reward_id)
            .map((row) => ({
              id: row.reward_id,
              level: row.reward_level,
              name: row.reward_name,
              description: row.reward_description,
              type: row.reward_type,
              rewardType: row.reward_rewardType,
              rewardValue: row.reward_rewardValue,
              isBonus: row.reward_isBonus,
            })),
        };

        return NextResponse.json(transformedSeason);
      } else {
        // If seasons exist but none are active, return error - no current season
        return NextResponse.json(
          { error: "No active battle pass season at this time" },
          { status: 404 },
        );
      }
    }

    // Get rewards for current season with EventReward info
    const seasonWithRewards = await db.$queryRaw<any[]>`
      SELECT 
        bs.*,
        bpr.id as reward_id,
        bpr.level as reward_level,
        bpr.name as reward_name,
        bpr.description as reward_description,
        bpr.type as reward_type,
        bpr.eventRewardId as reward_eventRewardId,
        bpr.rewardType as reward_fallbackRewardType,
        bpr.rewardValue as reward_fallbackRewardValue,
        er.rewardType as reward_eventRewardType,
        er.rewardConfig as reward_eventRewardConfig,
        bpr.isBonus as reward_isBonus,
        bpp.id as premium_package_id,
        bpp.basePrice as premium_package_basePrice,
        bpp.maxQuantity as premium_package_maxQuantity
      FROM BattlePassSeason bs
      LEFT JOIN BattlePassReward bpr ON bs.id = bpr.seasonId
      LEFT JOIN EventReward er ON bpr.eventRewardId = er.id
      LEFT JOIN BattlePassPremiumPackage bpp ON bs.id = bpp.seasonId
      WHERE bs.id = ${currentSeason[0].id}
      ORDER BY bpr.level ASC
    `;

    // Transform to match expected format
    const rewards = seasonWithRewards
      .filter((row) => row.reward_id)
      .map((row) => {
        // Ưu tiên dùng EventReward nếu có eventRewardId
        let rewardType = row.reward_fallbackRewardType;
        let rewardValue = row.reward_fallbackRewardValue;

        if (row.reward_eventRewardId && row.reward_eventRewardType) {
          rewardType = row.reward_eventRewardType;

          // Parse rewardConfig để lấy value
          try {
            const config = JSON.parse(row.reward_eventRewardConfig || "{}");

            // Với TOPUP_BONUS_PERCENTAGE, lấy maxDiscountAmount là giá trị thực
            if (row.reward_eventRewardType === "TOPUP_BONUS_PERCENTAGE") {
              rewardValue =
                config.maxDiscountAmount ||
                config.value ||
                row.reward_fallbackRewardValue;
            } else {
              rewardValue =
                config.value || config.amount || row.reward_fallbackRewardValue;
            }
          } catch (e) {
            rewardValue = row.reward_fallbackRewardValue;
          }
        }

        return {
          id: row.reward_id,
          level: row.reward_level,
          name: row.reward_name,
          description: row.reward_description,
          type: row.reward_type,
          eventRewardId: row.reward_eventRewardId,
          rewardType: rewardType,
          rewardValue: rewardValue,
          isBonus: row.reward_isBonus,
        };
      });

    // Tính tổng giá trị các loại rewards
    const premiumRewards = rewards.filter((r) => r.type === "premium");
    const mainAccountTopup = premiumRewards
      .filter((r) => r.rewardType === "MAIN_ACCOUNT_TOPUP")
      .reduce((sum, r) => sum + (Number(r.rewardValue) || 0), 0);
    const totalValue = premiumRewards.reduce(
      (sum, r) => sum + (Number(r.rewardValue) || 0),
      0,
    );
    const otherRewardsValue = totalValue - mainAccountTopup;

    // Lấy thông tin premium package
    const premiumPackageId = seasonWithRewards[0]?.premium_package_id;
    const premiumPackagePrice = seasonWithRewards[0]?.premium_package_basePrice;
    const premiumPackageMaxQty =
      seasonWithRewards[0]?.premium_package_maxQuantity;

    // Đếm số đơn đã approved
    let soldCount = 0;
    let remaining = null;
    if (premiumPackageId) {
      const soldCountResult = await db.$queryRaw<any[]>`
        SELECT COUNT(*) as count 
        FROM BattlePassPremiumOrder 
        WHERE packageId = ${premiumPackageId} 
          AND status = 'APPROVED'
      `;
      soldCount = Number(soldCountResult[0].count);
      if (premiumPackageMaxQty) {
        remaining = Number(premiumPackageMaxQty) - soldCount;
      }
    }

    const transformedCurrentSeason = {
      ...seasonWithRewards[0],
      rewards: rewards,
      rewardsSummary: {
        totalPremiumRewards: premiumRewards.length,
        totalValue: totalValue,
        mainAccountTopup: mainAccountTopup,
        otherRewardsValue: otherRewardsValue,
      },
      premiumPackage: premiumPackageId
        ? {
            id: Number(premiumPackageId),
            basePrice: Number(premiumPackagePrice),
            maxQuantity: premiumPackageMaxQty
              ? Number(premiumPackageMaxQty)
              : null,
            sold: soldCount,
            remaining: remaining,
          }
        : null,
    };

    return NextResponse.json(transformedCurrentSeason);
  } catch (error) {
    console.error("Error fetching current season:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
