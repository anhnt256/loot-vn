import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

export async function GET() {
  try {
    // First, try to find any active season
    const currentSeason = await db.$queryRaw<any[]>`
      SELECT * FROM BattlePassSeason 
      WHERE isActive = true
        AND startDate <= DATE(${getCurrentTimeVNISO()})
        AND endDate >= DATE(${getCurrentTimeVNISO()})
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
            ${getCurrentTimeVNISO()},
            ${getCurrentTimeVNISO()}
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
              ${getCurrentTimeVNISO()},
              ${getCurrentTimeVNISO()}
            )
          `;
        }

        // Create 3 bonus rewards
        await db.$executeRaw`
          INSERT INTO BattlePassReward (seasonId, level, name, description, type, rewardType, rewardValue, isBonus, createdAt, updatedAt)
          VALUES 
            (${seasonId}, 31, 'Ultimate Bonus 1', 'Free ultimate reward for completing all levels', 'free', 'stars', 5000, true, ${getCurrentTimeVNISO()}, ${getCurrentTimeVNISO()}),
            (${seasonId}, 32, 'Ultimate Bonus 2', 'Premium ultimate reward for completing all levels', 'premium', 'coins', 10000, true, ${getCurrentTimeVNISO()}, ${getCurrentTimeVNISO()}),
            (${seasonId}, 33, 'Ultimate Bonus 3', 'Premium ultimate reward for completing all levels', 'premium', 'voucher', 1, true, ${getCurrentTimeVNISO()}, ${getCurrentTimeVNISO()})
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
        // If seasons exist but none are active, return the most recent one or an error
        const latestSeason = await db.$queryRaw<any[]>`
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
          ORDER BY bs.createdAt DESC
          LIMIT 1
        `;

        if (latestSeason.length > 0) {
          // Transform to match expected format
          const transformedSeason = {
            ...latestSeason[0],
            rewards: latestSeason
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
          return NextResponse.json(
            { error: "No battle pass season found" },
            { status: 404 },
          );
        }
      }
    }

    // Get rewards for current season
    const seasonWithRewards = await db.$queryRaw<any[]>`
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
      WHERE bs.id = ${currentSeason[0].id}
      ORDER BY bpr.level ASC
    `;

    // Transform to match expected format
    const transformedCurrentSeason = {
      ...seasonWithRewards[0],
      rewards: seasonWithRewards
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

    return NextResponse.json(transformedCurrentSeason);
  } catch (error) {
    console.error("Error fetching current season:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
