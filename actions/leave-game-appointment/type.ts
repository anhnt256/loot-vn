export interface LeaveGameAppointmentResponse {
  success: boolean;
  data?: {
    appointmentId: string;
    userId: number;
    unlockedAmount: number;
    status: string;
    leftAt: string;
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
