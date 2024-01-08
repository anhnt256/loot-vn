import { z } from "zod";

export const CreateUserMissionMap = z.object({
  userId: z.number(),
  missionId: z.number(),
});
