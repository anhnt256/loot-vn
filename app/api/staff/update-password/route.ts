import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

// Helper function to hash password
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Helper function to check if password is reset required
function isPasswordResetRequired(
  hashedPassword: string,
  staffId: number,
): boolean {
  const resetPasswordHash = hashPassword("RESET_PASSWORD_REQUIRED_" + staffId);
  return hashedPassword === resetPasswordHash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffId, newPassword, branch } = body;

    if (!staffId || !newPassword || !newPassword.trim()) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Staff ID và mật khẩu mới là bắt buộc",
          data: null,
        },
        { status: 400 },
      );
    }

    if (!branch || (branch !== "GO_VAP" && branch !== "TAN_PHU")) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Chi nhánh là bắt buộc và phải là GO_VAP hoặc TAN_PHU",
          data: null,
        },
        { status: 400 },
      );
    }

    // Validate password length
    if (newPassword.trim().length < 6) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Mật khẩu phải có ít nhất 6 ký tự",
          data: null,
        },
        { status: 400 },
      );
    }

    // Check if staff exists and get current password
    const existingStaff = (await db.$queryRawUnsafe(
      `SELECT id, password, branch FROM Staff WHERE id = ? AND branch = ? AND isDeleted = false AND isAdmin = false`,
      staffId,
      branch,
    )) as any[];

    if (existingStaff.length === 0) {
      return NextResponse.json(
        {
          statusCode: 404,
          message: "Không tìm thấy nhân viên",
          data: null,
        },
        { status: 404 },
      );
    }

    const staffData = existingStaff[0];

    // Verify that password reset is required (security check)
    if (!isPasswordResetRequired(staffData.password, staffData.id)) {
      return NextResponse.json(
        {
          statusCode: 403,
          message: "Mật khẩu không cần reset",
          data: null,
        },
        { status: 403 },
      );
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword.trim());

    // Update password
    await db.$executeRawUnsafe(
      `UPDATE Staff SET password = ?, updatedAt = NOW() WHERE id = ? AND branch = ?`,
      hashedPassword,
      staffId,
      branch,
    );

    return NextResponse.json({
      statusCode: 200,
      message: "Cập nhật mật khẩu thành công",
      data: {
        staffId: staffData.id,
        branch: staffData.branch,
      },
    });
  } catch (error: any) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: error.message || "Lỗi khi cập nhật mật khẩu",
        data: null,
      },
      { status: 500 },
    );
  }
}
