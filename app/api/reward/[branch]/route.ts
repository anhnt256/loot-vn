import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { branch: string } },
) {
  try {
    const rewards: any = await db.$queryRaw<any[]>`
      SELECT * FROM Reward
    `;

    if (rewards.length > 0) {
      await Promise.all(
        rewards.map(async (reward: any, index: number) => {
          const { value } = reward;
          const countResult = await db.$queryRaw<any[]>`
            SELECT COUNT(*) as count FROM PromotionCode 
            WHERE value = ${value} 
            AND isUsed = false 
            AND branch = ${params.branch}
          `;
          rewards[index].totalPromotion = Number(countResult[0].count);
        }),
      );
    }

    return NextResponse.json(rewards);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
