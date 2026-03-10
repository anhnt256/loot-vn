import { GameAppointmentDetail } from "@gateway-workspace/shared/ui";

interface GameAppointmentDetailPageProps {
  params: {
    id: string;
  };
}

export default function GameAppointmentDetailPage({
  params,
}: GameAppointmentDetailPageProps) {
  return <GameAppointmentDetail appointmentId={params.id} />;
}
