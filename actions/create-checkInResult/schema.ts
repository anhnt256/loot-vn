import { z } from "zod";

export const CreateCheckInResult = z.object({
  userId: z.number(),
  currentUserId: z.number(),
  branch: z.string(),
  oldStars: z.number(),
  newStars: z.number(),
});
