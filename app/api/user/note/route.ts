import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function PATCH(req: NextRequest) {
  try {
    const { userId, note } = await req.json();

    if (!userId || typeof note !== "string") {
      return NextResponse.json(
        { success: false, message: "Thiếu userId hoặc note không hợp lệ" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy branch" },
        { status: 400 },
      );
    }

    console.log("Debug - userId:", userId, "branch:", branch, "note:", note);

    // Kiểm tra user có tồn tại không trước khi update
    let existingUser = await db.user.findFirst({
      where: {
        userId: parseInt(userId),
        branch: branch,
      },
    });

    if (!existingUser) {
      console.log(
        "Debug - User not found with userId:",
        userId,
        "branch:",
        branch,
        "- Creating new user",
      );

      // Tạo user mới nếu chưa tồn tại
      existingUser = await db.user.create({
        data: {
          userId: parseInt(userId),
          userName: `Không sử dụng - ${userId}`,
          branch: branch,
          rankId: 1, // Default rank
          stars: 0,
          magicStone: 0,
          isUseApp: true, // Default to true
          note: note,
        },
      });

      console.log("Debug - Created new user:", existingUser);
    } else {
      console.log("Debug - Found existing user:", existingUser);
    }

    // Update note trong table user
    const updatedUser = await db.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        note: note,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (e: any) {
    console.error("Error updating note:", e);
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 },
    );
  }
}
