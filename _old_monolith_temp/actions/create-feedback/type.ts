import { z } from "zod";
import { FeedbackSchema } from "./schema";

export type FeedbackType = z.infer<typeof FeedbackSchema>;

export type CreateFeedbackResponse = {
  data?: {
    message: string;
  };
  error?: string;
}; 