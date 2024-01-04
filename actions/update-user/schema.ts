import { z } from "zod";

export const UpdateUser = z.object({
  userId: z.number(),
  rankId: z.optional(z.number()),
  rocks: z.optional(z.number()),
  stars: z.optional(z.number()),
});
