
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.RankScalarFieldEnum = {
  id: 'id',
  name: 'name',
  fromValue: 'fromValue',
  toValue: 'toValue',
  discount: 'discount',
  foodVoucher: 'foodVoucher',
  drinkVoucher: 'drinkVoucher',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GameScalarFieldEnum = {
  id: 'id',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  starsPerRound: 'starsPerRound',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  balance_rate: 'balance_rate',
  play_rate: 'play_rate',
  jackpot: 'jackpot'
};

exports.Prisma.CheckInResultScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  createdAt: 'createdAt',
  branch: 'branch'
};

exports.Prisma.CheckInItemScalarFieldEnum = {
  id: 'id',
  dayName: 'dayName',
  stars: 'stars',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CheckInPromotionScalarFieldEnum = {
  id: 'id',
  checkInItemId: 'checkInItemId',
  coefficient: 'coefficient',
  startDate: 'startDate',
  endDate: 'endDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItemScalarFieldEnum = {
  id: 'id',
  name: 'name',
  image_url: 'image_url',
  rating: 'rating',
  value: 'value',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  title: 'title',
  background: 'background',
  textColor: 'textColor'
};

exports.Prisma.GameItemMapScalarFieldEnum = {
  id: 'id',
  gameId: 'gameId',
  itemId: 'itemId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GameResultScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  itemId: 'itemId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  userName: 'userName',
  userId: 'userId',
  rankId: 'rankId',
  stars: 'stars',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  magicStone: 'magicStone',
  branch: 'branch',
  totalPayment: 'totalPayment',
  note: 'note',
  isUseApp: 'isUseApp'
};

exports.Prisma.MissionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  reward: 'reward',
  startHours: 'startHours',
  endHours: 'endHours',
  createdAt: 'createdAt',
  quantity: 'quantity',
  type: 'type'
};

exports.Prisma.UserMissionCompletionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  missionId: 'missionId',
  branch: 'branch',
  completedAt: 'completedAt',
  actualValue: 'actualValue',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserRewardMapScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  rewardId: 'rewardId',
  promotionCodeId: 'promotionCodeId',
  duration: 'duration',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isUsed: 'isUsed',
  branch: 'branch',
  note: 'note',
  status: 'status',
  type: 'type'
};

exports.Prisma.RewardScalarFieldEnum = {
  id: 'id',
  name: 'name',
  stars: 'stars',
  value: 'value',
  startDate: 'startDate',
  endDate: 'endDate',
  createdAt: 'createdAt',
  updateAt: 'updateAt'
};

exports.Prisma.PromotionCodeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  value: 'value',
  branch: 'branch',
  isUsed: 'isUsed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  eventId: 'eventId',
  expirationDate: 'expirationDate',
  promotionSettingId: 'promotionSettingId',
  rewardType: 'rewardType',
  rewardValue: 'rewardValue'
};

exports.Prisma.UserStarHistoryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  oldStars: 'oldStars',
  newStars: 'newStars',
  type: 'type',
  createdAt: 'createdAt',
  targetId: 'targetId',
  branch: 'branch',
  gameResultId: 'gameResultId'
};

exports.Prisma.SavingPlanScalarFieldEnum = {
  id: 'id',
  uuid: 'uuid',
  name: 'name',
  price: 'price',
  description: 'description',
  isDelete: 'isDelete'
};

exports.Prisma.ComputerScalarFieldEnum = {
  id: 'id',
  fingerprintId: 'fingerprintId',
  ip: 'ip',
  name: 'name',
  branch: 'branch',
  status: 'status',
  localIp: 'localIp'
};

exports.Prisma.StaffScalarFieldEnum = {
  id: 'id',
  userName: 'userName',
  password: 'password',
  isDeleted: 'isDeleted',
  isAdmin: 'isAdmin',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  branch: 'branch',
  address: 'address',
  dateOfBirth: 'dateOfBirth',
  email: 'email',
  fullName: 'fullName',
  gender: 'gender',
  hireDate: 'hireDate',
  idCard: 'idCard',
  idCardExpiryDate: 'idCardExpiryDate',
  idCardIssueDate: 'idCardIssueDate',
  note: 'note',
  phone: 'phone',
  resignDate: 'resignDate',
  staffType: 'staffType',
  needCheckMacAddress: 'needCheckMacAddress',
  bankAccountName: 'bankAccountName',
  bankAccountNumber: 'bankAccountNumber',
  bankName: 'bankName',
  baseSalary: 'baseSalary'
};

exports.Prisma.StaffTimeTrackingScalarFieldEnum = {
  id: 'id',
  staffId: 'staffId',
  checkInTime: 'checkInTime',
  checkOutTime: 'checkOutTime',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkShiftScalarFieldEnum = {
  id: 'id',
  name: 'name',
  startTime: 'startTime',
  endTime: 'endTime',
  branch: 'branch',
  FnetStaffId: 'FnetStaffId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isOvernight: 'isOvernight',
  ffoodId: 'ffoodId'
};

exports.Prisma.WorkShiftRevenueReportScalarFieldEnum = {
  id: 'id',
  reportDate: 'reportDate',
  branch: 'branch',
  shift: 'shift',
  totalFood: 'totalFood',
  deduction: 'deduction',
  actualFfood: 'actualFfood',
  gamingRevenue: 'gamingRevenue',
  actualShiftRevenue: 'actualShiftRevenue',
  momoRevenue: 'momoRevenue',
  incidentalAmount: 'incidentalAmount',
  handoverAmount: 'handoverAmount',
  confirmedHeldAmount: 'confirmedHeldAmount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FraudLoginAlertScalarFieldEnum = {
  id: 'id',
  branch: 'branch',
  serverLogId: 'serverLogId',
  actor: 'actor',
  loginAt: 'loginAt',
  note: 'note',
  createdAt: 'createdAt'
};

exports.Prisma.StaffSalaryScalarFieldEnum = {
  id: 'id',
  staffId: 'staffId',
  month: 'month',
  year: 'year',
  totalHours: 'totalHours',
  hourlySalary: 'hourlySalary',
  salaryFromHours: 'salaryFromHours',
  advance: 'advance',
  bonus: 'bonus',
  penalty: 'penalty',
  total: 'total',
  status: 'status',
  paidAt: 'paidAt',
  note: 'note',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StaffBonusScalarFieldEnum = {
  id: 'id',
  staffId: 'staffId',
  amount: 'amount',
  reason: 'reason',
  description: 'description',
  imageUrl: 'imageUrl',
  note: 'note',
  rewardDate: 'rewardDate',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StaffPenaltyScalarFieldEnum = {
  id: 'id',
  staffId: 'staffId',
  amount: 'amount',
  reason: 'reason',
  description: 'description',
  imageUrl: 'imageUrl',
  note: 'note',
  penaltyDate: 'penaltyDate',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ManagerIncomeExpenseScalarFieldEnum = {
  id: 'id',
  type: 'type',
  amount: 'amount',
  reason: 'reason',
  description: 'description',
  transactionDate: 'transactionDate',
  branch: 'branch',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
};

exports.Prisma.GiftRoundScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  amount: 'amount',
  reason: 'reason',
  staffId: 'staffId',
  createdAt: 'createdAt',
  expiredAt: 'expiredAt',
  isUsed: 'isUsed',
  updatedAt: 'updatedAt',
  branch: 'branch',
  usedAmount: 'usedAmount'
};

exports.Prisma.DeviceScalarFieldEnum = {
  id: 'id',
  computerId: 'computerId',
  monitorStatus: 'monitorStatus',
  keyboardStatus: 'keyboardStatus',
  mouseStatus: 'mouseStatus',
  headphoneStatus: 'headphoneStatus',
  chairStatus: 'chairStatus',
  networkStatus: 'networkStatus',
  computerStatus: 'computerStatus',
  note: 'note',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DeviceHistoryScalarFieldEnum = {
  id: 'id',
  computerId: 'computerId',
  type: 'type',
  issue: 'issue',
  status: 'status',
  createdAt: 'createdAt',
  monitorStatus: 'monitorStatus',
  keyboardStatus: 'keyboardStatus',
  mouseStatus: 'mouseStatus',
  headphoneStatus: 'headphoneStatus',
  chairStatus: 'chairStatus',
  networkStatus: 'networkStatus',
  deviceId: 'deviceId',
  updatedAt: 'updatedAt'
};

exports.Prisma.BattlePassSeasonScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  maxLevel: 'maxLevel',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BattlePassRewardScalarFieldEnum = {
  id: 'id',
  seasonId: 'seasonId',
  level: 'level',
  name: 'name',
  description: 'description',
  type: 'type',
  rewardType: 'rewardType',
  rewardValue: 'rewardValue',
  imageUrl: 'imageUrl',
  isBonus: 'isBonus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  experience: 'experience',
  eventRewardId: 'eventRewardId'
};

exports.Prisma.UserBattlePassScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  seasonId: 'seasonId',
  level: 'level',
  experience: 'experience',
  isPremium: 'isPremium',
  totalSpent: 'totalSpent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  branch: 'branch'
};

exports.Prisma.UserBattlePassRewardScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  seasonId: 'seasonId',
  rewardId: 'rewardId',
  claimedAt: 'claimedAt',
  branch: 'branch'
};

exports.Prisma.BattlePassPremiumPackageScalarFieldEnum = {
  id: 'id',
  seasonId: 'seasonId',
  name: 'name',
  basePrice: 'basePrice',
  description: 'description',
  benefits: 'benefits',
  maxQuantity: 'maxQuantity',
  sold: 'sold',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PromotionSettingScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  targetId: 'targetId',
  discountType: 'discountType',
  discountValue: 'discountValue',
  startDate: 'startDate',
  endDate: 'endDate',
  maxQuantity: 'maxQuantity',
  used: 'used',
  isActive: 'isActive',
  rule: 'rule',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  eventId: 'eventId'
};

exports.Prisma.BattlePassPremiumOrderScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  packageId: 'packageId',
  price: 'price',
  status: 'status',
  createdAt: 'createdAt',
  approvedAt: 'approvedAt',
  approvedBy: 'approvedBy',
  note: 'note',
  branch: 'branch'
};

exports.Prisma.ChatMessageScalarFieldEnum = {
  id: 'id',
  content: 'content',
  userId: 'userId',
  machineName: 'machineName',
  branch: 'branch',
  createdAt: 'createdAt',
  staffId: 'staffId'
};

exports.Prisma.BirthdayTierScalarFieldEnum = {
  id: 'id',
  tierName: 'tierName',
  discountPercent: 'discountPercent',
  milestoneAmount: 'milestoneAmount',
  additionalAmount: 'additionalAmount',
  bonusAmount: 'bonusAmount',
  totalAtTier: 'totalAtTier',
  totalReceived: 'totalReceived',
  freeSpins: 'freeSpins',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserBirthdayProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tierId: 'tierId',
  branch: 'branch',
  isClaimed: 'isClaimed',
  claimedAt: 'claimedAt',
  totalSpent: 'totalSpent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BirthdayTransactionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  branch: 'branch',
  amount: 'amount',
  tierId: 'tierId',
  transactionType: 'transactionType',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.ReportDetailScalarFieldEnum = {
  id: 'id',
  reportId: 'reportId',
  type: 'type',
  value: 'value'
};

exports.Prisma.ReportScalarFieldEnum = {
  id: 'id',
  date: 'date',
  shift: 'shift',
  branch: 'branch',
  fileUrl: 'fileUrl',
  note: 'note',
  counterStaffId: 'counterStaffId',
  kitchenStaffId: 'kitchenStaffId',
  securityStaffId: 'securityStaffId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HandoverReportScalarFieldEnum = {
  id: 'id',
  date: 'date',
  reportType: 'reportType',
  branch: 'branch',
  note: 'note',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  afternoonStaffId: 'afternoonStaffId',
  eveningStaffId: 'eveningStaffId',
  morningStaffId: 'morningStaffId',
  afternoonSubmissionCount: 'afternoonSubmissionCount',
  eveningSubmissionCount: 'eveningSubmissionCount',
  isAfternoonComplete: 'isAfternoonComplete',
  isEveningComplete: 'isEveningComplete',
  isMorningComplete: 'isMorningComplete',
  morningSubmissionCount: 'morningSubmissionCount'
};

exports.Prisma.HandoverMaterialScalarFieldEnum = {
  id: 'id',
  handoverReportId: 'handoverReportId',
  morningBeginning: 'morningBeginning',
  morningReceived: 'morningReceived',
  morningIssued: 'morningIssued',
  morningEnding: 'morningEnding',
  afternoonBeginning: 'afternoonBeginning',
  afternoonReceived: 'afternoonReceived',
  afternoonIssued: 'afternoonIssued',
  afternoonEnding: 'afternoonEnding',
  eveningBeginning: 'eveningBeginning',
  eveningReceived: 'eveningReceived',
  eveningIssued: 'eveningIssued',
  eveningEnding: 'eveningEnding',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  materialId: 'materialId'
};

exports.Prisma.MaterialScalarFieldEnum = {
  id: 'id',
  name: 'name',
  isActive: 'isActive',
  isOnFood: 'isOnFood',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  reportType: 'reportType'
};

exports.Prisma.FeedbackScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  description: 'description',
  priority: 'priority',
  category: 'category',
  rating: 'rating',
  image: 'image',
  note: 'note',
  isAnonymous: 'isAnonymous',
  status: 'status',
  response: 'response',
  stars: 'stars',
  branch: 'branch',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  computerId: 'computerId'
};

exports.Prisma.FnetHistoryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  branch: 'branch',
  oldSubMoney: 'oldSubMoney',
  newSubMoney: 'newSubMoney',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  targetId: 'targetId',
  type: 'type',
  moneyType: 'moneyType',
  oldMainMoney: 'oldMainMoney',
  newMainMoney: 'newMainMoney'
};

exports.Prisma.PromotionRewardScalarFieldEnum = {
  id: 'id',
  name: 'name',
  value: 'value',
  branch: 'branch',
  quantity: 'quantity',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  starsValue: 'starsValue'
};

exports.Prisma.GameAppointmentTierScalarFieldEnum = {
  id: 'id',
  tierName: 'tierName',
  minMembers: 'minMembers',
  minHours: 'minHours',
  isActive: 'isActive',
  createdAt: 'createdAt',
  lockedAmount: 'lockedAmount',
  maxMembers: 'maxMembers',
  questName: 'questName',
  tasks: 'tasks',
  updatedAt: 'updatedAt'
};

exports.Prisma.GameAppointmentScalarFieldEnum = {
  id: 'id',
  creatorId: 'creatorId',
  branch: 'branch',
  title: 'title',
  description: 'description',
  game: 'game',
  gameType: 'gameType',
  rankLevel: 'rankLevel',
  startTime: 'startTime',
  endTime: 'endTime',
  minMembers: 'minMembers',
  maxMembers: 'maxMembers',
  minCost: 'minCost',
  currentMembers: 'currentMembers',
  status: 'status',
  totalLockedAmount: 'totalLockedAmount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  tierId: 'tierId'
};

exports.Prisma.GameAppointmentMemberScalarFieldEnum = {
  id: 'id',
  appointmentId: 'appointmentId',
  userId: 'userId',
  branch: 'branch',
  lockedAmount: 'lockedAmount',
  status: 'status',
  joinedAt: 'joinedAt',
  completedAt: 'completedAt',
  machineGroupId: 'machineGroupId',
  machineName: 'machineName'
};

exports.Prisma.GameAppointmentRewardScalarFieldEnum = {
  id: 'id',
  appointmentId: 'appointmentId',
  userId: 'userId',
  branch: 'branch',
  status: 'status',
  distributedAt: 'distributedAt',
  createdAt: 'createdAt',
  rewardAmount: 'rewardAmount',
  taskId: 'taskId',
  taskName: 'taskName'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  type: 'type',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  registrationStart: 'registrationStart',
  registrationEnd: 'registrationEnd',
  targetAudience: 'targetAudience',
  conditions: 'conditions',
  rules: 'rules',
  budget: 'budget',
  expectedParticipants: 'expectedParticipants',
  totalParticipants: 'totalParticipants',
  totalCodesGenerated: 'totalCodesGenerated',
  totalCodesUsed: 'totalCodesUsed',
  totalRewardsDistributed: 'totalRewardsDistributed',
  createdBy: 'createdBy',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  branch: 'branch',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  generateCodesAhead: 'generateCodesAhead'
};

exports.Prisma.EventParticipantScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  userId: 'userId',
  branch: 'branch',
  status: 'status',
  registeredAt: 'registeredAt',
  participatedAt: 'participatedAt',
  completedAt: 'completedAt',
  participationData: 'participationData',
  rewardsReceived: 'rewardsReceived',
  totalSpent: 'totalSpent'
};

exports.Prisma.EventRewardScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  name: 'name',
  description: 'description',
  rewardType: 'rewardType',
  rewardConfig: 'rewardConfig',
  conditions: 'conditions',
  eligibility: 'eligibility',
  maxQuantity: 'maxQuantity',
  used: 'used',
  maxPerUser: 'maxPerUser',
  maxPerDay: 'maxPerDay',
  validFrom: 'validFrom',
  validTo: 'validTo',
  priority: 'priority',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventReportScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  reportType: 'reportType',
  reportDate: 'reportDate',
  data: 'data',
  createdAt: 'createdAt'
};

exports.Prisma.FfoodCredentialScalarFieldEnum = {
  id: 'id',
  ffoodUrl: 'ffoodUrl',
  username: 'username',
  password: 'password',
  token: 'token',
  expired: 'expired',
  branch: 'branch',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  shopId: 'shopId'
};

exports.Prisma.MomoCredentialScalarFieldEnum = {
  id: 'id',
  store_id: 'store_id',
  momoUrl: 'momoUrl',
  username: 'username',
  password: 'password',
  token: 'token',
  expired: 'expired',
  branch: 'branch',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  merchant_id: 'merchant_id'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.MissionType = exports.$Enums.MissionType = {
  HOURS: 'HOURS',
  ORDER: 'ORDER',
  TOPUP: 'TOPUP'
};

exports.UserRewardMapStatus = exports.$Enums.UserRewardMapStatus = {
  INITIAL: 'INITIAL',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT'
};

exports.UserRewardMap_type = exports.$Enums.UserRewardMap_type = {
  STARS: 'STARS',
  EVENT: 'EVENT'
};

exports.UserStarHistoryType = exports.$Enums.UserStarHistoryType = {
  CHECK_IN: 'CHECK_IN',
  MISSION: 'MISSION',
  REWARD: 'REWARD',
  GAME: 'GAME',
  RETURN_GIFT: 'RETURN_GIFT',
  GIFT_ROUND: 'GIFT_ROUND',
  FEEDBACK: 'FEEDBACK',
  BATTLE_PASS: 'BATTLE_PASS'
};

exports.Staff_gender = exports.$Enums.Staff_gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
};

exports.Staff_staffType = exports.$Enums.Staff_staffType = {
  STAFF: 'STAFF',
  KITCHEN: 'KITCHEN',
  SECURITY: 'SECURITY',
  CASHIER: 'CASHIER',
  MANAGER: 'MANAGER',
  SUPER_ADMIN: 'SUPER_ADMIN',
  BRANCH_ADMIN: 'BRANCH_ADMIN'
};

exports.ShiftRevenueType = exports.$Enums.ShiftRevenueType = {
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
  EVENING: 'EVENING'
};

exports.DeviceStatus = exports.$Enums.DeviceStatus = {
  GOOD: 'GOOD',
  DAMAGED_BUT_USABLE: 'DAMAGED_BUT_USABLE',
  COMPLETELY_DAMAGED: 'COMPLETELY_DAMAGED'
};

exports.PromotionType = exports.$Enums.PromotionType = {
  BATTLE_PASS: 'BATTLE_PASS',
  VOUCHER: 'VOUCHER',
  TOPUP: 'TOPUP'
};

exports.DiscountType = exports.$Enums.DiscountType = {
  PERCENT: 'PERCENT',
  FIXED: 'FIXED'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

exports.BirthdayTransactionType = exports.$Enums.BirthdayTransactionType = {
  TOPUP: 'TOPUP',
  BONUS: 'BONUS',
  FREE_SPIN: 'FREE_SPIN'
};

exports.ReportDetailType = exports.$Enums.ReportDetailType = {
  GIO: 'GIO',
  DICH_VU: 'DICH_VU',
  MOMO: 'MOMO',
  CHI: 'CHI',
  TONG: 'TONG'
};

exports.Shift = exports.$Enums.Shift = {
  SANG: 'SANG',
  CHIEU: 'CHIEU',
  TOI: 'TOI'
};

exports.HandoverReportType = exports.$Enums.HandoverReportType = {
  BAO_CAO_BEP: 'BAO_CAO_BEP',
  BAO_CAO_NUOC: 'BAO_CAO_NUOC'
};

exports.FeedbackType = exports.$Enums.FeedbackType = {
  IMPROVEMENT: 'IMPROVEMENT',
  BUG_REPORT: 'BUG_REPORT',
  FEATURE_REQUEST: 'FEATURE_REQUEST',
  GENERAL: 'GENERAL'
};

exports.FeedbackStatus = exports.$Enums.FeedbackStatus = {
  SUBMITTED: 'SUBMITTED',
  RECEIVED: 'RECEIVED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED'
};

exports.EventType = exports.$Enums.EventType = {
  NEW_USER_WELCOME: 'NEW_USER_WELCOME',
  BIRTHDAY_EVENT: 'BIRTHDAY_EVENT',
  HOLIDAY_EVENT: 'HOLIDAY_EVENT',
  SEASONAL_EVENT: 'SEASONAL_EVENT',
  BATTLE_PASS_EVENT: 'BATTLE_PASS_EVENT',
  LUCKY_WHEEL_EVENT: 'LUCKY_WHEEL_EVENT',
  GAME_TOURNAMENT: 'GAME_TOURNAMENT',
  REFERRAL_PROGRAM: 'REFERRAL_PROGRAM',
  LOYALTY_PROGRAM: 'LOYALTY_PROGRAM',
  PROMOTIONAL_CAMPAIGN: 'PROMOTIONAL_CAMPAIGN'
};

exports.EventStatus = exports.$Enums.EventStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.ParticipantStatus = exports.$Enums.ParticipantStatus = {
  REGISTERED: 'REGISTERED',
  PARTICIPATING: 'PARTICIPATING',
  COMPLETED: 'COMPLETED',
  DISQUALIFIED: 'DISQUALIFIED',
  WITHDRAWN: 'WITHDRAWN'
};

exports.RewardType = exports.$Enums.RewardType = {
  PERCENTAGE_DISCOUNT: 'PERCENTAGE_DISCOUNT',
  FIXED_DISCOUNT: 'FIXED_DISCOUNT',
  FREE_ITEM: 'FREE_ITEM',
  BONUS_ITEM: 'BONUS_ITEM',
  CASH_BACK: 'CASH_BACK',
  MULTIPLIER: 'MULTIPLIER',
  CONDITIONAL_REWARD: 'CONDITIONAL_REWARD',
  MAIN_ACCOUNT_TOPUP: 'MAIN_ACCOUNT_TOPUP',
  TOPUP_BONUS_PERCENTAGE: 'TOPUP_BONUS_PERCENTAGE'
};

exports.Prisma.ModelName = {
  Rank: 'Rank',
  Game: 'Game',
  CheckInResult: 'CheckInResult',
  CheckInItem: 'CheckInItem',
  CheckInPromotion: 'CheckInPromotion',
  Item: 'Item',
  GameItemMap: 'GameItemMap',
  GameResult: 'GameResult',
  User: 'User',
  Mission: 'Mission',
  UserMissionCompletion: 'UserMissionCompletion',
  UserRewardMap: 'UserRewardMap',
  Reward: 'Reward',
  PromotionCode: 'PromotionCode',
  UserStarHistory: 'UserStarHistory',
  SavingPlan: 'SavingPlan',
  Computer: 'Computer',
  Staff: 'Staff',
  StaffTimeTracking: 'StaffTimeTracking',
  WorkShift: 'WorkShift',
  WorkShiftRevenueReport: 'WorkShiftRevenueReport',
  FraudLoginAlert: 'FraudLoginAlert',
  StaffSalary: 'StaffSalary',
  StaffBonus: 'StaffBonus',
  StaffPenalty: 'StaffPenalty',
  ManagerIncomeExpense: 'ManagerIncomeExpense',
  GiftRound: 'GiftRound',
  Device: 'Device',
  DeviceHistory: 'DeviceHistory',
  BattlePassSeason: 'BattlePassSeason',
  BattlePassReward: 'BattlePassReward',
  UserBattlePass: 'UserBattlePass',
  UserBattlePassReward: 'UserBattlePassReward',
  BattlePassPremiumPackage: 'BattlePassPremiumPackage',
  PromotionSetting: 'PromotionSetting',
  BattlePassPremiumOrder: 'BattlePassPremiumOrder',
  ChatMessage: 'ChatMessage',
  BirthdayTier: 'BirthdayTier',
  UserBirthdayProgress: 'UserBirthdayProgress',
  BirthdayTransaction: 'BirthdayTransaction',
  ReportDetail: 'ReportDetail',
  Report: 'Report',
  HandoverReport: 'HandoverReport',
  HandoverMaterial: 'HandoverMaterial',
  Material: 'Material',
  Feedback: 'Feedback',
  FnetHistory: 'FnetHistory',
  PromotionReward: 'PromotionReward',
  GameAppointmentTier: 'GameAppointmentTier',
  GameAppointment: 'GameAppointment',
  GameAppointmentMember: 'GameAppointmentMember',
  GameAppointmentReward: 'GameAppointmentReward',
  Event: 'Event',
  EventParticipant: 'EventParticipant',
  EventReward: 'EventReward',
  EventReport: 'EventReport',
  FfoodCredential: 'FfoodCredential',
  MomoCredential: 'MomoCredential'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
