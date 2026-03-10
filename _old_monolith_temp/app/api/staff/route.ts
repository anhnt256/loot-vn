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

// Helper function to check if password is reset required
// This can be used in login logic to force password change
function isPasswordResetRequired(
  hashedPassword: string,
  staffId: number,
): boolean {
  const resetPasswordHash = hashPassword("RESET_PASSWORD_REQUIRED_" + staffId);
  return hashedPassword === resetPasswordHash;
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
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    let query = `
      SELECT 
        id, fullName, userName, staffType, phone, email,
        isDeleted, isAdmin, branch, address, dateOfBirth,
        gender, hireDate, idCard, idCardExpiryDate, idCardIssueDate,
        note, resignDate, needCheckMacAddress, bankAccountName,
        bankAccountNumber, bankName, baseSalary, createdAt, updatedAt
      FROM Staff 
      WHERE branch = ? AND isAdmin = false
    `;

    const queryParams = [branch];

    if (!includeDeleted) {
      query += ` AND isDeleted = false`;
    }

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

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      userName,
      password,
      fullName,
      staffType = "STAFF",
      phone,
      email,
      address,
      dateOfBirth,
      gender = "OTHER",
      hireDate,
      idCard,
      idCardExpiryDate,
      idCardIssueDate,
      note,
      needCheckMacAddress = true,
      bankAccountName,
      bankAccountNumber,
      bankName,
      baseSalary = 0,
    } = body;

    // Validation
    if (!userName || !password || !fullName) {
      return NextResponse.json(
        {
          success: false,
          error: "userName, password, and fullName are required",
        },
        { status: 400 },
      );
    }

    // Check if userName already exists
    const existingStaff = (await db.$queryRawUnsafe(
      `SELECT id FROM Staff WHERE userName = ?`,
      userName,
    )) as any[];

    if (existingStaff.length > 0) {
      return NextResponse.json(
        { success: false, error: "Username already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Insert new staff
    const result = await db.$executeRawUnsafe(
      `INSERT INTO Staff (
        userName, password, fullName, staffType, phone, email,
        address, dateOfBirth, gender, hireDate, idCard,
        idCardExpiryDate, idCardIssueDate, note, needCheckMacAddress,
        bankAccountName, bankAccountNumber, bankName, baseSalary,
        branch, isDeleted, isAdmin, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, false, NOW(), NOW())`,
      userName,
      hashedPassword,
      fullName,
      staffType.toUpperCase(),
      phone || null,
      email || null,
      address || null,
      dateOfBirth ? new Date(dateOfBirth) : null,
      gender.toUpperCase(),
      hireDate ? new Date(hireDate) : null,
      idCard || null,
      idCardExpiryDate ? new Date(idCardExpiryDate) : null,
      idCardIssueDate ? new Date(idCardIssueDate) : null,
      note || null,
      needCheckMacAddress,
      bankAccountName || null,
      bankAccountNumber || null,
      bankName || null,
      parseFloat(baseSalary) || 0,
      branch,
    );

    // Get created staff
    const createdStaff = (await db.$queryRawUnsafe(
      `SELECT * FROM Staff WHERE userName = ? AND branch = ?`,
      userName,
      branch,
    )) as any[];

    return NextResponse.json({
      success: true,
      data: createdStaff[0],
    });
  } catch (error: any) {
    console.error("Error creating staff:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create staff" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const {
      id,
      userName,
      password,
      fullName,
      staffType,
      phone,
      email,
      address,
      dateOfBirth,
      gender,
      hireDate,
      idCard,
      idCardExpiryDate,
      idCardIssueDate,
      note,
      resignDate,
      needCheckMacAddress,
      bankAccountName,
      bankAccountNumber,
      bankName,
      baseSalary,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 },
      );
    }

    // Check if staff exists
    const existingStaff = (await db.$queryRawUnsafe(
      `SELECT id, userName FROM Staff WHERE id = ? AND branch = ?`,
      id,
      branch,
    )) as any[];

    if (existingStaff.length === 0) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 },
      );
    }

    // Check if userName is being changed and if new userName already exists
    if (userName && userName !== existingStaff[0].userName) {
      const userNameCheck = (await db.$queryRawUnsafe(
        `SELECT id FROM Staff WHERE userName = ? AND id != ?`,
        userName,
        id,
      )) as any[];

      if (userNameCheck.length > 0) {
        return NextResponse.json(
          { success: false, error: "Username already exists" },
          { status: 400 },
        );
      }
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (userName !== undefined) {
      updateFields.push("userName = ?");
      updateValues.push(userName);
    }
    if (password !== undefined && password !== "") {
      updateFields.push("password = ?");
      updateValues.push(hashPassword(password));
    }
    if (fullName !== undefined) {
      updateFields.push("fullName = ?");
      updateValues.push(fullName);
    }
    if (staffType !== undefined) {
      updateFields.push("staffType = ?");
      updateValues.push(staffType.toUpperCase());
    }
    if (phone !== undefined) {
      updateFields.push("phone = ?");
      updateValues.push(phone || null);
    }
    if (email !== undefined) {
      updateFields.push("email = ?");
      updateValues.push(email || null);
    }
    if (address !== undefined) {
      updateFields.push("address = ?");
      updateValues.push(address || null);
    }
    if (dateOfBirth !== undefined) {
      updateFields.push("dateOfBirth = ?");
      updateValues.push(dateOfBirth ? new Date(dateOfBirth) : null);
    }
    if (gender !== undefined) {
      updateFields.push("gender = ?");
      updateValues.push(gender.toUpperCase());
    }
    if (hireDate !== undefined) {
      updateFields.push("hireDate = ?");
      updateValues.push(hireDate ? new Date(hireDate) : null);
    }
    if (idCard !== undefined) {
      updateFields.push("idCard = ?");
      updateValues.push(idCard || null);
    }
    if (idCardExpiryDate !== undefined) {
      updateFields.push("idCardExpiryDate = ?");
      updateValues.push(idCardExpiryDate ? new Date(idCardExpiryDate) : null);
    }
    if (idCardIssueDate !== undefined) {
      updateFields.push("idCardIssueDate = ?");
      updateValues.push(idCardIssueDate ? new Date(idCardIssueDate) : null);
    }
    if (note !== undefined) {
      updateFields.push("note = ?");
      updateValues.push(note || null);
    }
    if (resignDate !== undefined) {
      updateFields.push("resignDate = ?");
      updateValues.push(resignDate ? new Date(resignDate) : null);
    }
    if (needCheckMacAddress !== undefined) {
      updateFields.push("needCheckMacAddress = ?");
      updateValues.push(needCheckMacAddress);
    }
    if (bankAccountName !== undefined) {
      updateFields.push("bankAccountName = ?");
      updateValues.push(bankAccountName || null);
    }
    if (bankAccountNumber !== undefined) {
      updateFields.push("bankAccountNumber = ?");
      updateValues.push(bankAccountNumber || null);
    }
    if (bankName !== undefined) {
      updateFields.push("bankName = ?");
      updateValues.push(bankName || null);
    }
    if (baseSalary !== undefined) {
      updateFields.push("baseSalary = ?");
      updateValues.push(parseFloat(baseSalary) || 0);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 },
      );
    }

    updateFields.push("updatedAt = NOW()");
    updateValues.push(id, branch);

    const query = `UPDATE Staff SET ${updateFields.join(", ")} WHERE id = ? AND branch = ?`;
    await db.$executeRawUnsafe(query, ...updateValues);

    // Get updated staff
    const updatedStaff = (await db.$queryRawUnsafe(
      `SELECT * FROM Staff WHERE id = ? AND branch = ?`,
      id,
      branch,
    )) as any[];

    return NextResponse.json({
      success: true,
      data: updatedStaff[0],
    });
  } catch (error: any) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update staff" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
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

    // Prevent deleting admin accounts
    if (existingStaff[0].isAdmin) {
      return NextResponse.json(
        { success: false, error: "Cannot delete admin accounts" },
        { status: 400 },
      );
    }

    // Soft delete
    await db.$executeRawUnsafe(
      `UPDATE Staff SET isDeleted = true, updatedAt = NOW() WHERE id = ? AND branch = ?`,
      id,
      branch,
    );

    return NextResponse.json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete staff" },
      { status: 500 },
    );
  }
}
