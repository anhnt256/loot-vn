export class CreateGameAppointmentInput {
  title: string;
  description?: string;
  game: string;
  gameType: 'CASUAL' | 'RANKED' | 'COMPETITIVE';
  rankLevel?: string;
  startTime: string;
  endTime: string;
  selectedTier: string;
}

export class JoinGameAppointmentInput {
  appointmentId: string;
  computerCount: number;
  pricePerHour: number;
  machineName?: string;
  machineGroupId?: number;
}

export class LeaveGameAppointmentInput {
  appointmentId: string;
}

export class CompleteGameAppointmentInput {
  appointmentId: string;
  completedMembers: {
    userId: number;
    status: 'COMPLETED' | 'NO_SHOW';
  }[];
}
