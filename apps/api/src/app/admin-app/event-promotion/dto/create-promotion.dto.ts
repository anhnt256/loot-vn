export class CreatePromotionDto {
  eventId: string;
  name: string;
  description?: string;
  priority?: number;
  conditions?: CreateConditionDto[];
  rewardBundles?: CreateRewardBundleDto[];
}

export class CreateConditionDto {
  triggerAction: string; // TOPUP, ORDER_FOOD, PLAY_TIME, TOTAL_SPEND
  operator: string; // ">="
  value: number;
}

export class CreateRewardBundleDto {
  name: string;
  items: CreateRewardItemDto[];
}

export class CreateRewardItemDto {
  rewardType: string; // BONUS_PERCENT, TOPUP_FIXED, SPIN_TURNS, FREE_DRINK, FREE_FOOD, COUPON
  value: number;
  walletType?: string; // "MAIN" | "SUB"
  maxValue?: number;
  metadata?: string;
}

export class UpdatePromotionDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  priority?: number;
}
