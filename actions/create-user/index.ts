"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateUser } from "./schema";
import { InputType, ReturnType } from "./type";
import { User } from "@/prisma/generated/prisma-client";
import { BRANCH } from "@/constants/enum.constant";
import dayjs from "@/lib/dayjs";
import { getVNTimeForPrisma } from "@/lib/timezone-utils";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, rankId = 1, branch = BRANCH.GOVAP, stars = 0 } = data;

  let createUser;
  let currentUser: User | null;

  try {
    // Check if user exists using raw SQL
    const existingUsers = await db.$queryRaw`
      SELECT * FROM "User" 
      WHERE "userId" = ${userId} AND "branch" = ${branch}
      LIMIT 1
    `;
    currentUser = (existingUsers as any[])[0] || null;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }

  if (currentUser) {
    return {
      error: "User has exist.",
    };
  }

  try {
    // Create user using raw SQL
    const result = await db.$queryRaw`
      INSERT INTO "User" ("userId", "branch", "rankId", "stars", "createdAt", "updatedAt")
      VALUES (${userId}, ${branch}, ${rankId}, ${stars}, ${getVNTimeForPrisma()}, ${getVNTimeForPrisma()})
      RETURNING *
    `;
    createUser = (result as any[])[0];
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  return { data: createUser };
};

export const createUser = createSafeAction(CreateUser, handler);
