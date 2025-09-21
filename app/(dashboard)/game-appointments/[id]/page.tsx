import { GameAppointmentDetail } from "@/components/game-appointment/GameAppointmentDetail";

interface GameAppointmentDetailPageProps {
  params: {
    id: string;
  };
}

export default function GameAppointmentDetailPage({ params }: GameAppointmentDetailPageProps) {
  return <GameAppointmentDetail appointmentId={params.id} />;
}
