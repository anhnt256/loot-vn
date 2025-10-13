import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";

// Valid branches
const VALID_BRANCHES = ["GO_VAP", "TAN_PHU"];

export async function GET(request: NextRequest) {
  try {
    const branch = await getBranchFromCookie();

    // Validate branch
    if (!branch || !VALID_BRANCHES.includes(branch)) {
      console.error("Invalid or missing branch:", branch);
      return NextResponse.json(
        { success: false, error: "Invalid or missing branch" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const staffType = searchParams.get("type"); // counter, kitchen, security

    let query = `
      SELECT 
        id, fullName, userName, staffType, phone, email,
        isDeleted, isAdmin, branch
      FROM Staff 
      WHERE branch = ? AND isDeleted = false AND isAdmin = false
    `;

    const queryParams = [branch];

    // Filter by staff type if specified
    if (staffType) {
      query += ` AND staffType = ?`;
      queryParams.push(staffType.toUpperCase());
    }

    query += ` ORDER BY fullName ASC`;

    const staff = (await db.$queryRawUnsafe(query, ...queryParams)) as any[];

    return NextResponse.json({
      success: true,
      data: staff,
      branch: branch,
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff" },
      { status: 500 },
    );
  }
}
