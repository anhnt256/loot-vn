import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function PATCH(req: NextRequest) {
  try {
    const { userId, userName } = await req.json();

    if (!userId || typeof userName !== "string") {
      return NextResponse.json(
        { success: false, message: "Thiếu userId hoặc userName" },
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
      "userName:",
      userName,
    );

    // Kiểm tra user có tồn tại không trước khi update
    const existingUser = await db.user.findFirst({
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
      );
      return NextResponse.json(
        {
          success: false,
          message: `Không tìm thấy user với userId: ${userId} và branch: ${branch}`,
        },
        { status: 404 },
      );
    }

    console.log("Debug - Found user:", existingUser);

    // Update username trong table user
    const updatedUser = await db.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        userName: userName,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (e: any) {
    console.error("Error updating username:", e);
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 },
    );
  }
}
