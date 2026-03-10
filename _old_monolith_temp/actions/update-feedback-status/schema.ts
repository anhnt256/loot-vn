import { z } from "zod";

export const UpdateFeedbackStatusSchema = z.object({
  feedbackId: z.number(),
  status: z.enum(["SUBMITTED", "RECEIVED", "PROCESSING", "COMPLETED"]),
  stars: z.number().min(0).max(100).optional(),
});

export type UpdateFeedbackStatusInput = z.infer<typeof UpdateFeedbackStatusSchema>; 