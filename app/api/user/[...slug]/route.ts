import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { User } from "@/prisma/generated/prisma-client";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const [userId, requestBranch] = params.slug;

    // Validate input parameters
    if (!userId || !requestBranch) {
      return NextResponse.json(
        { error: "User ID and branch are required" },
        { status: 400 },
      );
    }

    // Validate userId is a number
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      );
    }

    // Validate branch matches cookie
    if (requestBranch !== branch) {
      return NextResponse.json({ error: "Branch mismatch" }, { status: 403 });
    }

    const currentUser: User | null = await db.user.findFirst({
      where: {
        userId: parsedUserId,
        branch: requestBranch,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(currentUser);
  } catch (error) {
    console.error("[USER_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
