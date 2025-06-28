import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCookie } from "cookies-next";

export async function GET(req: Request) {
  const cookie = getCookie("branch", { req });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new NextResponse("User ID is required", { status: 400 });
  }

  try {
    const user = await db.user.findFirst({
      where: {
        userId: parseInt(userId, 10),
        branch: cookie,
      },
      select: {
        id: true,
        userId: true,
        userName: true,
        stars: true,
        rankId: true,
        magicStone: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      userId: user.userId,
      userName: user.userName,
      stars: user.stars || 0,
      rankId: user.rankId,
      magicStone: user.magicStone || 0,
    });
  } catch (error) {
    console.error("[USER_STARS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 