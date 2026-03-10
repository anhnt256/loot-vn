import { z } from "zod";
import { UserRewardMap } from "@gateway-workspace/database";

import { ActionState } from "../../create-safe-action";

import { CreateUserRewardMap } from "./schema";

export type InputType = z.infer<typeof CreateUserRewardMap>;
export type ReturnType = ActionState<InputType, UserRewardMap>;
