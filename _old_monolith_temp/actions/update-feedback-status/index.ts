import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { UpdateFeedbackStatusSchema, UpdateFeedbackStatusInput } from "./schema";
import { UpdateFeedbackStatusResponse } from "./type";
import { cookies } from "next/headers";

const handler = async (
  data: UpdateFeedbackStatusInput
): Promise<UpdateFeedbackStatusResponse> => {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value || "GO_VAP";

    // Get current feedback info
    const feedback = await db.feedback.findFirst({
      where: {
        id: data.feedbackId,
        branch: branch
      },
      select: {
        userId: true,
        status: true,
        stars: true
      }
    });
    if (!feedback) {
      return {
        success: false,
        error: "Không tìm thấy phản ánh",
      };
    }

    // Update feedback status
    await db.feedback.update({
      where: {
        id: data.feedbackId
      },
      data: {
        status: data.status,
        stars: data.stars || 0,
        updatedAt: new Date()
      }
    });

    // If status is COMPLETED and stars > 0, reward user
    if (data.status === "COMPLETED" && data.stars && data.stars > 0 && feedback.userId) {
      // Get current user stars
      const user = await db.user.findFirst({
        where: {
          id: feedback.userId,
          branch: branch
        },
        select: {
          stars: true
        }
      });
      if (user) {
        const oldStars = user.stars;
        const newStars = oldStars + data.stars;

        // Update user stars
        await db.user.update({
          where: {
            id: feedback.userId,
            branch: branch
          },
          data: {
            stars: newStars
          }
        });

        // Create UserStarHistory record
        await db.userStarHistory.create({
          data: {
            userId: feedback.userId,
            oldStars: oldStars,
            newStars: newStars,
            type: 'FEEDBACK',
            targetId: data.feedbackId,
            branch: branch,
            createdAt: new Date()
          }
        });
      }
    }

    return {
      success: true,
      data: {
        id: data.feedbackId,
        status: data.status,
        stars: data.stars,
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error("Error updating feedback status:", error);
    return {
      success: false,
      error: "Có lỗi xảy ra khi cập nhật trạng thái",
    };
  }
};

export const updateFeedbackStatus = createSafeAction(UpdateFeedbackStatusSchema, handler); 