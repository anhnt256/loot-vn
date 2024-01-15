import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const rewards = await db.reward.findMany();

    return NextResponse.json(rewards);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
