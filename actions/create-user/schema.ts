import { z } from "zod";

export const CreateUser = z.object({
  userId: z.number(),
  userName: z.string(),
  rankId: z.optional(z.number()),
  stars: z.optional(z.number()),
});
