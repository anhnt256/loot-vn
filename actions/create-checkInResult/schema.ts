import { z } from "zod";

export const CreateCheckInResult = z.object({
  userId: z.number(),
});
