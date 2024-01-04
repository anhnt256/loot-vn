import { z } from "zod";

export const CreateUser = z.object({
  userId: z.number(),
  rankId: z.optional(z.number()),
  stars: z.optional(z.number()),
});
