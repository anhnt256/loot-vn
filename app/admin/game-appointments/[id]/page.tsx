import { GameAppointmentAdmin } from "@/components/admin/GameAppointmentAdmin";

interface GameAppointmentAdminPageProps {
  params: {
    id: string;
  };
}

export default function GameAppointmentAdminPage({
  params,
}: GameAppointmentAdminPageProps) {
  return <GameAppointmentAdmin appointmentId={params.id} />;
}
