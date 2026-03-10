import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import crypto from "crypto";

// Valid branches
const VALID_BRANCHES = ["GO_VAP", "TAN_PHU"];

// Helper function to hash password
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Helper function to check admin access
async function checkAdminAccess(): Promise<{
  isAdmin: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { isAdmin: false, error: "Unauthorized - No token" };
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return { isAdmin: false, error: "Invalid token" };
    }

    // Check if user is admin (userId -99 is admin, or role === "admin" with loginType === "username")
    const userId = parseInt(decoded.userId.toString());
    const loginType = cookieStore.get("loginType")?.value;
    const role = decoded.role;

    if (userId === -99 || (role === "admin" && loginType === "username")) {
      return { isAdmin: true };
    }

    return { isAdmin: false, error: "Admin access required" };
  } catch (error) {
    console.error("Error checking admin access:", error);
    return { isAdmin: false, error: "Error checking admin access" };
  }
}

// POST /api/staff/[id]/reset-password
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check admin access
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error || "Admin access required" },
        { status: 403 },
      );
    }

    const branch = await getBranchFromCookie();
    if (!branch || !VALID_BRANCHES.includes(branch)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing branch" },
        { status: 400 },
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid staff ID" },
        { status: 400 },
      );
    }

    // Check if staff exists
    const existingStaff = (await db.$queryRawUnsafe(
      `SELECT id, isAdmin FROM Staff WHERE id = ? AND branch = ?`,
      id,
      branch,
    )) as any[];

    if (existingStaff.length === 0) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 },
      );
    }

    // Prevent resetting admin accounts
    if (existingStaff[0].isAdmin) {
      return NextResponse.json(
        { success: false, error: "Cannot reset password for admin accounts" },
        { status: 400 },
      );
    }

    // Set password to a special reset required value
    // This hash represents "RESET_PASSWORD_REQUIRED" - when user logs in with this password,
    // they will be forced to change it
    const resetPasswordHash = hashPassword("RESET_PASSWORD_REQUIRED_" + id);

    await db.$executeRawUnsafe(
      `UPDATE Staff SET password = ?, updatedAt = NOW() WHERE id = ? AND branch = ?`,
      resetPasswordHash,
      id,
      branch,
    );

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully. User will be required to set a new password on next login.",
    });
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset password" },
      { status: 500 },
    );
  }
}
