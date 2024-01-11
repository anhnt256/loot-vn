import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { User } from "@prisma/client";
import dayjs, { nowUtc, startUtc } from "@/lib/dayjs";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  const [userId, branch] = params.slug;
  try {
    if (userId && branch) {
      const currentUserMissionMap = await db.userMissionMap.findMany({
        where: {
          userId: parseInt(userId, 10),
          branch,
          createdAt: { gt: startUtc },
        },
        include: {
          mission: true,
        },
      });

      return NextResponse.json(currentUserMissionMap);
    }
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
