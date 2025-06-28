import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { keepId, users } = await req.json();
    if (!keepId || !Array.isArray(users)) {
      return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
    }
    const deleteIds = users.map((u: any) => u.id).filter((id: number) => id !== keepId);
    if (deleteIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: deleteIds } } });
    }
    return NextResponse.json({ success: true, deletedIds: deleteIds, keptId: keepId });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
} 