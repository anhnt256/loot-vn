import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";

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
      ORDER BY 
        CASE name
          WHEN 'CA_SANG' THEN 1
          WHEN 'CA_CHIEU' THEN 2
          WHEN 'CA_TOI' THEN 3
          ELSE 4
        END
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
