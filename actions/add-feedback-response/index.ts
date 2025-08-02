import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { AddFeedbackResponseSchema, AddFeedbackResponseInput } from "./schema";
import { AddFeedbackResponseResponse } from "./type";
import { cookies } from "next/headers";

const handler = async (
  data: AddFeedbackResponseInput
): Promise<AddFeedbackResponseResponse> => {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value || "GO_VAP";

    // Check if feedback exists and belongs to current branch
    const feedback = await db.feedback.findFirst({
      where: {
        id: data.feedbackId,
        branch: branch
      },
      select: {
        id: true
      }
    });
    if (!feedback) {
      return {
        success: false,
        error: "Không tìm thấy phản ánh",
      };
    }

    // Update feedback response
    await db.feedback.update({
      where: {
        id: data.feedbackId
      },
      data: {
        response: data.response,
        updatedAt: new Date()
      }
    });

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