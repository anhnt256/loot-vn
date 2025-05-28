import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST endpoint để tặng lượt cho user
export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { amount, reason, staffId, expiredAt } = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Số lượt tặng phải lớn hơn 0" },
        { status: 400 }
      );
    }

    // Kiểm tra user có tồn tại không
    const user = await db.user.findFirst({
      where: { userId: parseInt(userId, 10) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Tạo gift round mới
    const giftRound = await db.giftRound.create({
      data: {
        userId: user.id,
        amount,
        reason,
        staffId,
        expiredAt: expiredAt ? new Date(expiredAt) : null,
      },
    });

    // Cập nhật số lượt (magicStone) của user
    await db.user.update({
      where: { id: user.id },
      data: {
        magicStone: {
          increment: amount
        }
      }
    });

    return NextResponse.json(giftRound, { status: 201 });
  } catch (error) {
    console.error("Error gifting rounds:", error);
    return NextResponse.json(
      { error: "Lỗi khi tặng lượt" },
      { status: 500 }
    );
  }
}

// GET endpoint để lấy lịch sử tặng lượt của user
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const user = await db.user.findFirst({
      where: { userId: parseInt(userId, 10) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    const giftHistory = await db.giftRound.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(giftHistory, { status: 200 });
  } catch (error) {
    console.error("Error fetching gift history:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy lịch sử tặng lượt" },
      { status: 500 }
    );
  }
} 