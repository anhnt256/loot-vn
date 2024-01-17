"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateUser } from "./schema";
import { InputType, ReturnType } from "./type";
import dayjs, { nowUtc } from "@/lib/dayjs";
import apiClient from "@/lib/apiClient";
import { MIN_LOGIN_TIME } from "@/constants/constant";
import { checkReward } from "@/lib/utils";

const handler = async (data: InputType): Promise<ReturnType> => {
  const {
    id,
    rankId = 1,
    stars = 0,
    magicStone = 0,
    userId,
    branch,
    userName,
    mission,
  } = data;
  let updateUser;

  if (!mission && !userName && !branch) {
    const userCheckIn = await db.checkInResult.findMany({
      where: { userId, branch },
    });

    const hasCheckIn = userCheckIn.find(
      (x) =>
        dayjs(x.createdAt).format("DD/MM/YYYY") ===
        dayjs().format("DD/MM/YYYY"),
    );

    if (hasCheckIn) {
      return {
        error: "User has checkin.",
      };
    }
  } else {
    const result = await apiClient({
      method: "get",
      url: `/account/${userName}/balance-history/?format=json`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const actions = result.data;

    const check = checkReward(actions, mission);

    if (!check) {
      return {
        error: "Error.",
      };
    }
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
        updatedAt: nowUtc,
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
