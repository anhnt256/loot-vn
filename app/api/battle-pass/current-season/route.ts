import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // First, try to find any active season
    const currentSeason = await db.battlePassSeason.findFirst({
      where: {
        isActive: true,
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        rewards: {
          orderBy: {
            level: "asc",
          },
        },
      },
    });

    // If no active season found, check if there are ANY seasons at all
    if (!currentSeason) {
      const existingSeasons = await db.battlePassSeason.count();

      if (existingSeasons === 0) {
        // Only create default season if NO seasons exist at all
        const defaultSeason = await db.battlePassSeason.create({
          data: {
            name: "Season 1",
            description: "Default battle pass season",
            startDate: new Date("2024-01-01"),
            endDate: new Date("2024-12-31"),
            isActive: true,
            maxLevel: 30,
            rewards: {
              create: [
                // 30 regular rewards (1 reward per level, alternating free/premium)
                ...Array.from({ length: 30 }, (_, i) => {
                  const level = i + 1;
                  const isFree = level % 2 === 1; // Odd levels are free, even levels are premium
                  const rewardType =
                    level <= 10 ? "stars" : level <= 20 ? "coins" : "voucher";
                  return {
                    level,
                    name: isFree
                      ? `Free Reward Lv.${level}`
                      : `Premium Reward Lv.${level}`,
                    description: isFree
                      ? `Free tier reward for level ${level}`
                      : `Premium tier reward for level ${level}`,
                    type: isFree ? "free" : "premium",
                    rewardType,
                    rewardValue: isFree ? level * 50 : level * 150,
                    isBonus: false,
                  };
                }),
                // 3 bonus rewards
                {
                  level: 31,
                  name: "Ultimate Bonus 1",
                  description: "Free ultimate reward for completing all levels",
                  type: "free",
                  rewardType: "stars",
                  rewardValue: 5000,
                  isBonus: true,
                },
                {
                  level: 32,
                  name: "Ultimate Bonus 2",
                  description:
                    "Premium ultimate reward for completing all levels",
                  type: "premium",
                  rewardType: "coins",
                  rewardValue: 10000,
                  isBonus: true,
                },
                {
                  level: 33,
                  name: "Ultimate Bonus 3",
                  description:
                    "Premium ultimate reward for completing all levels",
                  type: "premium",
                  rewardType: "voucher",
                  rewardValue: 1,
                  isBonus: true,
                },
              ],
            },
          },
          include: {
            rewards: {
              orderBy: {
                level: "asc",
              },
            },
          },
        });

        return NextResponse.json(defaultSeason);
      } else {
        // If seasons exist but none are active, return the most recent one or an error
        const latestSeason = await db.battlePassSeason.findFirst({
          orderBy: { createdAt: "desc" },
          include: {
            rewards: {
              orderBy: {
                level: "asc",
              },
            },
          },
        });

        if (latestSeason) {
          return NextResponse.json(latestSeason);
        } else {
          return NextResponse.json(
            { error: "No battle pass season found" },
            { status: 404 },
          );
        }
      }
    }

    return NextResponse.json(currentSeason);
  } catch (error) {
    console.error("Error fetching current season:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
