import { NextResponse } from "next/server";
import { getFnetDB } from "@/lib/db";
import { calculateDailyUsageHours } from "@/lib/battle-pass-utils";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  try {
    const fnetDB = await getFnetDB();
    const [userId, branch] = params.slug;
    const status = 3;

    let result: any;

    if (userId) {
      // Lấy session có EnterDate = hôm nay hoặc EndDate = hôm nay
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const curDate = `${yyyy}-${mm}-${dd}`;

      const query = `
        SELECT *
        FROM fnet.systemlogtb
        WHERE UserId = ${userId}
          AND status = ${status}
          AND (
            EnterDate = ${curDate} 
            OR EndDate = ${curDate}
            OR (EndDate IS NULL AND EnterDate = DATE_SUB(${curDate}, INTERVAL 1 DAY))
          )
      `;
      const todaySessions: any = await fnetDB.$queryRaw`
        SELECT *
        FROM fnet.systemlogtb
        WHERE UserId = ${userId}
          AND status = ${status}
          AND (
            EnterDate = ${curDate} 
            OR EndDate = ${curDate}
            OR (EndDate IS NULL AND EnterDate = DATE_SUB(${curDate}, INTERVAL 1 DAY))
          )
      `;

      if (todaySessions.length > 0) {
        result = todaySessions;
      }
    }

    if (!result || result.length === 0) {
      return NextResponse.json(0);
    }

    // Sử dụng utility function để tính thời gian sử dụng
    const totalHours = calculateDailyUsageHours(result);

    return NextResponse.json(totalHours);
  } catch (error) {
    console.error("Error calculating usage time:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
