import { z } from "zod";

export const LeaveGameAppointmentSchema = z.object({
  appointmentId: z.string().min(1, "ID hẹn chơi không hợp lệ")
});

export type LeaveGameAppointmentInput = z.infer<typeof LeaveGameAppointmentSchema>;
