import { z } from "zod";
import { User } from "@gateway-workspace/database";

import { ActionState } from "../../create-safe-action";

import { UpdateUser } from "./schema";

export type InputType = z.infer<typeof UpdateUser>;
export type ReturnType = ActionState<InputType, User>;
