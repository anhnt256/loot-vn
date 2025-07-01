import { NextResponse } from "next/server";

import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { Prisma } from "@/prisma/generated/prisma-client";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = params;

    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    const fnetQuery = fnetPrisma.sql`
      SELECT COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS total
      FROM fnet.paymenttb
      WHERE PaymentType = 4
        AND UserId = ${parseInt(userId, 10)}
        AND Note = N'Thời gian phí'
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= DATE(DATE_SUB(NOW(), INTERVAL WEEKDAY(NOW()) DAY))
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) <= NOW();
    `;

    const result = await fnetDB.$queryRaw<[{ total: number }]>(fnetQuery);

    const userTopUp = parseFloat(result[0].total.toString());

    // Calculate rounds from top-up
    const round = Math.floor(
      userTopUp
        ? userTopUp / Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND)
        : 0,
    );

    // Get user record first
    const user = await db.user.findFirst({
      where: { userId: parseInt(userId, 10) },
    });

    if (!user?.id) {
      return NextResponse.json("User not found", { status: 404 });
    }

    // Get active gift rounds
    const activeGiftRounds = await db.giftRound.findMany({
      where: {
        userId: user.id,
        isUsed: false,
        OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
      },
    });

    // Calculate total gift rounds
    const totalGiftRounds = activeGiftRounds.reduce(
      (sum, gr) => sum + gr.amount,
      0,
    );

    // Số lượt đã sử dụng
    const query = Prisma.sql`
      SELECT COUNT(*) as count
      FROM GameResult gr
      WHERE gr.userId = ${parseInt(userId, 10)}
      AND CreatedAt >= DATE(DATE_SUB(NOW(), INTERVAL WEEKDAY(NOW()) DAY))
      AND CreatedAt <= NOW();
    `;

    const userRound = await db.$queryRaw<[{ count: bigint }]>(query);
    const usedRounds = Number(userRound[0].count);

    // Calculate total available rounds (paid rounds + gift rounds)
    const totalAvailableRounds = round + totalGiftRounds;
    const remainingRounds = Math.max(0, totalAvailableRounds - usedRounds);

    // Update user
    await db.user.update({
      where: { id: user.id },
      data: {
        magicStone: remainingRounds,
        totalPayment: userTopUp || 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          paidRounds: round,
          giftRounds: totalGiftRounds,
          usedRounds,
          remainingRounds,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error calculating rounds:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
