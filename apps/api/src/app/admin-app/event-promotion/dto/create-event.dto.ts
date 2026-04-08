export class CreateEventDto {
  name: string;
  description?: string;
  type: string;
  startDate: string;
  endDate: string;
  budget?: number;
  targetRules?: CreateTargetRuleDto[];
}

export class CreateTargetRuleDto {
  type: string; // RANK, MIN_TOTAL_PAYMENT, ZONE, SPECIFIC_USER
  operator: string; // ">=", "=", "IN"
  value: string;
}

export class UpdateEventDto {
  name?: string;
  description?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  isActive?: boolean;
}
