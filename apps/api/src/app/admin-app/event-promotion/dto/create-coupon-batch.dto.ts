export class CreateCouponBatchDto {
  promotionId: number;
  name: string;
  discountType: string; // PERCENT, FIXED
  discountValue: number;
  maxDiscountValue?: number;
  totalCodes: number;
  validDays?: number;
  validFrom?: string;
  validTo?: string;
  usageFrequency: string; // PER_WEEK, PER_MONTH, PER_EVENT, ONE_TIME
  maxUsagePerUser?: number;
}
