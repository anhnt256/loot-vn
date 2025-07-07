import { z } from "zod";
import { CreateCheckInResult } from "./schema";

export type InputType = z.infer<typeof CreateCheckInResult>;

export type ReturnType = {
  data?: any;
  error?: string;
};
