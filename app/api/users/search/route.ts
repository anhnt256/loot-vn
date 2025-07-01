import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    const users = await db.user.findMany({
      where: {
        OR: [
          {
            userId: {
              equals: parseInt(query) || undefined,
            },
          },
          {
            userName: {
              contains: query,
            },
          },
        ],
      },
      select: {
        id: true,
        userId: true,
        userName: true,
      },
      take: 10,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
