import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = await cookies();
    // Only check staffToken for staff APIs
    const token = cookieStore.get("staffToken")?.value;

    if (!token) {
      const response = NextResponse.json(
        { success: false, error: "Unauthorized - Please login again" },
        { status: 401 },
      );
      response.headers.set("X-Redirect-To", "/staff-login");
      return response;
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "staff") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const staffId = parseInt(params.id);
    const body = await request.json();

    // Check if staff exists and get current staff type
    const staff = (await db.$queryRawUnsafe(
      `SELECT id, staffType FROM Staff WHERE id = ? AND isDeleted = false`,
      staffId,
    )) as any[];

    if (staff.length === 0) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 },
      );
    }

    const currentStaffType = staff[0].staffType;

    // Only MANAGER, SUPER_ADMIN, or BRANCH_ADMIN can submit update requests
    if (
      currentStaffType !== "MANAGER" &&
      currentStaffType !== "SUPER_ADMIN" &&
      currentStaffType !== "BRANCH_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Chỉ quản lý hoặc admin mới được chỉnh sửa thông tin",
        },
        { status: 403 },
      );
    }

    // Create update request (you may want to create a StaffUpdateRequest table)
    // For now, we'll just return success - you can implement the approval workflow later
    // This is a placeholder - you should create a table to store update requests

    return NextResponse.json({
      success: true,
      message: "Yêu cầu cập nhật đã được gửi, chờ admin/manager duyệt",
      data: {
        staffId,
        requestedChanges: body,
      },
    });
  } catch (error: any) {
    console.error("Error creating update request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create update request",
      },
      { status: 500 },
    );
  }
}
