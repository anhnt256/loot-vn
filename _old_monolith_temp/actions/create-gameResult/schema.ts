import { z } from "zod";

export const CreateGameResult = z.object({
  userId: z.number(),
  rolls: z.number(),
  type: z.enum(["Wish", "Gift"]),
});
