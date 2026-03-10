import { z } from "zod";

export const FeedbackSchema = z.object({
  type: z.enum(["bug", "feature", "improvement", "other"] as [string, ...string[]]),
  title: z.string().min(1, "Tiêu đề không được để trống").max(100, "Tiêu đề không được quá 100 ký tự"),
  description: z.string().min(1, "Mô tả không được để trống").max(1000, "Mô tả không được quá 1000 ký tự"),
  priority: z.enum(["low", "medium", "high"] as [string, ...string[]]),
});

export type FeedbackSchemaType = z.infer<typeof FeedbackSchema>; 