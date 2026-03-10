export interface AddFeedbackResponseResponse {
  success: boolean;
  data?: {
    id: number;
    response: string;
    updatedAt: Date;
  };
  error?: string;
} 