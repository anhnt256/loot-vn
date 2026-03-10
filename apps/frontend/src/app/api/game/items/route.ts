import { NextResponse } from "next/server";

import { db } from "@gateway-workspace/database";

export async function GET(req: Request) {
  try {
    const gameItems = await db.item.findMany({
      select: {
        id: true,
        title: true,
        background: true,
        value: true,
        textColor: true,
      },
    });

    return NextResponse.json(gameItems);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
