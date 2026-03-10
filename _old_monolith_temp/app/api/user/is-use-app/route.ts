import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

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

    // Kiểm tra user có tồn tại không trước khi update
    const existingUser = await db.$queryRaw<any[]>`
      SELECT * FROM User 
      WHERE userId = ${parseInt(userId)} 
      AND branch = ${branch}
      LIMIT 1
    `;

    let userToUpdate;

    if (existingUser.length === 0) {
      // Tạo user mới nếu chưa tồn tại
      await db.$executeRaw`
        INSERT INTO User (userId, userName, branch, rankId, stars, magicStone, createdAt, isUseApp, note, updatedAt)
        VALUES (
          ${parseInt(userId)},
          ${`Không sử dụng - ${userId}`},
          ${branch},
          ${1},
          ${0},
          ${0},
          NOW(),
          ${isUseApp},
          ${""},
          NOW()
        )
      `;

      // Get the created user
      const newUser = await db.$queryRaw<any[]>`
        SELECT * FROM User 
        WHERE userId = ${parseInt(userId)} 
        AND branch = ${branch}
        ORDER BY id DESC
        LIMIT 1
      `;

      userToUpdate = newUser[0];
      console.log("Debug - Created new user:", userToUpdate);
    } else {
      console.log("Debug - Found existing user:", existingUser[0]);

      // Update isUseApp trong table user
      await db.$executeRaw`
        UPDATE User 
        SET isUseApp = ${isUseApp}, updatedAt = NOW()
        WHERE id = ${existingUser[0].id}
      `;

      // Get the updated user
      const updatedUser = await db.$queryRaw<any[]>`
        SELECT * FROM User 
        WHERE id = ${existingUser[0].id}
        LIMIT 1
      `;

      userToUpdate = updatedUser[0];
    }

    return NextResponse.json({ success: true, data: userToUpdate });
  } catch (e: any) {
    console.error("Error updating isUseApp:", e);
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 },
    );
  }
}
