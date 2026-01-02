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
    const { userName, branch } = body;

    if (!userName || !userName.trim()) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Tên đăng nhập là bắt buộc",
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

    // Find staff by username and branch
    const staffByUsername = await db.$queryRawUnsafe(
      `SELECT id, userName, fullName, branch, isDeleted, isAdmin, password FROM Staff 
       WHERE userName = ? AND branch = ? AND isDeleted = false AND isAdmin = false`,
      userName.trim(),
      branch,
    ) as any[];

    if (staffByUsername.length === 0) {
      return NextResponse.json(
        {
          statusCode: 401,
          message: "Tên đăng nhập không tồn tại trong chi nhánh này",
          data: null,
        },
        { status: 401 },
      );
    }

    const staffData = staffByUsername[0];

    // Check if password reset is required
    const requirePasswordReset = isPasswordResetRequired(
      staffData.password,
      staffData.id,
    );

    return NextResponse.json({
      statusCode: 200,
      message: "Username verified",
      data: {
        staffId: staffData.id,
        userName: staffData.userName,
        fullName: staffData.fullName,
        branch: staffData.branch,
        requirePasswordReset: requirePasswordReset,
      },
    });
  } catch (error: any) {
    console.error("Error verifying username:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: error.message || "Lỗi khi xác minh tên đăng nhập",
        data: null,
      },
      { status: 500 },
    );
  }
}

