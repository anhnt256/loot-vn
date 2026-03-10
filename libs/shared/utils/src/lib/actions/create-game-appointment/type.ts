export interface CreateGameAppointmentResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    game: string;
    gameType: string;
    startTime: string;
    endTime: string;
    minMembers: number;
    maxMembers: number;
    minCost: number;
    currentMembers: number;
    status: string;
    tier: string;
    totalLockedAmount: number;
    promotion?: {
      promotion: string;
      description: string;
      businessLogic: string;
      minNetProfit: number;
    };
  };
  error?: string;
}
