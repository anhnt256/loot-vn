import { z } from "zod";

export const JoinGameAppointmentSchema = z.object({
  appointmentId: z.string().min(1, "ID hẹn chơi không hợp lệ"),
  computerCount: z.number().min(1, "Số lượng máy phải ít nhất là 1"),
  pricePerHour: z.number().min(0, "Giá tiền mỗi giờ không được âm"),
  machineName: z.string().optional(),
  machineGroupId: z.number().optional()
});

export type JoinGameAppointmentInput = z.infer<typeof JoinGameAppointmentSchema>;
