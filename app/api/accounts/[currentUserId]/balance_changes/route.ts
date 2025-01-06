import { NextResponse } from "next/server";

import apiClient from "@/lib/apiClient";
import { getCookie } from "cookies-next";
import dayjs, { endOfDayVN, startOfDayVN } from "@/lib/dayjs";

export async function GET(
  req: Request,
  { params }: { params: { currentUserId: number } },
) {
  const cookie = getCookie("branch", { req });

  const { currentUserId } = params;

  // const startDate = dayjs()
  //   .tz("Asia/Ho_Chi_Minh")
  //   .startOf("day")
  //   .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  // const endDate = dayjs()
  //   .tz("Asia/Ho_Chi_Minh")
  //   .endOf("day")
  //   .format("YYYY-MM-DDTHH:mm:ss.SSSZ");

  // console.log("startDate", startDate);
  // console.log("endDate", endDate);

  const startDate = "2025-01-04T00:00:00.000+07:00";
  const endDate = "2025-01-04T23:59:59.999+07:00";

  const url = `/accounts/${currentUserId}/balance_changes/?from_date=${encodeURIComponent(
    startDate,
  )}&to_date=${encodeURIComponent(endDate)}&limit=4000`;

  try {
    const result = await apiClient({
      method: "get",
      url,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
    });

    return NextResponse.json(result.data);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
