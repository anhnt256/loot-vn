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
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (rankId !== undefined) {
      updateFields.push(`"rankId" = $${paramIndex++}`);
      updateValues.push(rankId);
    }
    if (magicStone !== undefined) {
      updateFields.push(`"magicStone" = $${paramIndex++}`);
      updateValues.push(magicStone);
    }
    if (stars !== undefined) {
      updateFields.push(`"stars" = $${paramIndex++}`);
      updateValues.push(stars);
    }
    if (branch !== undefined) {
      updateFields.push(`"branch" = $${paramIndex++}`);
      updateValues.push(branch);
    }
    if (userName !== undefined) {
      updateFields.push(`"userName" = $${paramIndex++}`);
      updateValues.push(userName);
    }

    // Always update updatedAt
    updateFields.push(`"updatedAt" = $${paramIndex++}`);
    updateValues.push(getVNTimeForPrisma());

    if (updateFields.length === 0) {
      return { error: "No fields to update" };
    }

    const updateQuery = `
      UPDATE "User" 
      SET ${updateFields.join(', ')}
      WHERE "id" = $${paramIndex}
      RETURNING *
    `;
    updateValues.push(id);

    // Update user in database using raw SQL
    const result = await db.$queryRawUnsafe(updateQuery, ...updateValues);
    const updatedUser = (result as any[])[0];

    return { data: updatedUser };
  } catch (error: any) {
    return {
      error: error?.message || "Failed to update user",
    };
  }
};

export const updateUser = createSafeAction(UpdateUser, handler);
