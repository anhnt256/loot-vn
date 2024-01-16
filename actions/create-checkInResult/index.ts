"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateCheckInResult } from "./schema";
import { InputType, ReturnType } from "./type";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, branch } = data;
  let updateUser;

  try {
    updateUser = await db.checkInResult.create({
      data: {
        userId,
        branch,
      },
    });

  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  return { data: updateUser };
};

export const createCheckInResult = createSafeAction(
  CreateCheckInResult,
  handler,
);
