import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 }
      );
    }

    const checkInItems = await db.checkInItem.findMany({
      orderBy: {
        dayName: "asc",
      },
    });

    return NextResponse.json(checkInItems);
  } catch (error) {
    console.error("[CHECK_IN_ITEM_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
