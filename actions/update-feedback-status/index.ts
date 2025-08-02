import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { UpdateFeedbackStatusSchema } from "./schema";
import { UpdateFeedbackStatusResponse } from "./type";
import { cookies } from "next/headers";

const handler = async (
  data: UpdateFeedbackStatusSchema,
  adminId: number
): Promise<UpdateFeedbackStatusResponse> => {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value || "GO_VAP";

    // Get current feedback info
    const [feedbackRows] = await db.execute(
      `SELECT userId, status, stars FROM Feedback WHERE id = ? AND branch = ?`,
      [data.feedbackId, branch]
    );

    const feedback = (feedbackRows as any[])[0];
    if (!feedback) {
      return {
        success: false,
        error: "Không tìm thấy phản ánh",
      };
    }

    // Update feedback status
    await db.execute(
      `UPDATE Feedback SET status = ?, stars = ?, updatedAt = NOW() WHERE id = ?`,
      [data.status, data.stars || 0, data.feedbackId]
    );

    // If status is COMPLETED and stars > 0, reward user
    if (data.status === "COMPLETED" && data.stars && data.stars > 0 && feedback.userId) {
      // Get current user stars
      const [userRows] = await db.execute(
        `SELECT stars FROM User WHERE id = ? AND branch = ?`,
        [feedback.userId, branch]
      );

      const user = (userRows as any[])[0];
      if (user) {
        const oldStars = user.stars;
        const newStars = oldStars + data.stars;

        // Update user stars
        await db.execute(
          `UPDATE User SET stars = ? WHERE id = ? AND branch = ?`,
          [newStars, feedback.userId, branch]
        );

        // Create UserStarHistory record
        await db.execute(
          `INSERT INTO UserStarHistory (userId, oldStars, newStars, type, targetId, branch, createdAt) 
           VALUES (?, ?, ?, 'FEEDBACK', ?, ?, NOW())`,
          [feedback.userId, oldStars, newStars, data.feedbackId, branch]
        );
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