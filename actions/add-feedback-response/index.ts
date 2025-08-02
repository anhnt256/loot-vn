import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { AddFeedbackResponseSchema } from "./schema";
import { AddFeedbackResponseResponse } from "./type";
import { cookies } from "next/headers";

const handler = async (
  data: AddFeedbackResponseSchema,
  adminId: number
): Promise<AddFeedbackResponseResponse> => {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value || "GO_VAP";

    // Check if feedback exists and belongs to current branch
    const [feedbackRows] = await db.execute(
      `SELECT id FROM Feedback WHERE id = ? AND branch = ?`,
      [data.feedbackId, branch]
    );

    const feedback = (feedbackRows as any[])[0];
    if (!feedback) {
      return {
        success: false,
        error: "Không tìm thấy phản ánh",
      };
    }

    // Update feedback response
    await db.execute(
      `UPDATE Feedback SET response = ?, updatedAt = NOW() WHERE id = ?`,
      [data.response, data.feedbackId]
    );

    return {
      success: true,
      data: {
        id: data.feedbackId,
        response: data.response,
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error("Error adding feedback response:", error);
    return {
      success: false,
      error: "Có lỗi xảy ra khi thêm phản hồi",
    };
  }
};

export const addFeedbackResponse = createSafeAction(AddFeedbackResponseSchema, handler); 