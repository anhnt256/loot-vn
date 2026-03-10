import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@gateway-workspace/database";
import { getBranchFromCookie } from "@gateway-workspace/shared/utils";
import { verifyJWT } from "@gateway-workspace/shared/utils";

/** Parse "HH:mm" or "HH:mm:ss" from request body to "HH:mm:ss" for DB */
function parseTimeToHHmmss(input: string): string {
  if (!input || typeof input !== "string") return "00:00:00";
  const parts = input
    .trim()
    .split(/[:\s]/)
    .map((p) => parseInt(p, 10) || 0);
  const [h = 0, m = 0, s = 0] = parts;
  return [
    Math.min(23, Math.max(0, h)),
    Math.min(59, Math.max(0, m)),
    Math.min(59, Math.max(0, s)),
  ]
    .map((n) => n.toString().padStart(2, "0"))
    .join(":");
}

async function checkAdminAccess(): Promise<{
  isAdmin: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return { isAdmin: false, error: "Unauthorized" };
    const decoded = await verifyJWT(token);
    if (!decoded?.userId) return { isAdmin: false, error: "Invalid token" };
    const userId = parseInt(String(decoded.userId));
    const loginType = cookieStore.get("loginType")?.value;
    const role = decoded.role;
    if (userId === -99 || (role === "admin" && loginType === "username"))
      return { isAdmin: true };
    return { isAdmin: false, error: "Admin access required" };
  } catch {
    return { isAdmin: false, error: "Error checking admin access" };
  }
}

export async function GET(request: NextRequest) {
  try {
    const branch = await getBranchFromCookie();

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          error: "Branch is required",
        },
        { status: 400 },
      );
    }

    // Get all work shifts for the branch
    const workShifts = (await db.$queryRaw`
      SELECT 
        id,
        name,
        startTime,
        endTime,
        isOvernight,
        branch,
        FnetStaffId,
        FfoodStaffId,
        createdAt,
        updatedAt
      FROM WorkShift
      WHERE branch = ${branch}
      ORDER BY startTime, id
    `) as any[];

    // Format time fields to HH:mm:ss format
    const formattedShifts = workShifts.map((shift) => {
      const formatTime = (time: Date | string) => {
        if (!time) return null;
        const date = typeof time === "string" ? new Date(time) : time;
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
      };

      return {
        ...shift,
        startTime: formatTime(shift.startTime),
        endTime: formatTime(shift.endTime),
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedShifts,
    });
  } catch (error) {
    console.error("Error fetching work shifts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch work shifts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error || "Admin required" },
        { status: 403 },
      );
    }
    const branch = await getBranchFromCookie();
    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch is required" },
        { status: 400 },
      );
    }
    const body = await request.json();
    const { name, startTime, endTime, isOvernight, FnetStaffId, FfoodStaffId } =
      body;
    const nameStr = typeof name === "string" ? name.trim() : "";
    if (!nameStr) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 },
      );
    }
    const existing = (await db.$queryRawUnsafe(
      "SELECT id FROM WorkShift WHERE branch = ? AND name = ?",
      branch,
      nameStr,
    )) as any[];
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Ca ${nameStr} đã tồn tại cho chi nhánh` },
        { status: 400 },
      );
    }
    const start = parseTimeToHHmmss(startTime ?? "00:00:00");
    const end = parseTimeToHHmmss(endTime ?? "00:00:00");
    await db.$executeRawUnsafe(
      `INSERT INTO WorkShift (name, startTime, endTime, isOvernight, branch, FnetStaffId, FfoodStaffId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      nameStr,
      start,
      end,
      !!isOvernight,
      branch,
      FnetStaffId == null ? null : Number(FnetStaffId),
      FfoodStaffId == null ? null : Number(FfoodStaffId),
    );
    const rows = (await db.$queryRawUnsafe(
      "SELECT id, name, startTime, endTime, isOvernight, branch, FnetStaffId, FfoodStaffId, createdAt, updatedAt FROM WorkShift WHERE branch = ? AND name = ?",
      branch,
      nameStr,
    )) as any[];
    const shift = rows[0];
    const formatTime = (t: Date | string) => {
      if (!t) return "00:00:00";
      const d = typeof t === "string" ? new Date("1970-01-01 " + t) : t;
      return [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map((n) => String(n).padStart(2, "0"))
        .join(":");
    };
    return NextResponse.json({
      success: true,
      data: {
        ...shift,
        startTime: formatTime(shift.startTime),
        endTime: formatTime(shift.endTime),
      },
    });
  } catch (error) {
    console.error("Error creating work shift:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create work shift" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error || "Admin required" },
        { status: 403 },
      );
    }
    const branch = await getBranchFromCookie();
    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch is required" },
        { status: 400 },
      );
    }
    const body = await request.json();
    const {
      id,
      name,
      startTime,
      endTime,
      isOvernight,
      FnetStaffId,
      FfoodStaffId,
    } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 },
      );
    }
    const existing = (await db.$queryRawUnsafe(
      "SELECT id, name FROM WorkShift WHERE id = ? AND branch = ?",
      Number(id),
      branch,
    )) as any[];
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Work shift not found" },
        { status: 404 },
      );
    }
    if (name !== undefined) {
      const nameStr = typeof name === "string" ? name.trim() : "";
      if (!nameStr)
        return NextResponse.json(
          { success: false, error: "name cannot be empty" },
          { status: 400 },
        );
    }
    const nameStr =
      name !== undefined
        ? typeof name === "string"
          ? name.trim()
          : ""
        : undefined;
    if (nameStr && nameStr !== existing[0].name) {
      const dup = (await db.$queryRawUnsafe(
        "SELECT id FROM WorkShift WHERE branch = ? AND name = ? AND id != ?",
        branch,
        nameStr,
        Number(id),
      )) as any[];
      if (dup.length > 0) {
        return NextResponse.json(
          { success: false, error: `Ca ${nameStr} đã tồn tại` },
          { status: 400 },
        );
      }
    }
    const updates: string[] = [];
    const values: any[] = [];
    if (nameStr !== undefined) {
      updates.push("name = ?");
      values.push(nameStr);
    }
    if (startTime !== undefined) {
      updates.push("startTime = ?");
      values.push(parseTimeToHHmmss(startTime));
    }
    if (endTime !== undefined) {
      updates.push("endTime = ?");
      values.push(parseTimeToHHmmss(endTime));
    }
    if (isOvernight !== undefined) {
      updates.push("isOvernight = ?");
      values.push(!!isOvernight);
    }
    if (FnetStaffId !== undefined) {
      updates.push("FnetStaffId = ?");
      values.push(FnetStaffId == null ? null : Number(FnetStaffId));
    }
    if (FfoodStaffId !== undefined) {
      updates.push("FfoodStaffId = ?");
      values.push(FfoodStaffId == null ? null : Number(FfoodStaffId));
    }
    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 },
      );
    }
    updates.push("updatedAt = NOW()");
    values.push(Number(id), branch);
    await db.$executeRawUnsafe(
      `UPDATE WorkShift SET ${updates.join(", ")} WHERE id = ? AND branch = ?`,
      ...values,
    );
    const rows = (await db.$queryRawUnsafe(
      "SELECT id, name, startTime, endTime, isOvernight, branch, FnetStaffId, FfoodStaffId, createdAt, updatedAt FROM WorkShift WHERE id = ? AND branch = ?",
      Number(id),
      branch,
    )) as any[];
    const shift = rows[0];
    const formatTime = (t: Date | string) => {
      if (!t) return "00:00:00";
      const d = typeof t === "string" ? new Date("1970-01-01 " + t) : t;
      return [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map((n) => String(n).padStart(2, "0"))
        .join(":");
    };
    return NextResponse.json({
      success: true,
      data: {
        ...shift,
        startTime: formatTime(shift.startTime),
        endTime: formatTime(shift.endTime),
      },
    });
  } catch (error) {
    console.error("Error updating work shift:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update work shift" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error || "Admin required" },
        { status: 403 },
      );
    }
    const branch = await getBranchFromCookie();
    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch is required" },
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
    const existing = (await db.$queryRawUnsafe(
      "SELECT id FROM WorkShift WHERE id = ? AND branch = ?",
      id,
      branch,
    )) as any[];
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Work shift not found" },
        { status: 404 },
      );
    }
    await db.$executeRawUnsafe(
      "DELETE FROM WorkShift WHERE id = ? AND branch = ?",
      id,
      branch,
    );
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Error deleting work shift:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete work shift" },
      { status: 500 },
    );
  }
}
