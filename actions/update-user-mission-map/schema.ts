import { z } from "zod";

export const UpdateUserMissionMap = z.object({
  id: z.number(),
  userId: z.number(),
  stars: z.number(),
  isDone: z.boolean(),
  updatedAt: z.string(),
});
