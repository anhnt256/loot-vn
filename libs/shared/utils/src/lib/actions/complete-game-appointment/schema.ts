import { z } from "zod";

export const CompleteGameAppointmentSchema = z.object({
  appointmentId: z.string().min(1, "ID hẹn chơi không hợp lệ"),
  completedMembers: z.array(z.object({
    userId: z.number().min(1, "User ID không hợp lệ"),
    status: z.union([z.literal("COMPLETED"), z.literal("NO_SHOW")], {
      message: "Vui lòng chọn trạng thái thành viên"
    })
  })).min(1, "Phải có ít nhất 1 thành viên")
});

export type CompleteGameAppointmentInput = z.infer<typeof CompleteGameAppointmentSchema>;
