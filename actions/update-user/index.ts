"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateUser } from "./schema";
import { InputType, ReturnType } from "./type";
import apiClient from "@/lib/apiClient";
import { MIN_LOGIN_TIME } from "@/constants/constant";
import { checkReward } from "@/lib/utils";
import dayjs from "dayjs";
import { getVNTimeForPrisma } from "@/lib/timezone-utils";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, rankId, magicStone, userId, stars, branch, userName, mission } = data;

  try {
    // Update user in database
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        rankId: rankId !== undefined ? rankId : undefined,
        magicStone: magicStone !== undefined ? magicStone : undefined,
        stars: stars !== undefined ? stars : undefined,
        branch: branch !== undefined ? branch : undefined,
        userName: userName !== undefined ? userName : undefined,
        updatedAt: getVNTimeForPrisma(),
      },
    });

    return { data: updatedUser };
  } catch (error: any) {
    return {
      error: error?.message || "Failed to update user",
    };
  }
};

export const updateUser = createSafeAction(UpdateUser, handler);
