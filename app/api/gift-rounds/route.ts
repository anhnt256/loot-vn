import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createGiftRoundSchema = z.object({
  userId: z.number(),
  amount: z.number().min(1),
  reason: z.string().min(1),
  expiredAt: z.string().optional(),
});

// GET /api/gift-rounds
export async function GET(request: NextRequest) {
  try {
    // Get branch from cookie
    const branch = request.cookies.get("branch")?.value || "GO_VAP";

    const giftRounds = await db.giftRound.findMany({
      where: {
        branch: branch,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(giftRounds);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/gift-rounds
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const body = createGiftRoundSchema.parse(json);

    // Get admin info from request headers (set by middleware)
    const userHeader = request.headers.get("user");
    const user = userHeader ? JSON.parse(userHeader) : null;

    if (!user?.role || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    // Get branch from cookie
    const branch = request.cookies.get("branch")?.value || "GO_VAP";

    // Verify that the user exists using userId and branch
    const targetUser = await db.user.findFirst({
      where: {
        userId: body.userId,
        branch: branch,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const giftRound = await db.giftRound.create({
      data: {
        userId: body.userId, // Use userId directly, not targetUser.id
        amount: body.amount,
        reason: body.reason,
        staffId: 0, // Using 0 to represent admin
        expiredAt: body.expiredAt ? new Date(body.expiredAt) : null,
        isUsed: false,
        branch: branch,
      },
    });

    return NextResponse.json(giftRound);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
