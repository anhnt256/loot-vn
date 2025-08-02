export interface UpdateFeedbackStatusResponse {
  success: boolean;
  data?: {
    id: number;
    status: string;
    stars?: number;
    updatedAt: Date;
  };
  error?: string;
} 