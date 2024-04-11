"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateUser } from "./schema";
import { InputType, ReturnType } from "./type";
import { User } from "@prisma/client";
import { BRANCH } from "@/constants/enum.constant";
import { nowUtc } from "@/lib/dayjs";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, rankId = 1, branch = BRANCH.GOVAP, stars = 0 } = data;
  let createUser;
  let currentUser: User | null;

  try {
    currentUser = await db.user.findFirst({
      where: { userId, branch },
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  if (currentUser) {
    return {
      error: "User has exist.",
    };
  }

  try {
    createUser = await db.user.create({
      data: {
        userId,
        branch,
        rankId,
        stars,
        createdAt: nowUtc,
      },
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  return { data: createUser };
};

export const createUser = createSafeAction(CreateUser, handler);
