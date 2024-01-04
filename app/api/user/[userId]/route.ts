import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { User } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const currentUser: User | null = await db.user.findUnique({
      where: { userId: parseInt(params.userId, 10) },
    });

    return NextResponse.json(currentUser);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
