import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request: NextRequest) {
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

    // Get staff info from token (userId = -98 for staff)
    // We need to get staffId from userName in token
    const userName = payload.userName;
    // Use branch from token payload first, fallback to cookie
    const branch = payload.branch || cookieStore.get("branch")?.value;

    console.log(
      "my-info API - userName:",
      userName,
      "branch from token:",
      payload.branch,
      "branch from cookie:",
      cookieStore.get("branch")?.value,
      "final branch:",
      branch,
    );

    if (!userName || !branch) {
      return NextResponse.json(
        { success: false, error: "Missing user information" },
        { status: 400 },
      );
    }

    // Get staff info from database
    const staff = (await db.$queryRawUnsafe(
      `SELECT 
        id, fullName, userName, staffType, phone, email,
        address, dateOfBirth, gender, hireDate, idCard,
        idCardExpiryDate, idCardIssueDate, note, resignDate,
        needCheckMacAddress, bankAccountName, bankAccountNumber,
        bankName, baseSalary, branch, createdAt, updatedAt
      FROM Staff 
      WHERE userName = ? AND branch = ? AND isDeleted = false AND isAdmin = false
      LIMIT 1`,
      userName,
      branch,
    )) as any[];

    if (staff.length === 0) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: staff[0],
    });
  } catch (error: any) {
    console.error("Error fetching staff info:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch staff info" },
      { status: 500 },
    );
  }
}
