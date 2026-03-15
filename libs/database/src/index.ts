export * from './lib/database';
export * from './lib/db';
export * from './lib/types';

// Explicitly export types from the generated prisma client
export type { 
  GameAppointmentTier,
  User,
  GameAppointment,
  GameAppointmentMember,
  UserRewardMap,
  Item,
  GameResult,
  GiftRound,
  UserStarHistory,
  Computer,
  Staff,
  StaffTimeTracking,
  WorkShift,
  WorkShiftRevenueReport,
  FraudLoginAlert,
  StaffSalary,
  StaffBonus,
  StaffPenalty,
  ManagerIncomeExpense,
  Device,
  DeviceHistory,
  BattlePassSeason,
  BattlePassReward,
  UserBattlePass,
  UserBattlePassReward,
  BattlePassPremiumPackage,
  PromotionSetting,
  BattlePassPremiumOrder,
  ChatMessage,
  BirthdayTier,
  UserBirthdayProgress,
  BirthdayTransaction,
  ReportDetail,
  Report,
  HandoverReport,
  HandoverMaterial,
  Material,
  Feedback,
  FnetHistory,
  PromotionReward
} from './lib/generated/prisma-client';

export { 
  Shift,
  ReportDetailType,
  ShiftRevenueType,
  HandoverReportType,
  Staff_gender,
  Staff_staffType,
  MissionType,
  UserRewardMapStatus,
  UserRewardMap_type,
  UserStarHistoryType,
  DeviceStatus,
  OrderStatus,
  PromotionType,
  DiscountType,
  BirthdayTransactionType,
  FeedbackType,
  FeedbackStatus,
  ResetCycle,
  RewardPunishType,
  RuleActionType
} from './lib/generated/prisma-client';

export { PrismaClient, Prisma } from './lib/generated/prisma-client';
export { PrismaClient as MainPrismaClient, Prisma as MainPrisma } from './lib/generated/prisma-client';
export { PrismaClient as FnetGVPrismaClient, Prisma as FnetGVPrisma } from './lib/generated/fnet-gv-client';
export { PrismaClient as FnetTPPrismaClient, Prisma as FnetTPPrisma } from './lib/generated/fnet-tp-client';
export { PrismaClient as TenantPrismaClient, Prisma as TenantPrisma } from './lib/generated/tenant-client';
