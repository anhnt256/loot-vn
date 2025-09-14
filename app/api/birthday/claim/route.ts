import { NextRequest, NextResponse } from "next/server";
import { db, getFnetDB } from "@/lib/db";
import { cookies } from "next/headers";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;
    const { userId, tierId } = await request.json();

    console.log("=== BIRTHDAY CLAIM DEBUG ===");
    console.log("Request data:", { userId, tierId, branch });

    if (!userId || !tierId) {
      console.log("Missing userId or tierId");
      return NextResponse.json(
        { success: false, error: "Missing userId or tierId" },
        { status: 400 },
      );
    }

    if (!branch) {
      console.log("Missing branch cookie");
      return NextResponse.json(
        { success: false, error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    try {
      // Check if user already claimed this tier WITH LOCK
      const existingClaim = await db.$queryRaw<any[]>`
        SELECT * FROM UserBirthdayProgress 
        WHERE userId = ${userId} AND tierId = ${tierId} AND branch = ${branch}
        FOR UPDATE
      `;

      console.log("Existing claim check:", existingClaim);

      if (existingClaim.length > 0 && existingClaim[0].isClaimed) {
        console.log("Already claimed this tier");
        return NextResponse.json(
          { success: false, error: "Already claimed this tier" },
          { status: 400 },
        );
      }

      // Additional check: Verify no recent transactions for this tier (within last 5 minutes)
      const recentTransactions = await db.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM BirthdayTransaction
        WHERE userId = ${userId} AND tierId = ${tierId} AND branch = ${branch}
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      `;

      console.log("Recent transactions check:", recentTransactions);

      if (recentTransactions[0]?.count > 0) {
        console.log("Recent claim detected");
        return NextResponse.json(
          { success: false, error: "Recent claim detected, please wait" },
          { status: 429 },
        );
      }

      // Get tier information
      const tierResult = await db.$queryRaw<any[]>`
        SELECT * FROM BirthdayTier WHERE id = ${tierId}
      `;

      console.log("Tier result:", tierResult);

      if (tierResult.length === 0) {
        console.log("Invalid tier");
        return NextResponse.json(
          { success: false, error: "Invalid tier" },
          { status: 400 },
        );
      }

      const tier = tierResult[0];

      // Get fnetDB instance
      const fnetDB = await getFnetDB();
      console.log("FnetDB connected");

      // Hard code date range for birthday event: 21/07/2025 to 31/07/2025
      const startDate = "2025-07-24 00:00:00";
      const endDate = "2025-07-31 23:59:59";

      console.log("Checking spending from:", startDate, "to:", endDate);

      // Get total spent from fnet.paymenttb (real-time data) - same logic as progress API
      const totalSpentResult = await fnetDB.$queryRawUnsafe<any[]>(`
      SELECT 
        COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS totalSpent
      FROM fnet.paymenttb
      WHERE PaymentType = 4
        AND UserId = ${userId}
        AND Note = N'Thời gian phí'
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= '${startDate}'
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) <= '${endDate}'
    `);

      const totalSpent = totalSpentResult[0]?.totalSpent || 0;
      console.log(
        "Total spent:",
        totalSpent,
        "Tier milestone:",
        tier.milestoneAmount,
      );

      // Check if user meets the milestone requirement
      if (totalSpent < tier.milestoneAmount) {
        console.log("Insufficient spending");
        return NextResponse.json(
          { success: false, error: "Insufficient spending to claim this tier" },
          { status: 400 },
        );
      }

      console.log("Creating/updating user progress...");

      // Create or update user progress
      if (existingClaim.length > 0) {
        console.log("Updating existing progress...");
        await db.$executeRaw`
          UPDATE UserBirthdayProgress 
          SET isClaimed = 1, claimedAt = NOW(), totalSpent = ${totalSpent}
          WHERE userId = ${userId} AND tierId = ${tierId} AND branch = ${branch}
        `;
        console.log("Updated existing progress successfully");
      } else {
        console.log("Creating new progress record...");
        await db.$executeRaw`
          INSERT INTO UserBirthdayProgress (userId, tierId, branch, isClaimed, claimedAt, totalSpent, updatedAt)
          VALUES (${userId}, ${tierId}, ${branch}, 1, NOW(), ${totalSpent}, NOW())
        `;
        console.log("Created new progress record successfully");
      }

      console.log("Recording bonus transaction...");

      // Record bonus transaction
      await db.$executeRaw`
        INSERT INTO BirthdayTransaction (userId, branch, amount, tierId, transactionType, description)
        VALUES (${userId}, ${branch}, ${tier.bonusAmount}, ${tierId}, 'BONUS', ${`Birthday bonus for ${tier.tierName}`})
      `;
      console.log("Bonus transaction recorded successfully");

      // Record free spins transaction
      if (tier.freeSpins > 0) {
        console.log("Recording free spins transaction...");
        await db.$executeRaw`
          INSERT INTO BirthdayTransaction (userId, branch, amount, tierId, transactionType, description)
          VALUES (${userId}, ${branch}, ${tier.freeSpins}, ${tierId}, 'FREE_SPIN', ${`Free spins for ${tier.tierName}`})
        `;
        console.log("Free spins transaction recorded successfully");
      }

      // Create GiftRound for free spins if applicable
      if (tier.freeSpins > 0) {
        console.log("Creating GiftRound for free spins...");
        // Set expiration date to 3 days from now
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 3);
        const expirationDateFormatted = expirationDate
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");

        console.log("GiftRound expiration date:", expirationDateFormatted);

        await db.$executeRaw`
          INSERT INTO GiftRound (userId, amount, reason, staffId, branch, createdAt, expiredAt, isUsed, usedAmount)
          VALUES (
            ${userId},
            ${tier.freeSpins},
            ${`Birthday ${tier.tierName} - Free Spins`},
            ${0},
            ${branch},
            NOW(),
            ${expirationDateFormatted},
            ${false},
            ${0}
          )
        `;
        console.log("GiftRound created successfully");
      }

      console.log("Updating fnet.usertb...");

      // Update fnet.usertb with bonus amount
      const fnetUser = await fnetDB.$queryRaw<any[]>`
        SELECT UserId, RemainMoney FROM usertb 
        WHERE UserId = ${userId}
        LIMIT 1
      `;

      console.log("Fnet user data:", fnetUser);

      if (fnetUser.length > 0) {
        console.log("Updating fnet.usertb with bonus...");

        const oldMoney = fnetUser[0].RemainMoney;
        const newMoney =
          Number(fnetUser[0].RemainMoney) + Number(tier.bonusAmount);

        console.log(
          `Processing birthday bonus for user ${userId}: ${oldMoney} + ${tier.bonusAmount} = ${newMoney}`,
        );

        // Lưu lịch sử thay đổi số dư TRƯỚC khi update
        await db.$executeRaw`
          INSERT INTO FnetHistory (userId, branch, oldMoney, newMoney, createdAt, updatedAt)
          VALUES (${userId}, ${branch}, ${oldMoney}, ${newMoney}, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
        `;

        const today = new Date();
        today.setFullYear(today.getFullYear() - 20);
        const todayFormatted =
          today.toISOString().split("T")[0] + "T00:00:00.000Z";

        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 10);
        const expiryDateFormatted =
          expiryDate.toISOString().split("T")[0] + "T00:00:00.000Z";

        // Update user SAU khi đã lưu lịch sử
        await fnetDB.$executeRaw`
          UPDATE usertb 
          SET RemainMoney = ${newMoney},
              Birthdate = ${todayFormatted},
              ExpiryDate = ${expiryDateFormatted}
          WHERE UserId = ${userId}
        `;
        console.log(`Updated user ${userId} money: ${oldMoney} -> ${newMoney}`);
      }

      // Final verification: Check if we actually created the progress record
      const finalCheck = await db.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM UserBirthdayProgress 
        WHERE userId = ${userId} AND tierId = ${tierId} AND branch = ${branch} AND isClaimed = 1
      `;

      console.log("Final verification:", finalCheck);

      if (finalCheck[0]?.count === 0) {
        console.log("Failed to create claim record");
        return NextResponse.json(
          { success: false, error: "Failed to create claim record" },
          { status: 500 },
        );
      }

      console.log("All operations completed successfully");

      // Get the created GiftRound if free spins were given
      let giftRound = null;
      if (tier.freeSpins > 0) {
        const giftRoundResult = await db.$queryRaw<any[]>`
          SELECT * FROM GiftRound 
          WHERE userId = ${userId} 
          AND reason = ${`Birthday ${tier.tierName} - Free Spins`}
          AND branch = ${branch}
          ORDER BY id DESC
          LIMIT 1
        `;
        giftRound = giftRoundResult[0] || null;
        console.log("GiftRound created:", giftRound);
      }

      console.log("=== BIRTHDAY CLAIM SUCCESS ===");
      return NextResponse.json({
        success: true,
        data: {
          message: "Successfully claimed birthday reward",
          bonusAmount: tier.bonusAmount,
          freeSpins: tier.freeSpins,
          giftRound: giftRound,
        },
      });
    } catch (error) {
      console.error("=== BIRTHDAY CLAIM TRANSACTION ERROR ===");
      console.error("Transaction error details:", error);
      throw error;
    }
  } catch (error) {
    console.error("=== BIRTHDAY CLAIM GENERAL ERROR ===");
    console.error("Error claiming birthday reward:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    return NextResponse.json(
      { success: false, error: "Failed to claim birthday reward" },
      { status: 500 },
    );
  }
}
