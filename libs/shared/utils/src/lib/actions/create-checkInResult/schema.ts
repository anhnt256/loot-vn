import { z } from "zod";

export const CreateCheckInResult = z.object({
  userId: z.number().positive("User ID must be positive"),
});
