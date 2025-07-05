import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function PATCH(req: NextRequest) {
  try {
    const { userId, isUseApp } = await req.json();

    if (!userId || typeof isUseApp !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Thiếu userId hoặc isUseApp không hợp lệ" },
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

    console.log(
      "Debug - userId:",
      userId,
      "branch:",
      branch,
      "isUseApp:",
      isUseApp,
    );

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
          isUseApp: isUseApp,
          note: "",
        },
      });
      
      console.log("Debug - Created new user:", existingUser);
    } else {
      console.log("Debug - Found existing user:", existingUser);
    }

    // Update isUseApp trong table user
    const updatedUser = await db.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        isUseApp: isUseApp,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (e: any) {
    console.error("Error updating isUseApp:", e);
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 },
    );
  }
} 