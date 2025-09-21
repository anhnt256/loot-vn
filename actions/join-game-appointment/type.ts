export interface JoinGameAppointmentResponse {
  success: boolean;
  data?: {
    appointmentId: string;
    userId: number;
    lockedAmount: number;
    status: string;
    joinedAt: string;
    tierChange?: {
      oldTier: string;
      newTier: string;
      promotion: {
        promotion: string;
        description: string;
        businessLogic: string;
        minNetProfit: number;
      };
    };
    promotion?: {
      promotion: string;
      description: string;
      businessLogic: string;
      minNetProfit: number;
    };
  };
  error?: string;
}
