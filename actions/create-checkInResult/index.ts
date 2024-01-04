"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateCheckInResult } from "./schema";
import { InputType, ReturnType } from "./type";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId } = data;
  console.log("userId", userId);
  let updateUser;

  try {
    updateUser = await db.checkInResult.create({
      data: {
        userId,
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
