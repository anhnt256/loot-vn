import { z } from "zod";

export const UpdateUserMissionMap = z.object({
  id: z.number(),
  isDone: z.boolean(),
  updatedAt: z.string(),
});
