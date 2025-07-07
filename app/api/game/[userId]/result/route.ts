import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { Prisma } from "@/prisma/generated/prisma-client";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 }
      );
    }

    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate userId is a number
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const query = Prisma.sql`
      SELECT gr.*, i.title, i.value, ush.oldStars, ush.newStars
      FROM GameResult gr
             INNER JOIN Item i ON gr.itemId = i.id
             INNER JOIN User u ON gr.userId = u.userId AND u.branch = ${branch}
             INNER JOIN UserStarHistory ush ON gr.userId = ush.userId AND ush.targetId = gr.id AND ush.branch = ${branch}
      WHERE gr.createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      AND gr.userId = ${parsedUserId}
      ORDER BY gr.createdAt DESC, ush.newStars DESC
      LIMIT 50
  `;

    const gameResults = await db.$queryRaw(query);

    return NextResponse.json(gameResults);
  } catch (error) {
    console.error("[GAME_USER_RESULT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
