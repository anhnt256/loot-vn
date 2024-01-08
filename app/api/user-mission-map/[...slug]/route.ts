import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { User } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  const [userId, branch] = params.slug;
  try {
    if (userId && branch) {
      const currentUserMissionMap = await db.userMissionMap.findMany({
        where: { userId: parseInt(userId, 10), branch },
        include: { mission: { select: { name: true } } },
      });

      console.log("currentUserMissionMap", currentUserMissionMap);

      return NextResponse.json(currentUserMissionMap);
    }
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
