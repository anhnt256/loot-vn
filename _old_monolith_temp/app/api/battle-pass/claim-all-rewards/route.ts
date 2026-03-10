import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { cookies } from "next/headers";

// Function to generate random 8-character code
function generateRandomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    // Get user info from headers (set by middleware)
    const userHeader = request.headers.get("user");
    if (!userHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = JSON.parse(userHeader);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 401 });
    }

    // Get branch from cookie
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;
    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    // Get current active season
    const currentSeasons = await db.$queryRaw<any[]>`
      SELECT * FROM BattlePassSeason 
      WHERE isActive = true
        AND startDate <= DATE(${getCurrentTimeVNDB()})
        AND endDate >= DATE(${getCurrentTimeVNDB()})
      LIMIT 1
    `;

    const currentSeason = currentSeasons[0];
    if (!currentSeason) {
      return NextResponse.json(
        { error: "No active season found" },
        { status: 404 },
      );
    }

    // Check season hasn't ended
    const currentDate = getCurrentTimeVNDB().split("T")[0];
    if (currentDate >= currentSeason.endDate) {
      return NextResponse.json(
        { error: "Season has ended - cannot claim rewards" },
        { status: 403 },
      );
    }

    // Get user progress
    const userProgressResult = await db.$queryRaw<any[]>`
      SELECT * FROM UserBattlePass 
      WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id} AND branch = ${branch}
      LIMIT 1
    `;

    const userProgress = userProgressResult[0];
    if (!userProgress) {
      return NextResponse.json(
        { error: "No progress found for this season" },
        { status: 404 },
      );
    }

    // Get all rewards in the season
    const allRewards = await db.$queryRaw<any[]>`
      SELECT * FROM BattlePassReward 
      WHERE seasonId = ${currentSeason.id}
      ORDER BY level ASC
    `;

    // Get already claimed rewards
    const claimedRewardsResult = await db.$queryRaw<any[]>`
      SELECT rewardId FROM UserBattlePassReward 
      WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id} AND branch = ${branch}
    `;
    const claimedRewardIds = claimedRewardsResult.map((r) => r.rewardId);

    // Filter: chỉ claim rewards chưa nhận, đủ XP, và đúng type (premium/free)
    const claimableRewards = allRewards.filter((reward) => {
      const isAlreadyClaimed = claimedRewardIds.includes(reward.id);
      const hasEnoughXP = userProgress.experience >= reward.experience;
      const canClaimPremium =
        reward.type !== "premium" || userProgress.isPremium;

      return !isAlreadyClaimed && hasEnoughXP && canClaimPremium;
    });

    if (claimableRewards.length === 0) {
      return NextResponse.json(
        { error: "No claimable rewards available" },
        { status: 400 },
      );
    }

    console.log(
      `User ${decoded.userId} claiming ${claimableRewards.length} rewards in batch`,
    );

    // Process all claims in a single transaction
    let totalStarsAdded = 0;
    const claimedRewardDetails: any[] = [];
    const promotionCodes: any[] = [];

    await db.$transaction(async (tx) => {
      const now = getCurrentTimeVNDB();

      for (const reward of claimableRewards) {
        // Insert claimed reward record
        await tx.$executeRaw`
          INSERT INTO UserBattlePassReward (userId, seasonId, rewardId, branch, claimedAt)
          VALUES (${decoded.userId}, ${currentSeason.id}, ${reward.id}, ${branch}, ${now})
        `;

        // Add stars if reward type is stars
        if (reward.rewardType === "stars" && reward.rewardValue) {
          totalStarsAdded += reward.rewardValue;
        }

        // Create PromotionCode if reward has eventRewardId (voucher/item rewards)
        if (reward.eventRewardId) {
          const randomCode = generateRandomCode();
          const promotionCode = `BP_${currentSeason.id}_${reward.level}_${randomCode}`;

          console.log(
            `Creating PromotionCode for Battle Pass reward: ${promotionCode}`,
          );

          // Get eventReward details
          const eventRewardResult = await tx.$queryRaw<any[]>`
            SELECT * FROM EventReward 
            WHERE id = ${reward.eventRewardId}
            LIMIT 1
          `;

          const eventReward = eventRewardResult[0];
          if (eventReward) {
            // Parse rewardConfig to get actual value
            const rewardConfig = eventReward.rewardConfig
              ? JSON.parse(eventReward.rewardConfig)
              : {};
            const actualValue =
              rewardConfig.value ||
              rewardConfig.discountAmount ||
              rewardConfig.freeValue ||
              null;

            // Calculate expiration date (use season end date)
            const expirationDate = new Date(currentSeason.endDate);
            expirationDate.setDate(expirationDate.getDate() + 30); // Add 30 days after season ends

            // Create promotion code using Prisma client
            const rewardName = eventReward.name || "Reward";
            const shortName = `BP Lv${reward.level} ${rewardName}`.substring(
              0,
              45,
            );

            const createdPromotionCode = await tx.promotionCode.create({
              data: {
                name: shortName,
                code: promotionCode,
                value: actualValue,
                branch: branch,
                isUsed: false,
                eventId: eventReward.eventId || null,
                rewardType: eventReward.rewardType,
                rewardValue: actualValue,
                expirationDate: expirationDate,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            promotionCodes.push({
              id: createdPromotionCode.id,
              code: promotionCode,
              name: createdPromotionCode.name,
              rewardType: eventReward.rewardType,
              rewardValue: actualValue,
              level: reward.level,
            });

            console.log(
              `✅ Created PromotionCode: ${promotionCode} with ID: ${createdPromotionCode.id}`,
            );

            // Update EventParticipant with new promotionCode in rewardsReceived
            if (eventReward.eventId) {
              const eventParticipantResult = await tx.$queryRaw<any[]>`
                SELECT * FROM EventParticipant
                WHERE userId = ${decoded.userId} 
                  AND eventId = ${eventReward.eventId}
                  AND branch = ${branch}
                LIMIT 1
              `;

              const rewardData = {
                rewardId: reward.eventRewardId,
                promotionCodeId: createdPromotionCode.id,
                claimedAt: now,
                source: "BATTLE_PASS",
                level: reward.level,
                seasonId: currentSeason.id,
              };

              if (eventParticipantResult.length > 0) {
                // Update existing EventParticipant
                const participant = eventParticipantResult[0];
                let rewardsReceived = [];

                try {
                  rewardsReceived = participant.rewardsReceived
                    ? JSON.parse(participant.rewardsReceived)
                    : [];
                } catch (e) {
                  console.error("Error parsing rewardsReceived:", e);
                  rewardsReceived = [];
                }

                rewardsReceived.push(rewardData);

                await tx.$executeRaw`
                  UPDATE EventParticipant
                  SET rewardsReceived = ${JSON.stringify(rewardsReceived)}
                  WHERE userId = ${decoded.userId} 
                    AND eventId = ${eventReward.eventId}
                    AND branch = ${branch}
                `;

                console.log(
                  `✅ Updated EventParticipant for Battle Pass reward`,
                );
              } else {
                // Create new EventParticipant
                await tx.$executeRaw`
                  INSERT INTO EventParticipant (
                    eventId, userId, branch, registeredAt, rewardsReceived
                  )
                  VALUES (
                    ${eventReward.eventId}, ${decoded.userId}, ${branch}, ${now}, ${JSON.stringify([rewardData])}
                  )
                `;

                console.log(
                  `✅ Created EventParticipant for Battle Pass reward`,
                );
              }
            }
          }
        }

        claimedRewardDetails.push({
          id: reward.id,
          name: reward.name,
          rewardType: reward.rewardType,
          rewardValue: reward.rewardValue,
          level: reward.level,
        });
      }

      // Update user stars once (batch update)
      if (totalStarsAdded > 0) {
        const userResult = await tx.$queryRaw<any[]>`
          SELECT stars FROM User 
          WHERE userId = ${decoded.userId} AND branch = ${branch}
          LIMIT 1
        `;

        const currentUser = userResult[0];
        if (currentUser) {
          const oldStars = currentUser.stars;
          const newStars = oldStars + totalStarsAdded;

          // Update user stars
          await tx.$executeRaw`
            UPDATE User 
            SET stars = ${newStars}, updatedAt = ${now}
            WHERE userId = ${decoded.userId} AND branch = ${branch}
          `;

          // Log to UserStarHistory
          await tx.$executeRaw`
            INSERT INTO UserStarHistory (userId, oldStars, newStars, type, createdAt, branch)
            VALUES (${decoded.userId}, ${oldStars}, ${newStars}, 'BATTLE_PASS', ${now}, ${branch})
          `;

          console.log(
            `✅ Updated user stars: ${oldStars} -> ${newStars} (+${totalStarsAdded})`,
          );
        }
      }
    });

    console.log(
      `✅ Successfully claimed ${claimableRewards.length} rewards for user ${decoded.userId}`,
    );
    console.log(`✅ Created ${promotionCodes.length} promotion codes`);

    return NextResponse.json({
      success: true,
      message: `Claimed ${claimableRewards.length} rewards successfully`,
      claimedCount: claimableRewards.length,
      totalStarsAdded,
      totalPromotionCodes: promotionCodes.length,
      claimedRewards: claimedRewardDetails,
      promotionCodes: promotionCodes,
    });
  } catch (error) {
    console.error("Error claiming all rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
