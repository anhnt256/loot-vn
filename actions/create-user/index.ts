"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateUser } from "./schema";
import { InputType, ReturnType } from "./type";
import { User } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, rankId = 1, stars = 0 } = data;
  let createUser;

  const currentUser: User | null = await db.user.findUnique({
    where: { userId },
  });

  if (currentUser) {
    return {
      error: "User has exist.",
    };
  }

  try {
    createUser = await db.user.create({
      data: {
        userId,
        rankId,
        stars,
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
