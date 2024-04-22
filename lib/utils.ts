import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs, { nowUtc, startUtc } from "@/lib/dayjs";
import { NextResponse } from "next/server";
import { data } from "@/constants/data";
import { fetcher } from "@/lib/fetcher";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

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
  const { startHours, endHours, quantity, type } = mission || {};

  // console.group(`checkReward ${startHours} - ${endHours}`);

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

  if (priceActions && priceActions.length > 0 && type === "HOURS") {
    priceActions.forEach((action: any) => {
      if (minutes < 0) {
        minutes = 0;
      }
      const { start, end } = action;
      const currentDateStart = dayjs(start);
      let currentDateEnd = dayjs().add(1, "day");
      const currentEndDateFix = dayjs().hour(endHours).minute(0).second(0);
      const currentStartDateFix = dayjs().hour(startHours).minute(0).second(0);

      // console.log(
      //   "currentDateStart",
      //   currentDateStart.format("DD/MM/YYYY HH:mm:ss"),
      // );
      // console.log(
      //   "currentDateEnd",
      //   currentDateEnd.format("DD/MM/YYYY HH:mm:ss"),
      // );
      // console.log(
      //   "currentEndDateFix",
      //   currentEndDateFix.format("DD/MM/YYYY HH:mm:ss"),
      // );
      // console.log(
      //   "currentStartDateFix",
      //   currentStartDateFix.format("DD/MM/YYYY HH:mm:ss"),
      // );

      if (end !== null) {
        currentDateEnd = dayjs(end);
        // console.log(
        //   "currentDateEnd-New",
        //   currentDateEnd.format("DD/MM/YYYY HH:mm:ss"),
        // );
        if (currentDateStart.hour() >= startHours) {
          if (currentDateEnd.isSameOrAfter(currentEndDateFix)) {
            minutes += currentEndDateFix.diff(currentDateStart, "minute");
          } else {
            minutes += currentDateEnd.diff(currentDateStart, "minute");
          }
        }
        // Trường hợp khách chơi từ sáng đến khuya. Nên StartDate sẽ lớn hơn điều kiện
        // Ví dụ StartDate 7h:45, EndDate 23h45 , nhưng Start Hours 13h, End Hours 17h, Chơi 1h
        else if (currentDateStart.hour() <= startHours) {
          if (currentDateEnd.isSameOrAfter(currentEndDateFix)) {
            minutes += currentEndDateFix.diff(currentStartDateFix, "minute");
          } else {
            minutes += currentDateEnd.diff(currentStartDateFix, "minute");
          }
        }
      } else {
        if (currentDateEnd.hour() >= startHours) {
          minutes += dayjs().diff(currentDateStart, "minute");
        }
        // Trường hợp khách chơi từ sáng đến khuya. Nên StartDate sẽ lớn hơn điều kiện
        // Ví dụ StartDate 7h:45, EndDate 23h45 , nhưng Start Hours 13h, End Hours 17h, Chơi 1h
        else if (currentDateStart.hour() <= startHours) {
          if (currentDateEnd.isSameOrAfter(currentEndDateFix)) {
            minutes += currentEndDateFix.diff(currentStartDateFix, "minute");
          } else {
            minutes += currentDateEnd.diff(currentStartDateFix, "minute");
          }
        }
      }
    });
  }
  // console.log("current Minutes", minutes);
  //
  // console.groupEnd();
  //

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

function isGreaterThanOrEqualYesterday(customDate: string) {
  const yesterday = dayjs().subtract(1, "day").startOf("day");

  const customDayjs = dayjs(customDate);

  return customDayjs.isSameOrAfter(yesterday);
}

export const checkTodaySpentTime = (actions: any[]) => {
  // set test values
  // actions = data;

  const priceActions = actions.filter(
    (x: any) =>
      x.action_name.includes("Phiên theo biểu giá") &&
      isGreaterThanOrEqualYesterday(x.start),
  );

  const ticketActions = actions.filter(
    (x: any) =>
      x.action_name.includes("Ticket session") &&
      isGreaterThanOrEqualYesterday(x.start),
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
  return minutes;
};

export const updateUserBalance = async (userName: string) => {
  const userBalance = localStorage.getItem("userBalance");
  if (userBalance === null) {
    const result = await fetcher(`/api/account/${userName}/balance`);
    localStorage.setItem("userBalance", JSON.stringify(result));
    window.location.reload();
  }
};
