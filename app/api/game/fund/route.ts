import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import dayjs from "@/lib/dayjs";

export async function GET() {
  try {
    const lastJackPotDate = await db.$queryRaw<any[]>`
      SELECT createdAt FROM GameResult 
      WHERE itemId = 8
      ORDER BY createdAt DESC
      LIMIT 1
    `;

    let totalRound;
    if (lastJackPotDate.length > 0) {
      const totalRoundResult = await db.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM GameResult gr
        INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
        WHERE gr.createdAt > ${lastJackPotDate[0].createdAt}
      `;
      totalRound = Number(totalRoundResult[0].count);
    } else {
      const totalRoundResult = await db.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM GameResult gr
        INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
      `;
      totalRound = Number(totalRoundResult[0].count);
    }

    const ROUND_COST = Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND); // 30000 một vòng quay
    const RATE = 0.015; // 1.5%

    const totalAmount = totalRound * ROUND_COST * RATE;
    return NextResponse.json(totalAmount);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
