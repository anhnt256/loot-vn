
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

exports.Prisma.UserMissionMapScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  missionId: 'missionId',
  branch: 'branch',
  isDone: 'isDone',
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
  branch: 'branch'
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

exports.Prisma.UserRewardMapScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  rewardId: 'rewardId',
  promotionCodeId: 'promotionCodeId',
  duration: 'duration',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isUsed: 'isUsed',
  branch: 'branch'
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
  updatedAt: 'updatedAt'
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

exports.Prisma.FundHistoryScalarFieldEnum = {
  id: 'id',
  date: 'date',
  startValue: 'startValue',
  currentValue: 'currentValue',
  endValue: 'endValue',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserSpendMapScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  branch: 'branch',
  totalSpend: 'totalSpend',
  date: 'date',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Mission_type = exports.$Enums.Mission_type = {
  HOURS: 'HOURS',
  ORDER: 'ORDER',
  COMBO: 'COMBO',
  GAME: 'GAME'
};

exports.UserStarHistory_type = exports.$Enums.UserStarHistory_type = {
  CHECK_IN: 'CHECK_IN',
  MISSION: 'MISSION',
  REWARD: 'REWARD',
  GAME: 'GAME',
  RETURN_GIFT: 'RETURN_GIFT'
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
  UserMissionMap: 'UserMissionMap',
  User: 'User',
  Mission: 'Mission',
  UserRewardMap: 'UserRewardMap',
  Reward: 'Reward',
  PromotionCode: 'PromotionCode',
  UserStarHistory: 'UserStarHistory',
  SavingPlan: 'SavingPlan',
  Computer: 'Computer',
  FundHistory: 'FundHistory',
  UserSpendMap: 'UserSpendMap'
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
