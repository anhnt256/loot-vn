import { NextResponse } from "next/server";

import apiClient from "@/lib/apiClient";
import dayjs from "@/lib/dayjs";
import { data } from "@/constants/data";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[]; userName: string } },
) {
  const [startHours, endHours, quantity, type] = params.slug;
  try {
    const result = await apiClient({
      method: "get",
      url: `/account/${params.userName}/balance-history/?format=json`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const actions = result.data;

    // const actions = data;

    const priceActions = actions.filter(
      (x: any) =>
        x.action_name.includes("Phiên theo biểu giá") &&
        dayjs(x.start).isToday(),
    );

    const ticketActions = actions.filter(
      (x: any) =>
        x.action_name.includes("Ticket session") && dayjs(x.start).isToday(),
    );

    const orderActions = actions.filter(
      (x: any) =>
        x.action_name.includes("Số tiền thanh toán đơn hàng tại cửa hàng") &&
        dayjs(x.start).isToday(),
    );

    let minutes = 0;

    if (ticketActions && ticketActions.length > 0 && type === "COMBO") {
      ticketActions.forEach((action: any) => {
        const { start, end } = action;
        const dateStart = dayjs(start);

        if (dayjs(start).hour() >= dateStart.hour()) {
          return NextResponse.json({ canClaim: true });
        }
      });
    }

    if (
      minutes === 0 &&
      priceActions &&
      priceActions.length > 0 &&
      type === "HOURS"
    ) {
      priceActions.forEach((action: any) => {
        const { start, end } = action;
        const dateStart = dayjs(start);

        if (dayjs(start).hour() >= dateStart.hour()) {
          if (end !== null) {
            const dateEnd = dayjs(end);
            minutes += dateEnd.diff(dateStart, "minute");
          } else {
            const dateEnd = dayjs();
            minutes += dateEnd.diff(dateStart, "minute");
          }
        }
      });
    }

    if (minutes >= parseInt(quantity, 10) * 60) {
      return NextResponse.json({ canClaim: true });
    }

    if (orderActions && orderActions.length > 0 && type === "ORDER") {
      let totalSpent = 0;
      orderActions.forEach((action: any) => {
        const { spent_sum } = action;
        const spentSum = parseInt(spent_sum.split(".")[0], 10);
        totalSpent += spentSum;
      });
      if (totalSpent >= parseInt(quantity, 10)) {
        return NextResponse.json({ canClaim: true });
      }
    }

    return NextResponse.json({ canClaim: false });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
