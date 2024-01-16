import { NextResponse } from "next/server";

import apiClient from "@/lib/apiClient";
import dayjs from "@/lib/dayjs";
import { data } from "@/constants/data";

export async function GET(
  req: Request,
  { params }: { params: { userName: string } },
) {
  try {
    const result = await apiClient({
      method: "get",
      url: `/account/${params.userName}/balance-history/?format=json`,
      headers: {
        "Content-Type": "application/json",
      },
    });
    const actions = data;

    // const actions = result.data;

    const priceActions = actions.filter(
      (x: any) =>
        x.action_name.includes("Phiên theo biểu giá") &&
        dayjs(x.start).isToday(),
    );

    const ticketActions = actions.filter(
      (x: any) =>
        x.action_name.includes("Ticket session") && dayjs(x.start).isToday(),
    );

    let minutes = 0;

    if (ticketActions && ticketActions.length > 0) {
      ticketActions.forEach((action: any) => {
        const { start, end } = action;
        if (end !== null) {
          const dateStart = dayjs(start);
          const dateEnd = dayjs(end);
          minutes += dateEnd.diff(dateStart, "minute");
        } else {
          const dateStart = dayjs(start);
          const dateEnd = dayjs();
          minutes += dateEnd.diff(dateStart, "minute");
        }
      });
    }

    if (minutes === 0 && priceActions && priceActions.length > 0) {
      priceActions.forEach((action: any) => {
        const { start, end } = action;
        if (end !== null) {
          const dateStart = dayjs(start);
          const dateEnd = dayjs(end);
          minutes += dateEnd.diff(dateStart, "minute");
        } else {
          const dateStart = dayjs(start);
          const dateEnd = dayjs();
          minutes += dateEnd.diff(dateStart, "minute");
        }
      });
    }

    return NextResponse.json(minutes);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
