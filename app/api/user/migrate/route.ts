import { NextRequest, NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branchFromCookie = cookieStore.get("branch")?.value;
    
    if (!branchFromCookie) {
      return NextResponse.json({ success: false, message: "Branch cookie is required" }, { status: 400 });
    }

    const { keepId, users, starsCalculated } = await req.json();
    if (!keepId || !Array.isArray(users)) {
      return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
    }
    
    const deleteIds = users.map((u: any) => u.id).filter((id: number) => id !== keepId);
    
    // Cập nhật số sao của tài khoản được giữ lại
    if (starsCalculated !== undefined) {
      await db.user.update({
        where: { id: keepId },
        data: { stars: starsCalculated }
      });
    }
    
    // Xóa các tài khoản khác
    if (deleteIds.length > 0) {
      await db.user.deleteMany({ where: { id: { in: deleteIds } } });
    }
    
    return NextResponse.json({ 
      success: true, 
      deletedIds: deleteIds, 
      keptId: keepId,
      updatedStars: starsCalculated 
    });
  } catch (e: any) {
    console.error("Migrate error:", e);
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
} 