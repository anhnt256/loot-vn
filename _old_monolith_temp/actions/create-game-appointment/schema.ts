import { z } from "zod";

export const CreateGameAppointmentSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(255, "Tiêu đề quá dài"),
  description: z.string().optional(),
  game: z.string().min(1, "Vui lòng chọn game").max(100, "Tên game quá dài"),
  gameType: z.enum(["CASUAL", "RANKED", "COMPETITIVE"], {
    required_error: "Vui lòng chọn thể loại game"
  }),
  rankLevel: z.string().optional(),
  startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
  selectedTier: z.string().min(1, "Vui lòng chọn tier")
});

export type CreateGameAppointmentInput = z.infer<typeof CreateGameAppointmentSchema>;
