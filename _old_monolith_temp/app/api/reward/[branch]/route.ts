import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { branch: string } },
) {
  try {
    // Lấy dữ liệu từ PromotionReward table
    const rewards: any = await db.$queryRaw<any[]>`
      SELECT 
        id,
        name,
        value,
        starsValue as stars,
        branch,
        quantity,
        isActive,
        createdAt,
        updatedAt,
        quantity as totalPromotion
      FROM PromotionReward 
      WHERE branch = ${params.branch} 
        AND isActive = true
      ORDER BY value ASC
    `;

    // Transform data để match với cấu trúc cũ
    const transformedRewards = rewards.map((reward: any) => ({
      id: reward.id,
      name: reward.name,
      value: reward.value,
      stars: reward.stars,
      branch: reward.branch,
      quantity: reward.quantity,
      isActive: reward.isActive,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
      totalPromotion: reward.totalPromotion,
      startDate: null,
      endDate: null,
      updateAt: null,
    }));

    return NextResponse.json(transformedRewards);
  } catch (error) {
    console.error("Error fetching promotion rewards:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
