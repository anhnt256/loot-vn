import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    // Get branch from cookie
    const branch = request.cookies.get("branch")?.value || "GO_VAP";

    const users = await db.$queryRaw<any[]>`
      SELECT id, userId, userName
      FROM User
      WHERE (userId = ${parseInt(query) || 0} OR userName LIKE ${`%${query}%`})
        AND branch = ${branch}
      ORDER BY userName
      LIMIT 10
    `;

    return NextResponse.json(users);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
