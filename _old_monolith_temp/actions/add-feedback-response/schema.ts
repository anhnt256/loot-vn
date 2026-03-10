import { z } from "zod";

export const AddFeedbackResponseSchema = z.object({
  feedbackId: z.number(),
  response: z.string().min(1, "Nội dung phản hồi không được để trống"),
});

export type AddFeedbackResponseInput = z.infer<typeof AddFeedbackResponseSchema>; 