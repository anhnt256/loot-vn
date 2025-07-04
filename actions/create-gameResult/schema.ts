import { z } from "zod";

export const CreateGameResult = z.object({
  userId: z.number(),
  branch: z.string(),
  rolls: z.number(),
});
