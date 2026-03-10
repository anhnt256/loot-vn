import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { Prisma } from "@/prisma/generated/prisma-client";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const query = Prisma.sql`
      SELECT gr.id, gr.userId, gr.itemId, gr.createdAt, gr.updatedAt,
             i.title, i.value,
             CONCAT(SUBSTRING(u.userName, 1, LENGTH(u.userName)-3), '***') as maskedUsername,
             MAX(ush.oldStars) as oldStars,
             MAX(ush.newStars) as newStars
      FROM GameResult gr
             INNER JOIN Item i ON gr.itemId = i.id
             INNER JOIN User u ON gr.userId = u.userId AND u.branch = ${branch}
             LEFT JOIN UserStarHistory ush ON gr.userId = ush.userId 
               AND ush.targetId = gr.id 
               AND ush.branch = ${branch}
               AND ush.type = 'GAME'
      WHERE gr.createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY gr.id, gr.userId, gr.itemId, gr.createdAt, gr.updatedAt, i.title, i.value, u.userName
      ORDER BY gr.createdAt DESC, MAX(ush.newStars) DESC
      LIMIT 100
  `;
    const gameResults = await db.$queryRaw(query);

    return NextResponse.json(gameResults);
  } catch (error) {
    console.error("[GAME_RESULT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
