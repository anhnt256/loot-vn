"use server";

import { createSafeAction } from "@/lib/create-safe-action";
import { FeedbackSchema } from "./schema";
import { FeedbackType } from "./type";
import { getCurrentUser } from "@/lib/server-utils";
import { getBranchFromCookie } from "@/lib/server-utils";
import { getCurrentTimeISO } from "@/lib/timezone-utils";
import { cookies } from "next/headers";

const handler = async (data: FeedbackType) => {
  try {
    const cookieStore = await cookies();
    const currentUser = await getCurrentUser(cookieStore);
    const branch = await getBranchFromCookie();

    if (!currentUser) {
      return {
        error: "Unauthorized",
      };
    }

    const currentTime = getCurrentTimeISO();

    // Insert feedback into database
    const query = `
      INSERT INTO Feedback (
        userId, 
        branch, 
        type, 
        title, 
        description, 
        priority, 
        status, 
        createdAt, 
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      currentUser.userId,
      branch,
      data.type,
      data.title,
      data.description,
      data.priority,
      'pending', // Default status
      currentTime,
      currentTime
    ];

    const { db } = await import("@/lib/db");
    await db.execute(query, params);

    return {
      data: {
        message: "Feedback submitted successfully",
      },
    };
  } catch (error) {
    console.error("Error creating feedback:", error);
    return {
      error: "Failed to submit feedback",
    };
  }
};

export const createFeedback = createSafeAction(FeedbackSchema, handler); 