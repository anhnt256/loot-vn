import { z } from "zod";

export const UpdateUserMissionMap = z.object({
  id: z.number(),
  isDone: z.optional(z.boolean()),
  updatedAt: z.optional(z.date()),
  userId: z.number(),
  currentUserId: z.number(),
  reward: z.number(),
  branch: z.string(),
});
