"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateUser } from "./schema";
import { InputType, ReturnType } from "./type";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, rankId = 1, stars = 0, magicStone = 0 } = data;
  let updateUser;

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
