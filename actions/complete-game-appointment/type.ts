export interface CompleteGameAppointmentResponse {
  success: boolean;
  data?: {
    appointmentId: string;
    status: string;
    rewardDistribution: {
      distributedRewards: Array<{
        userId: number;
        rewardType: string;
        rewardValue: string;
        quantity: number;
        status: string;
      }>;
      totalRewardsDistributed: number;
    };
    forfeitedAmount: number;
  };
  error?: string;
}
