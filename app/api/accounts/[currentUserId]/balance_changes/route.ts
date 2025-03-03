import { NextResponse } from "next/server";

import apiClient from "@/lib/apiClient";
import { getCookie } from "cookies-next";
import dayjs from "@/lib/dayjs";

const startOfDayVN = dayjs()
  .tz("Asia/Ho_Chi_Minh")
  .startOf("day")
  .add(7, "hours")
  .toISOString();

const endOfDayVN = dayjs()
  .tz("Asia/Ho_Chi_Minh")
  .endOf("day")
  .add(7, "hours")
  .toISOString();

export async function GET(
  req: Request,
  { params }: { params: { currentUserId: number } },
) {
  const cookie = getCookie("branch", { req });

  const { currentUserId } = params;

  const startDate = dayjs()
    .tz("Asia/Ho_Chi_Minh")
    .startOf("day")
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  const endDate = dayjs()
    .tz("Asia/Ho_Chi_Minh")
    .endOf("day")
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");

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
