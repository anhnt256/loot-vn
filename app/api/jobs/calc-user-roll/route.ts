import { NextResponse } from "next/server";

import apiClient from "@/lib/apiClient";
import { getCookie } from "cookies-next";
import dayjs, { currentTimeVN } from "@/lib/dayjs";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const cookie = getCookie("branch", { req }) || "";

  const specificYear = 2024;

  const fromDate = dayjs().year(specificYear).startOf("year").toISOString();
  const toDate = dayjs().year(specificYear).endOf("year").toISOString();

  const result = await apiClient({
    method: "get",
    url: `/reports/user_activity/?format=json&from_date=${fromDate}&office_id=1&to_date=${toDate}`,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
  });
  const data = result.data;

  try {
    for (const item of data) {
      try {
        const user = await db.user.findFirst({
          where: {
            userName: item["User login"],
          },
        });

        if (!user) {
          continue;
        }

        const { userId, rankId, stars, userName } = user;

        const topUpSum = item["Amount of replenishment"];

        const magicStone = Math.round(
          topUpSum / process.env.NEXT_PUBLIC_SPEND_PER_ROUND,
        );

        const history = await db.userStarHistory.count({
          where: {
            userId,
            type: "GAME",
          },
        });

        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            rankId,
            stars,
            magicStone: magicStone - history,
            userName,
            updatedAt: currentTimeVN,
          },
        });
      } catch (error) {
        return {
          error: "Failed to update.",
        };
      }
    }
    return NextResponse.json(currentTimeVN);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
