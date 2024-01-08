import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const checkInItems = await db.checkInResult.findMany({
      where: { userId: parseInt(params.userId, 10) },
    });

    return NextResponse.json(checkInItems);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
