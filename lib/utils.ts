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

      if (end !== null) {
        if (currentDateStart.hour() >= startHours) {
          if (currentDateStart.hour() < endHours) {
            minutes += currentDateEnd.diff(currentDateStart, "minute");
          } else if (currentDateStart.hour() > endHours) {
            const currentEndDateFix = dayjs().hour(endHours);
            minutes += currentEndDateFix.diff(currentDateStart, "minute");
          }
        }
      } else {
        const currentDate = dayjs().hour();
        const currentEndDateFix = dayjs().hour(endHours);
        const currentStartDateFix = dayjs().hour(startHours);
        if (currentDateStart.hour() >= startHours) {
          if (currentDate < endHours) {
            minutes += dayjs().diff(currentDateStart, "minute");
          } else {
            minutes += currentEndDateFix.diff(currentDateStart, "minute");
          }
        } else {
          if (currentDate < endHours) {
            minutes += dayjs().diff(currentStartDateFix, "minute");
          } else {
            minutes += currentEndDateFix.diff(currentStartDateFix, "minute");
          }
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
