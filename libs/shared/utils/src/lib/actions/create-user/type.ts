import { z } from "zod";
import { User } from "@gateway-workspace/database";

import { ActionState } from "../../create-safe-action";

import { CreateUser } from "./schema";

export type InputType = z.infer<typeof CreateUser>;
export type ReturnType = ActionState<InputType, User>;
