import { NextResponse } from "next/server";

import apiClient from "@/lib/apiClient";
import { cookies } from "next/headers";
import dayjs from "@/lib/dayjs";

const startOfDayVN = dayjs()
  .tz("Asia/Ho_Chi_Minh")
  .startOf("day")
  .toISOString();

const endOfDayVN = dayjs().tz("Asia/Ho_Chi_Minh").endOf("day").toISOString();

export async function GET(
  req: Request,
  { params }: { params: { currentUserId: string } },
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

    const { currentUserId } = params;

    // Validate currentUserId is a number
    const parsedUserId = parseInt(currentUserId, 10);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const startDate = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day").toISOString();
    const endDate = dayjs().tz("Asia/Ho_Chi_Minh").endOf("day").toISOString();

    const url = `/accounts/${parsedUserId}/balance_changes/?from_date=${encodeURIComponent(
      startDate,
    )}&to_date=${encodeURIComponent(endDate)}&limit=4000`;

    const result = await apiClient({
      method: "get",
      url,
      headers: {
        "Content-Type": "application/json",
        Cookie: `branch=${branch}`,
      },
    });

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[BALANCE_CHANGES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
