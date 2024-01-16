"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateUser } from "./schema";
import { InputType, ReturnType } from "./type";
import dayjs from "@/lib/dayjs";
import apiClient from "@/lib/apiClient";
import { MIN_LOGIN_TIME } from "@/constants/constant";

const handler = async (data: InputType): Promise<ReturnType> => {
  const {
    id,
    rankId = 1,
    stars = 0,
    magicStone = 0,
    userId,
    branch,
    userName,
  } = data;
  let updateUser;

  const userCheckIn = await db.checkInResult.findMany({
    where: { userId, branch },
  });

  const hasCheckIn = userCheckIn.find(
    (x) =>
      dayjs(x.createdAt).format("DD/MM/YYYY") === dayjs().format("DD/MM/YYYY"),
  );

  if (hasCheckIn) {
    return {
      error: "User has checkin.",
    };
  }

  const result = await apiClient({
    method: "get",
    url: `/account/${userName}/balance-history/?format=json`,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const actions = result.data;

  const priceActions = actions.filter(
    (x: any) =>
      x.action_name.includes("Phiên theo biểu giá") && dayjs(x.start).isToday(),
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

  if (minutes && minutes < MIN_LOGIN_TIME) {
    return {
      error: "User isn't play done!",
    };
  }

  try {
    updateUser = await db.user.update({
      where: {
        id,
      },
      data: {
        rankId,
        stars,
        magicStone,
      },
    });
  } catch (error) {
    return {
      error: "Failed to update.",
    };
  }

  return { data: updateUser };
};

export const updateUser = createSafeAction(UpdateUser, handler);
