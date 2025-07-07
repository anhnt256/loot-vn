import { NextResponse } from "next/server";
import { getFnetDB } from "@/lib/db";
import { calculateDailyUsageHours } from "@/lib/battle-pass-utils";
import { getCurrentDateVN } from "@/lib/timezone-utils";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 }
      );
    }

    const [userId, requestBranch] = params.slug;

    // Validate input parameters
    if (!userId || !requestBranch) {
      return NextResponse.json(
        { error: "User ID and branch are required" },
        { status: 400 }
      );
    }

    // Validate userId is a number
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Validate branch matches cookie
    if (requestBranch !== branch) {
      return NextResponse.json(
        { error: "Branch mismatch" },
        { status: 403 }
      );
    }

    const fnetDB = await getFnetDB();
    const status = 3;

    // Lấy session có EnterDate = hôm nay hoặc EndDate = hôm nay
    const today = getCurrentDateVN();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const curDate = `${yyyy}-${mm}-${dd}`;

    const todaySessions: any = await fnetDB.$queryRaw`
      SELECT *
      FROM fnet.systemlogtb
      WHERE UserId = ${parsedUserId}
        AND status = ${status}
        AND (
          EnterDate = ${curDate} 
          OR EndDate = ${curDate}
          OR (EndDate IS NULL AND EnterDate = DATE_SUB(${curDate}, INTERVAL 1 DAY))
        )
    `;

    if (!todaySessions || todaySessions.length === 0) {
      return NextResponse.json(0);
    }

    // Sử dụng utility function để tính thời gian sử dụng
    const totalHours = calculateDailyUsageHours(todaySessions);

    return NextResponse.json(totalHours);
  } catch (error) {
    console.error("[SPEND_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
