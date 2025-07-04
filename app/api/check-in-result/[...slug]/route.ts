import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import dayjs from "@/lib/dayjs";
import { getStartOfMonthVNISO, getEndOfMonthVNISO } from "@/lib/timezone-utils";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  const startOfMonth = getStartOfMonthVNISO();
  const endOfMonth = getEndOfMonthVNISO();

  const [userId, branch] = params.slug;

  try {
    const checkInItems = await db.userStarHistory.findMany({
      where: {
        userId: parseInt(userId, 10),
        branch,
        type: "CHECK_IN",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(checkInItems);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
