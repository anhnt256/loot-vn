import { z } from "zod";

export const CreateCheckInResult = z.object({
  userId: z.number(),
  currentUserId: z.number(),
  branch: z.string(),
  addedStar: z.number(),
});
