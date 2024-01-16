import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "@/lib/dayjs";
import { NextResponse } from "next/server";
import { data } from "@/constants/data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getRandomItem = (arr: any) => {
  if (arr.length === 0) {
    throw new Error("Cannot get a random item from an empty array.");
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

export const checkReward = (actions: any[], mission: any) => {
  const { startHours, endHours, quantity, type } = mission;

  // set test values
  // actions = data;

  const priceActions = actions.filter(
    (x: any) =>
      x.action_name.includes("Phiên theo biểu giá") && dayjs(x.start).isToday(),
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

      if (dayjs(start).hour() >= startHours) {
        return true;
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
      const currentDateStart = dayjs(start);
      const currentDateEnd = dayjs(end);

      if (
        currentDateStart.hour() >= startHours &&
        currentDateStart.hour() < endHours
      ) {
        if (end !== null) {
          minutes += currentDateEnd.diff(currentDateStart, "minute");

          console.log("minutes", minutes);
        } else {
          const dateEnd = dayjs();
          minutes += currentDateEnd.diff(currentDateStart, "minute");
        }
      }
    });
  }

  if (minutes >= parseInt(quantity, 10) * 60) {
    return true;
  }

  if (orderActions && orderActions.length > 0 && type === "ORDER") {
    let totalSpent = 0;
    orderActions.forEach((action: any) => {
      const { spent_sum } = action;
      const spentSum = parseInt(spent_sum.split(".")[0], 10);
      totalSpent += spentSum;
    });
    if (totalSpent >= parseInt(quantity, 10)) {
      return true;
    }
  }
  return false;
};
