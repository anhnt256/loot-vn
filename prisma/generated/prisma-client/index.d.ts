
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Rank
 * 
 */
export type Rank = $Result.DefaultSelection<Prisma.$RankPayload>
/**
 * Model Game
 * 
 */
export type Game = $Result.DefaultSelection<Prisma.$GamePayload>
/**
 * Model CheckInResult
 * 
 */
export type CheckInResult = $Result.DefaultSelection<Prisma.$CheckInResultPayload>
/**
 * Model CheckInItem
 * 
 */
export type CheckInItem = $Result.DefaultSelection<Prisma.$CheckInItemPayload>
/**
 * Model CheckInPromotion
 * 
 */
export type CheckInPromotion = $Result.DefaultSelection<Prisma.$CheckInPromotionPayload>
/**
 * Model Item
 * 
 */
export type Item = $Result.DefaultSelection<Prisma.$ItemPayload>
/**
 * Model GameItemMap
 * 
 */
export type GameItemMap = $Result.DefaultSelection<Prisma.$GameItemMapPayload>
/**
 * Model GameResult
 * 
 */
export type GameResult = $Result.DefaultSelection<Prisma.$GameResultPayload>
/**
 * Model UserMissionMap
 * 
 */
export type UserMissionMap = $Result.DefaultSelection<Prisma.$UserMissionMapPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Mission
 * 
 */
export type Mission = $Result.DefaultSelection<Prisma.$MissionPayload>
/**
 * Model UserRewardMap
 * 
 */
export type UserRewardMap = $Result.DefaultSelection<Prisma.$UserRewardMapPayload>
/**
 * Model Reward
 * 
 */
export type Reward = $Result.DefaultSelection<Prisma.$RewardPayload>
/**
 * Model PromotionCode
 * 
 */
export type PromotionCode = $Result.DefaultSelection<Prisma.$PromotionCodePayload>
/**
 * Model UserStarHistory
 * 
 */
export type UserStarHistory = $Result.DefaultSelection<Prisma.$UserStarHistoryPayload>
/**
 * Model SavingPlan
 * 
 */
export type SavingPlan = $Result.DefaultSelection<Prisma.$SavingPlanPayload>
/**
 * Model Computer
 * 
 */
export type Computer = $Result.DefaultSelection<Prisma.$ComputerPayload>
/**
 * Model FundHistory
 * 
 */
export type FundHistory = $Result.DefaultSelection<Prisma.$FundHistoryPayload>
/**
 * Model UserSpendMap
 * 
 */
export type UserSpendMap = $Result.DefaultSelection<Prisma.$UserSpendMapPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Mission_type: {
  HOURS: 'HOURS',
  ORDER: 'ORDER',
  COMBO: 'COMBO',
  GAME: 'GAME'
};

export type Mission_type = (typeof Mission_type)[keyof typeof Mission_type]


export const UserStarHistory_type: {
  CHECK_IN: 'CHECK_IN',
  MISSION: 'MISSION',
  REWARD: 'REWARD',
  GAME: 'GAME',
  RETURN_GIFT: 'RETURN_GIFT'
};

export type UserStarHistory_type = (typeof UserStarHistory_type)[keyof typeof UserStarHistory_type]

}

export type Mission_type = $Enums.Mission_type

export const Mission_type: typeof $Enums.Mission_type

export type UserStarHistory_type = $Enums.UserStarHistory_type

export const UserStarHistory_type: typeof $Enums.UserStarHistory_type

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Ranks
 * const ranks = await prisma.rank.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Ranks
   * const ranks = await prisma.rank.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.rank`: Exposes CRUD operations for the **Rank** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ranks
    * const ranks = await prisma.rank.findMany()
    * ```
    */
  get rank(): Prisma.RankDelegate<ExtArgs>;

  /**
   * `prisma.game`: Exposes CRUD operations for the **Game** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Games
    * const games = await prisma.game.findMany()
    * ```
    */
  get game(): Prisma.GameDelegate<ExtArgs>;

  /**
   * `prisma.checkInResult`: Exposes CRUD operations for the **CheckInResult** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CheckInResults
    * const checkInResults = await prisma.checkInResult.findMany()
    * ```
    */
  get checkInResult(): Prisma.CheckInResultDelegate<ExtArgs>;

  /**
   * `prisma.checkInItem`: Exposes CRUD operations for the **CheckInItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CheckInItems
    * const checkInItems = await prisma.checkInItem.findMany()
    * ```
    */
  get checkInItem(): Prisma.CheckInItemDelegate<ExtArgs>;

  /**
   * `prisma.checkInPromotion`: Exposes CRUD operations for the **CheckInPromotion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CheckInPromotions
    * const checkInPromotions = await prisma.checkInPromotion.findMany()
    * ```
    */
  get checkInPromotion(): Prisma.CheckInPromotionDelegate<ExtArgs>;

  /**
   * `prisma.item`: Exposes CRUD operations for the **Item** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Items
    * const items = await prisma.item.findMany()
    * ```
    */
  get item(): Prisma.ItemDelegate<ExtArgs>;

  /**
   * `prisma.gameItemMap`: Exposes CRUD operations for the **GameItemMap** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GameItemMaps
    * const gameItemMaps = await prisma.gameItemMap.findMany()
    * ```
    */
  get gameItemMap(): Prisma.GameItemMapDelegate<ExtArgs>;

  /**
   * `prisma.gameResult`: Exposes CRUD operations for the **GameResult** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GameResults
    * const gameResults = await prisma.gameResult.findMany()
    * ```
    */
  get gameResult(): Prisma.GameResultDelegate<ExtArgs>;

  /**
   * `prisma.userMissionMap`: Exposes CRUD operations for the **UserMissionMap** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserMissionMaps
    * const userMissionMaps = await prisma.userMissionMap.findMany()
    * ```
    */
  get userMissionMap(): Prisma.UserMissionMapDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.mission`: Exposes CRUD operations for the **Mission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Missions
    * const missions = await prisma.mission.findMany()
    * ```
    */
  get mission(): Prisma.MissionDelegate<ExtArgs>;

  /**
   * `prisma.userRewardMap`: Exposes CRUD operations for the **UserRewardMap** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserRewardMaps
    * const userRewardMaps = await prisma.userRewardMap.findMany()
    * ```
    */
  get userRewardMap(): Prisma.UserRewardMapDelegate<ExtArgs>;

  /**
   * `prisma.reward`: Exposes CRUD operations for the **Reward** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Rewards
    * const rewards = await prisma.reward.findMany()
    * ```
    */
  get reward(): Prisma.RewardDelegate<ExtArgs>;

  /**
   * `prisma.promotionCode`: Exposes CRUD operations for the **PromotionCode** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PromotionCodes
    * const promotionCodes = await prisma.promotionCode.findMany()
    * ```
    */
  get promotionCode(): Prisma.PromotionCodeDelegate<ExtArgs>;

  /**
   * `prisma.userStarHistory`: Exposes CRUD operations for the **UserStarHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserStarHistories
    * const userStarHistories = await prisma.userStarHistory.findMany()
    * ```
    */
  get userStarHistory(): Prisma.UserStarHistoryDelegate<ExtArgs>;

  /**
   * `prisma.savingPlan`: Exposes CRUD operations for the **SavingPlan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SavingPlans
    * const savingPlans = await prisma.savingPlan.findMany()
    * ```
    */
  get savingPlan(): Prisma.SavingPlanDelegate<ExtArgs>;

  /**
   * `prisma.computer`: Exposes CRUD operations for the **Computer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Computers
    * const computers = await prisma.computer.findMany()
    * ```
    */
  get computer(): Prisma.ComputerDelegate<ExtArgs>;

  /**
   * `prisma.fundHistory`: Exposes CRUD operations for the **FundHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FundHistories
    * const fundHistories = await prisma.fundHistory.findMany()
    * ```
    */
  get fundHistory(): Prisma.FundHistoryDelegate<ExtArgs>;

  /**
   * `prisma.userSpendMap`: Exposes CRUD operations for the **UserSpendMap** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserSpendMaps
    * const userSpendMaps = await prisma.userSpendMap.findMany()
    * ```
    */
  get userSpendMap(): Prisma.UserSpendMapDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "rank" | "game" | "checkInResult" | "checkInItem" | "checkInPromotion" | "item" | "gameItemMap" | "gameResult" | "userMissionMap" | "user" | "mission" | "userRewardMap" | "reward" | "promotionCode" | "userStarHistory" | "savingPlan" | "computer" | "fundHistory" | "userSpendMap"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Rank: {
        payload: Prisma.$RankPayload<ExtArgs>
        fields: Prisma.RankFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RankFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RankFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankPayload>
          }
          findFirst: {
            args: Prisma.RankFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RankFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankPayload>
          }
          findMany: {
            args: Prisma.RankFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankPayload>[]
          }
          create: {
            args: Prisma.RankCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankPayload>
          }
          createMany: {
            args: Prisma.RankCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.RankDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankPayload>
          }
          update: {
            args: Prisma.RankUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankPayload>
          }
          deleteMany: {
            args: Prisma.RankDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RankUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RankUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankPayload>
          }
          aggregate: {
            args: Prisma.RankAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRank>
          }
          groupBy: {
            args: Prisma.RankGroupByArgs<ExtArgs>
            result: $Utils.Optional<RankGroupByOutputType>[]
          }
          count: {
            args: Prisma.RankCountArgs<ExtArgs>
            result: $Utils.Optional<RankCountAggregateOutputType> | number
          }
        }
      }
      Game: {
        payload: Prisma.$GamePayload<ExtArgs>
        fields: Prisma.GameFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GameFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GameFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          findFirst: {
            args: Prisma.GameFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GameFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          findMany: {
            args: Prisma.GameFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>[]
          }
          create: {
            args: Prisma.GameCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          createMany: {
            args: Prisma.GameCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GameDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          update: {
            args: Prisma.GameUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          deleteMany: {
            args: Prisma.GameDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GameUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GameUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          aggregate: {
            args: Prisma.GameAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGame>
          }
          groupBy: {
            args: Prisma.GameGroupByArgs<ExtArgs>
            result: $Utils.Optional<GameGroupByOutputType>[]
          }
          count: {
            args: Prisma.GameCountArgs<ExtArgs>
            result: $Utils.Optional<GameCountAggregateOutputType> | number
          }
        }
      }
      CheckInResult: {
        payload: Prisma.$CheckInResultPayload<ExtArgs>
        fields: Prisma.CheckInResultFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CheckInResultFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInResultPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CheckInResultFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInResultPayload>
          }
          findFirst: {
            args: Prisma.CheckInResultFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInResultPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CheckInResultFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInResultPayload>
          }
          findMany: {
            args: Prisma.CheckInResultFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInResultPayload>[]
          }
          create: {
            args: Prisma.CheckInResultCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInResultPayload>
          }
          createMany: {
            args: Prisma.CheckInResultCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CheckInResultDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInResultPayload>
          }
          update: {
            args: Prisma.CheckInResultUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInResultPayload>
          }
          deleteMany: {
            args: Prisma.CheckInResultDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CheckInResultUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CheckInResultUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInResultPayload>
          }
          aggregate: {
            args: Prisma.CheckInResultAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCheckInResult>
          }
          groupBy: {
            args: Prisma.CheckInResultGroupByArgs<ExtArgs>
            result: $Utils.Optional<CheckInResultGroupByOutputType>[]
          }
          count: {
            args: Prisma.CheckInResultCountArgs<ExtArgs>
            result: $Utils.Optional<CheckInResultCountAggregateOutputType> | number
          }
        }
      }
      CheckInItem: {
        payload: Prisma.$CheckInItemPayload<ExtArgs>
        fields: Prisma.CheckInItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CheckInItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CheckInItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInItemPayload>
          }
          findFirst: {
            args: Prisma.CheckInItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CheckInItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInItemPayload>
          }
          findMany: {
            args: Prisma.CheckInItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInItemPayload>[]
          }
          create: {
            args: Prisma.CheckInItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInItemPayload>
          }
          createMany: {
            args: Prisma.CheckInItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CheckInItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInItemPayload>
          }
          update: {
            args: Prisma.CheckInItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInItemPayload>
          }
          deleteMany: {
            args: Prisma.CheckInItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CheckInItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CheckInItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInItemPayload>
          }
          aggregate: {
            args: Prisma.CheckInItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCheckInItem>
          }
          groupBy: {
            args: Prisma.CheckInItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<CheckInItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.CheckInItemCountArgs<ExtArgs>
            result: $Utils.Optional<CheckInItemCountAggregateOutputType> | number
          }
        }
      }
      CheckInPromotion: {
        payload: Prisma.$CheckInPromotionPayload<ExtArgs>
        fields: Prisma.CheckInPromotionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CheckInPromotionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInPromotionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CheckInPromotionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInPromotionPayload>
          }
          findFirst: {
            args: Prisma.CheckInPromotionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInPromotionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CheckInPromotionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInPromotionPayload>
          }
          findMany: {
            args: Prisma.CheckInPromotionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInPromotionPayload>[]
          }
          create: {
            args: Prisma.CheckInPromotionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInPromotionPayload>
          }
          createMany: {
            args: Prisma.CheckInPromotionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CheckInPromotionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInPromotionPayload>
          }
          update: {
            args: Prisma.CheckInPromotionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInPromotionPayload>
          }
          deleteMany: {
            args: Prisma.CheckInPromotionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CheckInPromotionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CheckInPromotionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CheckInPromotionPayload>
          }
          aggregate: {
            args: Prisma.CheckInPromotionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCheckInPromotion>
          }
          groupBy: {
            args: Prisma.CheckInPromotionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CheckInPromotionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CheckInPromotionCountArgs<ExtArgs>
            result: $Utils.Optional<CheckInPromotionCountAggregateOutputType> | number
          }
        }
      }
      Item: {
        payload: Prisma.$ItemPayload<ExtArgs>
        fields: Prisma.ItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemPayload>
          }
          findFirst: {
            args: Prisma.ItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemPayload>
          }
          findMany: {
            args: Prisma.ItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemPayload>[]
          }
          create: {
            args: Prisma.ItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemPayload>
          }
          createMany: {
            args: Prisma.ItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemPayload>
          }
          update: {
            args: Prisma.ItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemPayload>
          }
          deleteMany: {
            args: Prisma.ItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemPayload>
          }
          aggregate: {
            args: Prisma.ItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateItem>
          }
          groupBy: {
            args: Prisma.ItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<ItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.ItemCountArgs<ExtArgs>
            result: $Utils.Optional<ItemCountAggregateOutputType> | number
          }
        }
      }
      GameItemMap: {
        payload: Prisma.$GameItemMapPayload<ExtArgs>
        fields: Prisma.GameItemMapFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GameItemMapFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameItemMapPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GameItemMapFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameItemMapPayload>
          }
          findFirst: {
            args: Prisma.GameItemMapFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameItemMapPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GameItemMapFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameItemMapPayload>
          }
          findMany: {
            args: Prisma.GameItemMapFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameItemMapPayload>[]
          }
          create: {
            args: Prisma.GameItemMapCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameItemMapPayload>
          }
          createMany: {
            args: Prisma.GameItemMapCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GameItemMapDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameItemMapPayload>
          }
          update: {
            args: Prisma.GameItemMapUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameItemMapPayload>
          }
          deleteMany: {
            args: Prisma.GameItemMapDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GameItemMapUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GameItemMapUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameItemMapPayload>
          }
          aggregate: {
            args: Prisma.GameItemMapAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGameItemMap>
          }
          groupBy: {
            args: Prisma.GameItemMapGroupByArgs<ExtArgs>
            result: $Utils.Optional<GameItemMapGroupByOutputType>[]
          }
          count: {
            args: Prisma.GameItemMapCountArgs<ExtArgs>
            result: $Utils.Optional<GameItemMapCountAggregateOutputType> | number
          }
        }
      }
      GameResult: {
        payload: Prisma.$GameResultPayload<ExtArgs>
        fields: Prisma.GameResultFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GameResultFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GameResultFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          findFirst: {
            args: Prisma.GameResultFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GameResultFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          findMany: {
            args: Prisma.GameResultFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>[]
          }
          create: {
            args: Prisma.GameResultCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          createMany: {
            args: Prisma.GameResultCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GameResultDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          update: {
            args: Prisma.GameResultUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          deleteMany: {
            args: Prisma.GameResultDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GameResultUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GameResultUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameResultPayload>
          }
          aggregate: {
            args: Prisma.GameResultAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGameResult>
          }
          groupBy: {
            args: Prisma.GameResultGroupByArgs<ExtArgs>
            result: $Utils.Optional<GameResultGroupByOutputType>[]
          }
          count: {
            args: Prisma.GameResultCountArgs<ExtArgs>
            result: $Utils.Optional<GameResultCountAggregateOutputType> | number
          }
        }
      }
      UserMissionMap: {
        payload: Prisma.$UserMissionMapPayload<ExtArgs>
        fields: Prisma.UserMissionMapFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserMissionMapFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMissionMapPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserMissionMapFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMissionMapPayload>
          }
          findFirst: {
            args: Prisma.UserMissionMapFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMissionMapPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserMissionMapFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMissionMapPayload>
          }
          findMany: {
            args: Prisma.UserMissionMapFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMissionMapPayload>[]
          }
          create: {
            args: Prisma.UserMissionMapCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMissionMapPayload>
          }
          createMany: {
            args: Prisma.UserMissionMapCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserMissionMapDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMissionMapPayload>
          }
          update: {
            args: Prisma.UserMissionMapUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMissionMapPayload>
          }
          deleteMany: {
            args: Prisma.UserMissionMapDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserMissionMapUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserMissionMapUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMissionMapPayload>
          }
          aggregate: {
            args: Prisma.UserMissionMapAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserMissionMap>
          }
          groupBy: {
            args: Prisma.UserMissionMapGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserMissionMapGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserMissionMapCountArgs<ExtArgs>
            result: $Utils.Optional<UserMissionMapCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Mission: {
        payload: Prisma.$MissionPayload<ExtArgs>
        fields: Prisma.MissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionPayload>
          }
          findFirst: {
            args: Prisma.MissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionPayload>
          }
          findMany: {
            args: Prisma.MissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionPayload>[]
          }
          create: {
            args: Prisma.MissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionPayload>
          }
          createMany: {
            args: Prisma.MissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.MissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionPayload>
          }
          update: {
            args: Prisma.MissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionPayload>
          }
          deleteMany: {
            args: Prisma.MissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionPayload>
          }
          aggregate: {
            args: Prisma.MissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMission>
          }
          groupBy: {
            args: Prisma.MissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<MissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.MissionCountArgs<ExtArgs>
            result: $Utils.Optional<MissionCountAggregateOutputType> | number
          }
        }
      }
      UserRewardMap: {
        payload: Prisma.$UserRewardMapPayload<ExtArgs>
        fields: Prisma.UserRewardMapFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserRewardMapFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardMapPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserRewardMapFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardMapPayload>
          }
          findFirst: {
            args: Prisma.UserRewardMapFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardMapPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserRewardMapFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardMapPayload>
          }
          findMany: {
            args: Prisma.UserRewardMapFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardMapPayload>[]
          }
          create: {
            args: Prisma.UserRewardMapCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardMapPayload>
          }
          createMany: {
            args: Prisma.UserRewardMapCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserRewardMapDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardMapPayload>
          }
          update: {
            args: Prisma.UserRewardMapUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardMapPayload>
          }
          deleteMany: {
            args: Prisma.UserRewardMapDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserRewardMapUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserRewardMapUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardMapPayload>
          }
          aggregate: {
            args: Prisma.UserRewardMapAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserRewardMap>
          }
          groupBy: {
            args: Prisma.UserRewardMapGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserRewardMapGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserRewardMapCountArgs<ExtArgs>
            result: $Utils.Optional<UserRewardMapCountAggregateOutputType> | number
          }
        }
      }
      Reward: {
        payload: Prisma.$RewardPayload<ExtArgs>
        fields: Prisma.RewardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RewardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RewardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          findFirst: {
            args: Prisma.RewardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RewardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          findMany: {
            args: Prisma.RewardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>[]
          }
          create: {
            args: Prisma.RewardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          createMany: {
            args: Prisma.RewardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.RewardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          update: {
            args: Prisma.RewardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          deleteMany: {
            args: Prisma.RewardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RewardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RewardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          aggregate: {
            args: Prisma.RewardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReward>
          }
          groupBy: {
            args: Prisma.RewardGroupByArgs<ExtArgs>
            result: $Utils.Optional<RewardGroupByOutputType>[]
          }
          count: {
            args: Prisma.RewardCountArgs<ExtArgs>
            result: $Utils.Optional<RewardCountAggregateOutputType> | number
          }
        }
      }
      PromotionCode: {
        payload: Prisma.$PromotionCodePayload<ExtArgs>
        fields: Prisma.PromotionCodeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PromotionCodeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromotionCodePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PromotionCodeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromotionCodePayload>
          }
          findFirst: {
            args: Prisma.PromotionCodeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromotionCodePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PromotionCodeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromotionCodePayload>
          }
          findMany: {
            args: Prisma.PromotionCodeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromotionCodePayload>[]
          }
          create: {
            args: Prisma.PromotionCodeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromotionCodePayload>
          }
          createMany: {
            args: Prisma.PromotionCodeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PromotionCodeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromotionCodePayload>
          }
          update: {
            args: Prisma.PromotionCodeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromotionCodePayload>
          }
          deleteMany: {
            args: Prisma.PromotionCodeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PromotionCodeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PromotionCodeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromotionCodePayload>
          }
          aggregate: {
            args: Prisma.PromotionCodeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePromotionCode>
          }
          groupBy: {
            args: Prisma.PromotionCodeGroupByArgs<ExtArgs>
            result: $Utils.Optional<PromotionCodeGroupByOutputType>[]
          }
          count: {
            args: Prisma.PromotionCodeCountArgs<ExtArgs>
            result: $Utils.Optional<PromotionCodeCountAggregateOutputType> | number
          }
        }
      }
      UserStarHistory: {
        payload: Prisma.$UserStarHistoryPayload<ExtArgs>
        fields: Prisma.UserStarHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserStarHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStarHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserStarHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStarHistoryPayload>
          }
          findFirst: {
            args: Prisma.UserStarHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStarHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserStarHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStarHistoryPayload>
          }
          findMany: {
            args: Prisma.UserStarHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStarHistoryPayload>[]
          }
          create: {
            args: Prisma.UserStarHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStarHistoryPayload>
          }
          createMany: {
            args: Prisma.UserStarHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserStarHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStarHistoryPayload>
          }
          update: {
            args: Prisma.UserStarHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStarHistoryPayload>
          }
          deleteMany: {
            args: Prisma.UserStarHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserStarHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserStarHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStarHistoryPayload>
          }
          aggregate: {
            args: Prisma.UserStarHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserStarHistory>
          }
          groupBy: {
            args: Prisma.UserStarHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserStarHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserStarHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<UserStarHistoryCountAggregateOutputType> | number
          }
        }
      }
      SavingPlan: {
        payload: Prisma.$SavingPlanPayload<ExtArgs>
        fields: Prisma.SavingPlanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SavingPlanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavingPlanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SavingPlanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavingPlanPayload>
          }
          findFirst: {
            args: Prisma.SavingPlanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavingPlanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SavingPlanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavingPlanPayload>
          }
          findMany: {
            args: Prisma.SavingPlanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavingPlanPayload>[]
          }
          create: {
            args: Prisma.SavingPlanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavingPlanPayload>
          }
          createMany: {
            args: Prisma.SavingPlanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.SavingPlanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavingPlanPayload>
          }
          update: {
            args: Prisma.SavingPlanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavingPlanPayload>
          }
          deleteMany: {
            args: Prisma.SavingPlanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SavingPlanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SavingPlanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavingPlanPayload>
          }
          aggregate: {
            args: Prisma.SavingPlanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSavingPlan>
          }
          groupBy: {
            args: Prisma.SavingPlanGroupByArgs<ExtArgs>
            result: $Utils.Optional<SavingPlanGroupByOutputType>[]
          }
          count: {
            args: Prisma.SavingPlanCountArgs<ExtArgs>
            result: $Utils.Optional<SavingPlanCountAggregateOutputType> | number
          }
        }
      }
      Computer: {
        payload: Prisma.$ComputerPayload<ExtArgs>
        fields: Prisma.ComputerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ComputerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComputerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ComputerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComputerPayload>
          }
          findFirst: {
            args: Prisma.ComputerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComputerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ComputerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComputerPayload>
          }
          findMany: {
            args: Prisma.ComputerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComputerPayload>[]
          }
          create: {
            args: Prisma.ComputerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComputerPayload>
          }
          createMany: {
            args: Prisma.ComputerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ComputerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComputerPayload>
          }
          update: {
            args: Prisma.ComputerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComputerPayload>
          }
          deleteMany: {
            args: Prisma.ComputerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ComputerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ComputerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComputerPayload>
          }
          aggregate: {
            args: Prisma.ComputerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateComputer>
          }
          groupBy: {
            args: Prisma.ComputerGroupByArgs<ExtArgs>
            result: $Utils.Optional<ComputerGroupByOutputType>[]
          }
          count: {
            args: Prisma.ComputerCountArgs<ExtArgs>
            result: $Utils.Optional<ComputerCountAggregateOutputType> | number
          }
        }
      }
      FundHistory: {
        payload: Prisma.$FundHistoryPayload<ExtArgs>
        fields: Prisma.FundHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FundHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FundHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FundHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FundHistoryPayload>
          }
          findFirst: {
            args: Prisma.FundHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FundHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FundHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FundHistoryPayload>
          }
          findMany: {
            args: Prisma.FundHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FundHistoryPayload>[]
          }
          create: {
            args: Prisma.FundHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FundHistoryPayload>
          }
          createMany: {
            args: Prisma.FundHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.FundHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FundHistoryPayload>
          }
          update: {
            args: Prisma.FundHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FundHistoryPayload>
          }
          deleteMany: {
            args: Prisma.FundHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FundHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FundHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FundHistoryPayload>
          }
          aggregate: {
            args: Prisma.FundHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFundHistory>
          }
          groupBy: {
            args: Prisma.FundHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<FundHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.FundHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<FundHistoryCountAggregateOutputType> | number
          }
        }
      }
      UserSpendMap: {
        payload: Prisma.$UserSpendMapPayload<ExtArgs>
        fields: Prisma.UserSpendMapFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserSpendMapFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSpendMapPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserSpendMapFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSpendMapPayload>
          }
          findFirst: {
            args: Prisma.UserSpendMapFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSpendMapPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserSpendMapFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSpendMapPayload>
          }
          findMany: {
            args: Prisma.UserSpendMapFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSpendMapPayload>[]
          }
          create: {
            args: Prisma.UserSpendMapCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSpendMapPayload>
          }
          createMany: {
            args: Prisma.UserSpendMapCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserSpendMapDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSpendMapPayload>
          }
          update: {
            args: Prisma.UserSpendMapUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSpendMapPayload>
          }
          deleteMany: {
            args: Prisma.UserSpendMapDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserSpendMapUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserSpendMapUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSpendMapPayload>
          }
          aggregate: {
            args: Prisma.UserSpendMapAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserSpendMap>
          }
          groupBy: {
            args: Prisma.UserSpendMapGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserSpendMapGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserSpendMapCountArgs<ExtArgs>
            result: $Utils.Optional<UserSpendMapCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type GameResultCountOutputType
   */

  export type GameResultCountOutputType = {
    userStarHistory: number
  }

  export type GameResultCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userStarHistory?: boolean | GameResultCountOutputTypeCountUserStarHistoryArgs
  }

  // Custom InputTypes
  /**
   * GameResultCountOutputType without action
   */
  export type GameResultCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResultCountOutputType
     */
    select?: GameResultCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GameResultCountOutputType without action
   */
  export type GameResultCountOutputTypeCountUserStarHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserStarHistoryWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    UserRewardMap: number
    UserMissionMap: number
    GameResults: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserRewardMap?: boolean | UserCountOutputTypeCountUserRewardMapArgs
    UserMissionMap?: boolean | UserCountOutputTypeCountUserMissionMapArgs
    GameResults?: boolean | UserCountOutputTypeCountGameResultsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserRewardMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRewardMapWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserMissionMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserMissionMapWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountGameResultsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameResultWhereInput
  }


  /**
   * Count Type MissionCountOutputType
   */

  export type MissionCountOutputType = {
    UserMissionMap: number
  }

  export type MissionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserMissionMap?: boolean | MissionCountOutputTypeCountUserMissionMapArgs
  }

  // Custom InputTypes
  /**
   * MissionCountOutputType without action
   */
  export type MissionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionCountOutputType
     */
    select?: MissionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MissionCountOutputType without action
   */
  export type MissionCountOutputTypeCountUserMissionMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserMissionMapWhereInput
  }


  /**
   * Count Type RewardCountOutputType
   */

  export type RewardCountOutputType = {
    UserRewardMap: number
  }

  export type RewardCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserRewardMap?: boolean | RewardCountOutputTypeCountUserRewardMapArgs
  }

  // Custom InputTypes
  /**
   * RewardCountOutputType without action
   */
  export type RewardCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RewardCountOutputType
     */
    select?: RewardCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RewardCountOutputType without action
   */
  export type RewardCountOutputTypeCountUserRewardMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRewardMapWhereInput
  }


  /**
   * Count Type PromotionCodeCountOutputType
   */

  export type PromotionCodeCountOutputType = {
    UserRewardMap: number
  }

  export type PromotionCodeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserRewardMap?: boolean | PromotionCodeCountOutputTypeCountUserRewardMapArgs
  }

  // Custom InputTypes
  /**
   * PromotionCodeCountOutputType without action
   */
  export type PromotionCodeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCodeCountOutputType
     */
    select?: PromotionCodeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PromotionCodeCountOutputType without action
   */
  export type PromotionCodeCountOutputTypeCountUserRewardMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRewardMapWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Rank
   */

  export type AggregateRank = {
    _count: RankCountAggregateOutputType | null
    _avg: RankAvgAggregateOutputType | null
    _sum: RankSumAggregateOutputType | null
    _min: RankMinAggregateOutputType | null
    _max: RankMaxAggregateOutputType | null
  }

  export type RankAvgAggregateOutputType = {
    id: number | null
    fromValue: number | null
    toValue: number | null
    discount: number | null
    foodVoucher: number | null
    drinkVoucher: number | null
  }

  export type RankSumAggregateOutputType = {
    id: number | null
    fromValue: number | null
    toValue: number | null
    discount: number | null
    foodVoucher: number | null
    drinkVoucher: number | null
  }

  export type RankMinAggregateOutputType = {
    id: number | null
    name: string | null
    fromValue: number | null
    toValue: number | null
    discount: number | null
    foodVoucher: number | null
    drinkVoucher: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RankMaxAggregateOutputType = {
    id: number | null
    name: string | null
    fromValue: number | null
    toValue: number | null
    discount: number | null
    foodVoucher: number | null
    drinkVoucher: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RankCountAggregateOutputType = {
    id: number
    name: number
    fromValue: number
    toValue: number
    discount: number
    foodVoucher: number
    drinkVoucher: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RankAvgAggregateInputType = {
    id?: true
    fromValue?: true
    toValue?: true
    discount?: true
    foodVoucher?: true
    drinkVoucher?: true
  }

  export type RankSumAggregateInputType = {
    id?: true
    fromValue?: true
    toValue?: true
    discount?: true
    foodVoucher?: true
    drinkVoucher?: true
  }

  export type RankMinAggregateInputType = {
    id?: true
    name?: true
    fromValue?: true
    toValue?: true
    discount?: true
    foodVoucher?: true
    drinkVoucher?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RankMaxAggregateInputType = {
    id?: true
    name?: true
    fromValue?: true
    toValue?: true
    discount?: true
    foodVoucher?: true
    drinkVoucher?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RankCountAggregateInputType = {
    id?: true
    name?: true
    fromValue?: true
    toValue?: true
    discount?: true
    foodVoucher?: true
    drinkVoucher?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RankAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rank to aggregate.
     */
    where?: RankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ranks to fetch.
     */
    orderBy?: RankOrderByWithRelationInput | RankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ranks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ranks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Ranks
    **/
    _count?: true | RankCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RankAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RankSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RankMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RankMaxAggregateInputType
  }

  export type GetRankAggregateType<T extends RankAggregateArgs> = {
        [P in keyof T & keyof AggregateRank]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRank[P]>
      : GetScalarType<T[P], AggregateRank[P]>
  }




  export type RankGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RankWhereInput
    orderBy?: RankOrderByWithAggregationInput | RankOrderByWithAggregationInput[]
    by: RankScalarFieldEnum[] | RankScalarFieldEnum
    having?: RankScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RankCountAggregateInputType | true
    _avg?: RankAvgAggregateInputType
    _sum?: RankSumAggregateInputType
    _min?: RankMinAggregateInputType
    _max?: RankMaxAggregateInputType
  }

  export type RankGroupByOutputType = {
    id: number
    name: string
    fromValue: number
    toValue: number
    discount: number | null
    foodVoucher: number | null
    drinkVoucher: number | null
    createdAt: Date
    updatedAt: Date
    _count: RankCountAggregateOutputType | null
    _avg: RankAvgAggregateOutputType | null
    _sum: RankSumAggregateOutputType | null
    _min: RankMinAggregateOutputType | null
    _max: RankMaxAggregateOutputType | null
  }

  type GetRankGroupByPayload<T extends RankGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RankGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RankGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RankGroupByOutputType[P]>
            : GetScalarType<T[P], RankGroupByOutputType[P]>
        }
      >
    >


  export type RankSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    fromValue?: boolean
    toValue?: boolean
    discount?: boolean
    foodVoucher?: boolean
    drinkVoucher?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["rank"]>


  export type RankSelectScalar = {
    id?: boolean
    name?: boolean
    fromValue?: boolean
    toValue?: boolean
    discount?: boolean
    foodVoucher?: boolean
    drinkVoucher?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $RankPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Rank"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      fromValue: number
      toValue: number
      discount: number | null
      foodVoucher: number | null
      drinkVoucher: number | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["rank"]>
    composites: {}
  }

  type RankGetPayload<S extends boolean | null | undefined | RankDefaultArgs> = $Result.GetResult<Prisma.$RankPayload, S>

  type RankCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RankFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RankCountAggregateInputType | true
    }

  export interface RankDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Rank'], meta: { name: 'Rank' } }
    /**
     * Find zero or one Rank that matches the filter.
     * @param {RankFindUniqueArgs} args - Arguments to find a Rank
     * @example
     * // Get one Rank
     * const rank = await prisma.rank.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RankFindUniqueArgs>(args: SelectSubset<T, RankFindUniqueArgs<ExtArgs>>): Prisma__RankClient<$Result.GetResult<Prisma.$RankPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Rank that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RankFindUniqueOrThrowArgs} args - Arguments to find a Rank
     * @example
     * // Get one Rank
     * const rank = await prisma.rank.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RankFindUniqueOrThrowArgs>(args: SelectSubset<T, RankFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RankClient<$Result.GetResult<Prisma.$RankPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Rank that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankFindFirstArgs} args - Arguments to find a Rank
     * @example
     * // Get one Rank
     * const rank = await prisma.rank.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RankFindFirstArgs>(args?: SelectSubset<T, RankFindFirstArgs<ExtArgs>>): Prisma__RankClient<$Result.GetResult<Prisma.$RankPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Rank that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankFindFirstOrThrowArgs} args - Arguments to find a Rank
     * @example
     * // Get one Rank
     * const rank = await prisma.rank.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RankFindFirstOrThrowArgs>(args?: SelectSubset<T, RankFindFirstOrThrowArgs<ExtArgs>>): Prisma__RankClient<$Result.GetResult<Prisma.$RankPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Ranks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ranks
     * const ranks = await prisma.rank.findMany()
     * 
     * // Get first 10 Ranks
     * const ranks = await prisma.rank.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rankWithIdOnly = await prisma.rank.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RankFindManyArgs>(args?: SelectSubset<T, RankFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RankPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Rank.
     * @param {RankCreateArgs} args - Arguments to create a Rank.
     * @example
     * // Create one Rank
     * const Rank = await prisma.rank.create({
     *   data: {
     *     // ... data to create a Rank
     *   }
     * })
     * 
     */
    create<T extends RankCreateArgs>(args: SelectSubset<T, RankCreateArgs<ExtArgs>>): Prisma__RankClient<$Result.GetResult<Prisma.$RankPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Ranks.
     * @param {RankCreateManyArgs} args - Arguments to create many Ranks.
     * @example
     * // Create many Ranks
     * const rank = await prisma.rank.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RankCreateManyArgs>(args?: SelectSubset<T, RankCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Rank.
     * @param {RankDeleteArgs} args - Arguments to delete one Rank.
     * @example
     * // Delete one Rank
     * const Rank = await prisma.rank.delete({
     *   where: {
     *     // ... filter to delete one Rank
     *   }
     * })
     * 
     */
    delete<T extends RankDeleteArgs>(args: SelectSubset<T, RankDeleteArgs<ExtArgs>>): Prisma__RankClient<$Result.GetResult<Prisma.$RankPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Rank.
     * @param {RankUpdateArgs} args - Arguments to update one Rank.
     * @example
     * // Update one Rank
     * const rank = await prisma.rank.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RankUpdateArgs>(args: SelectSubset<T, RankUpdateArgs<ExtArgs>>): Prisma__RankClient<$Result.GetResult<Prisma.$RankPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Ranks.
     * @param {RankDeleteManyArgs} args - Arguments to filter Ranks to delete.
     * @example
     * // Delete a few Ranks
     * const { count } = await prisma.rank.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RankDeleteManyArgs>(args?: SelectSubset<T, RankDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ranks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ranks
     * const rank = await prisma.rank.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RankUpdateManyArgs>(args: SelectSubset<T, RankUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Rank.
     * @param {RankUpsertArgs} args - Arguments to update or create a Rank.
     * @example
     * // Update or create a Rank
     * const rank = await prisma.rank.upsert({
     *   create: {
     *     // ... data to create a Rank
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Rank we want to update
     *   }
     * })
     */
    upsert<T extends RankUpsertArgs>(args: SelectSubset<T, RankUpsertArgs<ExtArgs>>): Prisma__RankClient<$Result.GetResult<Prisma.$RankPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Ranks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankCountArgs} args - Arguments to filter Ranks to count.
     * @example
     * // Count the number of Ranks
     * const count = await prisma.rank.count({
     *   where: {
     *     // ... the filter for the Ranks we want to count
     *   }
     * })
    **/
    count<T extends RankCountArgs>(
      args?: Subset<T, RankCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RankCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Rank.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RankAggregateArgs>(args: Subset<T, RankAggregateArgs>): Prisma.PrismaPromise<GetRankAggregateType<T>>

    /**
     * Group by Rank.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RankGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RankGroupByArgs['orderBy'] }
        : { orderBy?: RankGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RankGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRankGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Rank model
   */
  readonly fields: RankFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Rank.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RankClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Rank model
   */ 
  interface RankFieldRefs {
    readonly id: FieldRef<"Rank", 'Int'>
    readonly name: FieldRef<"Rank", 'String'>
    readonly fromValue: FieldRef<"Rank", 'Float'>
    readonly toValue: FieldRef<"Rank", 'Float'>
    readonly discount: FieldRef<"Rank", 'Float'>
    readonly foodVoucher: FieldRef<"Rank", 'Int'>
    readonly drinkVoucher: FieldRef<"Rank", 'Int'>
    readonly createdAt: FieldRef<"Rank", 'DateTime'>
    readonly updatedAt: FieldRef<"Rank", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Rank findUnique
   */
  export type RankFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rank
     */
    select?: RankSelect<ExtArgs> | null
    /**
     * Filter, which Rank to fetch.
     */
    where: RankWhereUniqueInput
  }

  /**
   * Rank findUniqueOrThrow
   */
  export type RankFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rank
     */
    select?: RankSelect<ExtArgs> | null
    /**
     * Filter, which Rank to fetch.
     */
    where: RankWhereUniqueInput
  }

  /**
   * Rank findFirst
   */
  export type RankFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rank
     */
    select?: RankSelect<ExtArgs> | null
    /**
     * Filter, which Rank to fetch.
     */
    where?: RankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ranks to fetch.
     */
    orderBy?: RankOrderByWithRelationInput | RankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ranks.
     */
    cursor?: RankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ranks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ranks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ranks.
     */
    distinct?: RankScalarFieldEnum | RankScalarFieldEnum[]
  }

  /**
   * Rank findFirstOrThrow
   */
  export type RankFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rank
     */
    select?: RankSelect<ExtArgs> | null
    /**
     * Filter, which Rank to fetch.
     */
    where?: RankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ranks to fetch.
     */
    orderBy?: RankOrderByWithRelationInput | RankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ranks.
     */
    cursor?: RankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ranks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ranks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ranks.
     */
    distinct?: RankScalarFieldEnum | RankScalarFieldEnum[]
  }

  /**
   * Rank findMany
   */
  export type RankFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rank
     */
    select?: RankSelect<ExtArgs> | null
    /**
     * Filter, which Ranks to fetch.
     */
    where?: RankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ranks to fetch.
     */
    orderBy?: RankOrderByWithRelationInput | RankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Ranks.
     */
    cursor?: RankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ranks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ranks.
     */
    skip?: number
    distinct?: RankScalarFieldEnum | RankScalarFieldEnum[]
  }

  /**
   * Rank create
   */
  export type RankCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rank
     */
    select?: RankSelect<ExtArgs> | null
    /**
     * The data needed to create a Rank.
     */
    data: XOR<RankCreateInput, RankUncheckedCreateInput>
  }

  /**
   * Rank createMany
   */
  export type RankCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Ranks.
     */
    data: RankCreateManyInput | RankCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Rank update
   */
  export type RankUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rank
     */
    select?: RankSelect<ExtArgs> | null
    /**
     * The data needed to update a Rank.
     */
    data: XOR<RankUpdateInput, RankUncheckedUpdateInput>
    /**
     * Choose, which Rank to update.
     */
    where: RankWhereUniqueInput
  }

  /**
   * Rank updateMany
   */
  export type RankUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Ranks.
     */
    data: XOR<RankUpdateManyMutationInput, RankUncheckedUpdateManyInput>
    /**
     * Filter which Ranks to update
     */
    where?: RankWhereInput
  }

  /**
   * Rank upsert
   */
  export type RankUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rank
     */
    select?: RankSelect<ExtArgs> | null
    /**
     * The filter to search for the Rank to update in case it exists.
     */
    where: RankWhereUniqueInput
    /**
     * In case the Rank found by the `where` argument doesn't exist, create a new Rank with this data.
     */
    create: XOR<RankCreateInput, RankUncheckedCreateInput>
    /**
     * In case the Rank was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RankUpdateInput, RankUncheckedUpdateInput>
  }

  /**
   * Rank delete
   */
  export type RankDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rank
     */
    select?: RankSelect<ExtArgs> | null
    /**
     * Filter which Rank to delete.
     */
    where: RankWhereUniqueInput
  }

  /**
   * Rank deleteMany
   */
  export type RankDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ranks to delete
     */
    where?: RankWhereInput
  }

  /**
   * Rank without action
   */
  export type RankDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rank
     */
    select?: RankSelect<ExtArgs> | null
  }


  /**
   * Model Game
   */

  export type AggregateGame = {
    _count: GameCountAggregateOutputType | null
    _avg: GameAvgAggregateOutputType | null
    _sum: GameSumAggregateOutputType | null
    _min: GameMinAggregateOutputType | null
    _max: GameMaxAggregateOutputType | null
  }

  export type GameAvgAggregateOutputType = {
    id: number | null
    starsPerRound: number | null
    balance_rate: number | null
    play_rate: number | null
    jackpot: number | null
  }

  export type GameSumAggregateOutputType = {
    id: number | null
    starsPerRound: number | null
    balance_rate: number | null
    play_rate: number | null
    jackpot: number | null
  }

  export type GameMinAggregateOutputType = {
    id: number | null
    name: string | null
    startDate: Date | null
    endDate: Date | null
    starsPerRound: number | null
    createdAt: Date | null
    updatedAt: Date | null
    balance_rate: number | null
    play_rate: number | null
    jackpot: number | null
  }

  export type GameMaxAggregateOutputType = {
    id: number | null
    name: string | null
    startDate: Date | null
    endDate: Date | null
    starsPerRound: number | null
    createdAt: Date | null
    updatedAt: Date | null
    balance_rate: number | null
    play_rate: number | null
    jackpot: number | null
  }

  export type GameCountAggregateOutputType = {
    id: number
    name: number
    startDate: number
    endDate: number
    starsPerRound: number
    createdAt: number
    updatedAt: number
    balance_rate: number
    play_rate: number
    jackpot: number
    _all: number
  }


  export type GameAvgAggregateInputType = {
    id?: true
    starsPerRound?: true
    balance_rate?: true
    play_rate?: true
    jackpot?: true
  }

  export type GameSumAggregateInputType = {
    id?: true
    starsPerRound?: true
    balance_rate?: true
    play_rate?: true
    jackpot?: true
  }

  export type GameMinAggregateInputType = {
    id?: true
    name?: true
    startDate?: true
    endDate?: true
    starsPerRound?: true
    createdAt?: true
    updatedAt?: true
    balance_rate?: true
    play_rate?: true
    jackpot?: true
  }

  export type GameMaxAggregateInputType = {
    id?: true
    name?: true
    startDate?: true
    endDate?: true
    starsPerRound?: true
    createdAt?: true
    updatedAt?: true
    balance_rate?: true
    play_rate?: true
    jackpot?: true
  }

  export type GameCountAggregateInputType = {
    id?: true
    name?: true
    startDate?: true
    endDate?: true
    starsPerRound?: true
    createdAt?: true
    updatedAt?: true
    balance_rate?: true
    play_rate?: true
    jackpot?: true
    _all?: true
  }

  export type GameAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Game to aggregate.
     */
    where?: GameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Games to fetch.
     */
    orderBy?: GameOrderByWithRelationInput | GameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Games.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Games
    **/
    _count?: true | GameCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GameAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GameSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GameMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GameMaxAggregateInputType
  }

  export type GetGameAggregateType<T extends GameAggregateArgs> = {
        [P in keyof T & keyof AggregateGame]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGame[P]>
      : GetScalarType<T[P], AggregateGame[P]>
  }




  export type GameGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameWhereInput
    orderBy?: GameOrderByWithAggregationInput | GameOrderByWithAggregationInput[]
    by: GameScalarFieldEnum[] | GameScalarFieldEnum
    having?: GameScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GameCountAggregateInputType | true
    _avg?: GameAvgAggregateInputType
    _sum?: GameSumAggregateInputType
    _min?: GameMinAggregateInputType
    _max?: GameMaxAggregateInputType
  }

  export type GameGroupByOutputType = {
    id: number
    name: string
    startDate: Date
    endDate: Date
    starsPerRound: number
    createdAt: Date
    updatedAt: Date
    balance_rate: number | null
    play_rate: number | null
    jackpot: number | null
    _count: GameCountAggregateOutputType | null
    _avg: GameAvgAggregateOutputType | null
    _sum: GameSumAggregateOutputType | null
    _min: GameMinAggregateOutputType | null
    _max: GameMaxAggregateOutputType | null
  }

  type GetGameGroupByPayload<T extends GameGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GameGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GameGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GameGroupByOutputType[P]>
            : GetScalarType<T[P], GameGroupByOutputType[P]>
        }
      >
    >


  export type GameSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    startDate?: boolean
    endDate?: boolean
    starsPerRound?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    balance_rate?: boolean
    play_rate?: boolean
    jackpot?: boolean
  }, ExtArgs["result"]["game"]>


  export type GameSelectScalar = {
    id?: boolean
    name?: boolean
    startDate?: boolean
    endDate?: boolean
    starsPerRound?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    balance_rate?: boolean
    play_rate?: boolean
    jackpot?: boolean
  }


  export type $GamePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Game"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      startDate: Date
      endDate: Date
      starsPerRound: number
      createdAt: Date
      updatedAt: Date
      balance_rate: number | null
      play_rate: number | null
      jackpot: number | null
    }, ExtArgs["result"]["game"]>
    composites: {}
  }

  type GameGetPayload<S extends boolean | null | undefined | GameDefaultArgs> = $Result.GetResult<Prisma.$GamePayload, S>

  type GameCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GameFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GameCountAggregateInputType | true
    }

  export interface GameDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Game'], meta: { name: 'Game' } }
    /**
     * Find zero or one Game that matches the filter.
     * @param {GameFindUniqueArgs} args - Arguments to find a Game
     * @example
     * // Get one Game
     * const game = await prisma.game.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GameFindUniqueArgs>(args: SelectSubset<T, GameFindUniqueArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Game that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GameFindUniqueOrThrowArgs} args - Arguments to find a Game
     * @example
     * // Get one Game
     * const game = await prisma.game.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GameFindUniqueOrThrowArgs>(args: SelectSubset<T, GameFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Game that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameFindFirstArgs} args - Arguments to find a Game
     * @example
     * // Get one Game
     * const game = await prisma.game.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GameFindFirstArgs>(args?: SelectSubset<T, GameFindFirstArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Game that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameFindFirstOrThrowArgs} args - Arguments to find a Game
     * @example
     * // Get one Game
     * const game = await prisma.game.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GameFindFirstOrThrowArgs>(args?: SelectSubset<T, GameFindFirstOrThrowArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Games that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Games
     * const games = await prisma.game.findMany()
     * 
     * // Get first 10 Games
     * const games = await prisma.game.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gameWithIdOnly = await prisma.game.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GameFindManyArgs>(args?: SelectSubset<T, GameFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Game.
     * @param {GameCreateArgs} args - Arguments to create a Game.
     * @example
     * // Create one Game
     * const Game = await prisma.game.create({
     *   data: {
     *     // ... data to create a Game
     *   }
     * })
     * 
     */
    create<T extends GameCreateArgs>(args: SelectSubset<T, GameCreateArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Games.
     * @param {GameCreateManyArgs} args - Arguments to create many Games.
     * @example
     * // Create many Games
     * const game = await prisma.game.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GameCreateManyArgs>(args?: SelectSubset<T, GameCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Game.
     * @param {GameDeleteArgs} args - Arguments to delete one Game.
     * @example
     * // Delete one Game
     * const Game = await prisma.game.delete({
     *   where: {
     *     // ... filter to delete one Game
     *   }
     * })
     * 
     */
    delete<T extends GameDeleteArgs>(args: SelectSubset<T, GameDeleteArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Game.
     * @param {GameUpdateArgs} args - Arguments to update one Game.
     * @example
     * // Update one Game
     * const game = await prisma.game.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GameUpdateArgs>(args: SelectSubset<T, GameUpdateArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Games.
     * @param {GameDeleteManyArgs} args - Arguments to filter Games to delete.
     * @example
     * // Delete a few Games
     * const { count } = await prisma.game.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GameDeleteManyArgs>(args?: SelectSubset<T, GameDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Games.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Games
     * const game = await prisma.game.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GameUpdateManyArgs>(args: SelectSubset<T, GameUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Game.
     * @param {GameUpsertArgs} args - Arguments to update or create a Game.
     * @example
     * // Update or create a Game
     * const game = await prisma.game.upsert({
     *   create: {
     *     // ... data to create a Game
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Game we want to update
     *   }
     * })
     */
    upsert<T extends GameUpsertArgs>(args: SelectSubset<T, GameUpsertArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Games.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameCountArgs} args - Arguments to filter Games to count.
     * @example
     * // Count the number of Games
     * const count = await prisma.game.count({
     *   where: {
     *     // ... the filter for the Games we want to count
     *   }
     * })
    **/
    count<T extends GameCountArgs>(
      args?: Subset<T, GameCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GameCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Game.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GameAggregateArgs>(args: Subset<T, GameAggregateArgs>): Prisma.PrismaPromise<GetGameAggregateType<T>>

    /**
     * Group by Game.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GameGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GameGroupByArgs['orderBy'] }
        : { orderBy?: GameGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GameGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGameGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Game model
   */
  readonly fields: GameFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Game.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GameClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Game model
   */ 
  interface GameFieldRefs {
    readonly id: FieldRef<"Game", 'Int'>
    readonly name: FieldRef<"Game", 'String'>
    readonly startDate: FieldRef<"Game", 'DateTime'>
    readonly endDate: FieldRef<"Game", 'DateTime'>
    readonly starsPerRound: FieldRef<"Game", 'Int'>
    readonly createdAt: FieldRef<"Game", 'DateTime'>
    readonly updatedAt: FieldRef<"Game", 'DateTime'>
    readonly balance_rate: FieldRef<"Game", 'Float'>
    readonly play_rate: FieldRef<"Game", 'Float'>
    readonly jackpot: FieldRef<"Game", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * Game findUnique
   */
  export type GameFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Filter, which Game to fetch.
     */
    where: GameWhereUniqueInput
  }

  /**
   * Game findUniqueOrThrow
   */
  export type GameFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Filter, which Game to fetch.
     */
    where: GameWhereUniqueInput
  }

  /**
   * Game findFirst
   */
  export type GameFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Filter, which Game to fetch.
     */
    where?: GameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Games to fetch.
     */
    orderBy?: GameOrderByWithRelationInput | GameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Games.
     */
    cursor?: GameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Games.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Games.
     */
    distinct?: GameScalarFieldEnum | GameScalarFieldEnum[]
  }

  /**
   * Game findFirstOrThrow
   */
  export type GameFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Filter, which Game to fetch.
     */
    where?: GameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Games to fetch.
     */
    orderBy?: GameOrderByWithRelationInput | GameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Games.
     */
    cursor?: GameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Games.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Games.
     */
    distinct?: GameScalarFieldEnum | GameScalarFieldEnum[]
  }

  /**
   * Game findMany
   */
  export type GameFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Filter, which Games to fetch.
     */
    where?: GameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Games to fetch.
     */
    orderBy?: GameOrderByWithRelationInput | GameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Games.
     */
    cursor?: GameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Games.
     */
    skip?: number
    distinct?: GameScalarFieldEnum | GameScalarFieldEnum[]
  }

  /**
   * Game create
   */
  export type GameCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * The data needed to create a Game.
     */
    data: XOR<GameCreateInput, GameUncheckedCreateInput>
  }

  /**
   * Game createMany
   */
  export type GameCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Games.
     */
    data: GameCreateManyInput | GameCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Game update
   */
  export type GameUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * The data needed to update a Game.
     */
    data: XOR<GameUpdateInput, GameUncheckedUpdateInput>
    /**
     * Choose, which Game to update.
     */
    where: GameWhereUniqueInput
  }

  /**
   * Game updateMany
   */
  export type GameUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Games.
     */
    data: XOR<GameUpdateManyMutationInput, GameUncheckedUpdateManyInput>
    /**
     * Filter which Games to update
     */
    where?: GameWhereInput
  }

  /**
   * Game upsert
   */
  export type GameUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * The filter to search for the Game to update in case it exists.
     */
    where: GameWhereUniqueInput
    /**
     * In case the Game found by the `where` argument doesn't exist, create a new Game with this data.
     */
    create: XOR<GameCreateInput, GameUncheckedCreateInput>
    /**
     * In case the Game was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GameUpdateInput, GameUncheckedUpdateInput>
  }

  /**
   * Game delete
   */
  export type GameDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Filter which Game to delete.
     */
    where: GameWhereUniqueInput
  }

  /**
   * Game deleteMany
   */
  export type GameDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Games to delete
     */
    where?: GameWhereInput
  }

  /**
   * Game without action
   */
  export type GameDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
  }


  /**
   * Model CheckInResult
   */

  export type AggregateCheckInResult = {
    _count: CheckInResultCountAggregateOutputType | null
    _avg: CheckInResultAvgAggregateOutputType | null
    _sum: CheckInResultSumAggregateOutputType | null
    _min: CheckInResultMinAggregateOutputType | null
    _max: CheckInResultMaxAggregateOutputType | null
  }

  export type CheckInResultAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type CheckInResultSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type CheckInResultMinAggregateOutputType = {
    id: number | null
    userId: number | null
    createdAt: Date | null
    branch: string | null
  }

  export type CheckInResultMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    createdAt: Date | null
    branch: string | null
  }

  export type CheckInResultCountAggregateOutputType = {
    id: number
    userId: number
    createdAt: number
    branch: number
    _all: number
  }


  export type CheckInResultAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type CheckInResultSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type CheckInResultMinAggregateInputType = {
    id?: true
    userId?: true
    createdAt?: true
    branch?: true
  }

  export type CheckInResultMaxAggregateInputType = {
    id?: true
    userId?: true
    createdAt?: true
    branch?: true
  }

  export type CheckInResultCountAggregateInputType = {
    id?: true
    userId?: true
    createdAt?: true
    branch?: true
    _all?: true
  }

  export type CheckInResultAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CheckInResult to aggregate.
     */
    where?: CheckInResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInResults to fetch.
     */
    orderBy?: CheckInResultOrderByWithRelationInput | CheckInResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CheckInResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CheckInResults
    **/
    _count?: true | CheckInResultCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CheckInResultAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CheckInResultSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CheckInResultMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CheckInResultMaxAggregateInputType
  }

  export type GetCheckInResultAggregateType<T extends CheckInResultAggregateArgs> = {
        [P in keyof T & keyof AggregateCheckInResult]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCheckInResult[P]>
      : GetScalarType<T[P], AggregateCheckInResult[P]>
  }




  export type CheckInResultGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CheckInResultWhereInput
    orderBy?: CheckInResultOrderByWithAggregationInput | CheckInResultOrderByWithAggregationInput[]
    by: CheckInResultScalarFieldEnum[] | CheckInResultScalarFieldEnum
    having?: CheckInResultScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CheckInResultCountAggregateInputType | true
    _avg?: CheckInResultAvgAggregateInputType
    _sum?: CheckInResultSumAggregateInputType
    _min?: CheckInResultMinAggregateInputType
    _max?: CheckInResultMaxAggregateInputType
  }

  export type CheckInResultGroupByOutputType = {
    id: number
    userId: number
    createdAt: Date
    branch: string | null
    _count: CheckInResultCountAggregateOutputType | null
    _avg: CheckInResultAvgAggregateOutputType | null
    _sum: CheckInResultSumAggregateOutputType | null
    _min: CheckInResultMinAggregateOutputType | null
    _max: CheckInResultMaxAggregateOutputType | null
  }

  type GetCheckInResultGroupByPayload<T extends CheckInResultGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CheckInResultGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CheckInResultGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CheckInResultGroupByOutputType[P]>
            : GetScalarType<T[P], CheckInResultGroupByOutputType[P]>
        }
      >
    >


  export type CheckInResultSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    createdAt?: boolean
    branch?: boolean
  }, ExtArgs["result"]["checkInResult"]>


  export type CheckInResultSelectScalar = {
    id?: boolean
    userId?: boolean
    createdAt?: boolean
    branch?: boolean
  }


  export type $CheckInResultPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CheckInResult"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      createdAt: Date
      branch: string | null
    }, ExtArgs["result"]["checkInResult"]>
    composites: {}
  }

  type CheckInResultGetPayload<S extends boolean | null | undefined | CheckInResultDefaultArgs> = $Result.GetResult<Prisma.$CheckInResultPayload, S>

  type CheckInResultCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CheckInResultFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CheckInResultCountAggregateInputType | true
    }

  export interface CheckInResultDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CheckInResult'], meta: { name: 'CheckInResult' } }
    /**
     * Find zero or one CheckInResult that matches the filter.
     * @param {CheckInResultFindUniqueArgs} args - Arguments to find a CheckInResult
     * @example
     * // Get one CheckInResult
     * const checkInResult = await prisma.checkInResult.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CheckInResultFindUniqueArgs>(args: SelectSubset<T, CheckInResultFindUniqueArgs<ExtArgs>>): Prisma__CheckInResultClient<$Result.GetResult<Prisma.$CheckInResultPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CheckInResult that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CheckInResultFindUniqueOrThrowArgs} args - Arguments to find a CheckInResult
     * @example
     * // Get one CheckInResult
     * const checkInResult = await prisma.checkInResult.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CheckInResultFindUniqueOrThrowArgs>(args: SelectSubset<T, CheckInResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CheckInResultClient<$Result.GetResult<Prisma.$CheckInResultPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CheckInResult that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInResultFindFirstArgs} args - Arguments to find a CheckInResult
     * @example
     * // Get one CheckInResult
     * const checkInResult = await prisma.checkInResult.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CheckInResultFindFirstArgs>(args?: SelectSubset<T, CheckInResultFindFirstArgs<ExtArgs>>): Prisma__CheckInResultClient<$Result.GetResult<Prisma.$CheckInResultPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CheckInResult that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInResultFindFirstOrThrowArgs} args - Arguments to find a CheckInResult
     * @example
     * // Get one CheckInResult
     * const checkInResult = await prisma.checkInResult.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CheckInResultFindFirstOrThrowArgs>(args?: SelectSubset<T, CheckInResultFindFirstOrThrowArgs<ExtArgs>>): Prisma__CheckInResultClient<$Result.GetResult<Prisma.$CheckInResultPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CheckInResults that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInResultFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CheckInResults
     * const checkInResults = await prisma.checkInResult.findMany()
     * 
     * // Get first 10 CheckInResults
     * const checkInResults = await prisma.checkInResult.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const checkInResultWithIdOnly = await prisma.checkInResult.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CheckInResultFindManyArgs>(args?: SelectSubset<T, CheckInResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CheckInResultPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CheckInResult.
     * @param {CheckInResultCreateArgs} args - Arguments to create a CheckInResult.
     * @example
     * // Create one CheckInResult
     * const CheckInResult = await prisma.checkInResult.create({
     *   data: {
     *     // ... data to create a CheckInResult
     *   }
     * })
     * 
     */
    create<T extends CheckInResultCreateArgs>(args: SelectSubset<T, CheckInResultCreateArgs<ExtArgs>>): Prisma__CheckInResultClient<$Result.GetResult<Prisma.$CheckInResultPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CheckInResults.
     * @param {CheckInResultCreateManyArgs} args - Arguments to create many CheckInResults.
     * @example
     * // Create many CheckInResults
     * const checkInResult = await prisma.checkInResult.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CheckInResultCreateManyArgs>(args?: SelectSubset<T, CheckInResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CheckInResult.
     * @param {CheckInResultDeleteArgs} args - Arguments to delete one CheckInResult.
     * @example
     * // Delete one CheckInResult
     * const CheckInResult = await prisma.checkInResult.delete({
     *   where: {
     *     // ... filter to delete one CheckInResult
     *   }
     * })
     * 
     */
    delete<T extends CheckInResultDeleteArgs>(args: SelectSubset<T, CheckInResultDeleteArgs<ExtArgs>>): Prisma__CheckInResultClient<$Result.GetResult<Prisma.$CheckInResultPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CheckInResult.
     * @param {CheckInResultUpdateArgs} args - Arguments to update one CheckInResult.
     * @example
     * // Update one CheckInResult
     * const checkInResult = await prisma.checkInResult.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CheckInResultUpdateArgs>(args: SelectSubset<T, CheckInResultUpdateArgs<ExtArgs>>): Prisma__CheckInResultClient<$Result.GetResult<Prisma.$CheckInResultPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CheckInResults.
     * @param {CheckInResultDeleteManyArgs} args - Arguments to filter CheckInResults to delete.
     * @example
     * // Delete a few CheckInResults
     * const { count } = await prisma.checkInResult.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CheckInResultDeleteManyArgs>(args?: SelectSubset<T, CheckInResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CheckInResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInResultUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CheckInResults
     * const checkInResult = await prisma.checkInResult.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CheckInResultUpdateManyArgs>(args: SelectSubset<T, CheckInResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CheckInResult.
     * @param {CheckInResultUpsertArgs} args - Arguments to update or create a CheckInResult.
     * @example
     * // Update or create a CheckInResult
     * const checkInResult = await prisma.checkInResult.upsert({
     *   create: {
     *     // ... data to create a CheckInResult
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CheckInResult we want to update
     *   }
     * })
     */
    upsert<T extends CheckInResultUpsertArgs>(args: SelectSubset<T, CheckInResultUpsertArgs<ExtArgs>>): Prisma__CheckInResultClient<$Result.GetResult<Prisma.$CheckInResultPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CheckInResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInResultCountArgs} args - Arguments to filter CheckInResults to count.
     * @example
     * // Count the number of CheckInResults
     * const count = await prisma.checkInResult.count({
     *   where: {
     *     // ... the filter for the CheckInResults we want to count
     *   }
     * })
    **/
    count<T extends CheckInResultCountArgs>(
      args?: Subset<T, CheckInResultCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CheckInResultCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CheckInResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInResultAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CheckInResultAggregateArgs>(args: Subset<T, CheckInResultAggregateArgs>): Prisma.PrismaPromise<GetCheckInResultAggregateType<T>>

    /**
     * Group by CheckInResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInResultGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CheckInResultGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CheckInResultGroupByArgs['orderBy'] }
        : { orderBy?: CheckInResultGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CheckInResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCheckInResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CheckInResult model
   */
  readonly fields: CheckInResultFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CheckInResult.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CheckInResultClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CheckInResult model
   */ 
  interface CheckInResultFieldRefs {
    readonly id: FieldRef<"CheckInResult", 'Int'>
    readonly userId: FieldRef<"CheckInResult", 'Int'>
    readonly createdAt: FieldRef<"CheckInResult", 'DateTime'>
    readonly branch: FieldRef<"CheckInResult", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CheckInResult findUnique
   */
  export type CheckInResultFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInResult
     */
    select?: CheckInResultSelect<ExtArgs> | null
    /**
     * Filter, which CheckInResult to fetch.
     */
    where: CheckInResultWhereUniqueInput
  }

  /**
   * CheckInResult findUniqueOrThrow
   */
  export type CheckInResultFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInResult
     */
    select?: CheckInResultSelect<ExtArgs> | null
    /**
     * Filter, which CheckInResult to fetch.
     */
    where: CheckInResultWhereUniqueInput
  }

  /**
   * CheckInResult findFirst
   */
  export type CheckInResultFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInResult
     */
    select?: CheckInResultSelect<ExtArgs> | null
    /**
     * Filter, which CheckInResult to fetch.
     */
    where?: CheckInResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInResults to fetch.
     */
    orderBy?: CheckInResultOrderByWithRelationInput | CheckInResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CheckInResults.
     */
    cursor?: CheckInResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CheckInResults.
     */
    distinct?: CheckInResultScalarFieldEnum | CheckInResultScalarFieldEnum[]
  }

  /**
   * CheckInResult findFirstOrThrow
   */
  export type CheckInResultFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInResult
     */
    select?: CheckInResultSelect<ExtArgs> | null
    /**
     * Filter, which CheckInResult to fetch.
     */
    where?: CheckInResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInResults to fetch.
     */
    orderBy?: CheckInResultOrderByWithRelationInput | CheckInResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CheckInResults.
     */
    cursor?: CheckInResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CheckInResults.
     */
    distinct?: CheckInResultScalarFieldEnum | CheckInResultScalarFieldEnum[]
  }

  /**
   * CheckInResult findMany
   */
  export type CheckInResultFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInResult
     */
    select?: CheckInResultSelect<ExtArgs> | null
    /**
     * Filter, which CheckInResults to fetch.
     */
    where?: CheckInResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInResults to fetch.
     */
    orderBy?: CheckInResultOrderByWithRelationInput | CheckInResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CheckInResults.
     */
    cursor?: CheckInResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInResults.
     */
    skip?: number
    distinct?: CheckInResultScalarFieldEnum | CheckInResultScalarFieldEnum[]
  }

  /**
   * CheckInResult create
   */
  export type CheckInResultCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInResult
     */
    select?: CheckInResultSelect<ExtArgs> | null
    /**
     * The data needed to create a CheckInResult.
     */
    data: XOR<CheckInResultCreateInput, CheckInResultUncheckedCreateInput>
  }

  /**
   * CheckInResult createMany
   */
  export type CheckInResultCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CheckInResults.
     */
    data: CheckInResultCreateManyInput | CheckInResultCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CheckInResult update
   */
  export type CheckInResultUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInResult
     */
    select?: CheckInResultSelect<ExtArgs> | null
    /**
     * The data needed to update a CheckInResult.
     */
    data: XOR<CheckInResultUpdateInput, CheckInResultUncheckedUpdateInput>
    /**
     * Choose, which CheckInResult to update.
     */
    where: CheckInResultWhereUniqueInput
  }

  /**
   * CheckInResult updateMany
   */
  export type CheckInResultUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CheckInResults.
     */
    data: XOR<CheckInResultUpdateManyMutationInput, CheckInResultUncheckedUpdateManyInput>
    /**
     * Filter which CheckInResults to update
     */
    where?: CheckInResultWhereInput
  }

  /**
   * CheckInResult upsert
   */
  export type CheckInResultUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInResult
     */
    select?: CheckInResultSelect<ExtArgs> | null
    /**
     * The filter to search for the CheckInResult to update in case it exists.
     */
    where: CheckInResultWhereUniqueInput
    /**
     * In case the CheckInResult found by the `where` argument doesn't exist, create a new CheckInResult with this data.
     */
    create: XOR<CheckInResultCreateInput, CheckInResultUncheckedCreateInput>
    /**
     * In case the CheckInResult was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CheckInResultUpdateInput, CheckInResultUncheckedUpdateInput>
  }

  /**
   * CheckInResult delete
   */
  export type CheckInResultDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInResult
     */
    select?: CheckInResultSelect<ExtArgs> | null
    /**
     * Filter which CheckInResult to delete.
     */
    where: CheckInResultWhereUniqueInput
  }

  /**
   * CheckInResult deleteMany
   */
  export type CheckInResultDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CheckInResults to delete
     */
    where?: CheckInResultWhereInput
  }

  /**
   * CheckInResult without action
   */
  export type CheckInResultDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInResult
     */
    select?: CheckInResultSelect<ExtArgs> | null
  }


  /**
   * Model CheckInItem
   */

  export type AggregateCheckInItem = {
    _count: CheckInItemCountAggregateOutputType | null
    _avg: CheckInItemAvgAggregateOutputType | null
    _sum: CheckInItemSumAggregateOutputType | null
    _min: CheckInItemMinAggregateOutputType | null
    _max: CheckInItemMaxAggregateOutputType | null
  }

  export type CheckInItemAvgAggregateOutputType = {
    id: number | null
    stars: number | null
  }

  export type CheckInItemSumAggregateOutputType = {
    id: number | null
    stars: number | null
  }

  export type CheckInItemMinAggregateOutputType = {
    id: number | null
    dayName: string | null
    stars: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CheckInItemMaxAggregateOutputType = {
    id: number | null
    dayName: string | null
    stars: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CheckInItemCountAggregateOutputType = {
    id: number
    dayName: number
    stars: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CheckInItemAvgAggregateInputType = {
    id?: true
    stars?: true
  }

  export type CheckInItemSumAggregateInputType = {
    id?: true
    stars?: true
  }

  export type CheckInItemMinAggregateInputType = {
    id?: true
    dayName?: true
    stars?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CheckInItemMaxAggregateInputType = {
    id?: true
    dayName?: true
    stars?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CheckInItemCountAggregateInputType = {
    id?: true
    dayName?: true
    stars?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CheckInItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CheckInItem to aggregate.
     */
    where?: CheckInItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInItems to fetch.
     */
    orderBy?: CheckInItemOrderByWithRelationInput | CheckInItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CheckInItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CheckInItems
    **/
    _count?: true | CheckInItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CheckInItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CheckInItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CheckInItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CheckInItemMaxAggregateInputType
  }

  export type GetCheckInItemAggregateType<T extends CheckInItemAggregateArgs> = {
        [P in keyof T & keyof AggregateCheckInItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCheckInItem[P]>
      : GetScalarType<T[P], AggregateCheckInItem[P]>
  }




  export type CheckInItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CheckInItemWhereInput
    orderBy?: CheckInItemOrderByWithAggregationInput | CheckInItemOrderByWithAggregationInput[]
    by: CheckInItemScalarFieldEnum[] | CheckInItemScalarFieldEnum
    having?: CheckInItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CheckInItemCountAggregateInputType | true
    _avg?: CheckInItemAvgAggregateInputType
    _sum?: CheckInItemSumAggregateInputType
    _min?: CheckInItemMinAggregateInputType
    _max?: CheckInItemMaxAggregateInputType
  }

  export type CheckInItemGroupByOutputType = {
    id: number
    dayName: string
    stars: number
    createdAt: Date
    updatedAt: Date
    _count: CheckInItemCountAggregateOutputType | null
    _avg: CheckInItemAvgAggregateOutputType | null
    _sum: CheckInItemSumAggregateOutputType | null
    _min: CheckInItemMinAggregateOutputType | null
    _max: CheckInItemMaxAggregateOutputType | null
  }

  type GetCheckInItemGroupByPayload<T extends CheckInItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CheckInItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CheckInItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CheckInItemGroupByOutputType[P]>
            : GetScalarType<T[P], CheckInItemGroupByOutputType[P]>
        }
      >
    >


  export type CheckInItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dayName?: boolean
    stars?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["checkInItem"]>


  export type CheckInItemSelectScalar = {
    id?: boolean
    dayName?: boolean
    stars?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $CheckInItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CheckInItem"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      dayName: string
      stars: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["checkInItem"]>
    composites: {}
  }

  type CheckInItemGetPayload<S extends boolean | null | undefined | CheckInItemDefaultArgs> = $Result.GetResult<Prisma.$CheckInItemPayload, S>

  type CheckInItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CheckInItemFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CheckInItemCountAggregateInputType | true
    }

  export interface CheckInItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CheckInItem'], meta: { name: 'CheckInItem' } }
    /**
     * Find zero or one CheckInItem that matches the filter.
     * @param {CheckInItemFindUniqueArgs} args - Arguments to find a CheckInItem
     * @example
     * // Get one CheckInItem
     * const checkInItem = await prisma.checkInItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CheckInItemFindUniqueArgs>(args: SelectSubset<T, CheckInItemFindUniqueArgs<ExtArgs>>): Prisma__CheckInItemClient<$Result.GetResult<Prisma.$CheckInItemPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CheckInItem that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CheckInItemFindUniqueOrThrowArgs} args - Arguments to find a CheckInItem
     * @example
     * // Get one CheckInItem
     * const checkInItem = await prisma.checkInItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CheckInItemFindUniqueOrThrowArgs>(args: SelectSubset<T, CheckInItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CheckInItemClient<$Result.GetResult<Prisma.$CheckInItemPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CheckInItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInItemFindFirstArgs} args - Arguments to find a CheckInItem
     * @example
     * // Get one CheckInItem
     * const checkInItem = await prisma.checkInItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CheckInItemFindFirstArgs>(args?: SelectSubset<T, CheckInItemFindFirstArgs<ExtArgs>>): Prisma__CheckInItemClient<$Result.GetResult<Prisma.$CheckInItemPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CheckInItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInItemFindFirstOrThrowArgs} args - Arguments to find a CheckInItem
     * @example
     * // Get one CheckInItem
     * const checkInItem = await prisma.checkInItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CheckInItemFindFirstOrThrowArgs>(args?: SelectSubset<T, CheckInItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__CheckInItemClient<$Result.GetResult<Prisma.$CheckInItemPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CheckInItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CheckInItems
     * const checkInItems = await prisma.checkInItem.findMany()
     * 
     * // Get first 10 CheckInItems
     * const checkInItems = await prisma.checkInItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const checkInItemWithIdOnly = await prisma.checkInItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CheckInItemFindManyArgs>(args?: SelectSubset<T, CheckInItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CheckInItemPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CheckInItem.
     * @param {CheckInItemCreateArgs} args - Arguments to create a CheckInItem.
     * @example
     * // Create one CheckInItem
     * const CheckInItem = await prisma.checkInItem.create({
     *   data: {
     *     // ... data to create a CheckInItem
     *   }
     * })
     * 
     */
    create<T extends CheckInItemCreateArgs>(args: SelectSubset<T, CheckInItemCreateArgs<ExtArgs>>): Prisma__CheckInItemClient<$Result.GetResult<Prisma.$CheckInItemPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CheckInItems.
     * @param {CheckInItemCreateManyArgs} args - Arguments to create many CheckInItems.
     * @example
     * // Create many CheckInItems
     * const checkInItem = await prisma.checkInItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CheckInItemCreateManyArgs>(args?: SelectSubset<T, CheckInItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CheckInItem.
     * @param {CheckInItemDeleteArgs} args - Arguments to delete one CheckInItem.
     * @example
     * // Delete one CheckInItem
     * const CheckInItem = await prisma.checkInItem.delete({
     *   where: {
     *     // ... filter to delete one CheckInItem
     *   }
     * })
     * 
     */
    delete<T extends CheckInItemDeleteArgs>(args: SelectSubset<T, CheckInItemDeleteArgs<ExtArgs>>): Prisma__CheckInItemClient<$Result.GetResult<Prisma.$CheckInItemPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CheckInItem.
     * @param {CheckInItemUpdateArgs} args - Arguments to update one CheckInItem.
     * @example
     * // Update one CheckInItem
     * const checkInItem = await prisma.checkInItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CheckInItemUpdateArgs>(args: SelectSubset<T, CheckInItemUpdateArgs<ExtArgs>>): Prisma__CheckInItemClient<$Result.GetResult<Prisma.$CheckInItemPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CheckInItems.
     * @param {CheckInItemDeleteManyArgs} args - Arguments to filter CheckInItems to delete.
     * @example
     * // Delete a few CheckInItems
     * const { count } = await prisma.checkInItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CheckInItemDeleteManyArgs>(args?: SelectSubset<T, CheckInItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CheckInItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CheckInItems
     * const checkInItem = await prisma.checkInItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CheckInItemUpdateManyArgs>(args: SelectSubset<T, CheckInItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CheckInItem.
     * @param {CheckInItemUpsertArgs} args - Arguments to update or create a CheckInItem.
     * @example
     * // Update or create a CheckInItem
     * const checkInItem = await prisma.checkInItem.upsert({
     *   create: {
     *     // ... data to create a CheckInItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CheckInItem we want to update
     *   }
     * })
     */
    upsert<T extends CheckInItemUpsertArgs>(args: SelectSubset<T, CheckInItemUpsertArgs<ExtArgs>>): Prisma__CheckInItemClient<$Result.GetResult<Prisma.$CheckInItemPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CheckInItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInItemCountArgs} args - Arguments to filter CheckInItems to count.
     * @example
     * // Count the number of CheckInItems
     * const count = await prisma.checkInItem.count({
     *   where: {
     *     // ... the filter for the CheckInItems we want to count
     *   }
     * })
    **/
    count<T extends CheckInItemCountArgs>(
      args?: Subset<T, CheckInItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CheckInItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CheckInItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CheckInItemAggregateArgs>(args: Subset<T, CheckInItemAggregateArgs>): Prisma.PrismaPromise<GetCheckInItemAggregateType<T>>

    /**
     * Group by CheckInItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CheckInItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CheckInItemGroupByArgs['orderBy'] }
        : { orderBy?: CheckInItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CheckInItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCheckInItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CheckInItem model
   */
  readonly fields: CheckInItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CheckInItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CheckInItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CheckInItem model
   */ 
  interface CheckInItemFieldRefs {
    readonly id: FieldRef<"CheckInItem", 'Int'>
    readonly dayName: FieldRef<"CheckInItem", 'String'>
    readonly stars: FieldRef<"CheckInItem", 'Float'>
    readonly createdAt: FieldRef<"CheckInItem", 'DateTime'>
    readonly updatedAt: FieldRef<"CheckInItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CheckInItem findUnique
   */
  export type CheckInItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInItem
     */
    select?: CheckInItemSelect<ExtArgs> | null
    /**
     * Filter, which CheckInItem to fetch.
     */
    where: CheckInItemWhereUniqueInput
  }

  /**
   * CheckInItem findUniqueOrThrow
   */
  export type CheckInItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInItem
     */
    select?: CheckInItemSelect<ExtArgs> | null
    /**
     * Filter, which CheckInItem to fetch.
     */
    where: CheckInItemWhereUniqueInput
  }

  /**
   * CheckInItem findFirst
   */
  export type CheckInItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInItem
     */
    select?: CheckInItemSelect<ExtArgs> | null
    /**
     * Filter, which CheckInItem to fetch.
     */
    where?: CheckInItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInItems to fetch.
     */
    orderBy?: CheckInItemOrderByWithRelationInput | CheckInItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CheckInItems.
     */
    cursor?: CheckInItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CheckInItems.
     */
    distinct?: CheckInItemScalarFieldEnum | CheckInItemScalarFieldEnum[]
  }

  /**
   * CheckInItem findFirstOrThrow
   */
  export type CheckInItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInItem
     */
    select?: CheckInItemSelect<ExtArgs> | null
    /**
     * Filter, which CheckInItem to fetch.
     */
    where?: CheckInItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInItems to fetch.
     */
    orderBy?: CheckInItemOrderByWithRelationInput | CheckInItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CheckInItems.
     */
    cursor?: CheckInItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CheckInItems.
     */
    distinct?: CheckInItemScalarFieldEnum | CheckInItemScalarFieldEnum[]
  }

  /**
   * CheckInItem findMany
   */
  export type CheckInItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInItem
     */
    select?: CheckInItemSelect<ExtArgs> | null
    /**
     * Filter, which CheckInItems to fetch.
     */
    where?: CheckInItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInItems to fetch.
     */
    orderBy?: CheckInItemOrderByWithRelationInput | CheckInItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CheckInItems.
     */
    cursor?: CheckInItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInItems.
     */
    skip?: number
    distinct?: CheckInItemScalarFieldEnum | CheckInItemScalarFieldEnum[]
  }

  /**
   * CheckInItem create
   */
  export type CheckInItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInItem
     */
    select?: CheckInItemSelect<ExtArgs> | null
    /**
     * The data needed to create a CheckInItem.
     */
    data: XOR<CheckInItemCreateInput, CheckInItemUncheckedCreateInput>
  }

  /**
   * CheckInItem createMany
   */
  export type CheckInItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CheckInItems.
     */
    data: CheckInItemCreateManyInput | CheckInItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CheckInItem update
   */
  export type CheckInItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInItem
     */
    select?: CheckInItemSelect<ExtArgs> | null
    /**
     * The data needed to update a CheckInItem.
     */
    data: XOR<CheckInItemUpdateInput, CheckInItemUncheckedUpdateInput>
    /**
     * Choose, which CheckInItem to update.
     */
    where: CheckInItemWhereUniqueInput
  }

  /**
   * CheckInItem updateMany
   */
  export type CheckInItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CheckInItems.
     */
    data: XOR<CheckInItemUpdateManyMutationInput, CheckInItemUncheckedUpdateManyInput>
    /**
     * Filter which CheckInItems to update
     */
    where?: CheckInItemWhereInput
  }

  /**
   * CheckInItem upsert
   */
  export type CheckInItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInItem
     */
    select?: CheckInItemSelect<ExtArgs> | null
    /**
     * The filter to search for the CheckInItem to update in case it exists.
     */
    where: CheckInItemWhereUniqueInput
    /**
     * In case the CheckInItem found by the `where` argument doesn't exist, create a new CheckInItem with this data.
     */
    create: XOR<CheckInItemCreateInput, CheckInItemUncheckedCreateInput>
    /**
     * In case the CheckInItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CheckInItemUpdateInput, CheckInItemUncheckedUpdateInput>
  }

  /**
   * CheckInItem delete
   */
  export type CheckInItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInItem
     */
    select?: CheckInItemSelect<ExtArgs> | null
    /**
     * Filter which CheckInItem to delete.
     */
    where: CheckInItemWhereUniqueInput
  }

  /**
   * CheckInItem deleteMany
   */
  export type CheckInItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CheckInItems to delete
     */
    where?: CheckInItemWhereInput
  }

  /**
   * CheckInItem without action
   */
  export type CheckInItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInItem
     */
    select?: CheckInItemSelect<ExtArgs> | null
  }


  /**
   * Model CheckInPromotion
   */

  export type AggregateCheckInPromotion = {
    _count: CheckInPromotionCountAggregateOutputType | null
    _avg: CheckInPromotionAvgAggregateOutputType | null
    _sum: CheckInPromotionSumAggregateOutputType | null
    _min: CheckInPromotionMinAggregateOutputType | null
    _max: CheckInPromotionMaxAggregateOutputType | null
  }

  export type CheckInPromotionAvgAggregateOutputType = {
    id: number | null
    checkInItemId: number | null
    coefficient: number | null
  }

  export type CheckInPromotionSumAggregateOutputType = {
    id: number | null
    checkInItemId: number | null
    coefficient: number | null
  }

  export type CheckInPromotionMinAggregateOutputType = {
    id: number | null
    checkInItemId: number | null
    coefficient: number | null
    startDate: Date | null
    endDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CheckInPromotionMaxAggregateOutputType = {
    id: number | null
    checkInItemId: number | null
    coefficient: number | null
    startDate: Date | null
    endDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CheckInPromotionCountAggregateOutputType = {
    id: number
    checkInItemId: number
    coefficient: number
    startDate: number
    endDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CheckInPromotionAvgAggregateInputType = {
    id?: true
    checkInItemId?: true
    coefficient?: true
  }

  export type CheckInPromotionSumAggregateInputType = {
    id?: true
    checkInItemId?: true
    coefficient?: true
  }

  export type CheckInPromotionMinAggregateInputType = {
    id?: true
    checkInItemId?: true
    coefficient?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CheckInPromotionMaxAggregateInputType = {
    id?: true
    checkInItemId?: true
    coefficient?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CheckInPromotionCountAggregateInputType = {
    id?: true
    checkInItemId?: true
    coefficient?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CheckInPromotionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CheckInPromotion to aggregate.
     */
    where?: CheckInPromotionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInPromotions to fetch.
     */
    orderBy?: CheckInPromotionOrderByWithRelationInput | CheckInPromotionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CheckInPromotionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInPromotions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInPromotions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CheckInPromotions
    **/
    _count?: true | CheckInPromotionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CheckInPromotionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CheckInPromotionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CheckInPromotionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CheckInPromotionMaxAggregateInputType
  }

  export type GetCheckInPromotionAggregateType<T extends CheckInPromotionAggregateArgs> = {
        [P in keyof T & keyof AggregateCheckInPromotion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCheckInPromotion[P]>
      : GetScalarType<T[P], AggregateCheckInPromotion[P]>
  }




  export type CheckInPromotionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CheckInPromotionWhereInput
    orderBy?: CheckInPromotionOrderByWithAggregationInput | CheckInPromotionOrderByWithAggregationInput[]
    by: CheckInPromotionScalarFieldEnum[] | CheckInPromotionScalarFieldEnum
    having?: CheckInPromotionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CheckInPromotionCountAggregateInputType | true
    _avg?: CheckInPromotionAvgAggregateInputType
    _sum?: CheckInPromotionSumAggregateInputType
    _min?: CheckInPromotionMinAggregateInputType
    _max?: CheckInPromotionMaxAggregateInputType
  }

  export type CheckInPromotionGroupByOutputType = {
    id: number
    checkInItemId: number
    coefficient: number
    startDate: Date
    endDate: Date
    createdAt: Date
    updatedAt: Date
    _count: CheckInPromotionCountAggregateOutputType | null
    _avg: CheckInPromotionAvgAggregateOutputType | null
    _sum: CheckInPromotionSumAggregateOutputType | null
    _min: CheckInPromotionMinAggregateOutputType | null
    _max: CheckInPromotionMaxAggregateOutputType | null
  }

  type GetCheckInPromotionGroupByPayload<T extends CheckInPromotionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CheckInPromotionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CheckInPromotionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CheckInPromotionGroupByOutputType[P]>
            : GetScalarType<T[P], CheckInPromotionGroupByOutputType[P]>
        }
      >
    >


  export type CheckInPromotionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    checkInItemId?: boolean
    coefficient?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["checkInPromotion"]>


  export type CheckInPromotionSelectScalar = {
    id?: boolean
    checkInItemId?: boolean
    coefficient?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $CheckInPromotionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CheckInPromotion"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      checkInItemId: number
      coefficient: number
      startDate: Date
      endDate: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["checkInPromotion"]>
    composites: {}
  }

  type CheckInPromotionGetPayload<S extends boolean | null | undefined | CheckInPromotionDefaultArgs> = $Result.GetResult<Prisma.$CheckInPromotionPayload, S>

  type CheckInPromotionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CheckInPromotionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CheckInPromotionCountAggregateInputType | true
    }

  export interface CheckInPromotionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CheckInPromotion'], meta: { name: 'CheckInPromotion' } }
    /**
     * Find zero or one CheckInPromotion that matches the filter.
     * @param {CheckInPromotionFindUniqueArgs} args - Arguments to find a CheckInPromotion
     * @example
     * // Get one CheckInPromotion
     * const checkInPromotion = await prisma.checkInPromotion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CheckInPromotionFindUniqueArgs>(args: SelectSubset<T, CheckInPromotionFindUniqueArgs<ExtArgs>>): Prisma__CheckInPromotionClient<$Result.GetResult<Prisma.$CheckInPromotionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CheckInPromotion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CheckInPromotionFindUniqueOrThrowArgs} args - Arguments to find a CheckInPromotion
     * @example
     * // Get one CheckInPromotion
     * const checkInPromotion = await prisma.checkInPromotion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CheckInPromotionFindUniqueOrThrowArgs>(args: SelectSubset<T, CheckInPromotionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CheckInPromotionClient<$Result.GetResult<Prisma.$CheckInPromotionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CheckInPromotion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInPromotionFindFirstArgs} args - Arguments to find a CheckInPromotion
     * @example
     * // Get one CheckInPromotion
     * const checkInPromotion = await prisma.checkInPromotion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CheckInPromotionFindFirstArgs>(args?: SelectSubset<T, CheckInPromotionFindFirstArgs<ExtArgs>>): Prisma__CheckInPromotionClient<$Result.GetResult<Prisma.$CheckInPromotionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CheckInPromotion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInPromotionFindFirstOrThrowArgs} args - Arguments to find a CheckInPromotion
     * @example
     * // Get one CheckInPromotion
     * const checkInPromotion = await prisma.checkInPromotion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CheckInPromotionFindFirstOrThrowArgs>(args?: SelectSubset<T, CheckInPromotionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CheckInPromotionClient<$Result.GetResult<Prisma.$CheckInPromotionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CheckInPromotions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInPromotionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CheckInPromotions
     * const checkInPromotions = await prisma.checkInPromotion.findMany()
     * 
     * // Get first 10 CheckInPromotions
     * const checkInPromotions = await prisma.checkInPromotion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const checkInPromotionWithIdOnly = await prisma.checkInPromotion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CheckInPromotionFindManyArgs>(args?: SelectSubset<T, CheckInPromotionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CheckInPromotionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CheckInPromotion.
     * @param {CheckInPromotionCreateArgs} args - Arguments to create a CheckInPromotion.
     * @example
     * // Create one CheckInPromotion
     * const CheckInPromotion = await prisma.checkInPromotion.create({
     *   data: {
     *     // ... data to create a CheckInPromotion
     *   }
     * })
     * 
     */
    create<T extends CheckInPromotionCreateArgs>(args: SelectSubset<T, CheckInPromotionCreateArgs<ExtArgs>>): Prisma__CheckInPromotionClient<$Result.GetResult<Prisma.$CheckInPromotionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CheckInPromotions.
     * @param {CheckInPromotionCreateManyArgs} args - Arguments to create many CheckInPromotions.
     * @example
     * // Create many CheckInPromotions
     * const checkInPromotion = await prisma.checkInPromotion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CheckInPromotionCreateManyArgs>(args?: SelectSubset<T, CheckInPromotionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CheckInPromotion.
     * @param {CheckInPromotionDeleteArgs} args - Arguments to delete one CheckInPromotion.
     * @example
     * // Delete one CheckInPromotion
     * const CheckInPromotion = await prisma.checkInPromotion.delete({
     *   where: {
     *     // ... filter to delete one CheckInPromotion
     *   }
     * })
     * 
     */
    delete<T extends CheckInPromotionDeleteArgs>(args: SelectSubset<T, CheckInPromotionDeleteArgs<ExtArgs>>): Prisma__CheckInPromotionClient<$Result.GetResult<Prisma.$CheckInPromotionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CheckInPromotion.
     * @param {CheckInPromotionUpdateArgs} args - Arguments to update one CheckInPromotion.
     * @example
     * // Update one CheckInPromotion
     * const checkInPromotion = await prisma.checkInPromotion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CheckInPromotionUpdateArgs>(args: SelectSubset<T, CheckInPromotionUpdateArgs<ExtArgs>>): Prisma__CheckInPromotionClient<$Result.GetResult<Prisma.$CheckInPromotionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CheckInPromotions.
     * @param {CheckInPromotionDeleteManyArgs} args - Arguments to filter CheckInPromotions to delete.
     * @example
     * // Delete a few CheckInPromotions
     * const { count } = await prisma.checkInPromotion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CheckInPromotionDeleteManyArgs>(args?: SelectSubset<T, CheckInPromotionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CheckInPromotions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInPromotionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CheckInPromotions
     * const checkInPromotion = await prisma.checkInPromotion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CheckInPromotionUpdateManyArgs>(args: SelectSubset<T, CheckInPromotionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CheckInPromotion.
     * @param {CheckInPromotionUpsertArgs} args - Arguments to update or create a CheckInPromotion.
     * @example
     * // Update or create a CheckInPromotion
     * const checkInPromotion = await prisma.checkInPromotion.upsert({
     *   create: {
     *     // ... data to create a CheckInPromotion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CheckInPromotion we want to update
     *   }
     * })
     */
    upsert<T extends CheckInPromotionUpsertArgs>(args: SelectSubset<T, CheckInPromotionUpsertArgs<ExtArgs>>): Prisma__CheckInPromotionClient<$Result.GetResult<Prisma.$CheckInPromotionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CheckInPromotions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInPromotionCountArgs} args - Arguments to filter CheckInPromotions to count.
     * @example
     * // Count the number of CheckInPromotions
     * const count = await prisma.checkInPromotion.count({
     *   where: {
     *     // ... the filter for the CheckInPromotions we want to count
     *   }
     * })
    **/
    count<T extends CheckInPromotionCountArgs>(
      args?: Subset<T, CheckInPromotionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CheckInPromotionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CheckInPromotion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInPromotionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CheckInPromotionAggregateArgs>(args: Subset<T, CheckInPromotionAggregateArgs>): Prisma.PrismaPromise<GetCheckInPromotionAggregateType<T>>

    /**
     * Group by CheckInPromotion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckInPromotionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CheckInPromotionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CheckInPromotionGroupByArgs['orderBy'] }
        : { orderBy?: CheckInPromotionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CheckInPromotionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCheckInPromotionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CheckInPromotion model
   */
  readonly fields: CheckInPromotionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CheckInPromotion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CheckInPromotionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CheckInPromotion model
   */ 
  interface CheckInPromotionFieldRefs {
    readonly id: FieldRef<"CheckInPromotion", 'Int'>
    readonly checkInItemId: FieldRef<"CheckInPromotion", 'Int'>
    readonly coefficient: FieldRef<"CheckInPromotion", 'Float'>
    readonly startDate: FieldRef<"CheckInPromotion", 'DateTime'>
    readonly endDate: FieldRef<"CheckInPromotion", 'DateTime'>
    readonly createdAt: FieldRef<"CheckInPromotion", 'DateTime'>
    readonly updatedAt: FieldRef<"CheckInPromotion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CheckInPromotion findUnique
   */
  export type CheckInPromotionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInPromotion
     */
    select?: CheckInPromotionSelect<ExtArgs> | null
    /**
     * Filter, which CheckInPromotion to fetch.
     */
    where: CheckInPromotionWhereUniqueInput
  }

  /**
   * CheckInPromotion findUniqueOrThrow
   */
  export type CheckInPromotionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInPromotion
     */
    select?: CheckInPromotionSelect<ExtArgs> | null
    /**
     * Filter, which CheckInPromotion to fetch.
     */
    where: CheckInPromotionWhereUniqueInput
  }

  /**
   * CheckInPromotion findFirst
   */
  export type CheckInPromotionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInPromotion
     */
    select?: CheckInPromotionSelect<ExtArgs> | null
    /**
     * Filter, which CheckInPromotion to fetch.
     */
    where?: CheckInPromotionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInPromotions to fetch.
     */
    orderBy?: CheckInPromotionOrderByWithRelationInput | CheckInPromotionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CheckInPromotions.
     */
    cursor?: CheckInPromotionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInPromotions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInPromotions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CheckInPromotions.
     */
    distinct?: CheckInPromotionScalarFieldEnum | CheckInPromotionScalarFieldEnum[]
  }

  /**
   * CheckInPromotion findFirstOrThrow
   */
  export type CheckInPromotionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInPromotion
     */
    select?: CheckInPromotionSelect<ExtArgs> | null
    /**
     * Filter, which CheckInPromotion to fetch.
     */
    where?: CheckInPromotionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInPromotions to fetch.
     */
    orderBy?: CheckInPromotionOrderByWithRelationInput | CheckInPromotionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CheckInPromotions.
     */
    cursor?: CheckInPromotionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInPromotions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInPromotions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CheckInPromotions.
     */
    distinct?: CheckInPromotionScalarFieldEnum | CheckInPromotionScalarFieldEnum[]
  }

  /**
   * CheckInPromotion findMany
   */
  export type CheckInPromotionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInPromotion
     */
    select?: CheckInPromotionSelect<ExtArgs> | null
    /**
     * Filter, which CheckInPromotions to fetch.
     */
    where?: CheckInPromotionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CheckInPromotions to fetch.
     */
    orderBy?: CheckInPromotionOrderByWithRelationInput | CheckInPromotionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CheckInPromotions.
     */
    cursor?: CheckInPromotionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CheckInPromotions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CheckInPromotions.
     */
    skip?: number
    distinct?: CheckInPromotionScalarFieldEnum | CheckInPromotionScalarFieldEnum[]
  }

  /**
   * CheckInPromotion create
   */
  export type CheckInPromotionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInPromotion
     */
    select?: CheckInPromotionSelect<ExtArgs> | null
    /**
     * The data needed to create a CheckInPromotion.
     */
    data: XOR<CheckInPromotionCreateInput, CheckInPromotionUncheckedCreateInput>
  }

  /**
   * CheckInPromotion createMany
   */
  export type CheckInPromotionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CheckInPromotions.
     */
    data: CheckInPromotionCreateManyInput | CheckInPromotionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CheckInPromotion update
   */
  export type CheckInPromotionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInPromotion
     */
    select?: CheckInPromotionSelect<ExtArgs> | null
    /**
     * The data needed to update a CheckInPromotion.
     */
    data: XOR<CheckInPromotionUpdateInput, CheckInPromotionUncheckedUpdateInput>
    /**
     * Choose, which CheckInPromotion to update.
     */
    where: CheckInPromotionWhereUniqueInput
  }

  /**
   * CheckInPromotion updateMany
   */
  export type CheckInPromotionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CheckInPromotions.
     */
    data: XOR<CheckInPromotionUpdateManyMutationInput, CheckInPromotionUncheckedUpdateManyInput>
    /**
     * Filter which CheckInPromotions to update
     */
    where?: CheckInPromotionWhereInput
  }

  /**
   * CheckInPromotion upsert
   */
  export type CheckInPromotionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInPromotion
     */
    select?: CheckInPromotionSelect<ExtArgs> | null
    /**
     * The filter to search for the CheckInPromotion to update in case it exists.
     */
    where: CheckInPromotionWhereUniqueInput
    /**
     * In case the CheckInPromotion found by the `where` argument doesn't exist, create a new CheckInPromotion with this data.
     */
    create: XOR<CheckInPromotionCreateInput, CheckInPromotionUncheckedCreateInput>
    /**
     * In case the CheckInPromotion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CheckInPromotionUpdateInput, CheckInPromotionUncheckedUpdateInput>
  }

  /**
   * CheckInPromotion delete
   */
  export type CheckInPromotionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInPromotion
     */
    select?: CheckInPromotionSelect<ExtArgs> | null
    /**
     * Filter which CheckInPromotion to delete.
     */
    where: CheckInPromotionWhereUniqueInput
  }

  /**
   * CheckInPromotion deleteMany
   */
  export type CheckInPromotionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CheckInPromotions to delete
     */
    where?: CheckInPromotionWhereInput
  }

  /**
   * CheckInPromotion without action
   */
  export type CheckInPromotionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckInPromotion
     */
    select?: CheckInPromotionSelect<ExtArgs> | null
  }


  /**
   * Model Item
   */

  export type AggregateItem = {
    _count: ItemCountAggregateOutputType | null
    _avg: ItemAvgAggregateOutputType | null
    _sum: ItemSumAggregateOutputType | null
    _min: ItemMinAggregateOutputType | null
    _max: ItemMaxAggregateOutputType | null
  }

  export type ItemAvgAggregateOutputType = {
    id: number | null
    rating: number | null
    value: number | null
  }

  export type ItemSumAggregateOutputType = {
    id: number | null
    rating: number | null
    value: number | null
  }

  export type ItemMinAggregateOutputType = {
    id: number | null
    name: string | null
    image_url: string | null
    rating: number | null
    value: number | null
    createdAt: Date | null
    updatedAt: Date | null
    title: string | null
    background: string | null
    textColor: string | null
  }

  export type ItemMaxAggregateOutputType = {
    id: number | null
    name: string | null
    image_url: string | null
    rating: number | null
    value: number | null
    createdAt: Date | null
    updatedAt: Date | null
    title: string | null
    background: string | null
    textColor: string | null
  }

  export type ItemCountAggregateOutputType = {
    id: number
    name: number
    image_url: number
    rating: number
    value: number
    createdAt: number
    updatedAt: number
    title: number
    background: number
    textColor: number
    _all: number
  }


  export type ItemAvgAggregateInputType = {
    id?: true
    rating?: true
    value?: true
  }

  export type ItemSumAggregateInputType = {
    id?: true
    rating?: true
    value?: true
  }

  export type ItemMinAggregateInputType = {
    id?: true
    name?: true
    image_url?: true
    rating?: true
    value?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    background?: true
    textColor?: true
  }

  export type ItemMaxAggregateInputType = {
    id?: true
    name?: true
    image_url?: true
    rating?: true
    value?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    background?: true
    textColor?: true
  }

  export type ItemCountAggregateInputType = {
    id?: true
    name?: true
    image_url?: true
    rating?: true
    value?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    background?: true
    textColor?: true
    _all?: true
  }

  export type ItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Item to aggregate.
     */
    where?: ItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Items to fetch.
     */
    orderBy?: ItemOrderByWithRelationInput | ItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Items from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Items.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Items
    **/
    _count?: true | ItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ItemMaxAggregateInputType
  }

  export type GetItemAggregateType<T extends ItemAggregateArgs> = {
        [P in keyof T & keyof AggregateItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateItem[P]>
      : GetScalarType<T[P], AggregateItem[P]>
  }




  export type ItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItemWhereInput
    orderBy?: ItemOrderByWithAggregationInput | ItemOrderByWithAggregationInput[]
    by: ItemScalarFieldEnum[] | ItemScalarFieldEnum
    having?: ItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ItemCountAggregateInputType | true
    _avg?: ItemAvgAggregateInputType
    _sum?: ItemSumAggregateInputType
    _min?: ItemMinAggregateInputType
    _max?: ItemMaxAggregateInputType
  }

  export type ItemGroupByOutputType = {
    id: number
    name: string
    image_url: string
    rating: number
    value: number
    createdAt: Date | null
    updatedAt: Date | null
    title: string
    background: string | null
    textColor: string | null
    _count: ItemCountAggregateOutputType | null
    _avg: ItemAvgAggregateOutputType | null
    _sum: ItemSumAggregateOutputType | null
    _min: ItemMinAggregateOutputType | null
    _max: ItemMaxAggregateOutputType | null
  }

  type GetItemGroupByPayload<T extends ItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ItemGroupByOutputType[P]>
            : GetScalarType<T[P], ItemGroupByOutputType[P]>
        }
      >
    >


  export type ItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    image_url?: boolean
    rating?: boolean
    value?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    background?: boolean
    textColor?: boolean
  }, ExtArgs["result"]["item"]>


  export type ItemSelectScalar = {
    id?: boolean
    name?: boolean
    image_url?: boolean
    rating?: boolean
    value?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    background?: boolean
    textColor?: boolean
  }


  export type $ItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Item"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      image_url: string
      rating: number
      value: number
      createdAt: Date | null
      updatedAt: Date | null
      title: string
      background: string | null
      textColor: string | null
    }, ExtArgs["result"]["item"]>
    composites: {}
  }

  type ItemGetPayload<S extends boolean | null | undefined | ItemDefaultArgs> = $Result.GetResult<Prisma.$ItemPayload, S>

  type ItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ItemFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ItemCountAggregateInputType | true
    }

  export interface ItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Item'], meta: { name: 'Item' } }
    /**
     * Find zero or one Item that matches the filter.
     * @param {ItemFindUniqueArgs} args - Arguments to find a Item
     * @example
     * // Get one Item
     * const item = await prisma.item.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ItemFindUniqueArgs>(args: SelectSubset<T, ItemFindUniqueArgs<ExtArgs>>): Prisma__ItemClient<$Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Item that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ItemFindUniqueOrThrowArgs} args - Arguments to find a Item
     * @example
     * // Get one Item
     * const item = await prisma.item.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ItemFindUniqueOrThrowArgs>(args: SelectSubset<T, ItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ItemClient<$Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Item that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemFindFirstArgs} args - Arguments to find a Item
     * @example
     * // Get one Item
     * const item = await prisma.item.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ItemFindFirstArgs>(args?: SelectSubset<T, ItemFindFirstArgs<ExtArgs>>): Prisma__ItemClient<$Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Item that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemFindFirstOrThrowArgs} args - Arguments to find a Item
     * @example
     * // Get one Item
     * const item = await prisma.item.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ItemFindFirstOrThrowArgs>(args?: SelectSubset<T, ItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__ItemClient<$Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Items that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Items
     * const items = await prisma.item.findMany()
     * 
     * // Get first 10 Items
     * const items = await prisma.item.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const itemWithIdOnly = await prisma.item.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ItemFindManyArgs>(args?: SelectSubset<T, ItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Item.
     * @param {ItemCreateArgs} args - Arguments to create a Item.
     * @example
     * // Create one Item
     * const Item = await prisma.item.create({
     *   data: {
     *     // ... data to create a Item
     *   }
     * })
     * 
     */
    create<T extends ItemCreateArgs>(args: SelectSubset<T, ItemCreateArgs<ExtArgs>>): Prisma__ItemClient<$Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Items.
     * @param {ItemCreateManyArgs} args - Arguments to create many Items.
     * @example
     * // Create many Items
     * const item = await prisma.item.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ItemCreateManyArgs>(args?: SelectSubset<T, ItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Item.
     * @param {ItemDeleteArgs} args - Arguments to delete one Item.
     * @example
     * // Delete one Item
     * const Item = await prisma.item.delete({
     *   where: {
     *     // ... filter to delete one Item
     *   }
     * })
     * 
     */
    delete<T extends ItemDeleteArgs>(args: SelectSubset<T, ItemDeleteArgs<ExtArgs>>): Prisma__ItemClient<$Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Item.
     * @param {ItemUpdateArgs} args - Arguments to update one Item.
     * @example
     * // Update one Item
     * const item = await prisma.item.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ItemUpdateArgs>(args: SelectSubset<T, ItemUpdateArgs<ExtArgs>>): Prisma__ItemClient<$Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Items.
     * @param {ItemDeleteManyArgs} args - Arguments to filter Items to delete.
     * @example
     * // Delete a few Items
     * const { count } = await prisma.item.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ItemDeleteManyArgs>(args?: SelectSubset<T, ItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Items.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Items
     * const item = await prisma.item.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ItemUpdateManyArgs>(args: SelectSubset<T, ItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Item.
     * @param {ItemUpsertArgs} args - Arguments to update or create a Item.
     * @example
     * // Update or create a Item
     * const item = await prisma.item.upsert({
     *   create: {
     *     // ... data to create a Item
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Item we want to update
     *   }
     * })
     */
    upsert<T extends ItemUpsertArgs>(args: SelectSubset<T, ItemUpsertArgs<ExtArgs>>): Prisma__ItemClient<$Result.GetResult<Prisma.$ItemPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Items.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCountArgs} args - Arguments to filter Items to count.
     * @example
     * // Count the number of Items
     * const count = await prisma.item.count({
     *   where: {
     *     // ... the filter for the Items we want to count
     *   }
     * })
    **/
    count<T extends ItemCountArgs>(
      args?: Subset<T, ItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Item.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ItemAggregateArgs>(args: Subset<T, ItemAggregateArgs>): Prisma.PrismaPromise<GetItemAggregateType<T>>

    /**
     * Group by Item.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ItemGroupByArgs['orderBy'] }
        : { orderBy?: ItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Item model
   */
  readonly fields: ItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Item.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Item model
   */ 
  interface ItemFieldRefs {
    readonly id: FieldRef<"Item", 'Int'>
    readonly name: FieldRef<"Item", 'String'>
    readonly image_url: FieldRef<"Item", 'String'>
    readonly rating: FieldRef<"Item", 'Float'>
    readonly value: FieldRef<"Item", 'Float'>
    readonly createdAt: FieldRef<"Item", 'DateTime'>
    readonly updatedAt: FieldRef<"Item", 'DateTime'>
    readonly title: FieldRef<"Item", 'String'>
    readonly background: FieldRef<"Item", 'String'>
    readonly textColor: FieldRef<"Item", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Item findUnique
   */
  export type ItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Item
     */
    select?: ItemSelect<ExtArgs> | null
    /**
     * Filter, which Item to fetch.
     */
    where: ItemWhereUniqueInput
  }

  /**
   * Item findUniqueOrThrow
   */
  export type ItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Item
     */
    select?: ItemSelect<ExtArgs> | null
    /**
     * Filter, which Item to fetch.
     */
    where: ItemWhereUniqueInput
  }

  /**
   * Item findFirst
   */
  export type ItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Item
     */
    select?: ItemSelect<ExtArgs> | null
    /**
     * Filter, which Item to fetch.
     */
    where?: ItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Items to fetch.
     */
    orderBy?: ItemOrderByWithRelationInput | ItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Items.
     */
    cursor?: ItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Items from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Items.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Items.
     */
    distinct?: ItemScalarFieldEnum | ItemScalarFieldEnum[]
  }

  /**
   * Item findFirstOrThrow
   */
  export type ItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Item
     */
    select?: ItemSelect<ExtArgs> | null
    /**
     * Filter, which Item to fetch.
     */
    where?: ItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Items to fetch.
     */
    orderBy?: ItemOrderByWithRelationInput | ItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Items.
     */
    cursor?: ItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Items from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Items.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Items.
     */
    distinct?: ItemScalarFieldEnum | ItemScalarFieldEnum[]
  }

  /**
   * Item findMany
   */
  export type ItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Item
     */
    select?: ItemSelect<ExtArgs> | null
    /**
     * Filter, which Items to fetch.
     */
    where?: ItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Items to fetch.
     */
    orderBy?: ItemOrderByWithRelationInput | ItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Items.
     */
    cursor?: ItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Items from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Items.
     */
    skip?: number
    distinct?: ItemScalarFieldEnum | ItemScalarFieldEnum[]
  }

  /**
   * Item create
   */
  export type ItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Item
     */
    select?: ItemSelect<ExtArgs> | null
    /**
     * The data needed to create a Item.
     */
    data: XOR<ItemCreateInput, ItemUncheckedCreateInput>
  }

  /**
   * Item createMany
   */
  export type ItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Items.
     */
    data: ItemCreateManyInput | ItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Item update
   */
  export type ItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Item
     */
    select?: ItemSelect<ExtArgs> | null
    /**
     * The data needed to update a Item.
     */
    data: XOR<ItemUpdateInput, ItemUncheckedUpdateInput>
    /**
     * Choose, which Item to update.
     */
    where: ItemWhereUniqueInput
  }

  /**
   * Item updateMany
   */
  export type ItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Items.
     */
    data: XOR<ItemUpdateManyMutationInput, ItemUncheckedUpdateManyInput>
    /**
     * Filter which Items to update
     */
    where?: ItemWhereInput
  }

  /**
   * Item upsert
   */
  export type ItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Item
     */
    select?: ItemSelect<ExtArgs> | null
    /**
     * The filter to search for the Item to update in case it exists.
     */
    where: ItemWhereUniqueInput
    /**
     * In case the Item found by the `where` argument doesn't exist, create a new Item with this data.
     */
    create: XOR<ItemCreateInput, ItemUncheckedCreateInput>
    /**
     * In case the Item was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ItemUpdateInput, ItemUncheckedUpdateInput>
  }

  /**
   * Item delete
   */
  export type ItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Item
     */
    select?: ItemSelect<ExtArgs> | null
    /**
     * Filter which Item to delete.
     */
    where: ItemWhereUniqueInput
  }

  /**
   * Item deleteMany
   */
  export type ItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Items to delete
     */
    where?: ItemWhereInput
  }

  /**
   * Item without action
   */
  export type ItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Item
     */
    select?: ItemSelect<ExtArgs> | null
  }


  /**
   * Model GameItemMap
   */

  export type AggregateGameItemMap = {
    _count: GameItemMapCountAggregateOutputType | null
    _avg: GameItemMapAvgAggregateOutputType | null
    _sum: GameItemMapSumAggregateOutputType | null
    _min: GameItemMapMinAggregateOutputType | null
    _max: GameItemMapMaxAggregateOutputType | null
  }

  export type GameItemMapAvgAggregateOutputType = {
    id: number | null
    gameId: number | null
    itemId: number | null
  }

  export type GameItemMapSumAggregateOutputType = {
    id: number | null
    gameId: number | null
    itemId: number | null
  }

  export type GameItemMapMinAggregateOutputType = {
    id: number | null
    gameId: number | null
    itemId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GameItemMapMaxAggregateOutputType = {
    id: number | null
    gameId: number | null
    itemId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GameItemMapCountAggregateOutputType = {
    id: number
    gameId: number
    itemId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GameItemMapAvgAggregateInputType = {
    id?: true
    gameId?: true
    itemId?: true
  }

  export type GameItemMapSumAggregateInputType = {
    id?: true
    gameId?: true
    itemId?: true
  }

  export type GameItemMapMinAggregateInputType = {
    id?: true
    gameId?: true
    itemId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GameItemMapMaxAggregateInputType = {
    id?: true
    gameId?: true
    itemId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GameItemMapCountAggregateInputType = {
    id?: true
    gameId?: true
    itemId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GameItemMapAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameItemMap to aggregate.
     */
    where?: GameItemMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameItemMaps to fetch.
     */
    orderBy?: GameItemMapOrderByWithRelationInput | GameItemMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GameItemMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameItemMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameItemMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GameItemMaps
    **/
    _count?: true | GameItemMapCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GameItemMapAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GameItemMapSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GameItemMapMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GameItemMapMaxAggregateInputType
  }

  export type GetGameItemMapAggregateType<T extends GameItemMapAggregateArgs> = {
        [P in keyof T & keyof AggregateGameItemMap]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGameItemMap[P]>
      : GetScalarType<T[P], AggregateGameItemMap[P]>
  }




  export type GameItemMapGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameItemMapWhereInput
    orderBy?: GameItemMapOrderByWithAggregationInput | GameItemMapOrderByWithAggregationInput[]
    by: GameItemMapScalarFieldEnum[] | GameItemMapScalarFieldEnum
    having?: GameItemMapScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GameItemMapCountAggregateInputType | true
    _avg?: GameItemMapAvgAggregateInputType
    _sum?: GameItemMapSumAggregateInputType
    _min?: GameItemMapMinAggregateInputType
    _max?: GameItemMapMaxAggregateInputType
  }

  export type GameItemMapGroupByOutputType = {
    id: number
    gameId: number
    itemId: number
    createdAt: Date
    updatedAt: Date
    _count: GameItemMapCountAggregateOutputType | null
    _avg: GameItemMapAvgAggregateOutputType | null
    _sum: GameItemMapSumAggregateOutputType | null
    _min: GameItemMapMinAggregateOutputType | null
    _max: GameItemMapMaxAggregateOutputType | null
  }

  type GetGameItemMapGroupByPayload<T extends GameItemMapGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GameItemMapGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GameItemMapGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GameItemMapGroupByOutputType[P]>
            : GetScalarType<T[P], GameItemMapGroupByOutputType[P]>
        }
      >
    >


  export type GameItemMapSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    gameId?: boolean
    itemId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["gameItemMap"]>


  export type GameItemMapSelectScalar = {
    id?: boolean
    gameId?: boolean
    itemId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $GameItemMapPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GameItemMap"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      gameId: number
      itemId: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["gameItemMap"]>
    composites: {}
  }

  type GameItemMapGetPayload<S extends boolean | null | undefined | GameItemMapDefaultArgs> = $Result.GetResult<Prisma.$GameItemMapPayload, S>

  type GameItemMapCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GameItemMapFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GameItemMapCountAggregateInputType | true
    }

  export interface GameItemMapDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GameItemMap'], meta: { name: 'GameItemMap' } }
    /**
     * Find zero or one GameItemMap that matches the filter.
     * @param {GameItemMapFindUniqueArgs} args - Arguments to find a GameItemMap
     * @example
     * // Get one GameItemMap
     * const gameItemMap = await prisma.gameItemMap.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GameItemMapFindUniqueArgs>(args: SelectSubset<T, GameItemMapFindUniqueArgs<ExtArgs>>): Prisma__GameItemMapClient<$Result.GetResult<Prisma.$GameItemMapPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GameItemMap that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GameItemMapFindUniqueOrThrowArgs} args - Arguments to find a GameItemMap
     * @example
     * // Get one GameItemMap
     * const gameItemMap = await prisma.gameItemMap.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GameItemMapFindUniqueOrThrowArgs>(args: SelectSubset<T, GameItemMapFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GameItemMapClient<$Result.GetResult<Prisma.$GameItemMapPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GameItemMap that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameItemMapFindFirstArgs} args - Arguments to find a GameItemMap
     * @example
     * // Get one GameItemMap
     * const gameItemMap = await prisma.gameItemMap.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GameItemMapFindFirstArgs>(args?: SelectSubset<T, GameItemMapFindFirstArgs<ExtArgs>>): Prisma__GameItemMapClient<$Result.GetResult<Prisma.$GameItemMapPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GameItemMap that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameItemMapFindFirstOrThrowArgs} args - Arguments to find a GameItemMap
     * @example
     * // Get one GameItemMap
     * const gameItemMap = await prisma.gameItemMap.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GameItemMapFindFirstOrThrowArgs>(args?: SelectSubset<T, GameItemMapFindFirstOrThrowArgs<ExtArgs>>): Prisma__GameItemMapClient<$Result.GetResult<Prisma.$GameItemMapPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GameItemMaps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameItemMapFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GameItemMaps
     * const gameItemMaps = await prisma.gameItemMap.findMany()
     * 
     * // Get first 10 GameItemMaps
     * const gameItemMaps = await prisma.gameItemMap.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gameItemMapWithIdOnly = await prisma.gameItemMap.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GameItemMapFindManyArgs>(args?: SelectSubset<T, GameItemMapFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameItemMapPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GameItemMap.
     * @param {GameItemMapCreateArgs} args - Arguments to create a GameItemMap.
     * @example
     * // Create one GameItemMap
     * const GameItemMap = await prisma.gameItemMap.create({
     *   data: {
     *     // ... data to create a GameItemMap
     *   }
     * })
     * 
     */
    create<T extends GameItemMapCreateArgs>(args: SelectSubset<T, GameItemMapCreateArgs<ExtArgs>>): Prisma__GameItemMapClient<$Result.GetResult<Prisma.$GameItemMapPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GameItemMaps.
     * @param {GameItemMapCreateManyArgs} args - Arguments to create many GameItemMaps.
     * @example
     * // Create many GameItemMaps
     * const gameItemMap = await prisma.gameItemMap.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GameItemMapCreateManyArgs>(args?: SelectSubset<T, GameItemMapCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a GameItemMap.
     * @param {GameItemMapDeleteArgs} args - Arguments to delete one GameItemMap.
     * @example
     * // Delete one GameItemMap
     * const GameItemMap = await prisma.gameItemMap.delete({
     *   where: {
     *     // ... filter to delete one GameItemMap
     *   }
     * })
     * 
     */
    delete<T extends GameItemMapDeleteArgs>(args: SelectSubset<T, GameItemMapDeleteArgs<ExtArgs>>): Prisma__GameItemMapClient<$Result.GetResult<Prisma.$GameItemMapPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GameItemMap.
     * @param {GameItemMapUpdateArgs} args - Arguments to update one GameItemMap.
     * @example
     * // Update one GameItemMap
     * const gameItemMap = await prisma.gameItemMap.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GameItemMapUpdateArgs>(args: SelectSubset<T, GameItemMapUpdateArgs<ExtArgs>>): Prisma__GameItemMapClient<$Result.GetResult<Prisma.$GameItemMapPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GameItemMaps.
     * @param {GameItemMapDeleteManyArgs} args - Arguments to filter GameItemMaps to delete.
     * @example
     * // Delete a few GameItemMaps
     * const { count } = await prisma.gameItemMap.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GameItemMapDeleteManyArgs>(args?: SelectSubset<T, GameItemMapDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GameItemMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameItemMapUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GameItemMaps
     * const gameItemMap = await prisma.gameItemMap.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GameItemMapUpdateManyArgs>(args: SelectSubset<T, GameItemMapUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GameItemMap.
     * @param {GameItemMapUpsertArgs} args - Arguments to update or create a GameItemMap.
     * @example
     * // Update or create a GameItemMap
     * const gameItemMap = await prisma.gameItemMap.upsert({
     *   create: {
     *     // ... data to create a GameItemMap
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GameItemMap we want to update
     *   }
     * })
     */
    upsert<T extends GameItemMapUpsertArgs>(args: SelectSubset<T, GameItemMapUpsertArgs<ExtArgs>>): Prisma__GameItemMapClient<$Result.GetResult<Prisma.$GameItemMapPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GameItemMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameItemMapCountArgs} args - Arguments to filter GameItemMaps to count.
     * @example
     * // Count the number of GameItemMaps
     * const count = await prisma.gameItemMap.count({
     *   where: {
     *     // ... the filter for the GameItemMaps we want to count
     *   }
     * })
    **/
    count<T extends GameItemMapCountArgs>(
      args?: Subset<T, GameItemMapCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GameItemMapCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GameItemMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameItemMapAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GameItemMapAggregateArgs>(args: Subset<T, GameItemMapAggregateArgs>): Prisma.PrismaPromise<GetGameItemMapAggregateType<T>>

    /**
     * Group by GameItemMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameItemMapGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GameItemMapGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GameItemMapGroupByArgs['orderBy'] }
        : { orderBy?: GameItemMapGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GameItemMapGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGameItemMapGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GameItemMap model
   */
  readonly fields: GameItemMapFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GameItemMap.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GameItemMapClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GameItemMap model
   */ 
  interface GameItemMapFieldRefs {
    readonly id: FieldRef<"GameItemMap", 'Int'>
    readonly gameId: FieldRef<"GameItemMap", 'Int'>
    readonly itemId: FieldRef<"GameItemMap", 'Int'>
    readonly createdAt: FieldRef<"GameItemMap", 'DateTime'>
    readonly updatedAt: FieldRef<"GameItemMap", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GameItemMap findUnique
   */
  export type GameItemMapFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameItemMap
     */
    select?: GameItemMapSelect<ExtArgs> | null
    /**
     * Filter, which GameItemMap to fetch.
     */
    where: GameItemMapWhereUniqueInput
  }

  /**
   * GameItemMap findUniqueOrThrow
   */
  export type GameItemMapFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameItemMap
     */
    select?: GameItemMapSelect<ExtArgs> | null
    /**
     * Filter, which GameItemMap to fetch.
     */
    where: GameItemMapWhereUniqueInput
  }

  /**
   * GameItemMap findFirst
   */
  export type GameItemMapFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameItemMap
     */
    select?: GameItemMapSelect<ExtArgs> | null
    /**
     * Filter, which GameItemMap to fetch.
     */
    where?: GameItemMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameItemMaps to fetch.
     */
    orderBy?: GameItemMapOrderByWithRelationInput | GameItemMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameItemMaps.
     */
    cursor?: GameItemMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameItemMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameItemMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameItemMaps.
     */
    distinct?: GameItemMapScalarFieldEnum | GameItemMapScalarFieldEnum[]
  }

  /**
   * GameItemMap findFirstOrThrow
   */
  export type GameItemMapFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameItemMap
     */
    select?: GameItemMapSelect<ExtArgs> | null
    /**
     * Filter, which GameItemMap to fetch.
     */
    where?: GameItemMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameItemMaps to fetch.
     */
    orderBy?: GameItemMapOrderByWithRelationInput | GameItemMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameItemMaps.
     */
    cursor?: GameItemMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameItemMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameItemMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameItemMaps.
     */
    distinct?: GameItemMapScalarFieldEnum | GameItemMapScalarFieldEnum[]
  }

  /**
   * GameItemMap findMany
   */
  export type GameItemMapFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameItemMap
     */
    select?: GameItemMapSelect<ExtArgs> | null
    /**
     * Filter, which GameItemMaps to fetch.
     */
    where?: GameItemMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameItemMaps to fetch.
     */
    orderBy?: GameItemMapOrderByWithRelationInput | GameItemMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GameItemMaps.
     */
    cursor?: GameItemMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameItemMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameItemMaps.
     */
    skip?: number
    distinct?: GameItemMapScalarFieldEnum | GameItemMapScalarFieldEnum[]
  }

  /**
   * GameItemMap create
   */
  export type GameItemMapCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameItemMap
     */
    select?: GameItemMapSelect<ExtArgs> | null
    /**
     * The data needed to create a GameItemMap.
     */
    data: XOR<GameItemMapCreateInput, GameItemMapUncheckedCreateInput>
  }

  /**
   * GameItemMap createMany
   */
  export type GameItemMapCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GameItemMaps.
     */
    data: GameItemMapCreateManyInput | GameItemMapCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GameItemMap update
   */
  export type GameItemMapUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameItemMap
     */
    select?: GameItemMapSelect<ExtArgs> | null
    /**
     * The data needed to update a GameItemMap.
     */
    data: XOR<GameItemMapUpdateInput, GameItemMapUncheckedUpdateInput>
    /**
     * Choose, which GameItemMap to update.
     */
    where: GameItemMapWhereUniqueInput
  }

  /**
   * GameItemMap updateMany
   */
  export type GameItemMapUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GameItemMaps.
     */
    data: XOR<GameItemMapUpdateManyMutationInput, GameItemMapUncheckedUpdateManyInput>
    /**
     * Filter which GameItemMaps to update
     */
    where?: GameItemMapWhereInput
  }

  /**
   * GameItemMap upsert
   */
  export type GameItemMapUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameItemMap
     */
    select?: GameItemMapSelect<ExtArgs> | null
    /**
     * The filter to search for the GameItemMap to update in case it exists.
     */
    where: GameItemMapWhereUniqueInput
    /**
     * In case the GameItemMap found by the `where` argument doesn't exist, create a new GameItemMap with this data.
     */
    create: XOR<GameItemMapCreateInput, GameItemMapUncheckedCreateInput>
    /**
     * In case the GameItemMap was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GameItemMapUpdateInput, GameItemMapUncheckedUpdateInput>
  }

  /**
   * GameItemMap delete
   */
  export type GameItemMapDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameItemMap
     */
    select?: GameItemMapSelect<ExtArgs> | null
    /**
     * Filter which GameItemMap to delete.
     */
    where: GameItemMapWhereUniqueInput
  }

  /**
   * GameItemMap deleteMany
   */
  export type GameItemMapDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameItemMaps to delete
     */
    where?: GameItemMapWhereInput
  }

  /**
   * GameItemMap without action
   */
  export type GameItemMapDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameItemMap
     */
    select?: GameItemMapSelect<ExtArgs> | null
  }


  /**
   * Model GameResult
   */

  export type AggregateGameResult = {
    _count: GameResultCountAggregateOutputType | null
    _avg: GameResultAvgAggregateOutputType | null
    _sum: GameResultSumAggregateOutputType | null
    _min: GameResultMinAggregateOutputType | null
    _max: GameResultMaxAggregateOutputType | null
  }

  export type GameResultAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    itemId: number | null
  }

  export type GameResultSumAggregateOutputType = {
    id: number | null
    userId: number | null
    itemId: number | null
  }

  export type GameResultMinAggregateOutputType = {
    id: number | null
    userId: number | null
    itemId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GameResultMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    itemId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GameResultCountAggregateOutputType = {
    id: number
    userId: number
    itemId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GameResultAvgAggregateInputType = {
    id?: true
    userId?: true
    itemId?: true
  }

  export type GameResultSumAggregateInputType = {
    id?: true
    userId?: true
    itemId?: true
  }

  export type GameResultMinAggregateInputType = {
    id?: true
    userId?: true
    itemId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GameResultMaxAggregateInputType = {
    id?: true
    userId?: true
    itemId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GameResultCountAggregateInputType = {
    id?: true
    userId?: true
    itemId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GameResultAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameResult to aggregate.
     */
    where?: GameResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameResults to fetch.
     */
    orderBy?: GameResultOrderByWithRelationInput | GameResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GameResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GameResults
    **/
    _count?: true | GameResultCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GameResultAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GameResultSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GameResultMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GameResultMaxAggregateInputType
  }

  export type GetGameResultAggregateType<T extends GameResultAggregateArgs> = {
        [P in keyof T & keyof AggregateGameResult]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGameResult[P]>
      : GetScalarType<T[P], AggregateGameResult[P]>
  }




  export type GameResultGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameResultWhereInput
    orderBy?: GameResultOrderByWithAggregationInput | GameResultOrderByWithAggregationInput[]
    by: GameResultScalarFieldEnum[] | GameResultScalarFieldEnum
    having?: GameResultScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GameResultCountAggregateInputType | true
    _avg?: GameResultAvgAggregateInputType
    _sum?: GameResultSumAggregateInputType
    _min?: GameResultMinAggregateInputType
    _max?: GameResultMaxAggregateInputType
  }

  export type GameResultGroupByOutputType = {
    id: number
    userId: number
    itemId: number
    createdAt: Date
    updatedAt: Date
    _count: GameResultCountAggregateOutputType | null
    _avg: GameResultAvgAggregateOutputType | null
    _sum: GameResultSumAggregateOutputType | null
    _min: GameResultMinAggregateOutputType | null
    _max: GameResultMaxAggregateOutputType | null
  }

  type GetGameResultGroupByPayload<T extends GameResultGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GameResultGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GameResultGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GameResultGroupByOutputType[P]>
            : GetScalarType<T[P], GameResultGroupByOutputType[P]>
        }
      >
    >


  export type GameResultSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    itemId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userStarHistory?: boolean | GameResult$userStarHistoryArgs<ExtArgs>
    users?: boolean | UserDefaultArgs<ExtArgs>
    _count?: boolean | GameResultCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gameResult"]>


  export type GameResultSelectScalar = {
    id?: boolean
    userId?: boolean
    itemId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GameResultInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userStarHistory?: boolean | GameResult$userStarHistoryArgs<ExtArgs>
    users?: boolean | UserDefaultArgs<ExtArgs>
    _count?: boolean | GameResultCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $GameResultPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GameResult"
    objects: {
      userStarHistory: Prisma.$UserStarHistoryPayload<ExtArgs>[]
      users: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      itemId: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["gameResult"]>
    composites: {}
  }

  type GameResultGetPayload<S extends boolean | null | undefined | GameResultDefaultArgs> = $Result.GetResult<Prisma.$GameResultPayload, S>

  type GameResultCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GameResultFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GameResultCountAggregateInputType | true
    }

  export interface GameResultDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GameResult'], meta: { name: 'GameResult' } }
    /**
     * Find zero or one GameResult that matches the filter.
     * @param {GameResultFindUniqueArgs} args - Arguments to find a GameResult
     * @example
     * // Get one GameResult
     * const gameResult = await prisma.gameResult.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GameResultFindUniqueArgs>(args: SelectSubset<T, GameResultFindUniqueArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GameResult that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GameResultFindUniqueOrThrowArgs} args - Arguments to find a GameResult
     * @example
     * // Get one GameResult
     * const gameResult = await prisma.gameResult.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GameResultFindUniqueOrThrowArgs>(args: SelectSubset<T, GameResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GameResult that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultFindFirstArgs} args - Arguments to find a GameResult
     * @example
     * // Get one GameResult
     * const gameResult = await prisma.gameResult.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GameResultFindFirstArgs>(args?: SelectSubset<T, GameResultFindFirstArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GameResult that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultFindFirstOrThrowArgs} args - Arguments to find a GameResult
     * @example
     * // Get one GameResult
     * const gameResult = await prisma.gameResult.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GameResultFindFirstOrThrowArgs>(args?: SelectSubset<T, GameResultFindFirstOrThrowArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GameResults that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GameResults
     * const gameResults = await prisma.gameResult.findMany()
     * 
     * // Get first 10 GameResults
     * const gameResults = await prisma.gameResult.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gameResultWithIdOnly = await prisma.gameResult.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GameResultFindManyArgs>(args?: SelectSubset<T, GameResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GameResult.
     * @param {GameResultCreateArgs} args - Arguments to create a GameResult.
     * @example
     * // Create one GameResult
     * const GameResult = await prisma.gameResult.create({
     *   data: {
     *     // ... data to create a GameResult
     *   }
     * })
     * 
     */
    create<T extends GameResultCreateArgs>(args: SelectSubset<T, GameResultCreateArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GameResults.
     * @param {GameResultCreateManyArgs} args - Arguments to create many GameResults.
     * @example
     * // Create many GameResults
     * const gameResult = await prisma.gameResult.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GameResultCreateManyArgs>(args?: SelectSubset<T, GameResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a GameResult.
     * @param {GameResultDeleteArgs} args - Arguments to delete one GameResult.
     * @example
     * // Delete one GameResult
     * const GameResult = await prisma.gameResult.delete({
     *   where: {
     *     // ... filter to delete one GameResult
     *   }
     * })
     * 
     */
    delete<T extends GameResultDeleteArgs>(args: SelectSubset<T, GameResultDeleteArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GameResult.
     * @param {GameResultUpdateArgs} args - Arguments to update one GameResult.
     * @example
     * // Update one GameResult
     * const gameResult = await prisma.gameResult.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GameResultUpdateArgs>(args: SelectSubset<T, GameResultUpdateArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GameResults.
     * @param {GameResultDeleteManyArgs} args - Arguments to filter GameResults to delete.
     * @example
     * // Delete a few GameResults
     * const { count } = await prisma.gameResult.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GameResultDeleteManyArgs>(args?: SelectSubset<T, GameResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GameResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GameResults
     * const gameResult = await prisma.gameResult.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GameResultUpdateManyArgs>(args: SelectSubset<T, GameResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GameResult.
     * @param {GameResultUpsertArgs} args - Arguments to update or create a GameResult.
     * @example
     * // Update or create a GameResult
     * const gameResult = await prisma.gameResult.upsert({
     *   create: {
     *     // ... data to create a GameResult
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GameResult we want to update
     *   }
     * })
     */
    upsert<T extends GameResultUpsertArgs>(args: SelectSubset<T, GameResultUpsertArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GameResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultCountArgs} args - Arguments to filter GameResults to count.
     * @example
     * // Count the number of GameResults
     * const count = await prisma.gameResult.count({
     *   where: {
     *     // ... the filter for the GameResults we want to count
     *   }
     * })
    **/
    count<T extends GameResultCountArgs>(
      args?: Subset<T, GameResultCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GameResultCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GameResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GameResultAggregateArgs>(args: Subset<T, GameResultAggregateArgs>): Prisma.PrismaPromise<GetGameResultAggregateType<T>>

    /**
     * Group by GameResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameResultGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GameResultGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GameResultGroupByArgs['orderBy'] }
        : { orderBy?: GameResultGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GameResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGameResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GameResult model
   */
  readonly fields: GameResultFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GameResult.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GameResultClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    userStarHistory<T extends GameResult$userStarHistoryArgs<ExtArgs> = {}>(args?: Subset<T, GameResult$userStarHistoryArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserStarHistoryPayload<ExtArgs>, T, "findMany"> | Null>
    users<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GameResult model
   */ 
  interface GameResultFieldRefs {
    readonly id: FieldRef<"GameResult", 'Int'>
    readonly userId: FieldRef<"GameResult", 'Int'>
    readonly itemId: FieldRef<"GameResult", 'Int'>
    readonly createdAt: FieldRef<"GameResult", 'DateTime'>
    readonly updatedAt: FieldRef<"GameResult", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GameResult findUnique
   */
  export type GameResultFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
    /**
     * Filter, which GameResult to fetch.
     */
    where: GameResultWhereUniqueInput
  }

  /**
   * GameResult findUniqueOrThrow
   */
  export type GameResultFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
    /**
     * Filter, which GameResult to fetch.
     */
    where: GameResultWhereUniqueInput
  }

  /**
   * GameResult findFirst
   */
  export type GameResultFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
    /**
     * Filter, which GameResult to fetch.
     */
    where?: GameResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameResults to fetch.
     */
    orderBy?: GameResultOrderByWithRelationInput | GameResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameResults.
     */
    cursor?: GameResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameResults.
     */
    distinct?: GameResultScalarFieldEnum | GameResultScalarFieldEnum[]
  }

  /**
   * GameResult findFirstOrThrow
   */
  export type GameResultFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
    /**
     * Filter, which GameResult to fetch.
     */
    where?: GameResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameResults to fetch.
     */
    orderBy?: GameResultOrderByWithRelationInput | GameResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameResults.
     */
    cursor?: GameResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameResults.
     */
    distinct?: GameResultScalarFieldEnum | GameResultScalarFieldEnum[]
  }

  /**
   * GameResult findMany
   */
  export type GameResultFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
    /**
     * Filter, which GameResults to fetch.
     */
    where?: GameResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameResults to fetch.
     */
    orderBy?: GameResultOrderByWithRelationInput | GameResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GameResults.
     */
    cursor?: GameResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameResults.
     */
    skip?: number
    distinct?: GameResultScalarFieldEnum | GameResultScalarFieldEnum[]
  }

  /**
   * GameResult create
   */
  export type GameResultCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
    /**
     * The data needed to create a GameResult.
     */
    data: XOR<GameResultCreateInput, GameResultUncheckedCreateInput>
  }

  /**
   * GameResult createMany
   */
  export type GameResultCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GameResults.
     */
    data: GameResultCreateManyInput | GameResultCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GameResult update
   */
  export type GameResultUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
    /**
     * The data needed to update a GameResult.
     */
    data: XOR<GameResultUpdateInput, GameResultUncheckedUpdateInput>
    /**
     * Choose, which GameResult to update.
     */
    where: GameResultWhereUniqueInput
  }

  /**
   * GameResult updateMany
   */
  export type GameResultUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GameResults.
     */
    data: XOR<GameResultUpdateManyMutationInput, GameResultUncheckedUpdateManyInput>
    /**
     * Filter which GameResults to update
     */
    where?: GameResultWhereInput
  }

  /**
   * GameResult upsert
   */
  export type GameResultUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
    /**
     * The filter to search for the GameResult to update in case it exists.
     */
    where: GameResultWhereUniqueInput
    /**
     * In case the GameResult found by the `where` argument doesn't exist, create a new GameResult with this data.
     */
    create: XOR<GameResultCreateInput, GameResultUncheckedCreateInput>
    /**
     * In case the GameResult was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GameResultUpdateInput, GameResultUncheckedUpdateInput>
  }

  /**
   * GameResult delete
   */
  export type GameResultDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
    /**
     * Filter which GameResult to delete.
     */
    where: GameResultWhereUniqueInput
  }

  /**
   * GameResult deleteMany
   */
  export type GameResultDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameResults to delete
     */
    where?: GameResultWhereInput
  }

  /**
   * GameResult.userStarHistory
   */
  export type GameResult$userStarHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStarHistory
     */
    select?: UserStarHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStarHistoryInclude<ExtArgs> | null
    where?: UserStarHistoryWhereInput
    orderBy?: UserStarHistoryOrderByWithRelationInput | UserStarHistoryOrderByWithRelationInput[]
    cursor?: UserStarHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserStarHistoryScalarFieldEnum | UserStarHistoryScalarFieldEnum[]
  }

  /**
   * GameResult without action
   */
  export type GameResultDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
  }


  /**
   * Model UserMissionMap
   */

  export type AggregateUserMissionMap = {
    _count: UserMissionMapCountAggregateOutputType | null
    _avg: UserMissionMapAvgAggregateOutputType | null
    _sum: UserMissionMapSumAggregateOutputType | null
    _min: UserMissionMapMinAggregateOutputType | null
    _max: UserMissionMapMaxAggregateOutputType | null
  }

  export type UserMissionMapAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    missionId: number | null
  }

  export type UserMissionMapSumAggregateOutputType = {
    id: number | null
    userId: number | null
    missionId: number | null
  }

  export type UserMissionMapMinAggregateOutputType = {
    id: number | null
    userId: number | null
    missionId: number | null
    branch: string | null
    isDone: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMissionMapMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    missionId: number | null
    branch: string | null
    isDone: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMissionMapCountAggregateOutputType = {
    id: number
    userId: number
    missionId: number
    branch: number
    isDone: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMissionMapAvgAggregateInputType = {
    id?: true
    userId?: true
    missionId?: true
  }

  export type UserMissionMapSumAggregateInputType = {
    id?: true
    userId?: true
    missionId?: true
  }

  export type UserMissionMapMinAggregateInputType = {
    id?: true
    userId?: true
    missionId?: true
    branch?: true
    isDone?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMissionMapMaxAggregateInputType = {
    id?: true
    userId?: true
    missionId?: true
    branch?: true
    isDone?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMissionMapCountAggregateInputType = {
    id?: true
    userId?: true
    missionId?: true
    branch?: true
    isDone?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserMissionMapAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserMissionMap to aggregate.
     */
    where?: UserMissionMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMissionMaps to fetch.
     */
    orderBy?: UserMissionMapOrderByWithRelationInput | UserMissionMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserMissionMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMissionMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMissionMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserMissionMaps
    **/
    _count?: true | UserMissionMapCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserMissionMapAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserMissionMapSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMissionMapMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMissionMapMaxAggregateInputType
  }

  export type GetUserMissionMapAggregateType<T extends UserMissionMapAggregateArgs> = {
        [P in keyof T & keyof AggregateUserMissionMap]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserMissionMap[P]>
      : GetScalarType<T[P], AggregateUserMissionMap[P]>
  }




  export type UserMissionMapGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserMissionMapWhereInput
    orderBy?: UserMissionMapOrderByWithAggregationInput | UserMissionMapOrderByWithAggregationInput[]
    by: UserMissionMapScalarFieldEnum[] | UserMissionMapScalarFieldEnum
    having?: UserMissionMapScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserMissionMapCountAggregateInputType | true
    _avg?: UserMissionMapAvgAggregateInputType
    _sum?: UserMissionMapSumAggregateInputType
    _min?: UserMissionMapMinAggregateInputType
    _max?: UserMissionMapMaxAggregateInputType
  }

  export type UserMissionMapGroupByOutputType = {
    id: number
    userId: number
    missionId: number
    branch: string
    isDone: boolean
    createdAt: Date
    updatedAt: Date
    _count: UserMissionMapCountAggregateOutputType | null
    _avg: UserMissionMapAvgAggregateOutputType | null
    _sum: UserMissionMapSumAggregateOutputType | null
    _min: UserMissionMapMinAggregateOutputType | null
    _max: UserMissionMapMaxAggregateOutputType | null
  }

  type GetUserMissionMapGroupByPayload<T extends UserMissionMapGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserMissionMapGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserMissionMapGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserMissionMapGroupByOutputType[P]>
            : GetScalarType<T[P], UserMissionMapGroupByOutputType[P]>
        }
      >
    >


  export type UserMissionMapSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    missionId?: boolean
    branch?: boolean
    isDone?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    users?: boolean | UserDefaultArgs<ExtArgs>
    mission?: boolean | MissionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userMissionMap"]>


  export type UserMissionMapSelectScalar = {
    id?: boolean
    userId?: boolean
    missionId?: boolean
    branch?: boolean
    isDone?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserMissionMapInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | UserDefaultArgs<ExtArgs>
    mission?: boolean | MissionDefaultArgs<ExtArgs>
  }

  export type $UserMissionMapPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserMissionMap"
    objects: {
      users: Prisma.$UserPayload<ExtArgs>
      mission: Prisma.$MissionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      missionId: number
      branch: string
      isDone: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userMissionMap"]>
    composites: {}
  }

  type UserMissionMapGetPayload<S extends boolean | null | undefined | UserMissionMapDefaultArgs> = $Result.GetResult<Prisma.$UserMissionMapPayload, S>

  type UserMissionMapCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserMissionMapFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserMissionMapCountAggregateInputType | true
    }

  export interface UserMissionMapDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserMissionMap'], meta: { name: 'UserMissionMap' } }
    /**
     * Find zero or one UserMissionMap that matches the filter.
     * @param {UserMissionMapFindUniqueArgs} args - Arguments to find a UserMissionMap
     * @example
     * // Get one UserMissionMap
     * const userMissionMap = await prisma.userMissionMap.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserMissionMapFindUniqueArgs>(args: SelectSubset<T, UserMissionMapFindUniqueArgs<ExtArgs>>): Prisma__UserMissionMapClient<$Result.GetResult<Prisma.$UserMissionMapPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserMissionMap that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserMissionMapFindUniqueOrThrowArgs} args - Arguments to find a UserMissionMap
     * @example
     * // Get one UserMissionMap
     * const userMissionMap = await prisma.userMissionMap.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserMissionMapFindUniqueOrThrowArgs>(args: SelectSubset<T, UserMissionMapFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserMissionMapClient<$Result.GetResult<Prisma.$UserMissionMapPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserMissionMap that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMissionMapFindFirstArgs} args - Arguments to find a UserMissionMap
     * @example
     * // Get one UserMissionMap
     * const userMissionMap = await prisma.userMissionMap.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserMissionMapFindFirstArgs>(args?: SelectSubset<T, UserMissionMapFindFirstArgs<ExtArgs>>): Prisma__UserMissionMapClient<$Result.GetResult<Prisma.$UserMissionMapPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserMissionMap that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMissionMapFindFirstOrThrowArgs} args - Arguments to find a UserMissionMap
     * @example
     * // Get one UserMissionMap
     * const userMissionMap = await prisma.userMissionMap.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserMissionMapFindFirstOrThrowArgs>(args?: SelectSubset<T, UserMissionMapFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserMissionMapClient<$Result.GetResult<Prisma.$UserMissionMapPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserMissionMaps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMissionMapFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserMissionMaps
     * const userMissionMaps = await prisma.userMissionMap.findMany()
     * 
     * // Get first 10 UserMissionMaps
     * const userMissionMaps = await prisma.userMissionMap.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userMissionMapWithIdOnly = await prisma.userMissionMap.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserMissionMapFindManyArgs>(args?: SelectSubset<T, UserMissionMapFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMissionMapPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserMissionMap.
     * @param {UserMissionMapCreateArgs} args - Arguments to create a UserMissionMap.
     * @example
     * // Create one UserMissionMap
     * const UserMissionMap = await prisma.userMissionMap.create({
     *   data: {
     *     // ... data to create a UserMissionMap
     *   }
     * })
     * 
     */
    create<T extends UserMissionMapCreateArgs>(args: SelectSubset<T, UserMissionMapCreateArgs<ExtArgs>>): Prisma__UserMissionMapClient<$Result.GetResult<Prisma.$UserMissionMapPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserMissionMaps.
     * @param {UserMissionMapCreateManyArgs} args - Arguments to create many UserMissionMaps.
     * @example
     * // Create many UserMissionMaps
     * const userMissionMap = await prisma.userMissionMap.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserMissionMapCreateManyArgs>(args?: SelectSubset<T, UserMissionMapCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a UserMissionMap.
     * @param {UserMissionMapDeleteArgs} args - Arguments to delete one UserMissionMap.
     * @example
     * // Delete one UserMissionMap
     * const UserMissionMap = await prisma.userMissionMap.delete({
     *   where: {
     *     // ... filter to delete one UserMissionMap
     *   }
     * })
     * 
     */
    delete<T extends UserMissionMapDeleteArgs>(args: SelectSubset<T, UserMissionMapDeleteArgs<ExtArgs>>): Prisma__UserMissionMapClient<$Result.GetResult<Prisma.$UserMissionMapPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserMissionMap.
     * @param {UserMissionMapUpdateArgs} args - Arguments to update one UserMissionMap.
     * @example
     * // Update one UserMissionMap
     * const userMissionMap = await prisma.userMissionMap.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserMissionMapUpdateArgs>(args: SelectSubset<T, UserMissionMapUpdateArgs<ExtArgs>>): Prisma__UserMissionMapClient<$Result.GetResult<Prisma.$UserMissionMapPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserMissionMaps.
     * @param {UserMissionMapDeleteManyArgs} args - Arguments to filter UserMissionMaps to delete.
     * @example
     * // Delete a few UserMissionMaps
     * const { count } = await prisma.userMissionMap.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserMissionMapDeleteManyArgs>(args?: SelectSubset<T, UserMissionMapDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserMissionMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMissionMapUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserMissionMaps
     * const userMissionMap = await prisma.userMissionMap.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserMissionMapUpdateManyArgs>(args: SelectSubset<T, UserMissionMapUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserMissionMap.
     * @param {UserMissionMapUpsertArgs} args - Arguments to update or create a UserMissionMap.
     * @example
     * // Update or create a UserMissionMap
     * const userMissionMap = await prisma.userMissionMap.upsert({
     *   create: {
     *     // ... data to create a UserMissionMap
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserMissionMap we want to update
     *   }
     * })
     */
    upsert<T extends UserMissionMapUpsertArgs>(args: SelectSubset<T, UserMissionMapUpsertArgs<ExtArgs>>): Prisma__UserMissionMapClient<$Result.GetResult<Prisma.$UserMissionMapPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserMissionMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMissionMapCountArgs} args - Arguments to filter UserMissionMaps to count.
     * @example
     * // Count the number of UserMissionMaps
     * const count = await prisma.userMissionMap.count({
     *   where: {
     *     // ... the filter for the UserMissionMaps we want to count
     *   }
     * })
    **/
    count<T extends UserMissionMapCountArgs>(
      args?: Subset<T, UserMissionMapCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserMissionMapCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserMissionMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMissionMapAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserMissionMapAggregateArgs>(args: Subset<T, UserMissionMapAggregateArgs>): Prisma.PrismaPromise<GetUserMissionMapAggregateType<T>>

    /**
     * Group by UserMissionMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMissionMapGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserMissionMapGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserMissionMapGroupByArgs['orderBy'] }
        : { orderBy?: UserMissionMapGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserMissionMapGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserMissionMapGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserMissionMap model
   */
  readonly fields: UserMissionMapFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserMissionMap.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserMissionMapClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    mission<T extends MissionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MissionDefaultArgs<ExtArgs>>): Prisma__MissionClient<$Result.GetResult<Prisma.$MissionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserMissionMap model
   */ 
  interface UserMissionMapFieldRefs {
    readonly id: FieldRef<"UserMissionMap", 'Int'>
    readonly userId: FieldRef<"UserMissionMap", 'Int'>
    readonly missionId: FieldRef<"UserMissionMap", 'Int'>
    readonly branch: FieldRef<"UserMissionMap", 'String'>
    readonly isDone: FieldRef<"UserMissionMap", 'Boolean'>
    readonly createdAt: FieldRef<"UserMissionMap", 'DateTime'>
    readonly updatedAt: FieldRef<"UserMissionMap", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserMissionMap findUnique
   */
  export type UserMissionMapFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
    /**
     * Filter, which UserMissionMap to fetch.
     */
    where: UserMissionMapWhereUniqueInput
  }

  /**
   * UserMissionMap findUniqueOrThrow
   */
  export type UserMissionMapFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
    /**
     * Filter, which UserMissionMap to fetch.
     */
    where: UserMissionMapWhereUniqueInput
  }

  /**
   * UserMissionMap findFirst
   */
  export type UserMissionMapFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
    /**
     * Filter, which UserMissionMap to fetch.
     */
    where?: UserMissionMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMissionMaps to fetch.
     */
    orderBy?: UserMissionMapOrderByWithRelationInput | UserMissionMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserMissionMaps.
     */
    cursor?: UserMissionMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMissionMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMissionMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserMissionMaps.
     */
    distinct?: UserMissionMapScalarFieldEnum | UserMissionMapScalarFieldEnum[]
  }

  /**
   * UserMissionMap findFirstOrThrow
   */
  export type UserMissionMapFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
    /**
     * Filter, which UserMissionMap to fetch.
     */
    where?: UserMissionMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMissionMaps to fetch.
     */
    orderBy?: UserMissionMapOrderByWithRelationInput | UserMissionMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserMissionMaps.
     */
    cursor?: UserMissionMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMissionMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMissionMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserMissionMaps.
     */
    distinct?: UserMissionMapScalarFieldEnum | UserMissionMapScalarFieldEnum[]
  }

  /**
   * UserMissionMap findMany
   */
  export type UserMissionMapFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
    /**
     * Filter, which UserMissionMaps to fetch.
     */
    where?: UserMissionMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMissionMaps to fetch.
     */
    orderBy?: UserMissionMapOrderByWithRelationInput | UserMissionMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserMissionMaps.
     */
    cursor?: UserMissionMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMissionMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMissionMaps.
     */
    skip?: number
    distinct?: UserMissionMapScalarFieldEnum | UserMissionMapScalarFieldEnum[]
  }

  /**
   * UserMissionMap create
   */
  export type UserMissionMapCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
    /**
     * The data needed to create a UserMissionMap.
     */
    data: XOR<UserMissionMapCreateInput, UserMissionMapUncheckedCreateInput>
  }

  /**
   * UserMissionMap createMany
   */
  export type UserMissionMapCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserMissionMaps.
     */
    data: UserMissionMapCreateManyInput | UserMissionMapCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserMissionMap update
   */
  export type UserMissionMapUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
    /**
     * The data needed to update a UserMissionMap.
     */
    data: XOR<UserMissionMapUpdateInput, UserMissionMapUncheckedUpdateInput>
    /**
     * Choose, which UserMissionMap to update.
     */
    where: UserMissionMapWhereUniqueInput
  }

  /**
   * UserMissionMap updateMany
   */
  export type UserMissionMapUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserMissionMaps.
     */
    data: XOR<UserMissionMapUpdateManyMutationInput, UserMissionMapUncheckedUpdateManyInput>
    /**
     * Filter which UserMissionMaps to update
     */
    where?: UserMissionMapWhereInput
  }

  /**
   * UserMissionMap upsert
   */
  export type UserMissionMapUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
    /**
     * The filter to search for the UserMissionMap to update in case it exists.
     */
    where: UserMissionMapWhereUniqueInput
    /**
     * In case the UserMissionMap found by the `where` argument doesn't exist, create a new UserMissionMap with this data.
     */
    create: XOR<UserMissionMapCreateInput, UserMissionMapUncheckedCreateInput>
    /**
     * In case the UserMissionMap was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserMissionMapUpdateInput, UserMissionMapUncheckedUpdateInput>
  }

  /**
   * UserMissionMap delete
   */
  export type UserMissionMapDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
    /**
     * Filter which UserMissionMap to delete.
     */
    where: UserMissionMapWhereUniqueInput
  }

  /**
   * UserMissionMap deleteMany
   */
  export type UserMissionMapDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserMissionMaps to delete
     */
    where?: UserMissionMapWhereInput
  }

  /**
   * UserMissionMap without action
   */
  export type UserMissionMapDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    rankId: number | null
    stars: number | null
    magicStone: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
    userId: number | null
    rankId: number | null
    stars: number | null
    magicStone: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    userName: string | null
    userId: number | null
    rankId: number | null
    stars: number | null
    createdAt: Date | null
    updatedAt: Date | null
    magicStone: number | null
    branch: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    userName: string | null
    userId: number | null
    rankId: number | null
    stars: number | null
    createdAt: Date | null
    updatedAt: Date | null
    magicStone: number | null
    branch: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    userName: number
    userId: number
    rankId: number
    stars: number
    createdAt: number
    updatedAt: number
    magicStone: number
    branch: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
    userId?: true
    rankId?: true
    stars?: true
    magicStone?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
    userId?: true
    rankId?: true
    stars?: true
    magicStone?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    userName?: true
    userId?: true
    rankId?: true
    stars?: true
    createdAt?: true
    updatedAt?: true
    magicStone?: true
    branch?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    userName?: true
    userId?: true
    rankId?: true
    stars?: true
    createdAt?: true
    updatedAt?: true
    magicStone?: true
    branch?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    userName?: true
    userId?: true
    rankId?: true
    stars?: true
    createdAt?: true
    updatedAt?: true
    magicStone?: true
    branch?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    userName: string | null
    userId: number
    rankId: number
    stars: number
    createdAt: Date
    updatedAt: Date
    magicStone: number
    branch: string
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userName?: boolean
    userId?: boolean
    rankId?: boolean
    stars?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    magicStone?: boolean
    branch?: boolean
    UserRewardMap?: boolean | User$UserRewardMapArgs<ExtArgs>
    UserMissionMap?: boolean | User$UserMissionMapArgs<ExtArgs>
    GameResults?: boolean | User$GameResultsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>


  export type UserSelectScalar = {
    id?: boolean
    userName?: boolean
    userId?: boolean
    rankId?: boolean
    stars?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    magicStone?: boolean
    branch?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserRewardMap?: boolean | User$UserRewardMapArgs<ExtArgs>
    UserMissionMap?: boolean | User$UserMissionMapArgs<ExtArgs>
    GameResults?: boolean | User$GameResultsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      UserRewardMap: Prisma.$UserRewardMapPayload<ExtArgs>[]
      UserMissionMap: Prisma.$UserMissionMapPayload<ExtArgs>[]
      GameResults: Prisma.$GameResultPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userName: string | null
      userId: number
      rankId: number
      stars: number
      createdAt: Date
      updatedAt: Date
      magicStone: number
      branch: string
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    UserRewardMap<T extends User$UserRewardMapArgs<ExtArgs> = {}>(args?: Subset<T, User$UserRewardMapArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "findMany"> | Null>
    UserMissionMap<T extends User$UserMissionMapArgs<ExtArgs> = {}>(args?: Subset<T, User$UserMissionMapArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMissionMapPayload<ExtArgs>, T, "findMany"> | Null>
    GameResults<T extends User$GameResultsArgs<ExtArgs> = {}>(args?: Subset<T, User$GameResultsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly userName: FieldRef<"User", 'String'>
    readonly userId: FieldRef<"User", 'Int'>
    readonly rankId: FieldRef<"User", 'Int'>
    readonly stars: FieldRef<"User", 'Int'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly magicStone: FieldRef<"User", 'Int'>
    readonly branch: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.UserRewardMap
   */
  export type User$UserRewardMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    where?: UserRewardMapWhereInput
    orderBy?: UserRewardMapOrderByWithRelationInput | UserRewardMapOrderByWithRelationInput[]
    cursor?: UserRewardMapWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserRewardMapScalarFieldEnum | UserRewardMapScalarFieldEnum[]
  }

  /**
   * User.UserMissionMap
   */
  export type User$UserMissionMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
    where?: UserMissionMapWhereInput
    orderBy?: UserMissionMapOrderByWithRelationInput | UserMissionMapOrderByWithRelationInput[]
    cursor?: UserMissionMapWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserMissionMapScalarFieldEnum | UserMissionMapScalarFieldEnum[]
  }

  /**
   * User.GameResults
   */
  export type User$GameResultsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
    where?: GameResultWhereInput
    orderBy?: GameResultOrderByWithRelationInput | GameResultOrderByWithRelationInput[]
    cursor?: GameResultWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GameResultScalarFieldEnum | GameResultScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Mission
   */

  export type AggregateMission = {
    _count: MissionCountAggregateOutputType | null
    _avg: MissionAvgAggregateOutputType | null
    _sum: MissionSumAggregateOutputType | null
    _min: MissionMinAggregateOutputType | null
    _max: MissionMaxAggregateOutputType | null
  }

  export type MissionAvgAggregateOutputType = {
    id: number | null
    reward: number | null
    startHours: number | null
    endHours: number | null
    quantity: number | null
  }

  export type MissionSumAggregateOutputType = {
    id: number | null
    reward: number | null
    startHours: number | null
    endHours: number | null
    quantity: number | null
  }

  export type MissionMinAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    reward: number | null
    startHours: number | null
    endHours: number | null
    createdAt: Date | null
    quantity: number | null
    type: $Enums.Mission_type | null
  }

  export type MissionMaxAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    reward: number | null
    startHours: number | null
    endHours: number | null
    createdAt: Date | null
    quantity: number | null
    type: $Enums.Mission_type | null
  }

  export type MissionCountAggregateOutputType = {
    id: number
    name: number
    description: number
    reward: number
    startHours: number
    endHours: number
    createdAt: number
    quantity: number
    type: number
    _all: number
  }


  export type MissionAvgAggregateInputType = {
    id?: true
    reward?: true
    startHours?: true
    endHours?: true
    quantity?: true
  }

  export type MissionSumAggregateInputType = {
    id?: true
    reward?: true
    startHours?: true
    endHours?: true
    quantity?: true
  }

  export type MissionMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    reward?: true
    startHours?: true
    endHours?: true
    createdAt?: true
    quantity?: true
    type?: true
  }

  export type MissionMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    reward?: true
    startHours?: true
    endHours?: true
    createdAt?: true
    quantity?: true
    type?: true
  }

  export type MissionCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    reward?: true
    startHours?: true
    endHours?: true
    createdAt?: true
    quantity?: true
    type?: true
    _all?: true
  }

  export type MissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Mission to aggregate.
     */
    where?: MissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Missions to fetch.
     */
    orderBy?: MissionOrderByWithRelationInput | MissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Missions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Missions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Missions
    **/
    _count?: true | MissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MissionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MissionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MissionMaxAggregateInputType
  }

  export type GetMissionAggregateType<T extends MissionAggregateArgs> = {
        [P in keyof T & keyof AggregateMission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMission[P]>
      : GetScalarType<T[P], AggregateMission[P]>
  }




  export type MissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MissionWhereInput
    orderBy?: MissionOrderByWithAggregationInput | MissionOrderByWithAggregationInput[]
    by: MissionScalarFieldEnum[] | MissionScalarFieldEnum
    having?: MissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MissionCountAggregateInputType | true
    _avg?: MissionAvgAggregateInputType
    _sum?: MissionSumAggregateInputType
    _min?: MissionMinAggregateInputType
    _max?: MissionMaxAggregateInputType
  }

  export type MissionGroupByOutputType = {
    id: number
    name: string
    description: string
    reward: number
    startHours: number
    endHours: number
    createdAt: Date
    quantity: number
    type: $Enums.Mission_type
    _count: MissionCountAggregateOutputType | null
    _avg: MissionAvgAggregateOutputType | null
    _sum: MissionSumAggregateOutputType | null
    _min: MissionMinAggregateOutputType | null
    _max: MissionMaxAggregateOutputType | null
  }

  type GetMissionGroupByPayload<T extends MissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MissionGroupByOutputType[P]>
            : GetScalarType<T[P], MissionGroupByOutputType[P]>
        }
      >
    >


  export type MissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    reward?: boolean
    startHours?: boolean
    endHours?: boolean
    createdAt?: boolean
    quantity?: boolean
    type?: boolean
    UserMissionMap?: boolean | Mission$UserMissionMapArgs<ExtArgs>
    _count?: boolean | MissionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mission"]>


  export type MissionSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    reward?: boolean
    startHours?: boolean
    endHours?: boolean
    createdAt?: boolean
    quantity?: boolean
    type?: boolean
  }

  export type MissionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserMissionMap?: boolean | Mission$UserMissionMapArgs<ExtArgs>
    _count?: boolean | MissionCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $MissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Mission"
    objects: {
      UserMissionMap: Prisma.$UserMissionMapPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      description: string
      reward: number
      startHours: number
      endHours: number
      createdAt: Date
      quantity: number
      type: $Enums.Mission_type
    }, ExtArgs["result"]["mission"]>
    composites: {}
  }

  type MissionGetPayload<S extends boolean | null | undefined | MissionDefaultArgs> = $Result.GetResult<Prisma.$MissionPayload, S>

  type MissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MissionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MissionCountAggregateInputType | true
    }

  export interface MissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Mission'], meta: { name: 'Mission' } }
    /**
     * Find zero or one Mission that matches the filter.
     * @param {MissionFindUniqueArgs} args - Arguments to find a Mission
     * @example
     * // Get one Mission
     * const mission = await prisma.mission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MissionFindUniqueArgs>(args: SelectSubset<T, MissionFindUniqueArgs<ExtArgs>>): Prisma__MissionClient<$Result.GetResult<Prisma.$MissionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Mission that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MissionFindUniqueOrThrowArgs} args - Arguments to find a Mission
     * @example
     * // Get one Mission
     * const mission = await prisma.mission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MissionFindUniqueOrThrowArgs>(args: SelectSubset<T, MissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MissionClient<$Result.GetResult<Prisma.$MissionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Mission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionFindFirstArgs} args - Arguments to find a Mission
     * @example
     * // Get one Mission
     * const mission = await prisma.mission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MissionFindFirstArgs>(args?: SelectSubset<T, MissionFindFirstArgs<ExtArgs>>): Prisma__MissionClient<$Result.GetResult<Prisma.$MissionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Mission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionFindFirstOrThrowArgs} args - Arguments to find a Mission
     * @example
     * // Get one Mission
     * const mission = await prisma.mission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MissionFindFirstOrThrowArgs>(args?: SelectSubset<T, MissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__MissionClient<$Result.GetResult<Prisma.$MissionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Missions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Missions
     * const missions = await prisma.mission.findMany()
     * 
     * // Get first 10 Missions
     * const missions = await prisma.mission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const missionWithIdOnly = await prisma.mission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MissionFindManyArgs>(args?: SelectSubset<T, MissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MissionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Mission.
     * @param {MissionCreateArgs} args - Arguments to create a Mission.
     * @example
     * // Create one Mission
     * const Mission = await prisma.mission.create({
     *   data: {
     *     // ... data to create a Mission
     *   }
     * })
     * 
     */
    create<T extends MissionCreateArgs>(args: SelectSubset<T, MissionCreateArgs<ExtArgs>>): Prisma__MissionClient<$Result.GetResult<Prisma.$MissionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Missions.
     * @param {MissionCreateManyArgs} args - Arguments to create many Missions.
     * @example
     * // Create many Missions
     * const mission = await prisma.mission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MissionCreateManyArgs>(args?: SelectSubset<T, MissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Mission.
     * @param {MissionDeleteArgs} args - Arguments to delete one Mission.
     * @example
     * // Delete one Mission
     * const Mission = await prisma.mission.delete({
     *   where: {
     *     // ... filter to delete one Mission
     *   }
     * })
     * 
     */
    delete<T extends MissionDeleteArgs>(args: SelectSubset<T, MissionDeleteArgs<ExtArgs>>): Prisma__MissionClient<$Result.GetResult<Prisma.$MissionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Mission.
     * @param {MissionUpdateArgs} args - Arguments to update one Mission.
     * @example
     * // Update one Mission
     * const mission = await prisma.mission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MissionUpdateArgs>(args: SelectSubset<T, MissionUpdateArgs<ExtArgs>>): Prisma__MissionClient<$Result.GetResult<Prisma.$MissionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Missions.
     * @param {MissionDeleteManyArgs} args - Arguments to filter Missions to delete.
     * @example
     * // Delete a few Missions
     * const { count } = await prisma.mission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MissionDeleteManyArgs>(args?: SelectSubset<T, MissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Missions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Missions
     * const mission = await prisma.mission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MissionUpdateManyArgs>(args: SelectSubset<T, MissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Mission.
     * @param {MissionUpsertArgs} args - Arguments to update or create a Mission.
     * @example
     * // Update or create a Mission
     * const mission = await prisma.mission.upsert({
     *   create: {
     *     // ... data to create a Mission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Mission we want to update
     *   }
     * })
     */
    upsert<T extends MissionUpsertArgs>(args: SelectSubset<T, MissionUpsertArgs<ExtArgs>>): Prisma__MissionClient<$Result.GetResult<Prisma.$MissionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Missions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionCountArgs} args - Arguments to filter Missions to count.
     * @example
     * // Count the number of Missions
     * const count = await prisma.mission.count({
     *   where: {
     *     // ... the filter for the Missions we want to count
     *   }
     * })
    **/
    count<T extends MissionCountArgs>(
      args?: Subset<T, MissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Mission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MissionAggregateArgs>(args: Subset<T, MissionAggregateArgs>): Prisma.PrismaPromise<GetMissionAggregateType<T>>

    /**
     * Group by Mission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MissionGroupByArgs['orderBy'] }
        : { orderBy?: MissionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Mission model
   */
  readonly fields: MissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Mission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    UserMissionMap<T extends Mission$UserMissionMapArgs<ExtArgs> = {}>(args?: Subset<T, Mission$UserMissionMapArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMissionMapPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Mission model
   */ 
  interface MissionFieldRefs {
    readonly id: FieldRef<"Mission", 'Int'>
    readonly name: FieldRef<"Mission", 'String'>
    readonly description: FieldRef<"Mission", 'String'>
    readonly reward: FieldRef<"Mission", 'Float'>
    readonly startHours: FieldRef<"Mission", 'Int'>
    readonly endHours: FieldRef<"Mission", 'Int'>
    readonly createdAt: FieldRef<"Mission", 'DateTime'>
    readonly quantity: FieldRef<"Mission", 'Int'>
    readonly type: FieldRef<"Mission", 'Mission_type'>
  }
    

  // Custom InputTypes
  /**
   * Mission findUnique
   */
  export type MissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mission
     */
    select?: MissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionInclude<ExtArgs> | null
    /**
     * Filter, which Mission to fetch.
     */
    where: MissionWhereUniqueInput
  }

  /**
   * Mission findUniqueOrThrow
   */
  export type MissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mission
     */
    select?: MissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionInclude<ExtArgs> | null
    /**
     * Filter, which Mission to fetch.
     */
    where: MissionWhereUniqueInput
  }

  /**
   * Mission findFirst
   */
  export type MissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mission
     */
    select?: MissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionInclude<ExtArgs> | null
    /**
     * Filter, which Mission to fetch.
     */
    where?: MissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Missions to fetch.
     */
    orderBy?: MissionOrderByWithRelationInput | MissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Missions.
     */
    cursor?: MissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Missions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Missions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Missions.
     */
    distinct?: MissionScalarFieldEnum | MissionScalarFieldEnum[]
  }

  /**
   * Mission findFirstOrThrow
   */
  export type MissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mission
     */
    select?: MissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionInclude<ExtArgs> | null
    /**
     * Filter, which Mission to fetch.
     */
    where?: MissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Missions to fetch.
     */
    orderBy?: MissionOrderByWithRelationInput | MissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Missions.
     */
    cursor?: MissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Missions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Missions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Missions.
     */
    distinct?: MissionScalarFieldEnum | MissionScalarFieldEnum[]
  }

  /**
   * Mission findMany
   */
  export type MissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mission
     */
    select?: MissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionInclude<ExtArgs> | null
    /**
     * Filter, which Missions to fetch.
     */
    where?: MissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Missions to fetch.
     */
    orderBy?: MissionOrderByWithRelationInput | MissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Missions.
     */
    cursor?: MissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Missions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Missions.
     */
    skip?: number
    distinct?: MissionScalarFieldEnum | MissionScalarFieldEnum[]
  }

  /**
   * Mission create
   */
  export type MissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mission
     */
    select?: MissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionInclude<ExtArgs> | null
    /**
     * The data needed to create a Mission.
     */
    data: XOR<MissionCreateInput, MissionUncheckedCreateInput>
  }

  /**
   * Mission createMany
   */
  export type MissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Missions.
     */
    data: MissionCreateManyInput | MissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Mission update
   */
  export type MissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mission
     */
    select?: MissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionInclude<ExtArgs> | null
    /**
     * The data needed to update a Mission.
     */
    data: XOR<MissionUpdateInput, MissionUncheckedUpdateInput>
    /**
     * Choose, which Mission to update.
     */
    where: MissionWhereUniqueInput
  }

  /**
   * Mission updateMany
   */
  export type MissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Missions.
     */
    data: XOR<MissionUpdateManyMutationInput, MissionUncheckedUpdateManyInput>
    /**
     * Filter which Missions to update
     */
    where?: MissionWhereInput
  }

  /**
   * Mission upsert
   */
  export type MissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mission
     */
    select?: MissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionInclude<ExtArgs> | null
    /**
     * The filter to search for the Mission to update in case it exists.
     */
    where: MissionWhereUniqueInput
    /**
     * In case the Mission found by the `where` argument doesn't exist, create a new Mission with this data.
     */
    create: XOR<MissionCreateInput, MissionUncheckedCreateInput>
    /**
     * In case the Mission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MissionUpdateInput, MissionUncheckedUpdateInput>
  }

  /**
   * Mission delete
   */
  export type MissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mission
     */
    select?: MissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionInclude<ExtArgs> | null
    /**
     * Filter which Mission to delete.
     */
    where: MissionWhereUniqueInput
  }

  /**
   * Mission deleteMany
   */
  export type MissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Missions to delete
     */
    where?: MissionWhereInput
  }

  /**
   * Mission.UserMissionMap
   */
  export type Mission$UserMissionMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMissionMap
     */
    select?: UserMissionMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMissionMapInclude<ExtArgs> | null
    where?: UserMissionMapWhereInput
    orderBy?: UserMissionMapOrderByWithRelationInput | UserMissionMapOrderByWithRelationInput[]
    cursor?: UserMissionMapWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserMissionMapScalarFieldEnum | UserMissionMapScalarFieldEnum[]
  }

  /**
   * Mission without action
   */
  export type MissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mission
     */
    select?: MissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionInclude<ExtArgs> | null
  }


  /**
   * Model UserRewardMap
   */

  export type AggregateUserRewardMap = {
    _count: UserRewardMapCountAggregateOutputType | null
    _avg: UserRewardMapAvgAggregateOutputType | null
    _sum: UserRewardMapSumAggregateOutputType | null
    _min: UserRewardMapMinAggregateOutputType | null
    _max: UserRewardMapMaxAggregateOutputType | null
  }

  export type UserRewardMapAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    rewardId: number | null
    promotionCodeId: number | null
    duration: number | null
  }

  export type UserRewardMapSumAggregateOutputType = {
    id: number | null
    userId: number | null
    rewardId: number | null
    promotionCodeId: number | null
    duration: number | null
  }

  export type UserRewardMapMinAggregateOutputType = {
    id: number | null
    userId: number | null
    rewardId: number | null
    promotionCodeId: number | null
    duration: number | null
    createdAt: Date | null
    updatedAt: Date | null
    isUsed: boolean | null
    branch: string | null
  }

  export type UserRewardMapMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    rewardId: number | null
    promotionCodeId: number | null
    duration: number | null
    createdAt: Date | null
    updatedAt: Date | null
    isUsed: boolean | null
    branch: string | null
  }

  export type UserRewardMapCountAggregateOutputType = {
    id: number
    userId: number
    rewardId: number
    promotionCodeId: number
    duration: number
    createdAt: number
    updatedAt: number
    isUsed: number
    branch: number
    _all: number
  }


  export type UserRewardMapAvgAggregateInputType = {
    id?: true
    userId?: true
    rewardId?: true
    promotionCodeId?: true
    duration?: true
  }

  export type UserRewardMapSumAggregateInputType = {
    id?: true
    userId?: true
    rewardId?: true
    promotionCodeId?: true
    duration?: true
  }

  export type UserRewardMapMinAggregateInputType = {
    id?: true
    userId?: true
    rewardId?: true
    promotionCodeId?: true
    duration?: true
    createdAt?: true
    updatedAt?: true
    isUsed?: true
    branch?: true
  }

  export type UserRewardMapMaxAggregateInputType = {
    id?: true
    userId?: true
    rewardId?: true
    promotionCodeId?: true
    duration?: true
    createdAt?: true
    updatedAt?: true
    isUsed?: true
    branch?: true
  }

  export type UserRewardMapCountAggregateInputType = {
    id?: true
    userId?: true
    rewardId?: true
    promotionCodeId?: true
    duration?: true
    createdAt?: true
    updatedAt?: true
    isUsed?: true
    branch?: true
    _all?: true
  }

  export type UserRewardMapAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserRewardMap to aggregate.
     */
    where?: UserRewardMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRewardMaps to fetch.
     */
    orderBy?: UserRewardMapOrderByWithRelationInput | UserRewardMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserRewardMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRewardMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRewardMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserRewardMaps
    **/
    _count?: true | UserRewardMapCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserRewardMapAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserRewardMapSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserRewardMapMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserRewardMapMaxAggregateInputType
  }

  export type GetUserRewardMapAggregateType<T extends UserRewardMapAggregateArgs> = {
        [P in keyof T & keyof AggregateUserRewardMap]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserRewardMap[P]>
      : GetScalarType<T[P], AggregateUserRewardMap[P]>
  }




  export type UserRewardMapGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRewardMapWhereInput
    orderBy?: UserRewardMapOrderByWithAggregationInput | UserRewardMapOrderByWithAggregationInput[]
    by: UserRewardMapScalarFieldEnum[] | UserRewardMapScalarFieldEnum
    having?: UserRewardMapScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserRewardMapCountAggregateInputType | true
    _avg?: UserRewardMapAvgAggregateInputType
    _sum?: UserRewardMapSumAggregateInputType
    _min?: UserRewardMapMinAggregateInputType
    _max?: UserRewardMapMaxAggregateInputType
  }

  export type UserRewardMapGroupByOutputType = {
    id: number
    userId: number | null
    rewardId: number | null
    promotionCodeId: number | null
    duration: number | null
    createdAt: Date | null
    updatedAt: Date | null
    isUsed: boolean
    branch: string | null
    _count: UserRewardMapCountAggregateOutputType | null
    _avg: UserRewardMapAvgAggregateOutputType | null
    _sum: UserRewardMapSumAggregateOutputType | null
    _min: UserRewardMapMinAggregateOutputType | null
    _max: UserRewardMapMaxAggregateOutputType | null
  }

  type GetUserRewardMapGroupByPayload<T extends UserRewardMapGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserRewardMapGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserRewardMapGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserRewardMapGroupByOutputType[P]>
            : GetScalarType<T[P], UserRewardMapGroupByOutputType[P]>
        }
      >
    >


  export type UserRewardMapSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    rewardId?: boolean
    promotionCodeId?: boolean
    duration?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isUsed?: boolean
    branch?: boolean
    promotionCode?: boolean | UserRewardMap$promotionCodeArgs<ExtArgs>
    user?: boolean | UserRewardMap$userArgs<ExtArgs>
    reward?: boolean | UserRewardMap$rewardArgs<ExtArgs>
  }, ExtArgs["result"]["userRewardMap"]>


  export type UserRewardMapSelectScalar = {
    id?: boolean
    userId?: boolean
    rewardId?: boolean
    promotionCodeId?: boolean
    duration?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isUsed?: boolean
    branch?: boolean
  }

  export type UserRewardMapInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    promotionCode?: boolean | UserRewardMap$promotionCodeArgs<ExtArgs>
    user?: boolean | UserRewardMap$userArgs<ExtArgs>
    reward?: boolean | UserRewardMap$rewardArgs<ExtArgs>
  }

  export type $UserRewardMapPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserRewardMap"
    objects: {
      promotionCode: Prisma.$PromotionCodePayload<ExtArgs> | null
      user: Prisma.$UserPayload<ExtArgs> | null
      reward: Prisma.$RewardPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number | null
      rewardId: number | null
      promotionCodeId: number | null
      duration: number | null
      createdAt: Date | null
      updatedAt: Date | null
      isUsed: boolean
      branch: string | null
    }, ExtArgs["result"]["userRewardMap"]>
    composites: {}
  }

  type UserRewardMapGetPayload<S extends boolean | null | undefined | UserRewardMapDefaultArgs> = $Result.GetResult<Prisma.$UserRewardMapPayload, S>

  type UserRewardMapCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserRewardMapFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserRewardMapCountAggregateInputType | true
    }

  export interface UserRewardMapDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserRewardMap'], meta: { name: 'UserRewardMap' } }
    /**
     * Find zero or one UserRewardMap that matches the filter.
     * @param {UserRewardMapFindUniqueArgs} args - Arguments to find a UserRewardMap
     * @example
     * // Get one UserRewardMap
     * const userRewardMap = await prisma.userRewardMap.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserRewardMapFindUniqueArgs>(args: SelectSubset<T, UserRewardMapFindUniqueArgs<ExtArgs>>): Prisma__UserRewardMapClient<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserRewardMap that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserRewardMapFindUniqueOrThrowArgs} args - Arguments to find a UserRewardMap
     * @example
     * // Get one UserRewardMap
     * const userRewardMap = await prisma.userRewardMap.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserRewardMapFindUniqueOrThrowArgs>(args: SelectSubset<T, UserRewardMapFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserRewardMapClient<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserRewardMap that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardMapFindFirstArgs} args - Arguments to find a UserRewardMap
     * @example
     * // Get one UserRewardMap
     * const userRewardMap = await prisma.userRewardMap.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserRewardMapFindFirstArgs>(args?: SelectSubset<T, UserRewardMapFindFirstArgs<ExtArgs>>): Prisma__UserRewardMapClient<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserRewardMap that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardMapFindFirstOrThrowArgs} args - Arguments to find a UserRewardMap
     * @example
     * // Get one UserRewardMap
     * const userRewardMap = await prisma.userRewardMap.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserRewardMapFindFirstOrThrowArgs>(args?: SelectSubset<T, UserRewardMapFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserRewardMapClient<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserRewardMaps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardMapFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserRewardMaps
     * const userRewardMaps = await prisma.userRewardMap.findMany()
     * 
     * // Get first 10 UserRewardMaps
     * const userRewardMaps = await prisma.userRewardMap.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userRewardMapWithIdOnly = await prisma.userRewardMap.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserRewardMapFindManyArgs>(args?: SelectSubset<T, UserRewardMapFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserRewardMap.
     * @param {UserRewardMapCreateArgs} args - Arguments to create a UserRewardMap.
     * @example
     * // Create one UserRewardMap
     * const UserRewardMap = await prisma.userRewardMap.create({
     *   data: {
     *     // ... data to create a UserRewardMap
     *   }
     * })
     * 
     */
    create<T extends UserRewardMapCreateArgs>(args: SelectSubset<T, UserRewardMapCreateArgs<ExtArgs>>): Prisma__UserRewardMapClient<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserRewardMaps.
     * @param {UserRewardMapCreateManyArgs} args - Arguments to create many UserRewardMaps.
     * @example
     * // Create many UserRewardMaps
     * const userRewardMap = await prisma.userRewardMap.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserRewardMapCreateManyArgs>(args?: SelectSubset<T, UserRewardMapCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a UserRewardMap.
     * @param {UserRewardMapDeleteArgs} args - Arguments to delete one UserRewardMap.
     * @example
     * // Delete one UserRewardMap
     * const UserRewardMap = await prisma.userRewardMap.delete({
     *   where: {
     *     // ... filter to delete one UserRewardMap
     *   }
     * })
     * 
     */
    delete<T extends UserRewardMapDeleteArgs>(args: SelectSubset<T, UserRewardMapDeleteArgs<ExtArgs>>): Prisma__UserRewardMapClient<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserRewardMap.
     * @param {UserRewardMapUpdateArgs} args - Arguments to update one UserRewardMap.
     * @example
     * // Update one UserRewardMap
     * const userRewardMap = await prisma.userRewardMap.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserRewardMapUpdateArgs>(args: SelectSubset<T, UserRewardMapUpdateArgs<ExtArgs>>): Prisma__UserRewardMapClient<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserRewardMaps.
     * @param {UserRewardMapDeleteManyArgs} args - Arguments to filter UserRewardMaps to delete.
     * @example
     * // Delete a few UserRewardMaps
     * const { count } = await prisma.userRewardMap.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserRewardMapDeleteManyArgs>(args?: SelectSubset<T, UserRewardMapDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserRewardMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardMapUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserRewardMaps
     * const userRewardMap = await prisma.userRewardMap.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserRewardMapUpdateManyArgs>(args: SelectSubset<T, UserRewardMapUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserRewardMap.
     * @param {UserRewardMapUpsertArgs} args - Arguments to update or create a UserRewardMap.
     * @example
     * // Update or create a UserRewardMap
     * const userRewardMap = await prisma.userRewardMap.upsert({
     *   create: {
     *     // ... data to create a UserRewardMap
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserRewardMap we want to update
     *   }
     * })
     */
    upsert<T extends UserRewardMapUpsertArgs>(args: SelectSubset<T, UserRewardMapUpsertArgs<ExtArgs>>): Prisma__UserRewardMapClient<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserRewardMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardMapCountArgs} args - Arguments to filter UserRewardMaps to count.
     * @example
     * // Count the number of UserRewardMaps
     * const count = await prisma.userRewardMap.count({
     *   where: {
     *     // ... the filter for the UserRewardMaps we want to count
     *   }
     * })
    **/
    count<T extends UserRewardMapCountArgs>(
      args?: Subset<T, UserRewardMapCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserRewardMapCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserRewardMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardMapAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserRewardMapAggregateArgs>(args: Subset<T, UserRewardMapAggregateArgs>): Prisma.PrismaPromise<GetUserRewardMapAggregateType<T>>

    /**
     * Group by UserRewardMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardMapGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserRewardMapGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserRewardMapGroupByArgs['orderBy'] }
        : { orderBy?: UserRewardMapGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserRewardMapGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserRewardMapGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserRewardMap model
   */
  readonly fields: UserRewardMapFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserRewardMap.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserRewardMapClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    promotionCode<T extends UserRewardMap$promotionCodeArgs<ExtArgs> = {}>(args?: Subset<T, UserRewardMap$promotionCodeArgs<ExtArgs>>): Prisma__PromotionCodeClient<$Result.GetResult<Prisma.$PromotionCodePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    user<T extends UserRewardMap$userArgs<ExtArgs> = {}>(args?: Subset<T, UserRewardMap$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    reward<T extends UserRewardMap$rewardArgs<ExtArgs> = {}>(args?: Subset<T, UserRewardMap$rewardArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserRewardMap model
   */ 
  interface UserRewardMapFieldRefs {
    readonly id: FieldRef<"UserRewardMap", 'Int'>
    readonly userId: FieldRef<"UserRewardMap", 'Int'>
    readonly rewardId: FieldRef<"UserRewardMap", 'Int'>
    readonly promotionCodeId: FieldRef<"UserRewardMap", 'Int'>
    readonly duration: FieldRef<"UserRewardMap", 'Int'>
    readonly createdAt: FieldRef<"UserRewardMap", 'DateTime'>
    readonly updatedAt: FieldRef<"UserRewardMap", 'DateTime'>
    readonly isUsed: FieldRef<"UserRewardMap", 'Boolean'>
    readonly branch: FieldRef<"UserRewardMap", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UserRewardMap findUnique
   */
  export type UserRewardMapFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    /**
     * Filter, which UserRewardMap to fetch.
     */
    where: UserRewardMapWhereUniqueInput
  }

  /**
   * UserRewardMap findUniqueOrThrow
   */
  export type UserRewardMapFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    /**
     * Filter, which UserRewardMap to fetch.
     */
    where: UserRewardMapWhereUniqueInput
  }

  /**
   * UserRewardMap findFirst
   */
  export type UserRewardMapFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    /**
     * Filter, which UserRewardMap to fetch.
     */
    where?: UserRewardMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRewardMaps to fetch.
     */
    orderBy?: UserRewardMapOrderByWithRelationInput | UserRewardMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserRewardMaps.
     */
    cursor?: UserRewardMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRewardMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRewardMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserRewardMaps.
     */
    distinct?: UserRewardMapScalarFieldEnum | UserRewardMapScalarFieldEnum[]
  }

  /**
   * UserRewardMap findFirstOrThrow
   */
  export type UserRewardMapFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    /**
     * Filter, which UserRewardMap to fetch.
     */
    where?: UserRewardMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRewardMaps to fetch.
     */
    orderBy?: UserRewardMapOrderByWithRelationInput | UserRewardMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserRewardMaps.
     */
    cursor?: UserRewardMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRewardMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRewardMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserRewardMaps.
     */
    distinct?: UserRewardMapScalarFieldEnum | UserRewardMapScalarFieldEnum[]
  }

  /**
   * UserRewardMap findMany
   */
  export type UserRewardMapFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    /**
     * Filter, which UserRewardMaps to fetch.
     */
    where?: UserRewardMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRewardMaps to fetch.
     */
    orderBy?: UserRewardMapOrderByWithRelationInput | UserRewardMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserRewardMaps.
     */
    cursor?: UserRewardMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRewardMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRewardMaps.
     */
    skip?: number
    distinct?: UserRewardMapScalarFieldEnum | UserRewardMapScalarFieldEnum[]
  }

  /**
   * UserRewardMap create
   */
  export type UserRewardMapCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    /**
     * The data needed to create a UserRewardMap.
     */
    data?: XOR<UserRewardMapCreateInput, UserRewardMapUncheckedCreateInput>
  }

  /**
   * UserRewardMap createMany
   */
  export type UserRewardMapCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserRewardMaps.
     */
    data: UserRewardMapCreateManyInput | UserRewardMapCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserRewardMap update
   */
  export type UserRewardMapUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    /**
     * The data needed to update a UserRewardMap.
     */
    data: XOR<UserRewardMapUpdateInput, UserRewardMapUncheckedUpdateInput>
    /**
     * Choose, which UserRewardMap to update.
     */
    where: UserRewardMapWhereUniqueInput
  }

  /**
   * UserRewardMap updateMany
   */
  export type UserRewardMapUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserRewardMaps.
     */
    data: XOR<UserRewardMapUpdateManyMutationInput, UserRewardMapUncheckedUpdateManyInput>
    /**
     * Filter which UserRewardMaps to update
     */
    where?: UserRewardMapWhereInput
  }

  /**
   * UserRewardMap upsert
   */
  export type UserRewardMapUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    /**
     * The filter to search for the UserRewardMap to update in case it exists.
     */
    where: UserRewardMapWhereUniqueInput
    /**
     * In case the UserRewardMap found by the `where` argument doesn't exist, create a new UserRewardMap with this data.
     */
    create: XOR<UserRewardMapCreateInput, UserRewardMapUncheckedCreateInput>
    /**
     * In case the UserRewardMap was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserRewardMapUpdateInput, UserRewardMapUncheckedUpdateInput>
  }

  /**
   * UserRewardMap delete
   */
  export type UserRewardMapDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    /**
     * Filter which UserRewardMap to delete.
     */
    where: UserRewardMapWhereUniqueInput
  }

  /**
   * UserRewardMap deleteMany
   */
  export type UserRewardMapDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserRewardMaps to delete
     */
    where?: UserRewardMapWhereInput
  }

  /**
   * UserRewardMap.promotionCode
   */
  export type UserRewardMap$promotionCodeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCode
     */
    select?: PromotionCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromotionCodeInclude<ExtArgs> | null
    where?: PromotionCodeWhereInput
  }

  /**
   * UserRewardMap.user
   */
  export type UserRewardMap$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * UserRewardMap.reward
   */
  export type UserRewardMap$rewardArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    where?: RewardWhereInput
  }

  /**
   * UserRewardMap without action
   */
  export type UserRewardMapDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
  }


  /**
   * Model Reward
   */

  export type AggregateReward = {
    _count: RewardCountAggregateOutputType | null
    _avg: RewardAvgAggregateOutputType | null
    _sum: RewardSumAggregateOutputType | null
    _min: RewardMinAggregateOutputType | null
    _max: RewardMaxAggregateOutputType | null
  }

  export type RewardAvgAggregateOutputType = {
    id: number | null
    stars: number | null
    value: number | null
  }

  export type RewardSumAggregateOutputType = {
    id: number | null
    stars: number | null
    value: number | null
  }

  export type RewardMinAggregateOutputType = {
    id: number | null
    name: string | null
    stars: number | null
    value: number | null
    startDate: Date | null
    endDate: Date | null
    createdAt: Date | null
    updateAt: Date | null
  }

  export type RewardMaxAggregateOutputType = {
    id: number | null
    name: string | null
    stars: number | null
    value: number | null
    startDate: Date | null
    endDate: Date | null
    createdAt: Date | null
    updateAt: Date | null
  }

  export type RewardCountAggregateOutputType = {
    id: number
    name: number
    stars: number
    value: number
    startDate: number
    endDate: number
    createdAt: number
    updateAt: number
    _all: number
  }


  export type RewardAvgAggregateInputType = {
    id?: true
    stars?: true
    value?: true
  }

  export type RewardSumAggregateInputType = {
    id?: true
    stars?: true
    value?: true
  }

  export type RewardMinAggregateInputType = {
    id?: true
    name?: true
    stars?: true
    value?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updateAt?: true
  }

  export type RewardMaxAggregateInputType = {
    id?: true
    name?: true
    stars?: true
    value?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updateAt?: true
  }

  export type RewardCountAggregateInputType = {
    id?: true
    name?: true
    stars?: true
    value?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updateAt?: true
    _all?: true
  }

  export type RewardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Reward to aggregate.
     */
    where?: RewardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rewards to fetch.
     */
    orderBy?: RewardOrderByWithRelationInput | RewardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RewardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rewards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Rewards
    **/
    _count?: true | RewardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RewardAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RewardSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RewardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RewardMaxAggregateInputType
  }

  export type GetRewardAggregateType<T extends RewardAggregateArgs> = {
        [P in keyof T & keyof AggregateReward]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReward[P]>
      : GetScalarType<T[P], AggregateReward[P]>
  }




  export type RewardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RewardWhereInput
    orderBy?: RewardOrderByWithAggregationInput | RewardOrderByWithAggregationInput[]
    by: RewardScalarFieldEnum[] | RewardScalarFieldEnum
    having?: RewardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RewardCountAggregateInputType | true
    _avg?: RewardAvgAggregateInputType
    _sum?: RewardSumAggregateInputType
    _min?: RewardMinAggregateInputType
    _max?: RewardMaxAggregateInputType
  }

  export type RewardGroupByOutputType = {
    id: number
    name: string | null
    stars: number | null
    value: number | null
    startDate: Date | null
    endDate: Date | null
    createdAt: Date | null
    updateAt: Date | null
    _count: RewardCountAggregateOutputType | null
    _avg: RewardAvgAggregateOutputType | null
    _sum: RewardSumAggregateOutputType | null
    _min: RewardMinAggregateOutputType | null
    _max: RewardMaxAggregateOutputType | null
  }

  type GetRewardGroupByPayload<T extends RewardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RewardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RewardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RewardGroupByOutputType[P]>
            : GetScalarType<T[P], RewardGroupByOutputType[P]>
        }
      >
    >


  export type RewardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    stars?: boolean
    value?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updateAt?: boolean
    UserRewardMap?: boolean | Reward$UserRewardMapArgs<ExtArgs>
    _count?: boolean | RewardCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reward"]>


  export type RewardSelectScalar = {
    id?: boolean
    name?: boolean
    stars?: boolean
    value?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updateAt?: boolean
  }

  export type RewardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserRewardMap?: boolean | Reward$UserRewardMapArgs<ExtArgs>
    _count?: boolean | RewardCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $RewardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Reward"
    objects: {
      UserRewardMap: Prisma.$UserRewardMapPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string | null
      stars: number | null
      value: number | null
      startDate: Date | null
      endDate: Date | null
      createdAt: Date | null
      updateAt: Date | null
    }, ExtArgs["result"]["reward"]>
    composites: {}
  }

  type RewardGetPayload<S extends boolean | null | undefined | RewardDefaultArgs> = $Result.GetResult<Prisma.$RewardPayload, S>

  type RewardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RewardFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RewardCountAggregateInputType | true
    }

  export interface RewardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Reward'], meta: { name: 'Reward' } }
    /**
     * Find zero or one Reward that matches the filter.
     * @param {RewardFindUniqueArgs} args - Arguments to find a Reward
     * @example
     * // Get one Reward
     * const reward = await prisma.reward.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RewardFindUniqueArgs>(args: SelectSubset<T, RewardFindUniqueArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Reward that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RewardFindUniqueOrThrowArgs} args - Arguments to find a Reward
     * @example
     * // Get one Reward
     * const reward = await prisma.reward.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RewardFindUniqueOrThrowArgs>(args: SelectSubset<T, RewardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Reward that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardFindFirstArgs} args - Arguments to find a Reward
     * @example
     * // Get one Reward
     * const reward = await prisma.reward.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RewardFindFirstArgs>(args?: SelectSubset<T, RewardFindFirstArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Reward that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardFindFirstOrThrowArgs} args - Arguments to find a Reward
     * @example
     * // Get one Reward
     * const reward = await prisma.reward.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RewardFindFirstOrThrowArgs>(args?: SelectSubset<T, RewardFindFirstOrThrowArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Rewards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rewards
     * const rewards = await prisma.reward.findMany()
     * 
     * // Get first 10 Rewards
     * const rewards = await prisma.reward.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rewardWithIdOnly = await prisma.reward.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RewardFindManyArgs>(args?: SelectSubset<T, RewardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Reward.
     * @param {RewardCreateArgs} args - Arguments to create a Reward.
     * @example
     * // Create one Reward
     * const Reward = await prisma.reward.create({
     *   data: {
     *     // ... data to create a Reward
     *   }
     * })
     * 
     */
    create<T extends RewardCreateArgs>(args: SelectSubset<T, RewardCreateArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Rewards.
     * @param {RewardCreateManyArgs} args - Arguments to create many Rewards.
     * @example
     * // Create many Rewards
     * const reward = await prisma.reward.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RewardCreateManyArgs>(args?: SelectSubset<T, RewardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Reward.
     * @param {RewardDeleteArgs} args - Arguments to delete one Reward.
     * @example
     * // Delete one Reward
     * const Reward = await prisma.reward.delete({
     *   where: {
     *     // ... filter to delete one Reward
     *   }
     * })
     * 
     */
    delete<T extends RewardDeleteArgs>(args: SelectSubset<T, RewardDeleteArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Reward.
     * @param {RewardUpdateArgs} args - Arguments to update one Reward.
     * @example
     * // Update one Reward
     * const reward = await prisma.reward.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RewardUpdateArgs>(args: SelectSubset<T, RewardUpdateArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Rewards.
     * @param {RewardDeleteManyArgs} args - Arguments to filter Rewards to delete.
     * @example
     * // Delete a few Rewards
     * const { count } = await prisma.reward.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RewardDeleteManyArgs>(args?: SelectSubset<T, RewardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rewards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rewards
     * const reward = await prisma.reward.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RewardUpdateManyArgs>(args: SelectSubset<T, RewardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Reward.
     * @param {RewardUpsertArgs} args - Arguments to update or create a Reward.
     * @example
     * // Update or create a Reward
     * const reward = await prisma.reward.upsert({
     *   create: {
     *     // ... data to create a Reward
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Reward we want to update
     *   }
     * })
     */
    upsert<T extends RewardUpsertArgs>(args: SelectSubset<T, RewardUpsertArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Rewards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardCountArgs} args - Arguments to filter Rewards to count.
     * @example
     * // Count the number of Rewards
     * const count = await prisma.reward.count({
     *   where: {
     *     // ... the filter for the Rewards we want to count
     *   }
     * })
    **/
    count<T extends RewardCountArgs>(
      args?: Subset<T, RewardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RewardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Reward.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RewardAggregateArgs>(args: Subset<T, RewardAggregateArgs>): Prisma.PrismaPromise<GetRewardAggregateType<T>>

    /**
     * Group by Reward.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RewardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RewardGroupByArgs['orderBy'] }
        : { orderBy?: RewardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RewardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRewardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Reward model
   */
  readonly fields: RewardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Reward.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RewardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    UserRewardMap<T extends Reward$UserRewardMapArgs<ExtArgs> = {}>(args?: Subset<T, Reward$UserRewardMapArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Reward model
   */ 
  interface RewardFieldRefs {
    readonly id: FieldRef<"Reward", 'Int'>
    readonly name: FieldRef<"Reward", 'String'>
    readonly stars: FieldRef<"Reward", 'Int'>
    readonly value: FieldRef<"Reward", 'Int'>
    readonly startDate: FieldRef<"Reward", 'DateTime'>
    readonly endDate: FieldRef<"Reward", 'DateTime'>
    readonly createdAt: FieldRef<"Reward", 'DateTime'>
    readonly updateAt: FieldRef<"Reward", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Reward findUnique
   */
  export type RewardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter, which Reward to fetch.
     */
    where: RewardWhereUniqueInput
  }

  /**
   * Reward findUniqueOrThrow
   */
  export type RewardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter, which Reward to fetch.
     */
    where: RewardWhereUniqueInput
  }

  /**
   * Reward findFirst
   */
  export type RewardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter, which Reward to fetch.
     */
    where?: RewardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rewards to fetch.
     */
    orderBy?: RewardOrderByWithRelationInput | RewardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rewards.
     */
    cursor?: RewardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rewards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rewards.
     */
    distinct?: RewardScalarFieldEnum | RewardScalarFieldEnum[]
  }

  /**
   * Reward findFirstOrThrow
   */
  export type RewardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter, which Reward to fetch.
     */
    where?: RewardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rewards to fetch.
     */
    orderBy?: RewardOrderByWithRelationInput | RewardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rewards.
     */
    cursor?: RewardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rewards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rewards.
     */
    distinct?: RewardScalarFieldEnum | RewardScalarFieldEnum[]
  }

  /**
   * Reward findMany
   */
  export type RewardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter, which Rewards to fetch.
     */
    where?: RewardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rewards to fetch.
     */
    orderBy?: RewardOrderByWithRelationInput | RewardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Rewards.
     */
    cursor?: RewardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rewards.
     */
    skip?: number
    distinct?: RewardScalarFieldEnum | RewardScalarFieldEnum[]
  }

  /**
   * Reward create
   */
  export type RewardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * The data needed to create a Reward.
     */
    data?: XOR<RewardCreateInput, RewardUncheckedCreateInput>
  }

  /**
   * Reward createMany
   */
  export type RewardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Rewards.
     */
    data: RewardCreateManyInput | RewardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Reward update
   */
  export type RewardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * The data needed to update a Reward.
     */
    data: XOR<RewardUpdateInput, RewardUncheckedUpdateInput>
    /**
     * Choose, which Reward to update.
     */
    where: RewardWhereUniqueInput
  }

  /**
   * Reward updateMany
   */
  export type RewardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Rewards.
     */
    data: XOR<RewardUpdateManyMutationInput, RewardUncheckedUpdateManyInput>
    /**
     * Filter which Rewards to update
     */
    where?: RewardWhereInput
  }

  /**
   * Reward upsert
   */
  export type RewardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * The filter to search for the Reward to update in case it exists.
     */
    where: RewardWhereUniqueInput
    /**
     * In case the Reward found by the `where` argument doesn't exist, create a new Reward with this data.
     */
    create: XOR<RewardCreateInput, RewardUncheckedCreateInput>
    /**
     * In case the Reward was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RewardUpdateInput, RewardUncheckedUpdateInput>
  }

  /**
   * Reward delete
   */
  export type RewardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter which Reward to delete.
     */
    where: RewardWhereUniqueInput
  }

  /**
   * Reward deleteMany
   */
  export type RewardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rewards to delete
     */
    where?: RewardWhereInput
  }

  /**
   * Reward.UserRewardMap
   */
  export type Reward$UserRewardMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    where?: UserRewardMapWhereInput
    orderBy?: UserRewardMapOrderByWithRelationInput | UserRewardMapOrderByWithRelationInput[]
    cursor?: UserRewardMapWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserRewardMapScalarFieldEnum | UserRewardMapScalarFieldEnum[]
  }

  /**
   * Reward without action
   */
  export type RewardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
  }


  /**
   * Model PromotionCode
   */

  export type AggregatePromotionCode = {
    _count: PromotionCodeCountAggregateOutputType | null
    _avg: PromotionCodeAvgAggregateOutputType | null
    _sum: PromotionCodeSumAggregateOutputType | null
    _min: PromotionCodeMinAggregateOutputType | null
    _max: PromotionCodeMaxAggregateOutputType | null
  }

  export type PromotionCodeAvgAggregateOutputType = {
    id: number | null
    value: number | null
  }

  export type PromotionCodeSumAggregateOutputType = {
    id: number | null
    value: number | null
  }

  export type PromotionCodeMinAggregateOutputType = {
    id: number | null
    name: string | null
    code: string | null
    value: number | null
    branch: string | null
    isUsed: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PromotionCodeMaxAggregateOutputType = {
    id: number | null
    name: string | null
    code: string | null
    value: number | null
    branch: string | null
    isUsed: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PromotionCodeCountAggregateOutputType = {
    id: number
    name: number
    code: number
    value: number
    branch: number
    isUsed: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PromotionCodeAvgAggregateInputType = {
    id?: true
    value?: true
  }

  export type PromotionCodeSumAggregateInputType = {
    id?: true
    value?: true
  }

  export type PromotionCodeMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    value?: true
    branch?: true
    isUsed?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PromotionCodeMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    value?: true
    branch?: true
    isUsed?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PromotionCodeCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    value?: true
    branch?: true
    isUsed?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PromotionCodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PromotionCode to aggregate.
     */
    where?: PromotionCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromotionCodes to fetch.
     */
    orderBy?: PromotionCodeOrderByWithRelationInput | PromotionCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PromotionCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromotionCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromotionCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PromotionCodes
    **/
    _count?: true | PromotionCodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PromotionCodeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PromotionCodeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PromotionCodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PromotionCodeMaxAggregateInputType
  }

  export type GetPromotionCodeAggregateType<T extends PromotionCodeAggregateArgs> = {
        [P in keyof T & keyof AggregatePromotionCode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePromotionCode[P]>
      : GetScalarType<T[P], AggregatePromotionCode[P]>
  }




  export type PromotionCodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PromotionCodeWhereInput
    orderBy?: PromotionCodeOrderByWithAggregationInput | PromotionCodeOrderByWithAggregationInput[]
    by: PromotionCodeScalarFieldEnum[] | PromotionCodeScalarFieldEnum
    having?: PromotionCodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PromotionCodeCountAggregateInputType | true
    _avg?: PromotionCodeAvgAggregateInputType
    _sum?: PromotionCodeSumAggregateInputType
    _min?: PromotionCodeMinAggregateInputType
    _max?: PromotionCodeMaxAggregateInputType
  }

  export type PromotionCodeGroupByOutputType = {
    id: number
    name: string | null
    code: string | null
    value: number | null
    branch: string | null
    isUsed: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    _count: PromotionCodeCountAggregateOutputType | null
    _avg: PromotionCodeAvgAggregateOutputType | null
    _sum: PromotionCodeSumAggregateOutputType | null
    _min: PromotionCodeMinAggregateOutputType | null
    _max: PromotionCodeMaxAggregateOutputType | null
  }

  type GetPromotionCodeGroupByPayload<T extends PromotionCodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PromotionCodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PromotionCodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PromotionCodeGroupByOutputType[P]>
            : GetScalarType<T[P], PromotionCodeGroupByOutputType[P]>
        }
      >
    >


  export type PromotionCodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    value?: boolean
    branch?: boolean
    isUsed?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    UserRewardMap?: boolean | PromotionCode$UserRewardMapArgs<ExtArgs>
    _count?: boolean | PromotionCodeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["promotionCode"]>


  export type PromotionCodeSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    value?: boolean
    branch?: boolean
    isUsed?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PromotionCodeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserRewardMap?: boolean | PromotionCode$UserRewardMapArgs<ExtArgs>
    _count?: boolean | PromotionCodeCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $PromotionCodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PromotionCode"
    objects: {
      UserRewardMap: Prisma.$UserRewardMapPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string | null
      code: string | null
      value: number | null
      branch: string | null
      isUsed: boolean | null
      createdAt: Date | null
      updatedAt: Date | null
    }, ExtArgs["result"]["promotionCode"]>
    composites: {}
  }

  type PromotionCodeGetPayload<S extends boolean | null | undefined | PromotionCodeDefaultArgs> = $Result.GetResult<Prisma.$PromotionCodePayload, S>

  type PromotionCodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PromotionCodeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PromotionCodeCountAggregateInputType | true
    }

  export interface PromotionCodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PromotionCode'], meta: { name: 'PromotionCode' } }
    /**
     * Find zero or one PromotionCode that matches the filter.
     * @param {PromotionCodeFindUniqueArgs} args - Arguments to find a PromotionCode
     * @example
     * // Get one PromotionCode
     * const promotionCode = await prisma.promotionCode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PromotionCodeFindUniqueArgs>(args: SelectSubset<T, PromotionCodeFindUniqueArgs<ExtArgs>>): Prisma__PromotionCodeClient<$Result.GetResult<Prisma.$PromotionCodePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PromotionCode that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PromotionCodeFindUniqueOrThrowArgs} args - Arguments to find a PromotionCode
     * @example
     * // Get one PromotionCode
     * const promotionCode = await prisma.promotionCode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PromotionCodeFindUniqueOrThrowArgs>(args: SelectSubset<T, PromotionCodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PromotionCodeClient<$Result.GetResult<Prisma.$PromotionCodePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PromotionCode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionCodeFindFirstArgs} args - Arguments to find a PromotionCode
     * @example
     * // Get one PromotionCode
     * const promotionCode = await prisma.promotionCode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PromotionCodeFindFirstArgs>(args?: SelectSubset<T, PromotionCodeFindFirstArgs<ExtArgs>>): Prisma__PromotionCodeClient<$Result.GetResult<Prisma.$PromotionCodePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PromotionCode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionCodeFindFirstOrThrowArgs} args - Arguments to find a PromotionCode
     * @example
     * // Get one PromotionCode
     * const promotionCode = await prisma.promotionCode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PromotionCodeFindFirstOrThrowArgs>(args?: SelectSubset<T, PromotionCodeFindFirstOrThrowArgs<ExtArgs>>): Prisma__PromotionCodeClient<$Result.GetResult<Prisma.$PromotionCodePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PromotionCodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionCodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PromotionCodes
     * const promotionCodes = await prisma.promotionCode.findMany()
     * 
     * // Get first 10 PromotionCodes
     * const promotionCodes = await prisma.promotionCode.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const promotionCodeWithIdOnly = await prisma.promotionCode.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PromotionCodeFindManyArgs>(args?: SelectSubset<T, PromotionCodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PromotionCodePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PromotionCode.
     * @param {PromotionCodeCreateArgs} args - Arguments to create a PromotionCode.
     * @example
     * // Create one PromotionCode
     * const PromotionCode = await prisma.promotionCode.create({
     *   data: {
     *     // ... data to create a PromotionCode
     *   }
     * })
     * 
     */
    create<T extends PromotionCodeCreateArgs>(args: SelectSubset<T, PromotionCodeCreateArgs<ExtArgs>>): Prisma__PromotionCodeClient<$Result.GetResult<Prisma.$PromotionCodePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PromotionCodes.
     * @param {PromotionCodeCreateManyArgs} args - Arguments to create many PromotionCodes.
     * @example
     * // Create many PromotionCodes
     * const promotionCode = await prisma.promotionCode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PromotionCodeCreateManyArgs>(args?: SelectSubset<T, PromotionCodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PromotionCode.
     * @param {PromotionCodeDeleteArgs} args - Arguments to delete one PromotionCode.
     * @example
     * // Delete one PromotionCode
     * const PromotionCode = await prisma.promotionCode.delete({
     *   where: {
     *     // ... filter to delete one PromotionCode
     *   }
     * })
     * 
     */
    delete<T extends PromotionCodeDeleteArgs>(args: SelectSubset<T, PromotionCodeDeleteArgs<ExtArgs>>): Prisma__PromotionCodeClient<$Result.GetResult<Prisma.$PromotionCodePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PromotionCode.
     * @param {PromotionCodeUpdateArgs} args - Arguments to update one PromotionCode.
     * @example
     * // Update one PromotionCode
     * const promotionCode = await prisma.promotionCode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PromotionCodeUpdateArgs>(args: SelectSubset<T, PromotionCodeUpdateArgs<ExtArgs>>): Prisma__PromotionCodeClient<$Result.GetResult<Prisma.$PromotionCodePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PromotionCodes.
     * @param {PromotionCodeDeleteManyArgs} args - Arguments to filter PromotionCodes to delete.
     * @example
     * // Delete a few PromotionCodes
     * const { count } = await prisma.promotionCode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PromotionCodeDeleteManyArgs>(args?: SelectSubset<T, PromotionCodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PromotionCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionCodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PromotionCodes
     * const promotionCode = await prisma.promotionCode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PromotionCodeUpdateManyArgs>(args: SelectSubset<T, PromotionCodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PromotionCode.
     * @param {PromotionCodeUpsertArgs} args - Arguments to update or create a PromotionCode.
     * @example
     * // Update or create a PromotionCode
     * const promotionCode = await prisma.promotionCode.upsert({
     *   create: {
     *     // ... data to create a PromotionCode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PromotionCode we want to update
     *   }
     * })
     */
    upsert<T extends PromotionCodeUpsertArgs>(args: SelectSubset<T, PromotionCodeUpsertArgs<ExtArgs>>): Prisma__PromotionCodeClient<$Result.GetResult<Prisma.$PromotionCodePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PromotionCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionCodeCountArgs} args - Arguments to filter PromotionCodes to count.
     * @example
     * // Count the number of PromotionCodes
     * const count = await prisma.promotionCode.count({
     *   where: {
     *     // ... the filter for the PromotionCodes we want to count
     *   }
     * })
    **/
    count<T extends PromotionCodeCountArgs>(
      args?: Subset<T, PromotionCodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PromotionCodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PromotionCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionCodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PromotionCodeAggregateArgs>(args: Subset<T, PromotionCodeAggregateArgs>): Prisma.PrismaPromise<GetPromotionCodeAggregateType<T>>

    /**
     * Group by PromotionCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionCodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PromotionCodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PromotionCodeGroupByArgs['orderBy'] }
        : { orderBy?: PromotionCodeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PromotionCodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPromotionCodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PromotionCode model
   */
  readonly fields: PromotionCodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PromotionCode.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PromotionCodeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    UserRewardMap<T extends PromotionCode$UserRewardMapArgs<ExtArgs> = {}>(args?: Subset<T, PromotionCode$UserRewardMapArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRewardMapPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PromotionCode model
   */ 
  interface PromotionCodeFieldRefs {
    readonly id: FieldRef<"PromotionCode", 'Int'>
    readonly name: FieldRef<"PromotionCode", 'String'>
    readonly code: FieldRef<"PromotionCode", 'String'>
    readonly value: FieldRef<"PromotionCode", 'Int'>
    readonly branch: FieldRef<"PromotionCode", 'String'>
    readonly isUsed: FieldRef<"PromotionCode", 'Boolean'>
    readonly createdAt: FieldRef<"PromotionCode", 'DateTime'>
    readonly updatedAt: FieldRef<"PromotionCode", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PromotionCode findUnique
   */
  export type PromotionCodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCode
     */
    select?: PromotionCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromotionCodeInclude<ExtArgs> | null
    /**
     * Filter, which PromotionCode to fetch.
     */
    where: PromotionCodeWhereUniqueInput
  }

  /**
   * PromotionCode findUniqueOrThrow
   */
  export type PromotionCodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCode
     */
    select?: PromotionCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromotionCodeInclude<ExtArgs> | null
    /**
     * Filter, which PromotionCode to fetch.
     */
    where: PromotionCodeWhereUniqueInput
  }

  /**
   * PromotionCode findFirst
   */
  export type PromotionCodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCode
     */
    select?: PromotionCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromotionCodeInclude<ExtArgs> | null
    /**
     * Filter, which PromotionCode to fetch.
     */
    where?: PromotionCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromotionCodes to fetch.
     */
    orderBy?: PromotionCodeOrderByWithRelationInput | PromotionCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PromotionCodes.
     */
    cursor?: PromotionCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromotionCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromotionCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PromotionCodes.
     */
    distinct?: PromotionCodeScalarFieldEnum | PromotionCodeScalarFieldEnum[]
  }

  /**
   * PromotionCode findFirstOrThrow
   */
  export type PromotionCodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCode
     */
    select?: PromotionCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromotionCodeInclude<ExtArgs> | null
    /**
     * Filter, which PromotionCode to fetch.
     */
    where?: PromotionCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromotionCodes to fetch.
     */
    orderBy?: PromotionCodeOrderByWithRelationInput | PromotionCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PromotionCodes.
     */
    cursor?: PromotionCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromotionCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromotionCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PromotionCodes.
     */
    distinct?: PromotionCodeScalarFieldEnum | PromotionCodeScalarFieldEnum[]
  }

  /**
   * PromotionCode findMany
   */
  export type PromotionCodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCode
     */
    select?: PromotionCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromotionCodeInclude<ExtArgs> | null
    /**
     * Filter, which PromotionCodes to fetch.
     */
    where?: PromotionCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromotionCodes to fetch.
     */
    orderBy?: PromotionCodeOrderByWithRelationInput | PromotionCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PromotionCodes.
     */
    cursor?: PromotionCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromotionCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromotionCodes.
     */
    skip?: number
    distinct?: PromotionCodeScalarFieldEnum | PromotionCodeScalarFieldEnum[]
  }

  /**
   * PromotionCode create
   */
  export type PromotionCodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCode
     */
    select?: PromotionCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromotionCodeInclude<ExtArgs> | null
    /**
     * The data needed to create a PromotionCode.
     */
    data?: XOR<PromotionCodeCreateInput, PromotionCodeUncheckedCreateInput>
  }

  /**
   * PromotionCode createMany
   */
  export type PromotionCodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PromotionCodes.
     */
    data: PromotionCodeCreateManyInput | PromotionCodeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PromotionCode update
   */
  export type PromotionCodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCode
     */
    select?: PromotionCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromotionCodeInclude<ExtArgs> | null
    /**
     * The data needed to update a PromotionCode.
     */
    data: XOR<PromotionCodeUpdateInput, PromotionCodeUncheckedUpdateInput>
    /**
     * Choose, which PromotionCode to update.
     */
    where: PromotionCodeWhereUniqueInput
  }

  /**
   * PromotionCode updateMany
   */
  export type PromotionCodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PromotionCodes.
     */
    data: XOR<PromotionCodeUpdateManyMutationInput, PromotionCodeUncheckedUpdateManyInput>
    /**
     * Filter which PromotionCodes to update
     */
    where?: PromotionCodeWhereInput
  }

  /**
   * PromotionCode upsert
   */
  export type PromotionCodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCode
     */
    select?: PromotionCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromotionCodeInclude<ExtArgs> | null
    /**
     * The filter to search for the PromotionCode to update in case it exists.
     */
    where: PromotionCodeWhereUniqueInput
    /**
     * In case the PromotionCode found by the `where` argument doesn't exist, create a new PromotionCode with this data.
     */
    create: XOR<PromotionCodeCreateInput, PromotionCodeUncheckedCreateInput>
    /**
     * In case the PromotionCode was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PromotionCodeUpdateInput, PromotionCodeUncheckedUpdateInput>
  }

  /**
   * PromotionCode delete
   */
  export type PromotionCodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCode
     */
    select?: PromotionCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromotionCodeInclude<ExtArgs> | null
    /**
     * Filter which PromotionCode to delete.
     */
    where: PromotionCodeWhereUniqueInput
  }

  /**
   * PromotionCode deleteMany
   */
  export type PromotionCodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PromotionCodes to delete
     */
    where?: PromotionCodeWhereInput
  }

  /**
   * PromotionCode.UserRewardMap
   */
  export type PromotionCode$UserRewardMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewardMap
     */
    select?: UserRewardMapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardMapInclude<ExtArgs> | null
    where?: UserRewardMapWhereInput
    orderBy?: UserRewardMapOrderByWithRelationInput | UserRewardMapOrderByWithRelationInput[]
    cursor?: UserRewardMapWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserRewardMapScalarFieldEnum | UserRewardMapScalarFieldEnum[]
  }

  /**
   * PromotionCode without action
   */
  export type PromotionCodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionCode
     */
    select?: PromotionCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromotionCodeInclude<ExtArgs> | null
  }


  /**
   * Model UserStarHistory
   */

  export type AggregateUserStarHistory = {
    _count: UserStarHistoryCountAggregateOutputType | null
    _avg: UserStarHistoryAvgAggregateOutputType | null
    _sum: UserStarHistorySumAggregateOutputType | null
    _min: UserStarHistoryMinAggregateOutputType | null
    _max: UserStarHistoryMaxAggregateOutputType | null
  }

  export type UserStarHistoryAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    oldStars: number | null
    newStars: number | null
    targetId: number | null
    gameResultId: number | null
  }

  export type UserStarHistorySumAggregateOutputType = {
    id: number | null
    userId: number | null
    oldStars: number | null
    newStars: number | null
    targetId: number | null
    gameResultId: number | null
  }

  export type UserStarHistoryMinAggregateOutputType = {
    id: number | null
    userId: number | null
    oldStars: number | null
    newStars: number | null
    type: $Enums.UserStarHistory_type | null
    createdAt: Date | null
    targetId: number | null
    branch: string | null
    gameResultId: number | null
  }

  export type UserStarHistoryMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    oldStars: number | null
    newStars: number | null
    type: $Enums.UserStarHistory_type | null
    createdAt: Date | null
    targetId: number | null
    branch: string | null
    gameResultId: number | null
  }

  export type UserStarHistoryCountAggregateOutputType = {
    id: number
    userId: number
    oldStars: number
    newStars: number
    type: number
    createdAt: number
    targetId: number
    branch: number
    gameResultId: number
    _all: number
  }


  export type UserStarHistoryAvgAggregateInputType = {
    id?: true
    userId?: true
    oldStars?: true
    newStars?: true
    targetId?: true
    gameResultId?: true
  }

  export type UserStarHistorySumAggregateInputType = {
    id?: true
    userId?: true
    oldStars?: true
    newStars?: true
    targetId?: true
    gameResultId?: true
  }

  export type UserStarHistoryMinAggregateInputType = {
    id?: true
    userId?: true
    oldStars?: true
    newStars?: true
    type?: true
    createdAt?: true
    targetId?: true
    branch?: true
    gameResultId?: true
  }

  export type UserStarHistoryMaxAggregateInputType = {
    id?: true
    userId?: true
    oldStars?: true
    newStars?: true
    type?: true
    createdAt?: true
    targetId?: true
    branch?: true
    gameResultId?: true
  }

  export type UserStarHistoryCountAggregateInputType = {
    id?: true
    userId?: true
    oldStars?: true
    newStars?: true
    type?: true
    createdAt?: true
    targetId?: true
    branch?: true
    gameResultId?: true
    _all?: true
  }

  export type UserStarHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserStarHistory to aggregate.
     */
    where?: UserStarHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserStarHistories to fetch.
     */
    orderBy?: UserStarHistoryOrderByWithRelationInput | UserStarHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserStarHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserStarHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserStarHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserStarHistories
    **/
    _count?: true | UserStarHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserStarHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserStarHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserStarHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserStarHistoryMaxAggregateInputType
  }

  export type GetUserStarHistoryAggregateType<T extends UserStarHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateUserStarHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserStarHistory[P]>
      : GetScalarType<T[P], AggregateUserStarHistory[P]>
  }




  export type UserStarHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserStarHistoryWhereInput
    orderBy?: UserStarHistoryOrderByWithAggregationInput | UserStarHistoryOrderByWithAggregationInput[]
    by: UserStarHistoryScalarFieldEnum[] | UserStarHistoryScalarFieldEnum
    having?: UserStarHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserStarHistoryCountAggregateInputType | true
    _avg?: UserStarHistoryAvgAggregateInputType
    _sum?: UserStarHistorySumAggregateInputType
    _min?: UserStarHistoryMinAggregateInputType
    _max?: UserStarHistoryMaxAggregateInputType
  }

  export type UserStarHistoryGroupByOutputType = {
    id: number
    userId: number | null
    oldStars: number | null
    newStars: number | null
    type: $Enums.UserStarHistory_type | null
    createdAt: Date | null
    targetId: number | null
    branch: string | null
    gameResultId: number | null
    _count: UserStarHistoryCountAggregateOutputType | null
    _avg: UserStarHistoryAvgAggregateOutputType | null
    _sum: UserStarHistorySumAggregateOutputType | null
    _min: UserStarHistoryMinAggregateOutputType | null
    _max: UserStarHistoryMaxAggregateOutputType | null
  }

  type GetUserStarHistoryGroupByPayload<T extends UserStarHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserStarHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserStarHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserStarHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], UserStarHistoryGroupByOutputType[P]>
        }
      >
    >


  export type UserStarHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    oldStars?: boolean
    newStars?: boolean
    type?: boolean
    createdAt?: boolean
    targetId?: boolean
    branch?: boolean
    gameResultId?: boolean
    gameResult?: boolean | UserStarHistory$gameResultArgs<ExtArgs>
  }, ExtArgs["result"]["userStarHistory"]>


  export type UserStarHistorySelectScalar = {
    id?: boolean
    userId?: boolean
    oldStars?: boolean
    newStars?: boolean
    type?: boolean
    createdAt?: boolean
    targetId?: boolean
    branch?: boolean
    gameResultId?: boolean
  }

  export type UserStarHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gameResult?: boolean | UserStarHistory$gameResultArgs<ExtArgs>
  }

  export type $UserStarHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserStarHistory"
    objects: {
      gameResult: Prisma.$GameResultPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number | null
      oldStars: number | null
      newStars: number | null
      type: $Enums.UserStarHistory_type | null
      createdAt: Date | null
      targetId: number | null
      branch: string | null
      gameResultId: number | null
    }, ExtArgs["result"]["userStarHistory"]>
    composites: {}
  }

  type UserStarHistoryGetPayload<S extends boolean | null | undefined | UserStarHistoryDefaultArgs> = $Result.GetResult<Prisma.$UserStarHistoryPayload, S>

  type UserStarHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserStarHistoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserStarHistoryCountAggregateInputType | true
    }

  export interface UserStarHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserStarHistory'], meta: { name: 'UserStarHistory' } }
    /**
     * Find zero or one UserStarHistory that matches the filter.
     * @param {UserStarHistoryFindUniqueArgs} args - Arguments to find a UserStarHistory
     * @example
     * // Get one UserStarHistory
     * const userStarHistory = await prisma.userStarHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserStarHistoryFindUniqueArgs>(args: SelectSubset<T, UserStarHistoryFindUniqueArgs<ExtArgs>>): Prisma__UserStarHistoryClient<$Result.GetResult<Prisma.$UserStarHistoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserStarHistory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserStarHistoryFindUniqueOrThrowArgs} args - Arguments to find a UserStarHistory
     * @example
     * // Get one UserStarHistory
     * const userStarHistory = await prisma.userStarHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserStarHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, UserStarHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserStarHistoryClient<$Result.GetResult<Prisma.$UserStarHistoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserStarHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStarHistoryFindFirstArgs} args - Arguments to find a UserStarHistory
     * @example
     * // Get one UserStarHistory
     * const userStarHistory = await prisma.userStarHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserStarHistoryFindFirstArgs>(args?: SelectSubset<T, UserStarHistoryFindFirstArgs<ExtArgs>>): Prisma__UserStarHistoryClient<$Result.GetResult<Prisma.$UserStarHistoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserStarHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStarHistoryFindFirstOrThrowArgs} args - Arguments to find a UserStarHistory
     * @example
     * // Get one UserStarHistory
     * const userStarHistory = await prisma.userStarHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserStarHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, UserStarHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserStarHistoryClient<$Result.GetResult<Prisma.$UserStarHistoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserStarHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStarHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserStarHistories
     * const userStarHistories = await prisma.userStarHistory.findMany()
     * 
     * // Get first 10 UserStarHistories
     * const userStarHistories = await prisma.userStarHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userStarHistoryWithIdOnly = await prisma.userStarHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserStarHistoryFindManyArgs>(args?: SelectSubset<T, UserStarHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserStarHistoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserStarHistory.
     * @param {UserStarHistoryCreateArgs} args - Arguments to create a UserStarHistory.
     * @example
     * // Create one UserStarHistory
     * const UserStarHistory = await prisma.userStarHistory.create({
     *   data: {
     *     // ... data to create a UserStarHistory
     *   }
     * })
     * 
     */
    create<T extends UserStarHistoryCreateArgs>(args: SelectSubset<T, UserStarHistoryCreateArgs<ExtArgs>>): Prisma__UserStarHistoryClient<$Result.GetResult<Prisma.$UserStarHistoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserStarHistories.
     * @param {UserStarHistoryCreateManyArgs} args - Arguments to create many UserStarHistories.
     * @example
     * // Create many UserStarHistories
     * const userStarHistory = await prisma.userStarHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserStarHistoryCreateManyArgs>(args?: SelectSubset<T, UserStarHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a UserStarHistory.
     * @param {UserStarHistoryDeleteArgs} args - Arguments to delete one UserStarHistory.
     * @example
     * // Delete one UserStarHistory
     * const UserStarHistory = await prisma.userStarHistory.delete({
     *   where: {
     *     // ... filter to delete one UserStarHistory
     *   }
     * })
     * 
     */
    delete<T extends UserStarHistoryDeleteArgs>(args: SelectSubset<T, UserStarHistoryDeleteArgs<ExtArgs>>): Prisma__UserStarHistoryClient<$Result.GetResult<Prisma.$UserStarHistoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserStarHistory.
     * @param {UserStarHistoryUpdateArgs} args - Arguments to update one UserStarHistory.
     * @example
     * // Update one UserStarHistory
     * const userStarHistory = await prisma.userStarHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserStarHistoryUpdateArgs>(args: SelectSubset<T, UserStarHistoryUpdateArgs<ExtArgs>>): Prisma__UserStarHistoryClient<$Result.GetResult<Prisma.$UserStarHistoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserStarHistories.
     * @param {UserStarHistoryDeleteManyArgs} args - Arguments to filter UserStarHistories to delete.
     * @example
     * // Delete a few UserStarHistories
     * const { count } = await prisma.userStarHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserStarHistoryDeleteManyArgs>(args?: SelectSubset<T, UserStarHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserStarHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStarHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserStarHistories
     * const userStarHistory = await prisma.userStarHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserStarHistoryUpdateManyArgs>(args: SelectSubset<T, UserStarHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserStarHistory.
     * @param {UserStarHistoryUpsertArgs} args - Arguments to update or create a UserStarHistory.
     * @example
     * // Update or create a UserStarHistory
     * const userStarHistory = await prisma.userStarHistory.upsert({
     *   create: {
     *     // ... data to create a UserStarHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserStarHistory we want to update
     *   }
     * })
     */
    upsert<T extends UserStarHistoryUpsertArgs>(args: SelectSubset<T, UserStarHistoryUpsertArgs<ExtArgs>>): Prisma__UserStarHistoryClient<$Result.GetResult<Prisma.$UserStarHistoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserStarHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStarHistoryCountArgs} args - Arguments to filter UserStarHistories to count.
     * @example
     * // Count the number of UserStarHistories
     * const count = await prisma.userStarHistory.count({
     *   where: {
     *     // ... the filter for the UserStarHistories we want to count
     *   }
     * })
    **/
    count<T extends UserStarHistoryCountArgs>(
      args?: Subset<T, UserStarHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserStarHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserStarHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStarHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserStarHistoryAggregateArgs>(args: Subset<T, UserStarHistoryAggregateArgs>): Prisma.PrismaPromise<GetUserStarHistoryAggregateType<T>>

    /**
     * Group by UserStarHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStarHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserStarHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserStarHistoryGroupByArgs['orderBy'] }
        : { orderBy?: UserStarHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserStarHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserStarHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserStarHistory model
   */
  readonly fields: UserStarHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserStarHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserStarHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    gameResult<T extends UserStarHistory$gameResultArgs<ExtArgs> = {}>(args?: Subset<T, UserStarHistory$gameResultArgs<ExtArgs>>): Prisma__GameResultClient<$Result.GetResult<Prisma.$GameResultPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserStarHistory model
   */ 
  interface UserStarHistoryFieldRefs {
    readonly id: FieldRef<"UserStarHistory", 'Int'>
    readonly userId: FieldRef<"UserStarHistory", 'Int'>
    readonly oldStars: FieldRef<"UserStarHistory", 'Int'>
    readonly newStars: FieldRef<"UserStarHistory", 'Int'>
    readonly type: FieldRef<"UserStarHistory", 'UserStarHistory_type'>
    readonly createdAt: FieldRef<"UserStarHistory", 'DateTime'>
    readonly targetId: FieldRef<"UserStarHistory", 'Int'>
    readonly branch: FieldRef<"UserStarHistory", 'String'>
    readonly gameResultId: FieldRef<"UserStarHistory", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * UserStarHistory findUnique
   */
  export type UserStarHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStarHistory
     */
    select?: UserStarHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStarHistoryInclude<ExtArgs> | null
    /**
     * Filter, which UserStarHistory to fetch.
     */
    where: UserStarHistoryWhereUniqueInput
  }

  /**
   * UserStarHistory findUniqueOrThrow
   */
  export type UserStarHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStarHistory
     */
    select?: UserStarHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStarHistoryInclude<ExtArgs> | null
    /**
     * Filter, which UserStarHistory to fetch.
     */
    where: UserStarHistoryWhereUniqueInput
  }

  /**
   * UserStarHistory findFirst
   */
  export type UserStarHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStarHistory
     */
    select?: UserStarHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStarHistoryInclude<ExtArgs> | null
    /**
     * Filter, which UserStarHistory to fetch.
     */
    where?: UserStarHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserStarHistories to fetch.
     */
    orderBy?: UserStarHistoryOrderByWithRelationInput | UserStarHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserStarHistories.
     */
    cursor?: UserStarHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserStarHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserStarHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserStarHistories.
     */
    distinct?: UserStarHistoryScalarFieldEnum | UserStarHistoryScalarFieldEnum[]
  }

  /**
   * UserStarHistory findFirstOrThrow
   */
  export type UserStarHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStarHistory
     */
    select?: UserStarHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStarHistoryInclude<ExtArgs> | null
    /**
     * Filter, which UserStarHistory to fetch.
     */
    where?: UserStarHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserStarHistories to fetch.
     */
    orderBy?: UserStarHistoryOrderByWithRelationInput | UserStarHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserStarHistories.
     */
    cursor?: UserStarHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserStarHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserStarHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserStarHistories.
     */
    distinct?: UserStarHistoryScalarFieldEnum | UserStarHistoryScalarFieldEnum[]
  }

  /**
   * UserStarHistory findMany
   */
  export type UserStarHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStarHistory
     */
    select?: UserStarHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStarHistoryInclude<ExtArgs> | null
    /**
     * Filter, which UserStarHistories to fetch.
     */
    where?: UserStarHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserStarHistories to fetch.
     */
    orderBy?: UserStarHistoryOrderByWithRelationInput | UserStarHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserStarHistories.
     */
    cursor?: UserStarHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserStarHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserStarHistories.
     */
    skip?: number
    distinct?: UserStarHistoryScalarFieldEnum | UserStarHistoryScalarFieldEnum[]
  }

  /**
   * UserStarHistory create
   */
  export type UserStarHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStarHistory
     */
    select?: UserStarHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStarHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a UserStarHistory.
     */
    data?: XOR<UserStarHistoryCreateInput, UserStarHistoryUncheckedCreateInput>
  }

  /**
   * UserStarHistory createMany
   */
  export type UserStarHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserStarHistories.
     */
    data: UserStarHistoryCreateManyInput | UserStarHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserStarHistory update
   */
  export type UserStarHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStarHistory
     */
    select?: UserStarHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStarHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a UserStarHistory.
     */
    data: XOR<UserStarHistoryUpdateInput, UserStarHistoryUncheckedUpdateInput>
    /**
     * Choose, which UserStarHistory to update.
     */
    where: UserStarHistoryWhereUniqueInput
  }

  /**
   * UserStarHistory updateMany
   */
  export type UserStarHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserStarHistories.
     */
    data: XOR<UserStarHistoryUpdateManyMutationInput, UserStarHistoryUncheckedUpdateManyInput>
    /**
     * Filter which UserStarHistories to update
     */
    where?: UserStarHistoryWhereInput
  }

  /**
   * UserStarHistory upsert
   */
  export type UserStarHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStarHistory
     */
    select?: UserStarHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStarHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the UserStarHistory to update in case it exists.
     */
    where: UserStarHistoryWhereUniqueInput
    /**
     * In case the UserStarHistory found by the `where` argument doesn't exist, create a new UserStarHistory with this data.
     */
    create: XOR<UserStarHistoryCreateInput, UserStarHistoryUncheckedCreateInput>
    /**
     * In case the UserStarHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserStarHistoryUpdateInput, UserStarHistoryUncheckedUpdateInput>
  }

  /**
   * UserStarHistory delete
   */
  export type UserStarHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStarHistory
     */
    select?: UserStarHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStarHistoryInclude<ExtArgs> | null
    /**
     * Filter which UserStarHistory to delete.
     */
    where: UserStarHistoryWhereUniqueInput
  }

  /**
   * UserStarHistory deleteMany
   */
  export type UserStarHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserStarHistories to delete
     */
    where?: UserStarHistoryWhereInput
  }

  /**
   * UserStarHistory.gameResult
   */
  export type UserStarHistory$gameResultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameResult
     */
    select?: GameResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameResultInclude<ExtArgs> | null
    where?: GameResultWhereInput
  }

  /**
   * UserStarHistory without action
   */
  export type UserStarHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStarHistory
     */
    select?: UserStarHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStarHistoryInclude<ExtArgs> | null
  }


  /**
   * Model SavingPlan
   */

  export type AggregateSavingPlan = {
    _count: SavingPlanCountAggregateOutputType | null
    _avg: SavingPlanAvgAggregateOutputType | null
    _sum: SavingPlanSumAggregateOutputType | null
    _min: SavingPlanMinAggregateOutputType | null
    _max: SavingPlanMaxAggregateOutputType | null
  }

  export type SavingPlanAvgAggregateOutputType = {
    id: number | null
    price: number | null
  }

  export type SavingPlanSumAggregateOutputType = {
    id: number | null
    price: number | null
  }

  export type SavingPlanMinAggregateOutputType = {
    id: number | null
    uuid: string | null
    name: string | null
    price: number | null
    description: string | null
    isDelete: boolean | null
  }

  export type SavingPlanMaxAggregateOutputType = {
    id: number | null
    uuid: string | null
    name: string | null
    price: number | null
    description: string | null
    isDelete: boolean | null
  }

  export type SavingPlanCountAggregateOutputType = {
    id: number
    uuid: number
    name: number
    price: number
    description: number
    isDelete: number
    _all: number
  }


  export type SavingPlanAvgAggregateInputType = {
    id?: true
    price?: true
  }

  export type SavingPlanSumAggregateInputType = {
    id?: true
    price?: true
  }

  export type SavingPlanMinAggregateInputType = {
    id?: true
    uuid?: true
    name?: true
    price?: true
    description?: true
    isDelete?: true
  }

  export type SavingPlanMaxAggregateInputType = {
    id?: true
    uuid?: true
    name?: true
    price?: true
    description?: true
    isDelete?: true
  }

  export type SavingPlanCountAggregateInputType = {
    id?: true
    uuid?: true
    name?: true
    price?: true
    description?: true
    isDelete?: true
    _all?: true
  }

  export type SavingPlanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SavingPlan to aggregate.
     */
    where?: SavingPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavingPlans to fetch.
     */
    orderBy?: SavingPlanOrderByWithRelationInput | SavingPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SavingPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavingPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavingPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SavingPlans
    **/
    _count?: true | SavingPlanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SavingPlanAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SavingPlanSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SavingPlanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SavingPlanMaxAggregateInputType
  }

  export type GetSavingPlanAggregateType<T extends SavingPlanAggregateArgs> = {
        [P in keyof T & keyof AggregateSavingPlan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSavingPlan[P]>
      : GetScalarType<T[P], AggregateSavingPlan[P]>
  }




  export type SavingPlanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SavingPlanWhereInput
    orderBy?: SavingPlanOrderByWithAggregationInput | SavingPlanOrderByWithAggregationInput[]
    by: SavingPlanScalarFieldEnum[] | SavingPlanScalarFieldEnum
    having?: SavingPlanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SavingPlanCountAggregateInputType | true
    _avg?: SavingPlanAvgAggregateInputType
    _sum?: SavingPlanSumAggregateInputType
    _min?: SavingPlanMinAggregateInputType
    _max?: SavingPlanMaxAggregateInputType
  }

  export type SavingPlanGroupByOutputType = {
    id: number
    uuid: string
    name: string
    price: number
    description: string | null
    isDelete: boolean | null
    _count: SavingPlanCountAggregateOutputType | null
    _avg: SavingPlanAvgAggregateOutputType | null
    _sum: SavingPlanSumAggregateOutputType | null
    _min: SavingPlanMinAggregateOutputType | null
    _max: SavingPlanMaxAggregateOutputType | null
  }

  type GetSavingPlanGroupByPayload<T extends SavingPlanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SavingPlanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SavingPlanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SavingPlanGroupByOutputType[P]>
            : GetScalarType<T[P], SavingPlanGroupByOutputType[P]>
        }
      >
    >


  export type SavingPlanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    name?: boolean
    price?: boolean
    description?: boolean
    isDelete?: boolean
  }, ExtArgs["result"]["savingPlan"]>


  export type SavingPlanSelectScalar = {
    id?: boolean
    uuid?: boolean
    name?: boolean
    price?: boolean
    description?: boolean
    isDelete?: boolean
  }


  export type $SavingPlanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SavingPlan"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      uuid: string
      name: string
      price: number
      description: string | null
      isDelete: boolean | null
    }, ExtArgs["result"]["savingPlan"]>
    composites: {}
  }

  type SavingPlanGetPayload<S extends boolean | null | undefined | SavingPlanDefaultArgs> = $Result.GetResult<Prisma.$SavingPlanPayload, S>

  type SavingPlanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SavingPlanFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SavingPlanCountAggregateInputType | true
    }

  export interface SavingPlanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SavingPlan'], meta: { name: 'SavingPlan' } }
    /**
     * Find zero or one SavingPlan that matches the filter.
     * @param {SavingPlanFindUniqueArgs} args - Arguments to find a SavingPlan
     * @example
     * // Get one SavingPlan
     * const savingPlan = await prisma.savingPlan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SavingPlanFindUniqueArgs>(args: SelectSubset<T, SavingPlanFindUniqueArgs<ExtArgs>>): Prisma__SavingPlanClient<$Result.GetResult<Prisma.$SavingPlanPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SavingPlan that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SavingPlanFindUniqueOrThrowArgs} args - Arguments to find a SavingPlan
     * @example
     * // Get one SavingPlan
     * const savingPlan = await prisma.savingPlan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SavingPlanFindUniqueOrThrowArgs>(args: SelectSubset<T, SavingPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SavingPlanClient<$Result.GetResult<Prisma.$SavingPlanPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SavingPlan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingPlanFindFirstArgs} args - Arguments to find a SavingPlan
     * @example
     * // Get one SavingPlan
     * const savingPlan = await prisma.savingPlan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SavingPlanFindFirstArgs>(args?: SelectSubset<T, SavingPlanFindFirstArgs<ExtArgs>>): Prisma__SavingPlanClient<$Result.GetResult<Prisma.$SavingPlanPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SavingPlan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingPlanFindFirstOrThrowArgs} args - Arguments to find a SavingPlan
     * @example
     * // Get one SavingPlan
     * const savingPlan = await prisma.savingPlan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SavingPlanFindFirstOrThrowArgs>(args?: SelectSubset<T, SavingPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma__SavingPlanClient<$Result.GetResult<Prisma.$SavingPlanPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SavingPlans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingPlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SavingPlans
     * const savingPlans = await prisma.savingPlan.findMany()
     * 
     * // Get first 10 SavingPlans
     * const savingPlans = await prisma.savingPlan.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const savingPlanWithIdOnly = await prisma.savingPlan.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SavingPlanFindManyArgs>(args?: SelectSubset<T, SavingPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SavingPlanPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SavingPlan.
     * @param {SavingPlanCreateArgs} args - Arguments to create a SavingPlan.
     * @example
     * // Create one SavingPlan
     * const SavingPlan = await prisma.savingPlan.create({
     *   data: {
     *     // ... data to create a SavingPlan
     *   }
     * })
     * 
     */
    create<T extends SavingPlanCreateArgs>(args: SelectSubset<T, SavingPlanCreateArgs<ExtArgs>>): Prisma__SavingPlanClient<$Result.GetResult<Prisma.$SavingPlanPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SavingPlans.
     * @param {SavingPlanCreateManyArgs} args - Arguments to create many SavingPlans.
     * @example
     * // Create many SavingPlans
     * const savingPlan = await prisma.savingPlan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SavingPlanCreateManyArgs>(args?: SelectSubset<T, SavingPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a SavingPlan.
     * @param {SavingPlanDeleteArgs} args - Arguments to delete one SavingPlan.
     * @example
     * // Delete one SavingPlan
     * const SavingPlan = await prisma.savingPlan.delete({
     *   where: {
     *     // ... filter to delete one SavingPlan
     *   }
     * })
     * 
     */
    delete<T extends SavingPlanDeleteArgs>(args: SelectSubset<T, SavingPlanDeleteArgs<ExtArgs>>): Prisma__SavingPlanClient<$Result.GetResult<Prisma.$SavingPlanPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SavingPlan.
     * @param {SavingPlanUpdateArgs} args - Arguments to update one SavingPlan.
     * @example
     * // Update one SavingPlan
     * const savingPlan = await prisma.savingPlan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SavingPlanUpdateArgs>(args: SelectSubset<T, SavingPlanUpdateArgs<ExtArgs>>): Prisma__SavingPlanClient<$Result.GetResult<Prisma.$SavingPlanPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SavingPlans.
     * @param {SavingPlanDeleteManyArgs} args - Arguments to filter SavingPlans to delete.
     * @example
     * // Delete a few SavingPlans
     * const { count } = await prisma.savingPlan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SavingPlanDeleteManyArgs>(args?: SelectSubset<T, SavingPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SavingPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingPlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SavingPlans
     * const savingPlan = await prisma.savingPlan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SavingPlanUpdateManyArgs>(args: SelectSubset<T, SavingPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SavingPlan.
     * @param {SavingPlanUpsertArgs} args - Arguments to update or create a SavingPlan.
     * @example
     * // Update or create a SavingPlan
     * const savingPlan = await prisma.savingPlan.upsert({
     *   create: {
     *     // ... data to create a SavingPlan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SavingPlan we want to update
     *   }
     * })
     */
    upsert<T extends SavingPlanUpsertArgs>(args: SelectSubset<T, SavingPlanUpsertArgs<ExtArgs>>): Prisma__SavingPlanClient<$Result.GetResult<Prisma.$SavingPlanPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SavingPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingPlanCountArgs} args - Arguments to filter SavingPlans to count.
     * @example
     * // Count the number of SavingPlans
     * const count = await prisma.savingPlan.count({
     *   where: {
     *     // ... the filter for the SavingPlans we want to count
     *   }
     * })
    **/
    count<T extends SavingPlanCountArgs>(
      args?: Subset<T, SavingPlanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SavingPlanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SavingPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingPlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SavingPlanAggregateArgs>(args: Subset<T, SavingPlanAggregateArgs>): Prisma.PrismaPromise<GetSavingPlanAggregateType<T>>

    /**
     * Group by SavingPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingPlanGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SavingPlanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SavingPlanGroupByArgs['orderBy'] }
        : { orderBy?: SavingPlanGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SavingPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSavingPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SavingPlan model
   */
  readonly fields: SavingPlanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SavingPlan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SavingPlanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SavingPlan model
   */ 
  interface SavingPlanFieldRefs {
    readonly id: FieldRef<"SavingPlan", 'Int'>
    readonly uuid: FieldRef<"SavingPlan", 'String'>
    readonly name: FieldRef<"SavingPlan", 'String'>
    readonly price: FieldRef<"SavingPlan", 'Int'>
    readonly description: FieldRef<"SavingPlan", 'String'>
    readonly isDelete: FieldRef<"SavingPlan", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * SavingPlan findUnique
   */
  export type SavingPlanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavingPlan
     */
    select?: SavingPlanSelect<ExtArgs> | null
    /**
     * Filter, which SavingPlan to fetch.
     */
    where: SavingPlanWhereUniqueInput
  }

  /**
   * SavingPlan findUniqueOrThrow
   */
  export type SavingPlanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavingPlan
     */
    select?: SavingPlanSelect<ExtArgs> | null
    /**
     * Filter, which SavingPlan to fetch.
     */
    where: SavingPlanWhereUniqueInput
  }

  /**
   * SavingPlan findFirst
   */
  export type SavingPlanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavingPlan
     */
    select?: SavingPlanSelect<ExtArgs> | null
    /**
     * Filter, which SavingPlan to fetch.
     */
    where?: SavingPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavingPlans to fetch.
     */
    orderBy?: SavingPlanOrderByWithRelationInput | SavingPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SavingPlans.
     */
    cursor?: SavingPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavingPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavingPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SavingPlans.
     */
    distinct?: SavingPlanScalarFieldEnum | SavingPlanScalarFieldEnum[]
  }

  /**
   * SavingPlan findFirstOrThrow
   */
  export type SavingPlanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavingPlan
     */
    select?: SavingPlanSelect<ExtArgs> | null
    /**
     * Filter, which SavingPlan to fetch.
     */
    where?: SavingPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavingPlans to fetch.
     */
    orderBy?: SavingPlanOrderByWithRelationInput | SavingPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SavingPlans.
     */
    cursor?: SavingPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavingPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavingPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SavingPlans.
     */
    distinct?: SavingPlanScalarFieldEnum | SavingPlanScalarFieldEnum[]
  }

  /**
   * SavingPlan findMany
   */
  export type SavingPlanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavingPlan
     */
    select?: SavingPlanSelect<ExtArgs> | null
    /**
     * Filter, which SavingPlans to fetch.
     */
    where?: SavingPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavingPlans to fetch.
     */
    orderBy?: SavingPlanOrderByWithRelationInput | SavingPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SavingPlans.
     */
    cursor?: SavingPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavingPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavingPlans.
     */
    skip?: number
    distinct?: SavingPlanScalarFieldEnum | SavingPlanScalarFieldEnum[]
  }

  /**
   * SavingPlan create
   */
  export type SavingPlanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavingPlan
     */
    select?: SavingPlanSelect<ExtArgs> | null
    /**
     * The data needed to create a SavingPlan.
     */
    data: XOR<SavingPlanCreateInput, SavingPlanUncheckedCreateInput>
  }

  /**
   * SavingPlan createMany
   */
  export type SavingPlanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SavingPlans.
     */
    data: SavingPlanCreateManyInput | SavingPlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SavingPlan update
   */
  export type SavingPlanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavingPlan
     */
    select?: SavingPlanSelect<ExtArgs> | null
    /**
     * The data needed to update a SavingPlan.
     */
    data: XOR<SavingPlanUpdateInput, SavingPlanUncheckedUpdateInput>
    /**
     * Choose, which SavingPlan to update.
     */
    where: SavingPlanWhereUniqueInput
  }

  /**
   * SavingPlan updateMany
   */
  export type SavingPlanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SavingPlans.
     */
    data: XOR<SavingPlanUpdateManyMutationInput, SavingPlanUncheckedUpdateManyInput>
    /**
     * Filter which SavingPlans to update
     */
    where?: SavingPlanWhereInput
  }

  /**
   * SavingPlan upsert
   */
  export type SavingPlanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavingPlan
     */
    select?: SavingPlanSelect<ExtArgs> | null
    /**
     * The filter to search for the SavingPlan to update in case it exists.
     */
    where: SavingPlanWhereUniqueInput
    /**
     * In case the SavingPlan found by the `where` argument doesn't exist, create a new SavingPlan with this data.
     */
    create: XOR<SavingPlanCreateInput, SavingPlanUncheckedCreateInput>
    /**
     * In case the SavingPlan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SavingPlanUpdateInput, SavingPlanUncheckedUpdateInput>
  }

  /**
   * SavingPlan delete
   */
  export type SavingPlanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavingPlan
     */
    select?: SavingPlanSelect<ExtArgs> | null
    /**
     * Filter which SavingPlan to delete.
     */
    where: SavingPlanWhereUniqueInput
  }

  /**
   * SavingPlan deleteMany
   */
  export type SavingPlanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SavingPlans to delete
     */
    where?: SavingPlanWhereInput
  }

  /**
   * SavingPlan without action
   */
  export type SavingPlanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavingPlan
     */
    select?: SavingPlanSelect<ExtArgs> | null
  }


  /**
   * Model Computer
   */

  export type AggregateComputer = {
    _count: ComputerCountAggregateOutputType | null
    _avg: ComputerAvgAggregateOutputType | null
    _sum: ComputerSumAggregateOutputType | null
    _min: ComputerMinAggregateOutputType | null
    _max: ComputerMaxAggregateOutputType | null
  }

  export type ComputerAvgAggregateOutputType = {
    id: number | null
    status: number | null
  }

  export type ComputerSumAggregateOutputType = {
    id: number | null
    status: number | null
  }

  export type ComputerMinAggregateOutputType = {
    id: number | null
    fingerprintId: string | null
    ip: string | null
    name: string | null
    branch: string | null
    status: number | null
    localIp: string | null
  }

  export type ComputerMaxAggregateOutputType = {
    id: number | null
    fingerprintId: string | null
    ip: string | null
    name: string | null
    branch: string | null
    status: number | null
    localIp: string | null
  }

  export type ComputerCountAggregateOutputType = {
    id: number
    fingerprintId: number
    ip: number
    name: number
    branch: number
    status: number
    localIp: number
    _all: number
  }


  export type ComputerAvgAggregateInputType = {
    id?: true
    status?: true
  }

  export type ComputerSumAggregateInputType = {
    id?: true
    status?: true
  }

  export type ComputerMinAggregateInputType = {
    id?: true
    fingerprintId?: true
    ip?: true
    name?: true
    branch?: true
    status?: true
    localIp?: true
  }

  export type ComputerMaxAggregateInputType = {
    id?: true
    fingerprintId?: true
    ip?: true
    name?: true
    branch?: true
    status?: true
    localIp?: true
  }

  export type ComputerCountAggregateInputType = {
    id?: true
    fingerprintId?: true
    ip?: true
    name?: true
    branch?: true
    status?: true
    localIp?: true
    _all?: true
  }

  export type ComputerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Computer to aggregate.
     */
    where?: ComputerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Computers to fetch.
     */
    orderBy?: ComputerOrderByWithRelationInput | ComputerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ComputerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Computers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Computers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Computers
    **/
    _count?: true | ComputerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ComputerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ComputerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ComputerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ComputerMaxAggregateInputType
  }

  export type GetComputerAggregateType<T extends ComputerAggregateArgs> = {
        [P in keyof T & keyof AggregateComputer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateComputer[P]>
      : GetScalarType<T[P], AggregateComputer[P]>
  }




  export type ComputerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ComputerWhereInput
    orderBy?: ComputerOrderByWithAggregationInput | ComputerOrderByWithAggregationInput[]
    by: ComputerScalarFieldEnum[] | ComputerScalarFieldEnum
    having?: ComputerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ComputerCountAggregateInputType | true
    _avg?: ComputerAvgAggregateInputType
    _sum?: ComputerSumAggregateInputType
    _min?: ComputerMinAggregateInputType
    _max?: ComputerMaxAggregateInputType
  }

  export type ComputerGroupByOutputType = {
    id: number
    fingerprintId: string
    ip: string | null
    name: string
    branch: string
    status: number
    localIp: string | null
    _count: ComputerCountAggregateOutputType | null
    _avg: ComputerAvgAggregateOutputType | null
    _sum: ComputerSumAggregateOutputType | null
    _min: ComputerMinAggregateOutputType | null
    _max: ComputerMaxAggregateOutputType | null
  }

  type GetComputerGroupByPayload<T extends ComputerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ComputerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ComputerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ComputerGroupByOutputType[P]>
            : GetScalarType<T[P], ComputerGroupByOutputType[P]>
        }
      >
    >


  export type ComputerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fingerprintId?: boolean
    ip?: boolean
    name?: boolean
    branch?: boolean
    status?: boolean
    localIp?: boolean
  }, ExtArgs["result"]["computer"]>


  export type ComputerSelectScalar = {
    id?: boolean
    fingerprintId?: boolean
    ip?: boolean
    name?: boolean
    branch?: boolean
    status?: boolean
    localIp?: boolean
  }


  export type $ComputerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Computer"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      fingerprintId: string
      ip: string | null
      name: string
      branch: string
      status: number
      localIp: string | null
    }, ExtArgs["result"]["computer"]>
    composites: {}
  }

  type ComputerGetPayload<S extends boolean | null | undefined | ComputerDefaultArgs> = $Result.GetResult<Prisma.$ComputerPayload, S>

  type ComputerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ComputerFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ComputerCountAggregateInputType | true
    }

  export interface ComputerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Computer'], meta: { name: 'Computer' } }
    /**
     * Find zero or one Computer that matches the filter.
     * @param {ComputerFindUniqueArgs} args - Arguments to find a Computer
     * @example
     * // Get one Computer
     * const computer = await prisma.computer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ComputerFindUniqueArgs>(args: SelectSubset<T, ComputerFindUniqueArgs<ExtArgs>>): Prisma__ComputerClient<$Result.GetResult<Prisma.$ComputerPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Computer that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ComputerFindUniqueOrThrowArgs} args - Arguments to find a Computer
     * @example
     * // Get one Computer
     * const computer = await prisma.computer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ComputerFindUniqueOrThrowArgs>(args: SelectSubset<T, ComputerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ComputerClient<$Result.GetResult<Prisma.$ComputerPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Computer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputerFindFirstArgs} args - Arguments to find a Computer
     * @example
     * // Get one Computer
     * const computer = await prisma.computer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ComputerFindFirstArgs>(args?: SelectSubset<T, ComputerFindFirstArgs<ExtArgs>>): Prisma__ComputerClient<$Result.GetResult<Prisma.$ComputerPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Computer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputerFindFirstOrThrowArgs} args - Arguments to find a Computer
     * @example
     * // Get one Computer
     * const computer = await prisma.computer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ComputerFindFirstOrThrowArgs>(args?: SelectSubset<T, ComputerFindFirstOrThrowArgs<ExtArgs>>): Prisma__ComputerClient<$Result.GetResult<Prisma.$ComputerPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Computers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Computers
     * const computers = await prisma.computer.findMany()
     * 
     * // Get first 10 Computers
     * const computers = await prisma.computer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const computerWithIdOnly = await prisma.computer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ComputerFindManyArgs>(args?: SelectSubset<T, ComputerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ComputerPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Computer.
     * @param {ComputerCreateArgs} args - Arguments to create a Computer.
     * @example
     * // Create one Computer
     * const Computer = await prisma.computer.create({
     *   data: {
     *     // ... data to create a Computer
     *   }
     * })
     * 
     */
    create<T extends ComputerCreateArgs>(args: SelectSubset<T, ComputerCreateArgs<ExtArgs>>): Prisma__ComputerClient<$Result.GetResult<Prisma.$ComputerPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Computers.
     * @param {ComputerCreateManyArgs} args - Arguments to create many Computers.
     * @example
     * // Create many Computers
     * const computer = await prisma.computer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ComputerCreateManyArgs>(args?: SelectSubset<T, ComputerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Computer.
     * @param {ComputerDeleteArgs} args - Arguments to delete one Computer.
     * @example
     * // Delete one Computer
     * const Computer = await prisma.computer.delete({
     *   where: {
     *     // ... filter to delete one Computer
     *   }
     * })
     * 
     */
    delete<T extends ComputerDeleteArgs>(args: SelectSubset<T, ComputerDeleteArgs<ExtArgs>>): Prisma__ComputerClient<$Result.GetResult<Prisma.$ComputerPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Computer.
     * @param {ComputerUpdateArgs} args - Arguments to update one Computer.
     * @example
     * // Update one Computer
     * const computer = await prisma.computer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ComputerUpdateArgs>(args: SelectSubset<T, ComputerUpdateArgs<ExtArgs>>): Prisma__ComputerClient<$Result.GetResult<Prisma.$ComputerPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Computers.
     * @param {ComputerDeleteManyArgs} args - Arguments to filter Computers to delete.
     * @example
     * // Delete a few Computers
     * const { count } = await prisma.computer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ComputerDeleteManyArgs>(args?: SelectSubset<T, ComputerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Computers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Computers
     * const computer = await prisma.computer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ComputerUpdateManyArgs>(args: SelectSubset<T, ComputerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Computer.
     * @param {ComputerUpsertArgs} args - Arguments to update or create a Computer.
     * @example
     * // Update or create a Computer
     * const computer = await prisma.computer.upsert({
     *   create: {
     *     // ... data to create a Computer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Computer we want to update
     *   }
     * })
     */
    upsert<T extends ComputerUpsertArgs>(args: SelectSubset<T, ComputerUpsertArgs<ExtArgs>>): Prisma__ComputerClient<$Result.GetResult<Prisma.$ComputerPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Computers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputerCountArgs} args - Arguments to filter Computers to count.
     * @example
     * // Count the number of Computers
     * const count = await prisma.computer.count({
     *   where: {
     *     // ... the filter for the Computers we want to count
     *   }
     * })
    **/
    count<T extends ComputerCountArgs>(
      args?: Subset<T, ComputerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ComputerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Computer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ComputerAggregateArgs>(args: Subset<T, ComputerAggregateArgs>): Prisma.PrismaPromise<GetComputerAggregateType<T>>

    /**
     * Group by Computer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComputerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ComputerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ComputerGroupByArgs['orderBy'] }
        : { orderBy?: ComputerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ComputerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetComputerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Computer model
   */
  readonly fields: ComputerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Computer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ComputerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Computer model
   */ 
  interface ComputerFieldRefs {
    readonly id: FieldRef<"Computer", 'Int'>
    readonly fingerprintId: FieldRef<"Computer", 'String'>
    readonly ip: FieldRef<"Computer", 'String'>
    readonly name: FieldRef<"Computer", 'String'>
    readonly branch: FieldRef<"Computer", 'String'>
    readonly status: FieldRef<"Computer", 'Int'>
    readonly localIp: FieldRef<"Computer", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Computer findUnique
   */
  export type ComputerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Computer
     */
    select?: ComputerSelect<ExtArgs> | null
    /**
     * Filter, which Computer to fetch.
     */
    where: ComputerWhereUniqueInput
  }

  /**
   * Computer findUniqueOrThrow
   */
  export type ComputerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Computer
     */
    select?: ComputerSelect<ExtArgs> | null
    /**
     * Filter, which Computer to fetch.
     */
    where: ComputerWhereUniqueInput
  }

  /**
   * Computer findFirst
   */
  export type ComputerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Computer
     */
    select?: ComputerSelect<ExtArgs> | null
    /**
     * Filter, which Computer to fetch.
     */
    where?: ComputerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Computers to fetch.
     */
    orderBy?: ComputerOrderByWithRelationInput | ComputerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Computers.
     */
    cursor?: ComputerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Computers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Computers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Computers.
     */
    distinct?: ComputerScalarFieldEnum | ComputerScalarFieldEnum[]
  }

  /**
   * Computer findFirstOrThrow
   */
  export type ComputerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Computer
     */
    select?: ComputerSelect<ExtArgs> | null
    /**
     * Filter, which Computer to fetch.
     */
    where?: ComputerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Computers to fetch.
     */
    orderBy?: ComputerOrderByWithRelationInput | ComputerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Computers.
     */
    cursor?: ComputerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Computers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Computers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Computers.
     */
    distinct?: ComputerScalarFieldEnum | ComputerScalarFieldEnum[]
  }

  /**
   * Computer findMany
   */
  export type ComputerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Computer
     */
    select?: ComputerSelect<ExtArgs> | null
    /**
     * Filter, which Computers to fetch.
     */
    where?: ComputerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Computers to fetch.
     */
    orderBy?: ComputerOrderByWithRelationInput | ComputerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Computers.
     */
    cursor?: ComputerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Computers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Computers.
     */
    skip?: number
    distinct?: ComputerScalarFieldEnum | ComputerScalarFieldEnum[]
  }

  /**
   * Computer create
   */
  export type ComputerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Computer
     */
    select?: ComputerSelect<ExtArgs> | null
    /**
     * The data needed to create a Computer.
     */
    data: XOR<ComputerCreateInput, ComputerUncheckedCreateInput>
  }

  /**
   * Computer createMany
   */
  export type ComputerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Computers.
     */
    data: ComputerCreateManyInput | ComputerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Computer update
   */
  export type ComputerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Computer
     */
    select?: ComputerSelect<ExtArgs> | null
    /**
     * The data needed to update a Computer.
     */
    data: XOR<ComputerUpdateInput, ComputerUncheckedUpdateInput>
    /**
     * Choose, which Computer to update.
     */
    where: ComputerWhereUniqueInput
  }

  /**
   * Computer updateMany
   */
  export type ComputerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Computers.
     */
    data: XOR<ComputerUpdateManyMutationInput, ComputerUncheckedUpdateManyInput>
    /**
     * Filter which Computers to update
     */
    where?: ComputerWhereInput
  }

  /**
   * Computer upsert
   */
  export type ComputerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Computer
     */
    select?: ComputerSelect<ExtArgs> | null
    /**
     * The filter to search for the Computer to update in case it exists.
     */
    where: ComputerWhereUniqueInput
    /**
     * In case the Computer found by the `where` argument doesn't exist, create a new Computer with this data.
     */
    create: XOR<ComputerCreateInput, ComputerUncheckedCreateInput>
    /**
     * In case the Computer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ComputerUpdateInput, ComputerUncheckedUpdateInput>
  }

  /**
   * Computer delete
   */
  export type ComputerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Computer
     */
    select?: ComputerSelect<ExtArgs> | null
    /**
     * Filter which Computer to delete.
     */
    where: ComputerWhereUniqueInput
  }

  /**
   * Computer deleteMany
   */
  export type ComputerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Computers to delete
     */
    where?: ComputerWhereInput
  }

  /**
   * Computer without action
   */
  export type ComputerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Computer
     */
    select?: ComputerSelect<ExtArgs> | null
  }


  /**
   * Model FundHistory
   */

  export type AggregateFundHistory = {
    _count: FundHistoryCountAggregateOutputType | null
    _avg: FundHistoryAvgAggregateOutputType | null
    _sum: FundHistorySumAggregateOutputType | null
    _min: FundHistoryMinAggregateOutputType | null
    _max: FundHistoryMaxAggregateOutputType | null
  }

  export type FundHistoryAvgAggregateOutputType = {
    id: number | null
    startValue: number | null
    currentValue: number | null
    endValue: number | null
    updatedAt: number | null
  }

  export type FundHistorySumAggregateOutputType = {
    id: number | null
    startValue: number | null
    currentValue: number | null
    endValue: number | null
    updatedAt: number | null
  }

  export type FundHistoryMinAggregateOutputType = {
    id: number | null
    date: Date | null
    startValue: number | null
    currentValue: number | null
    endValue: number | null
    createdAt: Date | null
    updatedAt: number | null
  }

  export type FundHistoryMaxAggregateOutputType = {
    id: number | null
    date: Date | null
    startValue: number | null
    currentValue: number | null
    endValue: number | null
    createdAt: Date | null
    updatedAt: number | null
  }

  export type FundHistoryCountAggregateOutputType = {
    id: number
    date: number
    startValue: number
    currentValue: number
    endValue: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FundHistoryAvgAggregateInputType = {
    id?: true
    startValue?: true
    currentValue?: true
    endValue?: true
    updatedAt?: true
  }

  export type FundHistorySumAggregateInputType = {
    id?: true
    startValue?: true
    currentValue?: true
    endValue?: true
    updatedAt?: true
  }

  export type FundHistoryMinAggregateInputType = {
    id?: true
    date?: true
    startValue?: true
    currentValue?: true
    endValue?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FundHistoryMaxAggregateInputType = {
    id?: true
    date?: true
    startValue?: true
    currentValue?: true
    endValue?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FundHistoryCountAggregateInputType = {
    id?: true
    date?: true
    startValue?: true
    currentValue?: true
    endValue?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FundHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FundHistory to aggregate.
     */
    where?: FundHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FundHistories to fetch.
     */
    orderBy?: FundHistoryOrderByWithRelationInput | FundHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FundHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FundHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FundHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FundHistories
    **/
    _count?: true | FundHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FundHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FundHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FundHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FundHistoryMaxAggregateInputType
  }

  export type GetFundHistoryAggregateType<T extends FundHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateFundHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFundHistory[P]>
      : GetScalarType<T[P], AggregateFundHistory[P]>
  }




  export type FundHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FundHistoryWhereInput
    orderBy?: FundHistoryOrderByWithAggregationInput | FundHistoryOrderByWithAggregationInput[]
    by: FundHistoryScalarFieldEnum[] | FundHistoryScalarFieldEnum
    having?: FundHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FundHistoryCountAggregateInputType | true
    _avg?: FundHistoryAvgAggregateInputType
    _sum?: FundHistorySumAggregateInputType
    _min?: FundHistoryMinAggregateInputType
    _max?: FundHistoryMaxAggregateInputType
  }

  export type FundHistoryGroupByOutputType = {
    id: number
    date: Date | null
    startValue: number | null
    currentValue: number | null
    endValue: number | null
    createdAt: Date | null
    updatedAt: number | null
    _count: FundHistoryCountAggregateOutputType | null
    _avg: FundHistoryAvgAggregateOutputType | null
    _sum: FundHistorySumAggregateOutputType | null
    _min: FundHistoryMinAggregateOutputType | null
    _max: FundHistoryMaxAggregateOutputType | null
  }

  type GetFundHistoryGroupByPayload<T extends FundHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FundHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FundHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FundHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], FundHistoryGroupByOutputType[P]>
        }
      >
    >


  export type FundHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    startValue?: boolean
    currentValue?: boolean
    endValue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["fundHistory"]>


  export type FundHistorySelectScalar = {
    id?: boolean
    date?: boolean
    startValue?: boolean
    currentValue?: boolean
    endValue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $FundHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FundHistory"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      date: Date | null
      startValue: number | null
      currentValue: number | null
      endValue: number | null
      createdAt: Date | null
      updatedAt: number | null
    }, ExtArgs["result"]["fundHistory"]>
    composites: {}
  }

  type FundHistoryGetPayload<S extends boolean | null | undefined | FundHistoryDefaultArgs> = $Result.GetResult<Prisma.$FundHistoryPayload, S>

  type FundHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FundHistoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FundHistoryCountAggregateInputType | true
    }

  export interface FundHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FundHistory'], meta: { name: 'FundHistory' } }
    /**
     * Find zero or one FundHistory that matches the filter.
     * @param {FundHistoryFindUniqueArgs} args - Arguments to find a FundHistory
     * @example
     * // Get one FundHistory
     * const fundHistory = await prisma.fundHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FundHistoryFindUniqueArgs>(args: SelectSubset<T, FundHistoryFindUniqueArgs<ExtArgs>>): Prisma__FundHistoryClient<$Result.GetResult<Prisma.$FundHistoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FundHistory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FundHistoryFindUniqueOrThrowArgs} args - Arguments to find a FundHistory
     * @example
     * // Get one FundHistory
     * const fundHistory = await prisma.fundHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FundHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, FundHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FundHistoryClient<$Result.GetResult<Prisma.$FundHistoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FundHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FundHistoryFindFirstArgs} args - Arguments to find a FundHistory
     * @example
     * // Get one FundHistory
     * const fundHistory = await prisma.fundHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FundHistoryFindFirstArgs>(args?: SelectSubset<T, FundHistoryFindFirstArgs<ExtArgs>>): Prisma__FundHistoryClient<$Result.GetResult<Prisma.$FundHistoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FundHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FundHistoryFindFirstOrThrowArgs} args - Arguments to find a FundHistory
     * @example
     * // Get one FundHistory
     * const fundHistory = await prisma.fundHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FundHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, FundHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__FundHistoryClient<$Result.GetResult<Prisma.$FundHistoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FundHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FundHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FundHistories
     * const fundHistories = await prisma.fundHistory.findMany()
     * 
     * // Get first 10 FundHistories
     * const fundHistories = await prisma.fundHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fundHistoryWithIdOnly = await prisma.fundHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FundHistoryFindManyArgs>(args?: SelectSubset<T, FundHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FundHistoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FundHistory.
     * @param {FundHistoryCreateArgs} args - Arguments to create a FundHistory.
     * @example
     * // Create one FundHistory
     * const FundHistory = await prisma.fundHistory.create({
     *   data: {
     *     // ... data to create a FundHistory
     *   }
     * })
     * 
     */
    create<T extends FundHistoryCreateArgs>(args: SelectSubset<T, FundHistoryCreateArgs<ExtArgs>>): Prisma__FundHistoryClient<$Result.GetResult<Prisma.$FundHistoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FundHistories.
     * @param {FundHistoryCreateManyArgs} args - Arguments to create many FundHistories.
     * @example
     * // Create many FundHistories
     * const fundHistory = await prisma.fundHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FundHistoryCreateManyArgs>(args?: SelectSubset<T, FundHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a FundHistory.
     * @param {FundHistoryDeleteArgs} args - Arguments to delete one FundHistory.
     * @example
     * // Delete one FundHistory
     * const FundHistory = await prisma.fundHistory.delete({
     *   where: {
     *     // ... filter to delete one FundHistory
     *   }
     * })
     * 
     */
    delete<T extends FundHistoryDeleteArgs>(args: SelectSubset<T, FundHistoryDeleteArgs<ExtArgs>>): Prisma__FundHistoryClient<$Result.GetResult<Prisma.$FundHistoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FundHistory.
     * @param {FundHistoryUpdateArgs} args - Arguments to update one FundHistory.
     * @example
     * // Update one FundHistory
     * const fundHistory = await prisma.fundHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FundHistoryUpdateArgs>(args: SelectSubset<T, FundHistoryUpdateArgs<ExtArgs>>): Prisma__FundHistoryClient<$Result.GetResult<Prisma.$FundHistoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FundHistories.
     * @param {FundHistoryDeleteManyArgs} args - Arguments to filter FundHistories to delete.
     * @example
     * // Delete a few FundHistories
     * const { count } = await prisma.fundHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FundHistoryDeleteManyArgs>(args?: SelectSubset<T, FundHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FundHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FundHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FundHistories
     * const fundHistory = await prisma.fundHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FundHistoryUpdateManyArgs>(args: SelectSubset<T, FundHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FundHistory.
     * @param {FundHistoryUpsertArgs} args - Arguments to update or create a FundHistory.
     * @example
     * // Update or create a FundHistory
     * const fundHistory = await prisma.fundHistory.upsert({
     *   create: {
     *     // ... data to create a FundHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FundHistory we want to update
     *   }
     * })
     */
    upsert<T extends FundHistoryUpsertArgs>(args: SelectSubset<T, FundHistoryUpsertArgs<ExtArgs>>): Prisma__FundHistoryClient<$Result.GetResult<Prisma.$FundHistoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FundHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FundHistoryCountArgs} args - Arguments to filter FundHistories to count.
     * @example
     * // Count the number of FundHistories
     * const count = await prisma.fundHistory.count({
     *   where: {
     *     // ... the filter for the FundHistories we want to count
     *   }
     * })
    **/
    count<T extends FundHistoryCountArgs>(
      args?: Subset<T, FundHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FundHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FundHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FundHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FundHistoryAggregateArgs>(args: Subset<T, FundHistoryAggregateArgs>): Prisma.PrismaPromise<GetFundHistoryAggregateType<T>>

    /**
     * Group by FundHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FundHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FundHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FundHistoryGroupByArgs['orderBy'] }
        : { orderBy?: FundHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FundHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFundHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FundHistory model
   */
  readonly fields: FundHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FundHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FundHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FundHistory model
   */ 
  interface FundHistoryFieldRefs {
    readonly id: FieldRef<"FundHistory", 'Int'>
    readonly date: FieldRef<"FundHistory", 'DateTime'>
    readonly startValue: FieldRef<"FundHistory", 'Float'>
    readonly currentValue: FieldRef<"FundHistory", 'Float'>
    readonly endValue: FieldRef<"FundHistory", 'Float'>
    readonly createdAt: FieldRef<"FundHistory", 'DateTime'>
    readonly updatedAt: FieldRef<"FundHistory", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * FundHistory findUnique
   */
  export type FundHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FundHistory
     */
    select?: FundHistorySelect<ExtArgs> | null
    /**
     * Filter, which FundHistory to fetch.
     */
    where: FundHistoryWhereUniqueInput
  }

  /**
   * FundHistory findUniqueOrThrow
   */
  export type FundHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FundHistory
     */
    select?: FundHistorySelect<ExtArgs> | null
    /**
     * Filter, which FundHistory to fetch.
     */
    where: FundHistoryWhereUniqueInput
  }

  /**
   * FundHistory findFirst
   */
  export type FundHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FundHistory
     */
    select?: FundHistorySelect<ExtArgs> | null
    /**
     * Filter, which FundHistory to fetch.
     */
    where?: FundHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FundHistories to fetch.
     */
    orderBy?: FundHistoryOrderByWithRelationInput | FundHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FundHistories.
     */
    cursor?: FundHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FundHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FundHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FundHistories.
     */
    distinct?: FundHistoryScalarFieldEnum | FundHistoryScalarFieldEnum[]
  }

  /**
   * FundHistory findFirstOrThrow
   */
  export type FundHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FundHistory
     */
    select?: FundHistorySelect<ExtArgs> | null
    /**
     * Filter, which FundHistory to fetch.
     */
    where?: FundHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FundHistories to fetch.
     */
    orderBy?: FundHistoryOrderByWithRelationInput | FundHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FundHistories.
     */
    cursor?: FundHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FundHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FundHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FundHistories.
     */
    distinct?: FundHistoryScalarFieldEnum | FundHistoryScalarFieldEnum[]
  }

  /**
   * FundHistory findMany
   */
  export type FundHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FundHistory
     */
    select?: FundHistorySelect<ExtArgs> | null
    /**
     * Filter, which FundHistories to fetch.
     */
    where?: FundHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FundHistories to fetch.
     */
    orderBy?: FundHistoryOrderByWithRelationInput | FundHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FundHistories.
     */
    cursor?: FundHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FundHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FundHistories.
     */
    skip?: number
    distinct?: FundHistoryScalarFieldEnum | FundHistoryScalarFieldEnum[]
  }

  /**
   * FundHistory create
   */
  export type FundHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FundHistory
     */
    select?: FundHistorySelect<ExtArgs> | null
    /**
     * The data needed to create a FundHistory.
     */
    data?: XOR<FundHistoryCreateInput, FundHistoryUncheckedCreateInput>
  }

  /**
   * FundHistory createMany
   */
  export type FundHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FundHistories.
     */
    data: FundHistoryCreateManyInput | FundHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FundHistory update
   */
  export type FundHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FundHistory
     */
    select?: FundHistorySelect<ExtArgs> | null
    /**
     * The data needed to update a FundHistory.
     */
    data: XOR<FundHistoryUpdateInput, FundHistoryUncheckedUpdateInput>
    /**
     * Choose, which FundHistory to update.
     */
    where: FundHistoryWhereUniqueInput
  }

  /**
   * FundHistory updateMany
   */
  export type FundHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FundHistories.
     */
    data: XOR<FundHistoryUpdateManyMutationInput, FundHistoryUncheckedUpdateManyInput>
    /**
     * Filter which FundHistories to update
     */
    where?: FundHistoryWhereInput
  }

  /**
   * FundHistory upsert
   */
  export type FundHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FundHistory
     */
    select?: FundHistorySelect<ExtArgs> | null
    /**
     * The filter to search for the FundHistory to update in case it exists.
     */
    where: FundHistoryWhereUniqueInput
    /**
     * In case the FundHistory found by the `where` argument doesn't exist, create a new FundHistory with this data.
     */
    create: XOR<FundHistoryCreateInput, FundHistoryUncheckedCreateInput>
    /**
     * In case the FundHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FundHistoryUpdateInput, FundHistoryUncheckedUpdateInput>
  }

  /**
   * FundHistory delete
   */
  export type FundHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FundHistory
     */
    select?: FundHistorySelect<ExtArgs> | null
    /**
     * Filter which FundHistory to delete.
     */
    where: FundHistoryWhereUniqueInput
  }

  /**
   * FundHistory deleteMany
   */
  export type FundHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FundHistories to delete
     */
    where?: FundHistoryWhereInput
  }

  /**
   * FundHistory without action
   */
  export type FundHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FundHistory
     */
    select?: FundHistorySelect<ExtArgs> | null
  }


  /**
   * Model UserSpendMap
   */

  export type AggregateUserSpendMap = {
    _count: UserSpendMapCountAggregateOutputType | null
    _avg: UserSpendMapAvgAggregateOutputType | null
    _sum: UserSpendMapSumAggregateOutputType | null
    _min: UserSpendMapMinAggregateOutputType | null
    _max: UserSpendMapMaxAggregateOutputType | null
  }

  export type UserSpendMapAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    totalSpend: number | null
  }

  export type UserSpendMapSumAggregateOutputType = {
    id: number | null
    userId: number | null
    totalSpend: number | null
  }

  export type UserSpendMapMinAggregateOutputType = {
    id: number | null
    userId: number | null
    branch: string | null
    totalSpend: number | null
    date: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserSpendMapMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    branch: string | null
    totalSpend: number | null
    date: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserSpendMapCountAggregateOutputType = {
    id: number
    userId: number
    branch: number
    totalSpend: number
    date: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserSpendMapAvgAggregateInputType = {
    id?: true
    userId?: true
    totalSpend?: true
  }

  export type UserSpendMapSumAggregateInputType = {
    id?: true
    userId?: true
    totalSpend?: true
  }

  export type UserSpendMapMinAggregateInputType = {
    id?: true
    userId?: true
    branch?: true
    totalSpend?: true
    date?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserSpendMapMaxAggregateInputType = {
    id?: true
    userId?: true
    branch?: true
    totalSpend?: true
    date?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserSpendMapCountAggregateInputType = {
    id?: true
    userId?: true
    branch?: true
    totalSpend?: true
    date?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserSpendMapAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSpendMap to aggregate.
     */
    where?: UserSpendMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSpendMaps to fetch.
     */
    orderBy?: UserSpendMapOrderByWithRelationInput | UserSpendMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserSpendMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSpendMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSpendMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserSpendMaps
    **/
    _count?: true | UserSpendMapCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserSpendMapAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSpendMapSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserSpendMapMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserSpendMapMaxAggregateInputType
  }

  export type GetUserSpendMapAggregateType<T extends UserSpendMapAggregateArgs> = {
        [P in keyof T & keyof AggregateUserSpendMap]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserSpendMap[P]>
      : GetScalarType<T[P], AggregateUserSpendMap[P]>
  }




  export type UserSpendMapGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserSpendMapWhereInput
    orderBy?: UserSpendMapOrderByWithAggregationInput | UserSpendMapOrderByWithAggregationInput[]
    by: UserSpendMapScalarFieldEnum[] | UserSpendMapScalarFieldEnum
    having?: UserSpendMapScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserSpendMapCountAggregateInputType | true
    _avg?: UserSpendMapAvgAggregateInputType
    _sum?: UserSpendMapSumAggregateInputType
    _min?: UserSpendMapMinAggregateInputType
    _max?: UserSpendMapMaxAggregateInputType
  }

  export type UserSpendMapGroupByOutputType = {
    id: number
    userId: number | null
    branch: string | null
    totalSpend: number | null
    date: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    _count: UserSpendMapCountAggregateOutputType | null
    _avg: UserSpendMapAvgAggregateOutputType | null
    _sum: UserSpendMapSumAggregateOutputType | null
    _min: UserSpendMapMinAggregateOutputType | null
    _max: UserSpendMapMaxAggregateOutputType | null
  }

  type GetUserSpendMapGroupByPayload<T extends UserSpendMapGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserSpendMapGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserSpendMapGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserSpendMapGroupByOutputType[P]>
            : GetScalarType<T[P], UserSpendMapGroupByOutputType[P]>
        }
      >
    >


  export type UserSpendMapSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    branch?: boolean
    totalSpend?: boolean
    date?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userSpendMap"]>


  export type UserSpendMapSelectScalar = {
    id?: boolean
    userId?: boolean
    branch?: boolean
    totalSpend?: boolean
    date?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $UserSpendMapPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserSpendMap"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number | null
      branch: string | null
      totalSpend: number | null
      date: Date | null
      createdAt: Date | null
      updatedAt: Date | null
    }, ExtArgs["result"]["userSpendMap"]>
    composites: {}
  }

  type UserSpendMapGetPayload<S extends boolean | null | undefined | UserSpendMapDefaultArgs> = $Result.GetResult<Prisma.$UserSpendMapPayload, S>

  type UserSpendMapCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserSpendMapFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserSpendMapCountAggregateInputType | true
    }

  export interface UserSpendMapDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserSpendMap'], meta: { name: 'UserSpendMap' } }
    /**
     * Find zero or one UserSpendMap that matches the filter.
     * @param {UserSpendMapFindUniqueArgs} args - Arguments to find a UserSpendMap
     * @example
     * // Get one UserSpendMap
     * const userSpendMap = await prisma.userSpendMap.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserSpendMapFindUniqueArgs>(args: SelectSubset<T, UserSpendMapFindUniqueArgs<ExtArgs>>): Prisma__UserSpendMapClient<$Result.GetResult<Prisma.$UserSpendMapPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserSpendMap that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserSpendMapFindUniqueOrThrowArgs} args - Arguments to find a UserSpendMap
     * @example
     * // Get one UserSpendMap
     * const userSpendMap = await prisma.userSpendMap.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserSpendMapFindUniqueOrThrowArgs>(args: SelectSubset<T, UserSpendMapFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserSpendMapClient<$Result.GetResult<Prisma.$UserSpendMapPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserSpendMap that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSpendMapFindFirstArgs} args - Arguments to find a UserSpendMap
     * @example
     * // Get one UserSpendMap
     * const userSpendMap = await prisma.userSpendMap.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserSpendMapFindFirstArgs>(args?: SelectSubset<T, UserSpendMapFindFirstArgs<ExtArgs>>): Prisma__UserSpendMapClient<$Result.GetResult<Prisma.$UserSpendMapPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserSpendMap that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSpendMapFindFirstOrThrowArgs} args - Arguments to find a UserSpendMap
     * @example
     * // Get one UserSpendMap
     * const userSpendMap = await prisma.userSpendMap.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserSpendMapFindFirstOrThrowArgs>(args?: SelectSubset<T, UserSpendMapFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserSpendMapClient<$Result.GetResult<Prisma.$UserSpendMapPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserSpendMaps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSpendMapFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserSpendMaps
     * const userSpendMaps = await prisma.userSpendMap.findMany()
     * 
     * // Get first 10 UserSpendMaps
     * const userSpendMaps = await prisma.userSpendMap.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userSpendMapWithIdOnly = await prisma.userSpendMap.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserSpendMapFindManyArgs>(args?: SelectSubset<T, UserSpendMapFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSpendMapPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserSpendMap.
     * @param {UserSpendMapCreateArgs} args - Arguments to create a UserSpendMap.
     * @example
     * // Create one UserSpendMap
     * const UserSpendMap = await prisma.userSpendMap.create({
     *   data: {
     *     // ... data to create a UserSpendMap
     *   }
     * })
     * 
     */
    create<T extends UserSpendMapCreateArgs>(args: SelectSubset<T, UserSpendMapCreateArgs<ExtArgs>>): Prisma__UserSpendMapClient<$Result.GetResult<Prisma.$UserSpendMapPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserSpendMaps.
     * @param {UserSpendMapCreateManyArgs} args - Arguments to create many UserSpendMaps.
     * @example
     * // Create many UserSpendMaps
     * const userSpendMap = await prisma.userSpendMap.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserSpendMapCreateManyArgs>(args?: SelectSubset<T, UserSpendMapCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a UserSpendMap.
     * @param {UserSpendMapDeleteArgs} args - Arguments to delete one UserSpendMap.
     * @example
     * // Delete one UserSpendMap
     * const UserSpendMap = await prisma.userSpendMap.delete({
     *   where: {
     *     // ... filter to delete one UserSpendMap
     *   }
     * })
     * 
     */
    delete<T extends UserSpendMapDeleteArgs>(args: SelectSubset<T, UserSpendMapDeleteArgs<ExtArgs>>): Prisma__UserSpendMapClient<$Result.GetResult<Prisma.$UserSpendMapPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserSpendMap.
     * @param {UserSpendMapUpdateArgs} args - Arguments to update one UserSpendMap.
     * @example
     * // Update one UserSpendMap
     * const userSpendMap = await prisma.userSpendMap.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserSpendMapUpdateArgs>(args: SelectSubset<T, UserSpendMapUpdateArgs<ExtArgs>>): Prisma__UserSpendMapClient<$Result.GetResult<Prisma.$UserSpendMapPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserSpendMaps.
     * @param {UserSpendMapDeleteManyArgs} args - Arguments to filter UserSpendMaps to delete.
     * @example
     * // Delete a few UserSpendMaps
     * const { count } = await prisma.userSpendMap.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserSpendMapDeleteManyArgs>(args?: SelectSubset<T, UserSpendMapDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserSpendMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSpendMapUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserSpendMaps
     * const userSpendMap = await prisma.userSpendMap.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserSpendMapUpdateManyArgs>(args: SelectSubset<T, UserSpendMapUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserSpendMap.
     * @param {UserSpendMapUpsertArgs} args - Arguments to update or create a UserSpendMap.
     * @example
     * // Update or create a UserSpendMap
     * const userSpendMap = await prisma.userSpendMap.upsert({
     *   create: {
     *     // ... data to create a UserSpendMap
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserSpendMap we want to update
     *   }
     * })
     */
    upsert<T extends UserSpendMapUpsertArgs>(args: SelectSubset<T, UserSpendMapUpsertArgs<ExtArgs>>): Prisma__UserSpendMapClient<$Result.GetResult<Prisma.$UserSpendMapPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserSpendMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSpendMapCountArgs} args - Arguments to filter UserSpendMaps to count.
     * @example
     * // Count the number of UserSpendMaps
     * const count = await prisma.userSpendMap.count({
     *   where: {
     *     // ... the filter for the UserSpendMaps we want to count
     *   }
     * })
    **/
    count<T extends UserSpendMapCountArgs>(
      args?: Subset<T, UserSpendMapCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserSpendMapCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserSpendMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSpendMapAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserSpendMapAggregateArgs>(args: Subset<T, UserSpendMapAggregateArgs>): Prisma.PrismaPromise<GetUserSpendMapAggregateType<T>>

    /**
     * Group by UserSpendMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSpendMapGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserSpendMapGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserSpendMapGroupByArgs['orderBy'] }
        : { orderBy?: UserSpendMapGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserSpendMapGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserSpendMapGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserSpendMap model
   */
  readonly fields: UserSpendMapFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserSpendMap.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserSpendMapClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserSpendMap model
   */ 
  interface UserSpendMapFieldRefs {
    readonly id: FieldRef<"UserSpendMap", 'Int'>
    readonly userId: FieldRef<"UserSpendMap", 'Int'>
    readonly branch: FieldRef<"UserSpendMap", 'String'>
    readonly totalSpend: FieldRef<"UserSpendMap", 'Float'>
    readonly date: FieldRef<"UserSpendMap", 'DateTime'>
    readonly createdAt: FieldRef<"UserSpendMap", 'DateTime'>
    readonly updatedAt: FieldRef<"UserSpendMap", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserSpendMap findUnique
   */
  export type UserSpendMapFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSpendMap
     */
    select?: UserSpendMapSelect<ExtArgs> | null
    /**
     * Filter, which UserSpendMap to fetch.
     */
    where: UserSpendMapWhereUniqueInput
  }

  /**
   * UserSpendMap findUniqueOrThrow
   */
  export type UserSpendMapFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSpendMap
     */
    select?: UserSpendMapSelect<ExtArgs> | null
    /**
     * Filter, which UserSpendMap to fetch.
     */
    where: UserSpendMapWhereUniqueInput
  }

  /**
   * UserSpendMap findFirst
   */
  export type UserSpendMapFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSpendMap
     */
    select?: UserSpendMapSelect<ExtArgs> | null
    /**
     * Filter, which UserSpendMap to fetch.
     */
    where?: UserSpendMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSpendMaps to fetch.
     */
    orderBy?: UserSpendMapOrderByWithRelationInput | UserSpendMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSpendMaps.
     */
    cursor?: UserSpendMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSpendMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSpendMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSpendMaps.
     */
    distinct?: UserSpendMapScalarFieldEnum | UserSpendMapScalarFieldEnum[]
  }

  /**
   * UserSpendMap findFirstOrThrow
   */
  export type UserSpendMapFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSpendMap
     */
    select?: UserSpendMapSelect<ExtArgs> | null
    /**
     * Filter, which UserSpendMap to fetch.
     */
    where?: UserSpendMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSpendMaps to fetch.
     */
    orderBy?: UserSpendMapOrderByWithRelationInput | UserSpendMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSpendMaps.
     */
    cursor?: UserSpendMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSpendMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSpendMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSpendMaps.
     */
    distinct?: UserSpendMapScalarFieldEnum | UserSpendMapScalarFieldEnum[]
  }

  /**
   * UserSpendMap findMany
   */
  export type UserSpendMapFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSpendMap
     */
    select?: UserSpendMapSelect<ExtArgs> | null
    /**
     * Filter, which UserSpendMaps to fetch.
     */
    where?: UserSpendMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSpendMaps to fetch.
     */
    orderBy?: UserSpendMapOrderByWithRelationInput | UserSpendMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserSpendMaps.
     */
    cursor?: UserSpendMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSpendMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSpendMaps.
     */
    skip?: number
    distinct?: UserSpendMapScalarFieldEnum | UserSpendMapScalarFieldEnum[]
  }

  /**
   * UserSpendMap create
   */
  export type UserSpendMapCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSpendMap
     */
    select?: UserSpendMapSelect<ExtArgs> | null
    /**
     * The data needed to create a UserSpendMap.
     */
    data?: XOR<UserSpendMapCreateInput, UserSpendMapUncheckedCreateInput>
  }

  /**
   * UserSpendMap createMany
   */
  export type UserSpendMapCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserSpendMaps.
     */
    data: UserSpendMapCreateManyInput | UserSpendMapCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserSpendMap update
   */
  export type UserSpendMapUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSpendMap
     */
    select?: UserSpendMapSelect<ExtArgs> | null
    /**
     * The data needed to update a UserSpendMap.
     */
    data: XOR<UserSpendMapUpdateInput, UserSpendMapUncheckedUpdateInput>
    /**
     * Choose, which UserSpendMap to update.
     */
    where: UserSpendMapWhereUniqueInput
  }

  /**
   * UserSpendMap updateMany
   */
  export type UserSpendMapUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserSpendMaps.
     */
    data: XOR<UserSpendMapUpdateManyMutationInput, UserSpendMapUncheckedUpdateManyInput>
    /**
     * Filter which UserSpendMaps to update
     */
    where?: UserSpendMapWhereInput
  }

  /**
   * UserSpendMap upsert
   */
  export type UserSpendMapUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSpendMap
     */
    select?: UserSpendMapSelect<ExtArgs> | null
    /**
     * The filter to search for the UserSpendMap to update in case it exists.
     */
    where: UserSpendMapWhereUniqueInput
    /**
     * In case the UserSpendMap found by the `where` argument doesn't exist, create a new UserSpendMap with this data.
     */
    create: XOR<UserSpendMapCreateInput, UserSpendMapUncheckedCreateInput>
    /**
     * In case the UserSpendMap was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserSpendMapUpdateInput, UserSpendMapUncheckedUpdateInput>
  }

  /**
   * UserSpendMap delete
   */
  export type UserSpendMapDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSpendMap
     */
    select?: UserSpendMapSelect<ExtArgs> | null
    /**
     * Filter which UserSpendMap to delete.
     */
    where: UserSpendMapWhereUniqueInput
  }

  /**
   * UserSpendMap deleteMany
   */
  export type UserSpendMapDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSpendMaps to delete
     */
    where?: UserSpendMapWhereInput
  }

  /**
   * UserSpendMap without action
   */
  export type UserSpendMapDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSpendMap
     */
    select?: UserSpendMapSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const RankScalarFieldEnum: {
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

  export type RankScalarFieldEnum = (typeof RankScalarFieldEnum)[keyof typeof RankScalarFieldEnum]


  export const GameScalarFieldEnum: {
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

  export type GameScalarFieldEnum = (typeof GameScalarFieldEnum)[keyof typeof GameScalarFieldEnum]


  export const CheckInResultScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    createdAt: 'createdAt',
    branch: 'branch'
  };

  export type CheckInResultScalarFieldEnum = (typeof CheckInResultScalarFieldEnum)[keyof typeof CheckInResultScalarFieldEnum]


  export const CheckInItemScalarFieldEnum: {
    id: 'id',
    dayName: 'dayName',
    stars: 'stars',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CheckInItemScalarFieldEnum = (typeof CheckInItemScalarFieldEnum)[keyof typeof CheckInItemScalarFieldEnum]


  export const CheckInPromotionScalarFieldEnum: {
    id: 'id',
    checkInItemId: 'checkInItemId',
    coefficient: 'coefficient',
    startDate: 'startDate',
    endDate: 'endDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CheckInPromotionScalarFieldEnum = (typeof CheckInPromotionScalarFieldEnum)[keyof typeof CheckInPromotionScalarFieldEnum]


  export const ItemScalarFieldEnum: {
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

  export type ItemScalarFieldEnum = (typeof ItemScalarFieldEnum)[keyof typeof ItemScalarFieldEnum]


  export const GameItemMapScalarFieldEnum: {
    id: 'id',
    gameId: 'gameId',
    itemId: 'itemId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GameItemMapScalarFieldEnum = (typeof GameItemMapScalarFieldEnum)[keyof typeof GameItemMapScalarFieldEnum]


  export const GameResultScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    itemId: 'itemId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GameResultScalarFieldEnum = (typeof GameResultScalarFieldEnum)[keyof typeof GameResultScalarFieldEnum]


  export const UserMissionMapScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    missionId: 'missionId',
    branch: 'branch',
    isDone: 'isDone',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserMissionMapScalarFieldEnum = (typeof UserMissionMapScalarFieldEnum)[keyof typeof UserMissionMapScalarFieldEnum]


  export const UserScalarFieldEnum: {
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

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const MissionScalarFieldEnum: {
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

  export type MissionScalarFieldEnum = (typeof MissionScalarFieldEnum)[keyof typeof MissionScalarFieldEnum]


  export const UserRewardMapScalarFieldEnum: {
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

  export type UserRewardMapScalarFieldEnum = (typeof UserRewardMapScalarFieldEnum)[keyof typeof UserRewardMapScalarFieldEnum]


  export const RewardScalarFieldEnum: {
    id: 'id',
    name: 'name',
    stars: 'stars',
    value: 'value',
    startDate: 'startDate',
    endDate: 'endDate',
    createdAt: 'createdAt',
    updateAt: 'updateAt'
  };

  export type RewardScalarFieldEnum = (typeof RewardScalarFieldEnum)[keyof typeof RewardScalarFieldEnum]


  export const PromotionCodeScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    value: 'value',
    branch: 'branch',
    isUsed: 'isUsed',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PromotionCodeScalarFieldEnum = (typeof PromotionCodeScalarFieldEnum)[keyof typeof PromotionCodeScalarFieldEnum]


  export const UserStarHistoryScalarFieldEnum: {
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

  export type UserStarHistoryScalarFieldEnum = (typeof UserStarHistoryScalarFieldEnum)[keyof typeof UserStarHistoryScalarFieldEnum]


  export const SavingPlanScalarFieldEnum: {
    id: 'id',
    uuid: 'uuid',
    name: 'name',
    price: 'price',
    description: 'description',
    isDelete: 'isDelete'
  };

  export type SavingPlanScalarFieldEnum = (typeof SavingPlanScalarFieldEnum)[keyof typeof SavingPlanScalarFieldEnum]


  export const ComputerScalarFieldEnum: {
    id: 'id',
    fingerprintId: 'fingerprintId',
    ip: 'ip',
    name: 'name',
    branch: 'branch',
    status: 'status',
    localIp: 'localIp'
  };

  export type ComputerScalarFieldEnum = (typeof ComputerScalarFieldEnum)[keyof typeof ComputerScalarFieldEnum]


  export const FundHistoryScalarFieldEnum: {
    id: 'id',
    date: 'date',
    startValue: 'startValue',
    currentValue: 'currentValue',
    endValue: 'endValue',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FundHistoryScalarFieldEnum = (typeof FundHistoryScalarFieldEnum)[keyof typeof FundHistoryScalarFieldEnum]


  export const UserSpendMapScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    branch: 'branch',
    totalSpend: 'totalSpend',
    date: 'date',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserSpendMapScalarFieldEnum = (typeof UserSpendMapScalarFieldEnum)[keyof typeof UserSpendMapScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Mission_type'
   */
  export type EnumMission_typeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Mission_type'>
    


  /**
   * Reference to a field of type 'UserStarHistory_type'
   */
  export type EnumUserStarHistory_typeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStarHistory_type'>
    
  /**
   * Deep Input Types
   */


  export type RankWhereInput = {
    AND?: RankWhereInput | RankWhereInput[]
    OR?: RankWhereInput[]
    NOT?: RankWhereInput | RankWhereInput[]
    id?: IntFilter<"Rank"> | number
    name?: StringFilter<"Rank"> | string
    fromValue?: FloatFilter<"Rank"> | number
    toValue?: FloatFilter<"Rank"> | number
    discount?: FloatNullableFilter<"Rank"> | number | null
    foodVoucher?: IntNullableFilter<"Rank"> | number | null
    drinkVoucher?: IntNullableFilter<"Rank"> | number | null
    createdAt?: DateTimeFilter<"Rank"> | Date | string
    updatedAt?: DateTimeFilter<"Rank"> | Date | string
  }

  export type RankOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    fromValue?: SortOrder
    toValue?: SortOrder
    discount?: SortOrderInput | SortOrder
    foodVoucher?: SortOrderInput | SortOrder
    drinkVoucher?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RankWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: RankWhereInput | RankWhereInput[]
    OR?: RankWhereInput[]
    NOT?: RankWhereInput | RankWhereInput[]
    name?: StringFilter<"Rank"> | string
    fromValue?: FloatFilter<"Rank"> | number
    toValue?: FloatFilter<"Rank"> | number
    discount?: FloatNullableFilter<"Rank"> | number | null
    foodVoucher?: IntNullableFilter<"Rank"> | number | null
    drinkVoucher?: IntNullableFilter<"Rank"> | number | null
    createdAt?: DateTimeFilter<"Rank"> | Date | string
    updatedAt?: DateTimeFilter<"Rank"> | Date | string
  }, "id">

  export type RankOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    fromValue?: SortOrder
    toValue?: SortOrder
    discount?: SortOrderInput | SortOrder
    foodVoucher?: SortOrderInput | SortOrder
    drinkVoucher?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RankCountOrderByAggregateInput
    _avg?: RankAvgOrderByAggregateInput
    _max?: RankMaxOrderByAggregateInput
    _min?: RankMinOrderByAggregateInput
    _sum?: RankSumOrderByAggregateInput
  }

  export type RankScalarWhereWithAggregatesInput = {
    AND?: RankScalarWhereWithAggregatesInput | RankScalarWhereWithAggregatesInput[]
    OR?: RankScalarWhereWithAggregatesInput[]
    NOT?: RankScalarWhereWithAggregatesInput | RankScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Rank"> | number
    name?: StringWithAggregatesFilter<"Rank"> | string
    fromValue?: FloatWithAggregatesFilter<"Rank"> | number
    toValue?: FloatWithAggregatesFilter<"Rank"> | number
    discount?: FloatNullableWithAggregatesFilter<"Rank"> | number | null
    foodVoucher?: IntNullableWithAggregatesFilter<"Rank"> | number | null
    drinkVoucher?: IntNullableWithAggregatesFilter<"Rank"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"Rank"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Rank"> | Date | string
  }

  export type GameWhereInput = {
    AND?: GameWhereInput | GameWhereInput[]
    OR?: GameWhereInput[]
    NOT?: GameWhereInput | GameWhereInput[]
    id?: IntFilter<"Game"> | number
    name?: StringFilter<"Game"> | string
    startDate?: DateTimeFilter<"Game"> | Date | string
    endDate?: DateTimeFilter<"Game"> | Date | string
    starsPerRound?: IntFilter<"Game"> | number
    createdAt?: DateTimeFilter<"Game"> | Date | string
    updatedAt?: DateTimeFilter<"Game"> | Date | string
    balance_rate?: FloatNullableFilter<"Game"> | number | null
    play_rate?: FloatNullableFilter<"Game"> | number | null
    jackpot?: FloatNullableFilter<"Game"> | number | null
  }

  export type GameOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    starsPerRound?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    balance_rate?: SortOrderInput | SortOrder
    play_rate?: SortOrderInput | SortOrder
    jackpot?: SortOrderInput | SortOrder
  }

  export type GameWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: GameWhereInput | GameWhereInput[]
    OR?: GameWhereInput[]
    NOT?: GameWhereInput | GameWhereInput[]
    name?: StringFilter<"Game"> | string
    startDate?: DateTimeFilter<"Game"> | Date | string
    endDate?: DateTimeFilter<"Game"> | Date | string
    starsPerRound?: IntFilter<"Game"> | number
    createdAt?: DateTimeFilter<"Game"> | Date | string
    updatedAt?: DateTimeFilter<"Game"> | Date | string
    balance_rate?: FloatNullableFilter<"Game"> | number | null
    play_rate?: FloatNullableFilter<"Game"> | number | null
    jackpot?: FloatNullableFilter<"Game"> | number | null
  }, "id">

  export type GameOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    starsPerRound?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    balance_rate?: SortOrderInput | SortOrder
    play_rate?: SortOrderInput | SortOrder
    jackpot?: SortOrderInput | SortOrder
    _count?: GameCountOrderByAggregateInput
    _avg?: GameAvgOrderByAggregateInput
    _max?: GameMaxOrderByAggregateInput
    _min?: GameMinOrderByAggregateInput
    _sum?: GameSumOrderByAggregateInput
  }

  export type GameScalarWhereWithAggregatesInput = {
    AND?: GameScalarWhereWithAggregatesInput | GameScalarWhereWithAggregatesInput[]
    OR?: GameScalarWhereWithAggregatesInput[]
    NOT?: GameScalarWhereWithAggregatesInput | GameScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Game"> | number
    name?: StringWithAggregatesFilter<"Game"> | string
    startDate?: DateTimeWithAggregatesFilter<"Game"> | Date | string
    endDate?: DateTimeWithAggregatesFilter<"Game"> | Date | string
    starsPerRound?: IntWithAggregatesFilter<"Game"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Game"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Game"> | Date | string
    balance_rate?: FloatNullableWithAggregatesFilter<"Game"> | number | null
    play_rate?: FloatNullableWithAggregatesFilter<"Game"> | number | null
    jackpot?: FloatNullableWithAggregatesFilter<"Game"> | number | null
  }

  export type CheckInResultWhereInput = {
    AND?: CheckInResultWhereInput | CheckInResultWhereInput[]
    OR?: CheckInResultWhereInput[]
    NOT?: CheckInResultWhereInput | CheckInResultWhereInput[]
    id?: IntFilter<"CheckInResult"> | number
    userId?: IntFilter<"CheckInResult"> | number
    createdAt?: DateTimeFilter<"CheckInResult"> | Date | string
    branch?: StringNullableFilter<"CheckInResult"> | string | null
  }

  export type CheckInResultOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    branch?: SortOrderInput | SortOrder
  }

  export type CheckInResultWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CheckInResultWhereInput | CheckInResultWhereInput[]
    OR?: CheckInResultWhereInput[]
    NOT?: CheckInResultWhereInput | CheckInResultWhereInput[]
    userId?: IntFilter<"CheckInResult"> | number
    createdAt?: DateTimeFilter<"CheckInResult"> | Date | string
    branch?: StringNullableFilter<"CheckInResult"> | string | null
  }, "id">

  export type CheckInResultOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    branch?: SortOrderInput | SortOrder
    _count?: CheckInResultCountOrderByAggregateInput
    _avg?: CheckInResultAvgOrderByAggregateInput
    _max?: CheckInResultMaxOrderByAggregateInput
    _min?: CheckInResultMinOrderByAggregateInput
    _sum?: CheckInResultSumOrderByAggregateInput
  }

  export type CheckInResultScalarWhereWithAggregatesInput = {
    AND?: CheckInResultScalarWhereWithAggregatesInput | CheckInResultScalarWhereWithAggregatesInput[]
    OR?: CheckInResultScalarWhereWithAggregatesInput[]
    NOT?: CheckInResultScalarWhereWithAggregatesInput | CheckInResultScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CheckInResult"> | number
    userId?: IntWithAggregatesFilter<"CheckInResult"> | number
    createdAt?: DateTimeWithAggregatesFilter<"CheckInResult"> | Date | string
    branch?: StringNullableWithAggregatesFilter<"CheckInResult"> | string | null
  }

  export type CheckInItemWhereInput = {
    AND?: CheckInItemWhereInput | CheckInItemWhereInput[]
    OR?: CheckInItemWhereInput[]
    NOT?: CheckInItemWhereInput | CheckInItemWhereInput[]
    id?: IntFilter<"CheckInItem"> | number
    dayName?: StringFilter<"CheckInItem"> | string
    stars?: FloatFilter<"CheckInItem"> | number
    createdAt?: DateTimeFilter<"CheckInItem"> | Date | string
    updatedAt?: DateTimeFilter<"CheckInItem"> | Date | string
  }

  export type CheckInItemOrderByWithRelationInput = {
    id?: SortOrder
    dayName?: SortOrder
    stars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CheckInItemWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CheckInItemWhereInput | CheckInItemWhereInput[]
    OR?: CheckInItemWhereInput[]
    NOT?: CheckInItemWhereInput | CheckInItemWhereInput[]
    dayName?: StringFilter<"CheckInItem"> | string
    stars?: FloatFilter<"CheckInItem"> | number
    createdAt?: DateTimeFilter<"CheckInItem"> | Date | string
    updatedAt?: DateTimeFilter<"CheckInItem"> | Date | string
  }, "id">

  export type CheckInItemOrderByWithAggregationInput = {
    id?: SortOrder
    dayName?: SortOrder
    stars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CheckInItemCountOrderByAggregateInput
    _avg?: CheckInItemAvgOrderByAggregateInput
    _max?: CheckInItemMaxOrderByAggregateInput
    _min?: CheckInItemMinOrderByAggregateInput
    _sum?: CheckInItemSumOrderByAggregateInput
  }

  export type CheckInItemScalarWhereWithAggregatesInput = {
    AND?: CheckInItemScalarWhereWithAggregatesInput | CheckInItemScalarWhereWithAggregatesInput[]
    OR?: CheckInItemScalarWhereWithAggregatesInput[]
    NOT?: CheckInItemScalarWhereWithAggregatesInput | CheckInItemScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CheckInItem"> | number
    dayName?: StringWithAggregatesFilter<"CheckInItem"> | string
    stars?: FloatWithAggregatesFilter<"CheckInItem"> | number
    createdAt?: DateTimeWithAggregatesFilter<"CheckInItem"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CheckInItem"> | Date | string
  }

  export type CheckInPromotionWhereInput = {
    AND?: CheckInPromotionWhereInput | CheckInPromotionWhereInput[]
    OR?: CheckInPromotionWhereInput[]
    NOT?: CheckInPromotionWhereInput | CheckInPromotionWhereInput[]
    id?: IntFilter<"CheckInPromotion"> | number
    checkInItemId?: IntFilter<"CheckInPromotion"> | number
    coefficient?: FloatFilter<"CheckInPromotion"> | number
    startDate?: DateTimeFilter<"CheckInPromotion"> | Date | string
    endDate?: DateTimeFilter<"CheckInPromotion"> | Date | string
    createdAt?: DateTimeFilter<"CheckInPromotion"> | Date | string
    updatedAt?: DateTimeFilter<"CheckInPromotion"> | Date | string
  }

  export type CheckInPromotionOrderByWithRelationInput = {
    id?: SortOrder
    checkInItemId?: SortOrder
    coefficient?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CheckInPromotionWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CheckInPromotionWhereInput | CheckInPromotionWhereInput[]
    OR?: CheckInPromotionWhereInput[]
    NOT?: CheckInPromotionWhereInput | CheckInPromotionWhereInput[]
    checkInItemId?: IntFilter<"CheckInPromotion"> | number
    coefficient?: FloatFilter<"CheckInPromotion"> | number
    startDate?: DateTimeFilter<"CheckInPromotion"> | Date | string
    endDate?: DateTimeFilter<"CheckInPromotion"> | Date | string
    createdAt?: DateTimeFilter<"CheckInPromotion"> | Date | string
    updatedAt?: DateTimeFilter<"CheckInPromotion"> | Date | string
  }, "id">

  export type CheckInPromotionOrderByWithAggregationInput = {
    id?: SortOrder
    checkInItemId?: SortOrder
    coefficient?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CheckInPromotionCountOrderByAggregateInput
    _avg?: CheckInPromotionAvgOrderByAggregateInput
    _max?: CheckInPromotionMaxOrderByAggregateInput
    _min?: CheckInPromotionMinOrderByAggregateInput
    _sum?: CheckInPromotionSumOrderByAggregateInput
  }

  export type CheckInPromotionScalarWhereWithAggregatesInput = {
    AND?: CheckInPromotionScalarWhereWithAggregatesInput | CheckInPromotionScalarWhereWithAggregatesInput[]
    OR?: CheckInPromotionScalarWhereWithAggregatesInput[]
    NOT?: CheckInPromotionScalarWhereWithAggregatesInput | CheckInPromotionScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CheckInPromotion"> | number
    checkInItemId?: IntWithAggregatesFilter<"CheckInPromotion"> | number
    coefficient?: FloatWithAggregatesFilter<"CheckInPromotion"> | number
    startDate?: DateTimeWithAggregatesFilter<"CheckInPromotion"> | Date | string
    endDate?: DateTimeWithAggregatesFilter<"CheckInPromotion"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"CheckInPromotion"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CheckInPromotion"> | Date | string
  }

  export type ItemWhereInput = {
    AND?: ItemWhereInput | ItemWhereInput[]
    OR?: ItemWhereInput[]
    NOT?: ItemWhereInput | ItemWhereInput[]
    id?: IntFilter<"Item"> | number
    name?: StringFilter<"Item"> | string
    image_url?: StringFilter<"Item"> | string
    rating?: FloatFilter<"Item"> | number
    value?: FloatFilter<"Item"> | number
    createdAt?: DateTimeNullableFilter<"Item"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"Item"> | Date | string | null
    title?: StringFilter<"Item"> | string
    background?: StringNullableFilter<"Item"> | string | null
    textColor?: StringNullableFilter<"Item"> | string | null
  }

  export type ItemOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    image_url?: SortOrder
    rating?: SortOrder
    value?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    title?: SortOrder
    background?: SortOrderInput | SortOrder
    textColor?: SortOrderInput | SortOrder
  }

  export type ItemWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ItemWhereInput | ItemWhereInput[]
    OR?: ItemWhereInput[]
    NOT?: ItemWhereInput | ItemWhereInput[]
    name?: StringFilter<"Item"> | string
    image_url?: StringFilter<"Item"> | string
    rating?: FloatFilter<"Item"> | number
    value?: FloatFilter<"Item"> | number
    createdAt?: DateTimeNullableFilter<"Item"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"Item"> | Date | string | null
    title?: StringFilter<"Item"> | string
    background?: StringNullableFilter<"Item"> | string | null
    textColor?: StringNullableFilter<"Item"> | string | null
  }, "id">

  export type ItemOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    image_url?: SortOrder
    rating?: SortOrder
    value?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    title?: SortOrder
    background?: SortOrderInput | SortOrder
    textColor?: SortOrderInput | SortOrder
    _count?: ItemCountOrderByAggregateInput
    _avg?: ItemAvgOrderByAggregateInput
    _max?: ItemMaxOrderByAggregateInput
    _min?: ItemMinOrderByAggregateInput
    _sum?: ItemSumOrderByAggregateInput
  }

  export type ItemScalarWhereWithAggregatesInput = {
    AND?: ItemScalarWhereWithAggregatesInput | ItemScalarWhereWithAggregatesInput[]
    OR?: ItemScalarWhereWithAggregatesInput[]
    NOT?: ItemScalarWhereWithAggregatesInput | ItemScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Item"> | number
    name?: StringWithAggregatesFilter<"Item"> | string
    image_url?: StringWithAggregatesFilter<"Item"> | string
    rating?: FloatWithAggregatesFilter<"Item"> | number
    value?: FloatWithAggregatesFilter<"Item"> | number
    createdAt?: DateTimeNullableWithAggregatesFilter<"Item"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"Item"> | Date | string | null
    title?: StringWithAggregatesFilter<"Item"> | string
    background?: StringNullableWithAggregatesFilter<"Item"> | string | null
    textColor?: StringNullableWithAggregatesFilter<"Item"> | string | null
  }

  export type GameItemMapWhereInput = {
    AND?: GameItemMapWhereInput | GameItemMapWhereInput[]
    OR?: GameItemMapWhereInput[]
    NOT?: GameItemMapWhereInput | GameItemMapWhereInput[]
    id?: IntFilter<"GameItemMap"> | number
    gameId?: IntFilter<"GameItemMap"> | number
    itemId?: IntFilter<"GameItemMap"> | number
    createdAt?: DateTimeFilter<"GameItemMap"> | Date | string
    updatedAt?: DateTimeFilter<"GameItemMap"> | Date | string
  }

  export type GameItemMapOrderByWithRelationInput = {
    id?: SortOrder
    gameId?: SortOrder
    itemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GameItemMapWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    gameId?: number
    itemId?: number
    AND?: GameItemMapWhereInput | GameItemMapWhereInput[]
    OR?: GameItemMapWhereInput[]
    NOT?: GameItemMapWhereInput | GameItemMapWhereInput[]
    createdAt?: DateTimeFilter<"GameItemMap"> | Date | string
    updatedAt?: DateTimeFilter<"GameItemMap"> | Date | string
  }, "id" | "gameId" | "itemId">

  export type GameItemMapOrderByWithAggregationInput = {
    id?: SortOrder
    gameId?: SortOrder
    itemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GameItemMapCountOrderByAggregateInput
    _avg?: GameItemMapAvgOrderByAggregateInput
    _max?: GameItemMapMaxOrderByAggregateInput
    _min?: GameItemMapMinOrderByAggregateInput
    _sum?: GameItemMapSumOrderByAggregateInput
  }

  export type GameItemMapScalarWhereWithAggregatesInput = {
    AND?: GameItemMapScalarWhereWithAggregatesInput | GameItemMapScalarWhereWithAggregatesInput[]
    OR?: GameItemMapScalarWhereWithAggregatesInput[]
    NOT?: GameItemMapScalarWhereWithAggregatesInput | GameItemMapScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"GameItemMap"> | number
    gameId?: IntWithAggregatesFilter<"GameItemMap"> | number
    itemId?: IntWithAggregatesFilter<"GameItemMap"> | number
    createdAt?: DateTimeWithAggregatesFilter<"GameItemMap"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GameItemMap"> | Date | string
  }

  export type GameResultWhereInput = {
    AND?: GameResultWhereInput | GameResultWhereInput[]
    OR?: GameResultWhereInput[]
    NOT?: GameResultWhereInput | GameResultWhereInput[]
    id?: IntFilter<"GameResult"> | number
    userId?: IntFilter<"GameResult"> | number
    itemId?: IntFilter<"GameResult"> | number
    createdAt?: DateTimeFilter<"GameResult"> | Date | string
    updatedAt?: DateTimeFilter<"GameResult"> | Date | string
    userStarHistory?: UserStarHistoryListRelationFilter
    users?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type GameResultOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    itemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userStarHistory?: UserStarHistoryOrderByRelationAggregateInput
    users?: UserOrderByWithRelationInput
  }

  export type GameResultWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: GameResultWhereInput | GameResultWhereInput[]
    OR?: GameResultWhereInput[]
    NOT?: GameResultWhereInput | GameResultWhereInput[]
    userId?: IntFilter<"GameResult"> | number
    itemId?: IntFilter<"GameResult"> | number
    createdAt?: DateTimeFilter<"GameResult"> | Date | string
    updatedAt?: DateTimeFilter<"GameResult"> | Date | string
    userStarHistory?: UserStarHistoryListRelationFilter
    users?: XOR<UserRelationFilter, UserWhereInput>
  }, "id">

  export type GameResultOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    itemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GameResultCountOrderByAggregateInput
    _avg?: GameResultAvgOrderByAggregateInput
    _max?: GameResultMaxOrderByAggregateInput
    _min?: GameResultMinOrderByAggregateInput
    _sum?: GameResultSumOrderByAggregateInput
  }

  export type GameResultScalarWhereWithAggregatesInput = {
    AND?: GameResultScalarWhereWithAggregatesInput | GameResultScalarWhereWithAggregatesInput[]
    OR?: GameResultScalarWhereWithAggregatesInput[]
    NOT?: GameResultScalarWhereWithAggregatesInput | GameResultScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"GameResult"> | number
    userId?: IntWithAggregatesFilter<"GameResult"> | number
    itemId?: IntWithAggregatesFilter<"GameResult"> | number
    createdAt?: DateTimeWithAggregatesFilter<"GameResult"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GameResult"> | Date | string
  }

  export type UserMissionMapWhereInput = {
    AND?: UserMissionMapWhereInput | UserMissionMapWhereInput[]
    OR?: UserMissionMapWhereInput[]
    NOT?: UserMissionMapWhereInput | UserMissionMapWhereInput[]
    id?: IntFilter<"UserMissionMap"> | number
    userId?: IntFilter<"UserMissionMap"> | number
    missionId?: IntFilter<"UserMissionMap"> | number
    branch?: StringFilter<"UserMissionMap"> | string
    isDone?: BoolFilter<"UserMissionMap"> | boolean
    createdAt?: DateTimeFilter<"UserMissionMap"> | Date | string
    updatedAt?: DateTimeFilter<"UserMissionMap"> | Date | string
    users?: XOR<UserRelationFilter, UserWhereInput>
    mission?: XOR<MissionRelationFilter, MissionWhereInput>
  }

  export type UserMissionMapOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    missionId?: SortOrder
    branch?: SortOrder
    isDone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    users?: UserOrderByWithRelationInput
    mission?: MissionOrderByWithRelationInput
  }

  export type UserMissionMapWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: UserMissionMapWhereInput | UserMissionMapWhereInput[]
    OR?: UserMissionMapWhereInput[]
    NOT?: UserMissionMapWhereInput | UserMissionMapWhereInput[]
    userId?: IntFilter<"UserMissionMap"> | number
    missionId?: IntFilter<"UserMissionMap"> | number
    branch?: StringFilter<"UserMissionMap"> | string
    isDone?: BoolFilter<"UserMissionMap"> | boolean
    createdAt?: DateTimeFilter<"UserMissionMap"> | Date | string
    updatedAt?: DateTimeFilter<"UserMissionMap"> | Date | string
    users?: XOR<UserRelationFilter, UserWhereInput>
    mission?: XOR<MissionRelationFilter, MissionWhereInput>
  }, "id">

  export type UserMissionMapOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    missionId?: SortOrder
    branch?: SortOrder
    isDone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserMissionMapCountOrderByAggregateInput
    _avg?: UserMissionMapAvgOrderByAggregateInput
    _max?: UserMissionMapMaxOrderByAggregateInput
    _min?: UserMissionMapMinOrderByAggregateInput
    _sum?: UserMissionMapSumOrderByAggregateInput
  }

  export type UserMissionMapScalarWhereWithAggregatesInput = {
    AND?: UserMissionMapScalarWhereWithAggregatesInput | UserMissionMapScalarWhereWithAggregatesInput[]
    OR?: UserMissionMapScalarWhereWithAggregatesInput[]
    NOT?: UserMissionMapScalarWhereWithAggregatesInput | UserMissionMapScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserMissionMap"> | number
    userId?: IntWithAggregatesFilter<"UserMissionMap"> | number
    missionId?: IntWithAggregatesFilter<"UserMissionMap"> | number
    branch?: StringWithAggregatesFilter<"UserMissionMap"> | string
    isDone?: BoolWithAggregatesFilter<"UserMissionMap"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"UserMissionMap"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserMissionMap"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    userName?: StringNullableFilter<"User"> | string | null
    userId?: IntFilter<"User"> | number
    rankId?: IntFilter<"User"> | number
    stars?: IntFilter<"User"> | number
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    magicStone?: IntFilter<"User"> | number
    branch?: StringFilter<"User"> | string
    UserRewardMap?: UserRewardMapListRelationFilter
    UserMissionMap?: UserMissionMapListRelationFilter
    GameResults?: GameResultListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    userName?: SortOrderInput | SortOrder
    userId?: SortOrder
    rankId?: SortOrder
    stars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    magicStone?: SortOrder
    branch?: SortOrder
    UserRewardMap?: UserRewardMapOrderByRelationAggregateInput
    UserMissionMap?: UserMissionMapOrderByRelationAggregateInput
    GameResults?: GameResultOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    userName?: StringNullableFilter<"User"> | string | null
    userId?: IntFilter<"User"> | number
    rankId?: IntFilter<"User"> | number
    stars?: IntFilter<"User"> | number
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    magicStone?: IntFilter<"User"> | number
    branch?: StringFilter<"User"> | string
    UserRewardMap?: UserRewardMapListRelationFilter
    UserMissionMap?: UserMissionMapListRelationFilter
    GameResults?: GameResultListRelationFilter
  }, "id">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    userName?: SortOrderInput | SortOrder
    userId?: SortOrder
    rankId?: SortOrder
    stars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    magicStone?: SortOrder
    branch?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    userName?: StringNullableWithAggregatesFilter<"User"> | string | null
    userId?: IntWithAggregatesFilter<"User"> | number
    rankId?: IntWithAggregatesFilter<"User"> | number
    stars?: IntWithAggregatesFilter<"User"> | number
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    magicStone?: IntWithAggregatesFilter<"User"> | number
    branch?: StringWithAggregatesFilter<"User"> | string
  }

  export type MissionWhereInput = {
    AND?: MissionWhereInput | MissionWhereInput[]
    OR?: MissionWhereInput[]
    NOT?: MissionWhereInput | MissionWhereInput[]
    id?: IntFilter<"Mission"> | number
    name?: StringFilter<"Mission"> | string
    description?: StringFilter<"Mission"> | string
    reward?: FloatFilter<"Mission"> | number
    startHours?: IntFilter<"Mission"> | number
    endHours?: IntFilter<"Mission"> | number
    createdAt?: DateTimeFilter<"Mission"> | Date | string
    quantity?: IntFilter<"Mission"> | number
    type?: EnumMission_typeFilter<"Mission"> | $Enums.Mission_type
    UserMissionMap?: UserMissionMapListRelationFilter
  }

  export type MissionOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    reward?: SortOrder
    startHours?: SortOrder
    endHours?: SortOrder
    createdAt?: SortOrder
    quantity?: SortOrder
    type?: SortOrder
    UserMissionMap?: UserMissionMapOrderByRelationAggregateInput
  }

  export type MissionWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: MissionWhereInput | MissionWhereInput[]
    OR?: MissionWhereInput[]
    NOT?: MissionWhereInput | MissionWhereInput[]
    name?: StringFilter<"Mission"> | string
    description?: StringFilter<"Mission"> | string
    reward?: FloatFilter<"Mission"> | number
    startHours?: IntFilter<"Mission"> | number
    endHours?: IntFilter<"Mission"> | number
    createdAt?: DateTimeFilter<"Mission"> | Date | string
    quantity?: IntFilter<"Mission"> | number
    type?: EnumMission_typeFilter<"Mission"> | $Enums.Mission_type
    UserMissionMap?: UserMissionMapListRelationFilter
  }, "id">

  export type MissionOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    reward?: SortOrder
    startHours?: SortOrder
    endHours?: SortOrder
    createdAt?: SortOrder
    quantity?: SortOrder
    type?: SortOrder
    _count?: MissionCountOrderByAggregateInput
    _avg?: MissionAvgOrderByAggregateInput
    _max?: MissionMaxOrderByAggregateInput
    _min?: MissionMinOrderByAggregateInput
    _sum?: MissionSumOrderByAggregateInput
  }

  export type MissionScalarWhereWithAggregatesInput = {
    AND?: MissionScalarWhereWithAggregatesInput | MissionScalarWhereWithAggregatesInput[]
    OR?: MissionScalarWhereWithAggregatesInput[]
    NOT?: MissionScalarWhereWithAggregatesInput | MissionScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Mission"> | number
    name?: StringWithAggregatesFilter<"Mission"> | string
    description?: StringWithAggregatesFilter<"Mission"> | string
    reward?: FloatWithAggregatesFilter<"Mission"> | number
    startHours?: IntWithAggregatesFilter<"Mission"> | number
    endHours?: IntWithAggregatesFilter<"Mission"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Mission"> | Date | string
    quantity?: IntWithAggregatesFilter<"Mission"> | number
    type?: EnumMission_typeWithAggregatesFilter<"Mission"> | $Enums.Mission_type
  }

  export type UserRewardMapWhereInput = {
    AND?: UserRewardMapWhereInput | UserRewardMapWhereInput[]
    OR?: UserRewardMapWhereInput[]
    NOT?: UserRewardMapWhereInput | UserRewardMapWhereInput[]
    id?: IntFilter<"UserRewardMap"> | number
    userId?: IntNullableFilter<"UserRewardMap"> | number | null
    rewardId?: IntNullableFilter<"UserRewardMap"> | number | null
    promotionCodeId?: IntNullableFilter<"UserRewardMap"> | number | null
    duration?: IntNullableFilter<"UserRewardMap"> | number | null
    createdAt?: DateTimeNullableFilter<"UserRewardMap"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"UserRewardMap"> | Date | string | null
    isUsed?: BoolFilter<"UserRewardMap"> | boolean
    branch?: StringNullableFilter<"UserRewardMap"> | string | null
    promotionCode?: XOR<PromotionCodeNullableRelationFilter, PromotionCodeWhereInput> | null
    user?: XOR<UserNullableRelationFilter, UserWhereInput> | null
    reward?: XOR<RewardNullableRelationFilter, RewardWhereInput> | null
  }

  export type UserRewardMapOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    rewardId?: SortOrderInput | SortOrder
    promotionCodeId?: SortOrderInput | SortOrder
    duration?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    isUsed?: SortOrder
    branch?: SortOrderInput | SortOrder
    promotionCode?: PromotionCodeOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
    reward?: RewardOrderByWithRelationInput
  }

  export type UserRewardMapWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: UserRewardMapWhereInput | UserRewardMapWhereInput[]
    OR?: UserRewardMapWhereInput[]
    NOT?: UserRewardMapWhereInput | UserRewardMapWhereInput[]
    userId?: IntNullableFilter<"UserRewardMap"> | number | null
    rewardId?: IntNullableFilter<"UserRewardMap"> | number | null
    promotionCodeId?: IntNullableFilter<"UserRewardMap"> | number | null
    duration?: IntNullableFilter<"UserRewardMap"> | number | null
    createdAt?: DateTimeNullableFilter<"UserRewardMap"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"UserRewardMap"> | Date | string | null
    isUsed?: BoolFilter<"UserRewardMap"> | boolean
    branch?: StringNullableFilter<"UserRewardMap"> | string | null
    promotionCode?: XOR<PromotionCodeNullableRelationFilter, PromotionCodeWhereInput> | null
    user?: XOR<UserNullableRelationFilter, UserWhereInput> | null
    reward?: XOR<RewardNullableRelationFilter, RewardWhereInput> | null
  }, "id">

  export type UserRewardMapOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    rewardId?: SortOrderInput | SortOrder
    promotionCodeId?: SortOrderInput | SortOrder
    duration?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    isUsed?: SortOrder
    branch?: SortOrderInput | SortOrder
    _count?: UserRewardMapCountOrderByAggregateInput
    _avg?: UserRewardMapAvgOrderByAggregateInput
    _max?: UserRewardMapMaxOrderByAggregateInput
    _min?: UserRewardMapMinOrderByAggregateInput
    _sum?: UserRewardMapSumOrderByAggregateInput
  }

  export type UserRewardMapScalarWhereWithAggregatesInput = {
    AND?: UserRewardMapScalarWhereWithAggregatesInput | UserRewardMapScalarWhereWithAggregatesInput[]
    OR?: UserRewardMapScalarWhereWithAggregatesInput[]
    NOT?: UserRewardMapScalarWhereWithAggregatesInput | UserRewardMapScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserRewardMap"> | number
    userId?: IntNullableWithAggregatesFilter<"UserRewardMap"> | number | null
    rewardId?: IntNullableWithAggregatesFilter<"UserRewardMap"> | number | null
    promotionCodeId?: IntNullableWithAggregatesFilter<"UserRewardMap"> | number | null
    duration?: IntNullableWithAggregatesFilter<"UserRewardMap"> | number | null
    createdAt?: DateTimeNullableWithAggregatesFilter<"UserRewardMap"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"UserRewardMap"> | Date | string | null
    isUsed?: BoolWithAggregatesFilter<"UserRewardMap"> | boolean
    branch?: StringNullableWithAggregatesFilter<"UserRewardMap"> | string | null
  }

  export type RewardWhereInput = {
    AND?: RewardWhereInput | RewardWhereInput[]
    OR?: RewardWhereInput[]
    NOT?: RewardWhereInput | RewardWhereInput[]
    id?: IntFilter<"Reward"> | number
    name?: StringNullableFilter<"Reward"> | string | null
    stars?: IntNullableFilter<"Reward"> | number | null
    value?: IntNullableFilter<"Reward"> | number | null
    startDate?: DateTimeNullableFilter<"Reward"> | Date | string | null
    endDate?: DateTimeNullableFilter<"Reward"> | Date | string | null
    createdAt?: DateTimeNullableFilter<"Reward"> | Date | string | null
    updateAt?: DateTimeNullableFilter<"Reward"> | Date | string | null
    UserRewardMap?: UserRewardMapListRelationFilter
  }

  export type RewardOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    stars?: SortOrderInput | SortOrder
    value?: SortOrderInput | SortOrder
    startDate?: SortOrderInput | SortOrder
    endDate?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updateAt?: SortOrderInput | SortOrder
    UserRewardMap?: UserRewardMapOrderByRelationAggregateInput
  }

  export type RewardWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: RewardWhereInput | RewardWhereInput[]
    OR?: RewardWhereInput[]
    NOT?: RewardWhereInput | RewardWhereInput[]
    name?: StringNullableFilter<"Reward"> | string | null
    stars?: IntNullableFilter<"Reward"> | number | null
    value?: IntNullableFilter<"Reward"> | number | null
    startDate?: DateTimeNullableFilter<"Reward"> | Date | string | null
    endDate?: DateTimeNullableFilter<"Reward"> | Date | string | null
    createdAt?: DateTimeNullableFilter<"Reward"> | Date | string | null
    updateAt?: DateTimeNullableFilter<"Reward"> | Date | string | null
    UserRewardMap?: UserRewardMapListRelationFilter
  }, "id">

  export type RewardOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    stars?: SortOrderInput | SortOrder
    value?: SortOrderInput | SortOrder
    startDate?: SortOrderInput | SortOrder
    endDate?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updateAt?: SortOrderInput | SortOrder
    _count?: RewardCountOrderByAggregateInput
    _avg?: RewardAvgOrderByAggregateInput
    _max?: RewardMaxOrderByAggregateInput
    _min?: RewardMinOrderByAggregateInput
    _sum?: RewardSumOrderByAggregateInput
  }

  export type RewardScalarWhereWithAggregatesInput = {
    AND?: RewardScalarWhereWithAggregatesInput | RewardScalarWhereWithAggregatesInput[]
    OR?: RewardScalarWhereWithAggregatesInput[]
    NOT?: RewardScalarWhereWithAggregatesInput | RewardScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Reward"> | number
    name?: StringNullableWithAggregatesFilter<"Reward"> | string | null
    stars?: IntNullableWithAggregatesFilter<"Reward"> | number | null
    value?: IntNullableWithAggregatesFilter<"Reward"> | number | null
    startDate?: DateTimeNullableWithAggregatesFilter<"Reward"> | Date | string | null
    endDate?: DateTimeNullableWithAggregatesFilter<"Reward"> | Date | string | null
    createdAt?: DateTimeNullableWithAggregatesFilter<"Reward"> | Date | string | null
    updateAt?: DateTimeNullableWithAggregatesFilter<"Reward"> | Date | string | null
  }

  export type PromotionCodeWhereInput = {
    AND?: PromotionCodeWhereInput | PromotionCodeWhereInput[]
    OR?: PromotionCodeWhereInput[]
    NOT?: PromotionCodeWhereInput | PromotionCodeWhereInput[]
    id?: IntFilter<"PromotionCode"> | number
    name?: StringNullableFilter<"PromotionCode"> | string | null
    code?: StringNullableFilter<"PromotionCode"> | string | null
    value?: IntNullableFilter<"PromotionCode"> | number | null
    branch?: StringNullableFilter<"PromotionCode"> | string | null
    isUsed?: BoolNullableFilter<"PromotionCode"> | boolean | null
    createdAt?: DateTimeNullableFilter<"PromotionCode"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"PromotionCode"> | Date | string | null
    UserRewardMap?: UserRewardMapListRelationFilter
  }

  export type PromotionCodeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    code?: SortOrderInput | SortOrder
    value?: SortOrderInput | SortOrder
    branch?: SortOrderInput | SortOrder
    isUsed?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    UserRewardMap?: UserRewardMapOrderByRelationAggregateInput
  }

  export type PromotionCodeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: PromotionCodeWhereInput | PromotionCodeWhereInput[]
    OR?: PromotionCodeWhereInput[]
    NOT?: PromotionCodeWhereInput | PromotionCodeWhereInput[]
    name?: StringNullableFilter<"PromotionCode"> | string | null
    code?: StringNullableFilter<"PromotionCode"> | string | null
    value?: IntNullableFilter<"PromotionCode"> | number | null
    branch?: StringNullableFilter<"PromotionCode"> | string | null
    isUsed?: BoolNullableFilter<"PromotionCode"> | boolean | null
    createdAt?: DateTimeNullableFilter<"PromotionCode"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"PromotionCode"> | Date | string | null
    UserRewardMap?: UserRewardMapListRelationFilter
  }, "id">

  export type PromotionCodeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    code?: SortOrderInput | SortOrder
    value?: SortOrderInput | SortOrder
    branch?: SortOrderInput | SortOrder
    isUsed?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    _count?: PromotionCodeCountOrderByAggregateInput
    _avg?: PromotionCodeAvgOrderByAggregateInput
    _max?: PromotionCodeMaxOrderByAggregateInput
    _min?: PromotionCodeMinOrderByAggregateInput
    _sum?: PromotionCodeSumOrderByAggregateInput
  }

  export type PromotionCodeScalarWhereWithAggregatesInput = {
    AND?: PromotionCodeScalarWhereWithAggregatesInput | PromotionCodeScalarWhereWithAggregatesInput[]
    OR?: PromotionCodeScalarWhereWithAggregatesInput[]
    NOT?: PromotionCodeScalarWhereWithAggregatesInput | PromotionCodeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"PromotionCode"> | number
    name?: StringNullableWithAggregatesFilter<"PromotionCode"> | string | null
    code?: StringNullableWithAggregatesFilter<"PromotionCode"> | string | null
    value?: IntNullableWithAggregatesFilter<"PromotionCode"> | number | null
    branch?: StringNullableWithAggregatesFilter<"PromotionCode"> | string | null
    isUsed?: BoolNullableWithAggregatesFilter<"PromotionCode"> | boolean | null
    createdAt?: DateTimeNullableWithAggregatesFilter<"PromotionCode"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"PromotionCode"> | Date | string | null
  }

  export type UserStarHistoryWhereInput = {
    AND?: UserStarHistoryWhereInput | UserStarHistoryWhereInput[]
    OR?: UserStarHistoryWhereInput[]
    NOT?: UserStarHistoryWhereInput | UserStarHistoryWhereInput[]
    id?: IntFilter<"UserStarHistory"> | number
    userId?: IntNullableFilter<"UserStarHistory"> | number | null
    oldStars?: IntNullableFilter<"UserStarHistory"> | number | null
    newStars?: IntNullableFilter<"UserStarHistory"> | number | null
    type?: EnumUserStarHistory_typeNullableFilter<"UserStarHistory"> | $Enums.UserStarHistory_type | null
    createdAt?: DateTimeNullableFilter<"UserStarHistory"> | Date | string | null
    targetId?: IntNullableFilter<"UserStarHistory"> | number | null
    branch?: StringNullableFilter<"UserStarHistory"> | string | null
    gameResultId?: IntNullableFilter<"UserStarHistory"> | number | null
    gameResult?: XOR<GameResultNullableRelationFilter, GameResultWhereInput> | null
  }

  export type UserStarHistoryOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    oldStars?: SortOrderInput | SortOrder
    newStars?: SortOrderInput | SortOrder
    type?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    targetId?: SortOrderInput | SortOrder
    branch?: SortOrderInput | SortOrder
    gameResultId?: SortOrderInput | SortOrder
    gameResult?: GameResultOrderByWithRelationInput
  }

  export type UserStarHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: UserStarHistoryWhereInput | UserStarHistoryWhereInput[]
    OR?: UserStarHistoryWhereInput[]
    NOT?: UserStarHistoryWhereInput | UserStarHistoryWhereInput[]
    userId?: IntNullableFilter<"UserStarHistory"> | number | null
    oldStars?: IntNullableFilter<"UserStarHistory"> | number | null
    newStars?: IntNullableFilter<"UserStarHistory"> | number | null
    type?: EnumUserStarHistory_typeNullableFilter<"UserStarHistory"> | $Enums.UserStarHistory_type | null
    createdAt?: DateTimeNullableFilter<"UserStarHistory"> | Date | string | null
    targetId?: IntNullableFilter<"UserStarHistory"> | number | null
    branch?: StringNullableFilter<"UserStarHistory"> | string | null
    gameResultId?: IntNullableFilter<"UserStarHistory"> | number | null
    gameResult?: XOR<GameResultNullableRelationFilter, GameResultWhereInput> | null
  }, "id">

  export type UserStarHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    oldStars?: SortOrderInput | SortOrder
    newStars?: SortOrderInput | SortOrder
    type?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    targetId?: SortOrderInput | SortOrder
    branch?: SortOrderInput | SortOrder
    gameResultId?: SortOrderInput | SortOrder
    _count?: UserStarHistoryCountOrderByAggregateInput
    _avg?: UserStarHistoryAvgOrderByAggregateInput
    _max?: UserStarHistoryMaxOrderByAggregateInput
    _min?: UserStarHistoryMinOrderByAggregateInput
    _sum?: UserStarHistorySumOrderByAggregateInput
  }

  export type UserStarHistoryScalarWhereWithAggregatesInput = {
    AND?: UserStarHistoryScalarWhereWithAggregatesInput | UserStarHistoryScalarWhereWithAggregatesInput[]
    OR?: UserStarHistoryScalarWhereWithAggregatesInput[]
    NOT?: UserStarHistoryScalarWhereWithAggregatesInput | UserStarHistoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserStarHistory"> | number
    userId?: IntNullableWithAggregatesFilter<"UserStarHistory"> | number | null
    oldStars?: IntNullableWithAggregatesFilter<"UserStarHistory"> | number | null
    newStars?: IntNullableWithAggregatesFilter<"UserStarHistory"> | number | null
    type?: EnumUserStarHistory_typeNullableWithAggregatesFilter<"UserStarHistory"> | $Enums.UserStarHistory_type | null
    createdAt?: DateTimeNullableWithAggregatesFilter<"UserStarHistory"> | Date | string | null
    targetId?: IntNullableWithAggregatesFilter<"UserStarHistory"> | number | null
    branch?: StringNullableWithAggregatesFilter<"UserStarHistory"> | string | null
    gameResultId?: IntNullableWithAggregatesFilter<"UserStarHistory"> | number | null
  }

  export type SavingPlanWhereInput = {
    AND?: SavingPlanWhereInput | SavingPlanWhereInput[]
    OR?: SavingPlanWhereInput[]
    NOT?: SavingPlanWhereInput | SavingPlanWhereInput[]
    id?: IntFilter<"SavingPlan"> | number
    uuid?: StringFilter<"SavingPlan"> | string
    name?: StringFilter<"SavingPlan"> | string
    price?: IntFilter<"SavingPlan"> | number
    description?: StringNullableFilter<"SavingPlan"> | string | null
    isDelete?: BoolNullableFilter<"SavingPlan"> | boolean | null
  }

  export type SavingPlanOrderByWithRelationInput = {
    id?: SortOrder
    uuid?: SortOrder
    name?: SortOrder
    price?: SortOrder
    description?: SortOrderInput | SortOrder
    isDelete?: SortOrderInput | SortOrder
  }

  export type SavingPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SavingPlanWhereInput | SavingPlanWhereInput[]
    OR?: SavingPlanWhereInput[]
    NOT?: SavingPlanWhereInput | SavingPlanWhereInput[]
    uuid?: StringFilter<"SavingPlan"> | string
    name?: StringFilter<"SavingPlan"> | string
    price?: IntFilter<"SavingPlan"> | number
    description?: StringNullableFilter<"SavingPlan"> | string | null
    isDelete?: BoolNullableFilter<"SavingPlan"> | boolean | null
  }, "id">

  export type SavingPlanOrderByWithAggregationInput = {
    id?: SortOrder
    uuid?: SortOrder
    name?: SortOrder
    price?: SortOrder
    description?: SortOrderInput | SortOrder
    isDelete?: SortOrderInput | SortOrder
    _count?: SavingPlanCountOrderByAggregateInput
    _avg?: SavingPlanAvgOrderByAggregateInput
    _max?: SavingPlanMaxOrderByAggregateInput
    _min?: SavingPlanMinOrderByAggregateInput
    _sum?: SavingPlanSumOrderByAggregateInput
  }

  export type SavingPlanScalarWhereWithAggregatesInput = {
    AND?: SavingPlanScalarWhereWithAggregatesInput | SavingPlanScalarWhereWithAggregatesInput[]
    OR?: SavingPlanScalarWhereWithAggregatesInput[]
    NOT?: SavingPlanScalarWhereWithAggregatesInput | SavingPlanScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SavingPlan"> | number
    uuid?: StringWithAggregatesFilter<"SavingPlan"> | string
    name?: StringWithAggregatesFilter<"SavingPlan"> | string
    price?: IntWithAggregatesFilter<"SavingPlan"> | number
    description?: StringNullableWithAggregatesFilter<"SavingPlan"> | string | null
    isDelete?: BoolNullableWithAggregatesFilter<"SavingPlan"> | boolean | null
  }

  export type ComputerWhereInput = {
    AND?: ComputerWhereInput | ComputerWhereInput[]
    OR?: ComputerWhereInput[]
    NOT?: ComputerWhereInput | ComputerWhereInput[]
    id?: IntFilter<"Computer"> | number
    fingerprintId?: StringFilter<"Computer"> | string
    ip?: StringNullableFilter<"Computer"> | string | null
    name?: StringFilter<"Computer"> | string
    branch?: StringFilter<"Computer"> | string
    status?: IntFilter<"Computer"> | number
    localIp?: StringNullableFilter<"Computer"> | string | null
  }

  export type ComputerOrderByWithRelationInput = {
    id?: SortOrder
    fingerprintId?: SortOrder
    ip?: SortOrderInput | SortOrder
    name?: SortOrder
    branch?: SortOrder
    status?: SortOrder
    localIp?: SortOrderInput | SortOrder
  }

  export type ComputerWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ComputerWhereInput | ComputerWhereInput[]
    OR?: ComputerWhereInput[]
    NOT?: ComputerWhereInput | ComputerWhereInput[]
    fingerprintId?: StringFilter<"Computer"> | string
    ip?: StringNullableFilter<"Computer"> | string | null
    name?: StringFilter<"Computer"> | string
    branch?: StringFilter<"Computer"> | string
    status?: IntFilter<"Computer"> | number
    localIp?: StringNullableFilter<"Computer"> | string | null
  }, "id">

  export type ComputerOrderByWithAggregationInput = {
    id?: SortOrder
    fingerprintId?: SortOrder
    ip?: SortOrderInput | SortOrder
    name?: SortOrder
    branch?: SortOrder
    status?: SortOrder
    localIp?: SortOrderInput | SortOrder
    _count?: ComputerCountOrderByAggregateInput
    _avg?: ComputerAvgOrderByAggregateInput
    _max?: ComputerMaxOrderByAggregateInput
    _min?: ComputerMinOrderByAggregateInput
    _sum?: ComputerSumOrderByAggregateInput
  }

  export type ComputerScalarWhereWithAggregatesInput = {
    AND?: ComputerScalarWhereWithAggregatesInput | ComputerScalarWhereWithAggregatesInput[]
    OR?: ComputerScalarWhereWithAggregatesInput[]
    NOT?: ComputerScalarWhereWithAggregatesInput | ComputerScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Computer"> | number
    fingerprintId?: StringWithAggregatesFilter<"Computer"> | string
    ip?: StringNullableWithAggregatesFilter<"Computer"> | string | null
    name?: StringWithAggregatesFilter<"Computer"> | string
    branch?: StringWithAggregatesFilter<"Computer"> | string
    status?: IntWithAggregatesFilter<"Computer"> | number
    localIp?: StringNullableWithAggregatesFilter<"Computer"> | string | null
  }

  export type FundHistoryWhereInput = {
    AND?: FundHistoryWhereInput | FundHistoryWhereInput[]
    OR?: FundHistoryWhereInput[]
    NOT?: FundHistoryWhereInput | FundHistoryWhereInput[]
    id?: IntFilter<"FundHistory"> | number
    date?: DateTimeNullableFilter<"FundHistory"> | Date | string | null
    startValue?: FloatNullableFilter<"FundHistory"> | number | null
    currentValue?: FloatNullableFilter<"FundHistory"> | number | null
    endValue?: FloatNullableFilter<"FundHistory"> | number | null
    createdAt?: DateTimeNullableFilter<"FundHistory"> | Date | string | null
    updatedAt?: FloatNullableFilter<"FundHistory"> | number | null
  }

  export type FundHistoryOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrderInput | SortOrder
    startValue?: SortOrderInput | SortOrder
    currentValue?: SortOrderInput | SortOrder
    endValue?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
  }

  export type FundHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: FundHistoryWhereInput | FundHistoryWhereInput[]
    OR?: FundHistoryWhereInput[]
    NOT?: FundHistoryWhereInput | FundHistoryWhereInput[]
    date?: DateTimeNullableFilter<"FundHistory"> | Date | string | null
    startValue?: FloatNullableFilter<"FundHistory"> | number | null
    currentValue?: FloatNullableFilter<"FundHistory"> | number | null
    endValue?: FloatNullableFilter<"FundHistory"> | number | null
    createdAt?: DateTimeNullableFilter<"FundHistory"> | Date | string | null
    updatedAt?: FloatNullableFilter<"FundHistory"> | number | null
  }, "id">

  export type FundHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrderInput | SortOrder
    startValue?: SortOrderInput | SortOrder
    currentValue?: SortOrderInput | SortOrder
    endValue?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    _count?: FundHistoryCountOrderByAggregateInput
    _avg?: FundHistoryAvgOrderByAggregateInput
    _max?: FundHistoryMaxOrderByAggregateInput
    _min?: FundHistoryMinOrderByAggregateInput
    _sum?: FundHistorySumOrderByAggregateInput
  }

  export type FundHistoryScalarWhereWithAggregatesInput = {
    AND?: FundHistoryScalarWhereWithAggregatesInput | FundHistoryScalarWhereWithAggregatesInput[]
    OR?: FundHistoryScalarWhereWithAggregatesInput[]
    NOT?: FundHistoryScalarWhereWithAggregatesInput | FundHistoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"FundHistory"> | number
    date?: DateTimeNullableWithAggregatesFilter<"FundHistory"> | Date | string | null
    startValue?: FloatNullableWithAggregatesFilter<"FundHistory"> | number | null
    currentValue?: FloatNullableWithAggregatesFilter<"FundHistory"> | number | null
    endValue?: FloatNullableWithAggregatesFilter<"FundHistory"> | number | null
    createdAt?: DateTimeNullableWithAggregatesFilter<"FundHistory"> | Date | string | null
    updatedAt?: FloatNullableWithAggregatesFilter<"FundHistory"> | number | null
  }

  export type UserSpendMapWhereInput = {
    AND?: UserSpendMapWhereInput | UserSpendMapWhereInput[]
    OR?: UserSpendMapWhereInput[]
    NOT?: UserSpendMapWhereInput | UserSpendMapWhereInput[]
    id?: IntFilter<"UserSpendMap"> | number
    userId?: IntNullableFilter<"UserSpendMap"> | number | null
    branch?: StringNullableFilter<"UserSpendMap"> | string | null
    totalSpend?: FloatNullableFilter<"UserSpendMap"> | number | null
    date?: DateTimeNullableFilter<"UserSpendMap"> | Date | string | null
    createdAt?: DateTimeNullableFilter<"UserSpendMap"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"UserSpendMap"> | Date | string | null
  }

  export type UserSpendMapOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    branch?: SortOrderInput | SortOrder
    totalSpend?: SortOrderInput | SortOrder
    date?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
  }

  export type UserSpendMapWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: UserSpendMapWhereInput | UserSpendMapWhereInput[]
    OR?: UserSpendMapWhereInput[]
    NOT?: UserSpendMapWhereInput | UserSpendMapWhereInput[]
    userId?: IntNullableFilter<"UserSpendMap"> | number | null
    branch?: StringNullableFilter<"UserSpendMap"> | string | null
    totalSpend?: FloatNullableFilter<"UserSpendMap"> | number | null
    date?: DateTimeNullableFilter<"UserSpendMap"> | Date | string | null
    createdAt?: DateTimeNullableFilter<"UserSpendMap"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"UserSpendMap"> | Date | string | null
  }, "id">

  export type UserSpendMapOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    branch?: SortOrderInput | SortOrder
    totalSpend?: SortOrderInput | SortOrder
    date?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    _count?: UserSpendMapCountOrderByAggregateInput
    _avg?: UserSpendMapAvgOrderByAggregateInput
    _max?: UserSpendMapMaxOrderByAggregateInput
    _min?: UserSpendMapMinOrderByAggregateInput
    _sum?: UserSpendMapSumOrderByAggregateInput
  }

  export type UserSpendMapScalarWhereWithAggregatesInput = {
    AND?: UserSpendMapScalarWhereWithAggregatesInput | UserSpendMapScalarWhereWithAggregatesInput[]
    OR?: UserSpendMapScalarWhereWithAggregatesInput[]
    NOT?: UserSpendMapScalarWhereWithAggregatesInput | UserSpendMapScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserSpendMap"> | number
    userId?: IntNullableWithAggregatesFilter<"UserSpendMap"> | number | null
    branch?: StringNullableWithAggregatesFilter<"UserSpendMap"> | string | null
    totalSpend?: FloatNullableWithAggregatesFilter<"UserSpendMap"> | number | null
    date?: DateTimeNullableWithAggregatesFilter<"UserSpendMap"> | Date | string | null
    createdAt?: DateTimeNullableWithAggregatesFilter<"UserSpendMap"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"UserSpendMap"> | Date | string | null
  }

  export type RankCreateInput = {
    name: string
    fromValue: number
    toValue: number
    discount?: number | null
    foodVoucher?: number | null
    drinkVoucher?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RankUncheckedCreateInput = {
    id?: number
    name: string
    fromValue: number
    toValue: number
    discount?: number | null
    foodVoucher?: number | null
    drinkVoucher?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RankUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    fromValue?: FloatFieldUpdateOperationsInput | number
    toValue?: FloatFieldUpdateOperationsInput | number
    discount?: NullableFloatFieldUpdateOperationsInput | number | null
    foodVoucher?: NullableIntFieldUpdateOperationsInput | number | null
    drinkVoucher?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RankUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    fromValue?: FloatFieldUpdateOperationsInput | number
    toValue?: FloatFieldUpdateOperationsInput | number
    discount?: NullableFloatFieldUpdateOperationsInput | number | null
    foodVoucher?: NullableIntFieldUpdateOperationsInput | number | null
    drinkVoucher?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RankCreateManyInput = {
    id?: number
    name: string
    fromValue: number
    toValue: number
    discount?: number | null
    foodVoucher?: number | null
    drinkVoucher?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RankUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    fromValue?: FloatFieldUpdateOperationsInput | number
    toValue?: FloatFieldUpdateOperationsInput | number
    discount?: NullableFloatFieldUpdateOperationsInput | number | null
    foodVoucher?: NullableIntFieldUpdateOperationsInput | number | null
    drinkVoucher?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RankUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    fromValue?: FloatFieldUpdateOperationsInput | number
    toValue?: FloatFieldUpdateOperationsInput | number
    discount?: NullableFloatFieldUpdateOperationsInput | number | null
    foodVoucher?: NullableIntFieldUpdateOperationsInput | number | null
    drinkVoucher?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameCreateInput = {
    name: string
    startDate: Date | string
    endDate: Date | string
    starsPerRound: number
    createdAt?: Date | string
    updatedAt?: Date | string
    balance_rate?: number | null
    play_rate?: number | null
    jackpot?: number | null
  }

  export type GameUncheckedCreateInput = {
    id?: number
    name: string
    startDate: Date | string
    endDate: Date | string
    starsPerRound: number
    createdAt?: Date | string
    updatedAt?: Date | string
    balance_rate?: number | null
    play_rate?: number | null
    jackpot?: number | null
  }

  export type GameUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    starsPerRound?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    balance_rate?: NullableFloatFieldUpdateOperationsInput | number | null
    play_rate?: NullableFloatFieldUpdateOperationsInput | number | null
    jackpot?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type GameUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    starsPerRound?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    balance_rate?: NullableFloatFieldUpdateOperationsInput | number | null
    play_rate?: NullableFloatFieldUpdateOperationsInput | number | null
    jackpot?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type GameCreateManyInput = {
    id?: number
    name: string
    startDate: Date | string
    endDate: Date | string
    starsPerRound: number
    createdAt?: Date | string
    updatedAt?: Date | string
    balance_rate?: number | null
    play_rate?: number | null
    jackpot?: number | null
  }

  export type GameUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    starsPerRound?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    balance_rate?: NullableFloatFieldUpdateOperationsInput | number | null
    play_rate?: NullableFloatFieldUpdateOperationsInput | number | null
    jackpot?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type GameUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    starsPerRound?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    balance_rate?: NullableFloatFieldUpdateOperationsInput | number | null
    play_rate?: NullableFloatFieldUpdateOperationsInput | number | null
    jackpot?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type CheckInResultCreateInput = {
    userId: number
    createdAt?: Date | string
    branch?: string | null
  }

  export type CheckInResultUncheckedCreateInput = {
    id?: number
    userId: number
    createdAt?: Date | string
    branch?: string | null
  }

  export type CheckInResultUpdateInput = {
    userId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CheckInResultUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CheckInResultCreateManyInput = {
    id?: number
    userId: number
    createdAt?: Date | string
    branch?: string | null
  }

  export type CheckInResultUpdateManyMutationInput = {
    userId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CheckInResultUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CheckInItemCreateInput = {
    dayName: string
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CheckInItemUncheckedCreateInput = {
    id?: number
    dayName: string
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CheckInItemUpdateInput = {
    dayName?: StringFieldUpdateOperationsInput | string
    stars?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CheckInItemUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    dayName?: StringFieldUpdateOperationsInput | string
    stars?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CheckInItemCreateManyInput = {
    id?: number
    dayName: string
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CheckInItemUpdateManyMutationInput = {
    dayName?: StringFieldUpdateOperationsInput | string
    stars?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CheckInItemUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    dayName?: StringFieldUpdateOperationsInput | string
    stars?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CheckInPromotionCreateInput = {
    checkInItemId: number
    coefficient: number
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CheckInPromotionUncheckedCreateInput = {
    id?: number
    checkInItemId: number
    coefficient: number
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CheckInPromotionUpdateInput = {
    checkInItemId?: IntFieldUpdateOperationsInput | number
    coefficient?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CheckInPromotionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    checkInItemId?: IntFieldUpdateOperationsInput | number
    coefficient?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CheckInPromotionCreateManyInput = {
    id?: number
    checkInItemId: number
    coefficient: number
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CheckInPromotionUpdateManyMutationInput = {
    checkInItemId?: IntFieldUpdateOperationsInput | number
    coefficient?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CheckInPromotionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    checkInItemId?: IntFieldUpdateOperationsInput | number
    coefficient?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemCreateInput = {
    name: string
    image_url: string
    rating: number
    value: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    title: string
    background?: string | null
    textColor?: string | null
  }

  export type ItemUncheckedCreateInput = {
    id?: number
    name: string
    image_url: string
    rating: number
    value: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    title: string
    background?: string | null
    textColor?: string | null
  }

  export type ItemUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    image_url?: StringFieldUpdateOperationsInput | string
    rating?: FloatFieldUpdateOperationsInput | number
    value?: FloatFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    title?: StringFieldUpdateOperationsInput | string
    background?: NullableStringFieldUpdateOperationsInput | string | null
    textColor?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ItemUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    image_url?: StringFieldUpdateOperationsInput | string
    rating?: FloatFieldUpdateOperationsInput | number
    value?: FloatFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    title?: StringFieldUpdateOperationsInput | string
    background?: NullableStringFieldUpdateOperationsInput | string | null
    textColor?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ItemCreateManyInput = {
    id?: number
    name: string
    image_url: string
    rating: number
    value: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    title: string
    background?: string | null
    textColor?: string | null
  }

  export type ItemUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    image_url?: StringFieldUpdateOperationsInput | string
    rating?: FloatFieldUpdateOperationsInput | number
    value?: FloatFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    title?: StringFieldUpdateOperationsInput | string
    background?: NullableStringFieldUpdateOperationsInput | string | null
    textColor?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ItemUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    image_url?: StringFieldUpdateOperationsInput | string
    rating?: FloatFieldUpdateOperationsInput | number
    value?: FloatFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    title?: StringFieldUpdateOperationsInput | string
    background?: NullableStringFieldUpdateOperationsInput | string | null
    textColor?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GameItemMapCreateInput = {
    gameId: number
    itemId: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GameItemMapUncheckedCreateInput = {
    id?: number
    gameId: number
    itemId: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GameItemMapUpdateInput = {
    gameId?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameItemMapUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    gameId?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameItemMapCreateManyInput = {
    id?: number
    gameId: number
    itemId: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GameItemMapUpdateManyMutationInput = {
    gameId?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameItemMapUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    gameId?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameResultCreateInput = {
    itemId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    userStarHistory?: UserStarHistoryCreateNestedManyWithoutGameResultInput
    users: UserCreateNestedOneWithoutGameResultsInput
  }

  export type GameResultUncheckedCreateInput = {
    id?: number
    userId: number
    itemId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    userStarHistory?: UserStarHistoryUncheckedCreateNestedManyWithoutGameResultInput
  }

  export type GameResultUpdateInput = {
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userStarHistory?: UserStarHistoryUpdateManyWithoutGameResultNestedInput
    users?: UserUpdateOneRequiredWithoutGameResultsNestedInput
  }

  export type GameResultUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userStarHistory?: UserStarHistoryUncheckedUpdateManyWithoutGameResultNestedInput
  }

  export type GameResultCreateManyInput = {
    id?: number
    userId: number
    itemId: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GameResultUpdateManyMutationInput = {
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameResultUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMissionMapCreateInput = {
    branch: string
    isDone?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    users: UserCreateNestedOneWithoutUserMissionMapInput
    mission: MissionCreateNestedOneWithoutUserMissionMapInput
  }

  export type UserMissionMapUncheckedCreateInput = {
    id?: number
    userId: number
    missionId: number
    branch: string
    isDone?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserMissionMapUpdateInput = {
    branch?: StringFieldUpdateOperationsInput | string
    isDone?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateOneRequiredWithoutUserMissionMapNestedInput
    mission?: MissionUpdateOneRequiredWithoutUserMissionMapNestedInput
  }

  export type UserMissionMapUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    missionId?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    isDone?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMissionMapCreateManyInput = {
    id?: number
    userId: number
    missionId: number
    branch: string
    isDone?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserMissionMapUpdateManyMutationInput = {
    branch?: StringFieldUpdateOperationsInput | string
    isDone?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMissionMapUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    missionId?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    isDone?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    userName?: string | null
    userId: number
    rankId: number
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
    magicStone?: number
    branch: string
    UserRewardMap?: UserRewardMapCreateNestedManyWithoutUserInput
    UserMissionMap?: UserMissionMapCreateNestedManyWithoutUsersInput
    GameResults?: GameResultCreateNestedManyWithoutUsersInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    userName?: string | null
    userId: number
    rankId: number
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
    magicStone?: number
    branch: string
    UserRewardMap?: UserRewardMapUncheckedCreateNestedManyWithoutUserInput
    UserMissionMap?: UserMissionMapUncheckedCreateNestedManyWithoutUsersInput
    GameResults?: GameResultUncheckedCreateNestedManyWithoutUsersInput
  }

  export type UserUpdateInput = {
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: IntFieldUpdateOperationsInput | number
    rankId?: IntFieldUpdateOperationsInput | number
    stars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    magicStone?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    UserRewardMap?: UserRewardMapUpdateManyWithoutUserNestedInput
    UserMissionMap?: UserMissionMapUpdateManyWithoutUsersNestedInput
    GameResults?: GameResultUpdateManyWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: IntFieldUpdateOperationsInput | number
    rankId?: IntFieldUpdateOperationsInput | number
    stars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    magicStone?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    UserRewardMap?: UserRewardMapUncheckedUpdateManyWithoutUserNestedInput
    UserMissionMap?: UserMissionMapUncheckedUpdateManyWithoutUsersNestedInput
    GameResults?: GameResultUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    userName?: string | null
    userId: number
    rankId: number
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
    magicStone?: number
    branch: string
  }

  export type UserUpdateManyMutationInput = {
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: IntFieldUpdateOperationsInput | number
    rankId?: IntFieldUpdateOperationsInput | number
    stars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    magicStone?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: IntFieldUpdateOperationsInput | number
    rankId?: IntFieldUpdateOperationsInput | number
    stars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    magicStone?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
  }

  export type MissionCreateInput = {
    name: string
    description: string
    reward: number
    startHours: number
    endHours: number
    createdAt?: Date | string
    quantity: number
    type: $Enums.Mission_type
    UserMissionMap?: UserMissionMapCreateNestedManyWithoutMissionInput
  }

  export type MissionUncheckedCreateInput = {
    id?: number
    name: string
    description: string
    reward: number
    startHours: number
    endHours: number
    createdAt?: Date | string
    quantity: number
    type: $Enums.Mission_type
    UserMissionMap?: UserMissionMapUncheckedCreateNestedManyWithoutMissionInput
  }

  export type MissionUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    reward?: FloatFieldUpdateOperationsInput | number
    startHours?: IntFieldUpdateOperationsInput | number
    endHours?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: IntFieldUpdateOperationsInput | number
    type?: EnumMission_typeFieldUpdateOperationsInput | $Enums.Mission_type
    UserMissionMap?: UserMissionMapUpdateManyWithoutMissionNestedInput
  }

  export type MissionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    reward?: FloatFieldUpdateOperationsInput | number
    startHours?: IntFieldUpdateOperationsInput | number
    endHours?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: IntFieldUpdateOperationsInput | number
    type?: EnumMission_typeFieldUpdateOperationsInput | $Enums.Mission_type
    UserMissionMap?: UserMissionMapUncheckedUpdateManyWithoutMissionNestedInput
  }

  export type MissionCreateManyInput = {
    id?: number
    name: string
    description: string
    reward: number
    startHours: number
    endHours: number
    createdAt?: Date | string
    quantity: number
    type: $Enums.Mission_type
  }

  export type MissionUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    reward?: FloatFieldUpdateOperationsInput | number
    startHours?: IntFieldUpdateOperationsInput | number
    endHours?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: IntFieldUpdateOperationsInput | number
    type?: EnumMission_typeFieldUpdateOperationsInput | $Enums.Mission_type
  }

  export type MissionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    reward?: FloatFieldUpdateOperationsInput | number
    startHours?: IntFieldUpdateOperationsInput | number
    endHours?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: IntFieldUpdateOperationsInput | number
    type?: EnumMission_typeFieldUpdateOperationsInput | $Enums.Mission_type
  }

  export type UserRewardMapCreateInput = {
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
    promotionCode?: PromotionCodeCreateNestedOneWithoutUserRewardMapInput
    user?: UserCreateNestedOneWithoutUserRewardMapInput
    reward?: RewardCreateNestedOneWithoutUserRewardMapInput
  }

  export type UserRewardMapUncheckedCreateInput = {
    id?: number
    userId?: number | null
    rewardId?: number | null
    promotionCodeId?: number | null
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
  }

  export type UserRewardMapUpdateInput = {
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    promotionCode?: PromotionCodeUpdateOneWithoutUserRewardMapNestedInput
    user?: UserUpdateOneWithoutUserRewardMapNestedInput
    reward?: RewardUpdateOneWithoutUserRewardMapNestedInput
  }

  export type UserRewardMapUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    rewardId?: NullableIntFieldUpdateOperationsInput | number | null
    promotionCodeId?: NullableIntFieldUpdateOperationsInput | number | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserRewardMapCreateManyInput = {
    id?: number
    userId?: number | null
    rewardId?: number | null
    promotionCodeId?: number | null
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
  }

  export type UserRewardMapUpdateManyMutationInput = {
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserRewardMapUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    rewardId?: NullableIntFieldUpdateOperationsInput | number | null
    promotionCodeId?: NullableIntFieldUpdateOperationsInput | number | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RewardCreateInput = {
    name?: string | null
    stars?: number | null
    value?: number | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    createdAt?: Date | string | null
    updateAt?: Date | string | null
    UserRewardMap?: UserRewardMapCreateNestedManyWithoutRewardInput
  }

  export type RewardUncheckedCreateInput = {
    id?: number
    name?: string | null
    stars?: number | null
    value?: number | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    createdAt?: Date | string | null
    updateAt?: Date | string | null
    UserRewardMap?: UserRewardMapUncheckedCreateNestedManyWithoutRewardInput
  }

  export type RewardUpdateInput = {
    name?: NullableStringFieldUpdateOperationsInput | string | null
    stars?: NullableIntFieldUpdateOperationsInput | number | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updateAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    UserRewardMap?: UserRewardMapUpdateManyWithoutRewardNestedInput
  }

  export type RewardUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: NullableStringFieldUpdateOperationsInput | string | null
    stars?: NullableIntFieldUpdateOperationsInput | number | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updateAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    UserRewardMap?: UserRewardMapUncheckedUpdateManyWithoutRewardNestedInput
  }

  export type RewardCreateManyInput = {
    id?: number
    name?: string | null
    stars?: number | null
    value?: number | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    createdAt?: Date | string | null
    updateAt?: Date | string | null
  }

  export type RewardUpdateManyMutationInput = {
    name?: NullableStringFieldUpdateOperationsInput | string | null
    stars?: NullableIntFieldUpdateOperationsInput | number | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updateAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RewardUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: NullableStringFieldUpdateOperationsInput | string | null
    stars?: NullableIntFieldUpdateOperationsInput | number | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updateAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PromotionCodeCreateInput = {
    name?: string | null
    code?: string | null
    value?: number | null
    branch?: string | null
    isUsed?: boolean | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    UserRewardMap?: UserRewardMapCreateNestedManyWithoutPromotionCodeInput
  }

  export type PromotionCodeUncheckedCreateInput = {
    id?: number
    name?: string | null
    code?: string | null
    value?: number | null
    branch?: string | null
    isUsed?: boolean | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    UserRewardMap?: UserRewardMapUncheckedCreateNestedManyWithoutPromotionCodeInput
  }

  export type PromotionCodeUpdateInput = {
    name?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    isUsed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    UserRewardMap?: UserRewardMapUpdateManyWithoutPromotionCodeNestedInput
  }

  export type PromotionCodeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    isUsed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    UserRewardMap?: UserRewardMapUncheckedUpdateManyWithoutPromotionCodeNestedInput
  }

  export type PromotionCodeCreateManyInput = {
    id?: number
    name?: string | null
    code?: string | null
    value?: number | null
    branch?: string | null
    isUsed?: boolean | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type PromotionCodeUpdateManyMutationInput = {
    name?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    isUsed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PromotionCodeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    isUsed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserStarHistoryCreateInput = {
    userId?: number | null
    oldStars?: number | null
    newStars?: number | null
    type?: $Enums.UserStarHistory_type | null
    createdAt?: Date | string | null
    targetId?: number | null
    branch?: string | null
    gameResult?: GameResultCreateNestedOneWithoutUserStarHistoryInput
  }

  export type UserStarHistoryUncheckedCreateInput = {
    id?: number
    userId?: number | null
    oldStars?: number | null
    newStars?: number | null
    type?: $Enums.UserStarHistory_type | null
    createdAt?: Date | string | null
    targetId?: number | null
    branch?: string | null
    gameResultId?: number | null
  }

  export type UserStarHistoryUpdateInput = {
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    oldStars?: NullableIntFieldUpdateOperationsInput | number | null
    newStars?: NullableIntFieldUpdateOperationsInput | number | null
    type?: NullableEnumUserStarHistory_typeFieldUpdateOperationsInput | $Enums.UserStarHistory_type | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    targetId?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    gameResult?: GameResultUpdateOneWithoutUserStarHistoryNestedInput
  }

  export type UserStarHistoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    oldStars?: NullableIntFieldUpdateOperationsInput | number | null
    newStars?: NullableIntFieldUpdateOperationsInput | number | null
    type?: NullableEnumUserStarHistory_typeFieldUpdateOperationsInput | $Enums.UserStarHistory_type | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    targetId?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    gameResultId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type UserStarHistoryCreateManyInput = {
    id?: number
    userId?: number | null
    oldStars?: number | null
    newStars?: number | null
    type?: $Enums.UserStarHistory_type | null
    createdAt?: Date | string | null
    targetId?: number | null
    branch?: string | null
    gameResultId?: number | null
  }

  export type UserStarHistoryUpdateManyMutationInput = {
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    oldStars?: NullableIntFieldUpdateOperationsInput | number | null
    newStars?: NullableIntFieldUpdateOperationsInput | number | null
    type?: NullableEnumUserStarHistory_typeFieldUpdateOperationsInput | $Enums.UserStarHistory_type | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    targetId?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserStarHistoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    oldStars?: NullableIntFieldUpdateOperationsInput | number | null
    newStars?: NullableIntFieldUpdateOperationsInput | number | null
    type?: NullableEnumUserStarHistory_typeFieldUpdateOperationsInput | $Enums.UserStarHistory_type | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    targetId?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    gameResultId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type SavingPlanCreateInput = {
    uuid: string
    name: string
    price: number
    description?: string | null
    isDelete?: boolean | null
  }

  export type SavingPlanUncheckedCreateInput = {
    id?: number
    uuid: string
    name: string
    price: number
    description?: string | null
    isDelete?: boolean | null
  }

  export type SavingPlanUpdateInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isDelete?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type SavingPlanUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isDelete?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type SavingPlanCreateManyInput = {
    id?: number
    uuid: string
    name: string
    price: number
    description?: string | null
    isDelete?: boolean | null
  }

  export type SavingPlanUpdateManyMutationInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isDelete?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type SavingPlanUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isDelete?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type ComputerCreateInput = {
    fingerprintId: string
    ip?: string | null
    name: string
    branch: string
    status: number
    localIp?: string | null
  }

  export type ComputerUncheckedCreateInput = {
    id?: number
    fingerprintId: string
    ip?: string | null
    name: string
    branch: string
    status: number
    localIp?: string | null
  }

  export type ComputerUpdateInput = {
    fingerprintId?: StringFieldUpdateOperationsInput | string
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    status?: IntFieldUpdateOperationsInput | number
    localIp?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ComputerUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    fingerprintId?: StringFieldUpdateOperationsInput | string
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    status?: IntFieldUpdateOperationsInput | number
    localIp?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ComputerCreateManyInput = {
    id?: number
    fingerprintId: string
    ip?: string | null
    name: string
    branch: string
    status: number
    localIp?: string | null
  }

  export type ComputerUpdateManyMutationInput = {
    fingerprintId?: StringFieldUpdateOperationsInput | string
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    status?: IntFieldUpdateOperationsInput | number
    localIp?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ComputerUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    fingerprintId?: StringFieldUpdateOperationsInput | string
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    status?: IntFieldUpdateOperationsInput | number
    localIp?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FundHistoryCreateInput = {
    date?: Date | string | null
    startValue?: number | null
    currentValue?: number | null
    endValue?: number | null
    createdAt?: Date | string | null
    updatedAt?: number | null
  }

  export type FundHistoryUncheckedCreateInput = {
    id?: number
    date?: Date | string | null
    startValue?: number | null
    currentValue?: number | null
    endValue?: number | null
    createdAt?: Date | string | null
    updatedAt?: number | null
  }

  export type FundHistoryUpdateInput = {
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startValue?: NullableFloatFieldUpdateOperationsInput | number | null
    currentValue?: NullableFloatFieldUpdateOperationsInput | number | null
    endValue?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type FundHistoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startValue?: NullableFloatFieldUpdateOperationsInput | number | null
    currentValue?: NullableFloatFieldUpdateOperationsInput | number | null
    endValue?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type FundHistoryCreateManyInput = {
    id?: number
    date?: Date | string | null
    startValue?: number | null
    currentValue?: number | null
    endValue?: number | null
    createdAt?: Date | string | null
    updatedAt?: number | null
  }

  export type FundHistoryUpdateManyMutationInput = {
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startValue?: NullableFloatFieldUpdateOperationsInput | number | null
    currentValue?: NullableFloatFieldUpdateOperationsInput | number | null
    endValue?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type FundHistoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startValue?: NullableFloatFieldUpdateOperationsInput | number | null
    currentValue?: NullableFloatFieldUpdateOperationsInput | number | null
    endValue?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type UserSpendMapCreateInput = {
    userId?: number | null
    branch?: string | null
    totalSpend?: number | null
    date?: Date | string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type UserSpendMapUncheckedCreateInput = {
    id?: number
    userId?: number | null
    branch?: string | null
    totalSpend?: number | null
    date?: Date | string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type UserSpendMapUpdateInput = {
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    totalSpend?: NullableFloatFieldUpdateOperationsInput | number | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserSpendMapUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    totalSpend?: NullableFloatFieldUpdateOperationsInput | number | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserSpendMapCreateManyInput = {
    id?: number
    userId?: number | null
    branch?: string | null
    totalSpend?: number | null
    date?: Date | string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type UserSpendMapUpdateManyMutationInput = {
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    totalSpend?: NullableFloatFieldUpdateOperationsInput | number | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserSpendMapUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    totalSpend?: NullableFloatFieldUpdateOperationsInput | number | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type RankCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    fromValue?: SortOrder
    toValue?: SortOrder
    discount?: SortOrder
    foodVoucher?: SortOrder
    drinkVoucher?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RankAvgOrderByAggregateInput = {
    id?: SortOrder
    fromValue?: SortOrder
    toValue?: SortOrder
    discount?: SortOrder
    foodVoucher?: SortOrder
    drinkVoucher?: SortOrder
  }

  export type RankMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    fromValue?: SortOrder
    toValue?: SortOrder
    discount?: SortOrder
    foodVoucher?: SortOrder
    drinkVoucher?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RankMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    fromValue?: SortOrder
    toValue?: SortOrder
    discount?: SortOrder
    foodVoucher?: SortOrder
    drinkVoucher?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RankSumOrderByAggregateInput = {
    id?: SortOrder
    fromValue?: SortOrder
    toValue?: SortOrder
    discount?: SortOrder
    foodVoucher?: SortOrder
    drinkVoucher?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type GameCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    starsPerRound?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    balance_rate?: SortOrder
    play_rate?: SortOrder
    jackpot?: SortOrder
  }

  export type GameAvgOrderByAggregateInput = {
    id?: SortOrder
    starsPerRound?: SortOrder
    balance_rate?: SortOrder
    play_rate?: SortOrder
    jackpot?: SortOrder
  }

  export type GameMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    starsPerRound?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    balance_rate?: SortOrder
    play_rate?: SortOrder
    jackpot?: SortOrder
  }

  export type GameMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    starsPerRound?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    balance_rate?: SortOrder
    play_rate?: SortOrder
    jackpot?: SortOrder
  }

  export type GameSumOrderByAggregateInput = {
    id?: SortOrder
    starsPerRound?: SortOrder
    balance_rate?: SortOrder
    play_rate?: SortOrder
    jackpot?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type CheckInResultCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    branch?: SortOrder
  }

  export type CheckInResultAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type CheckInResultMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    branch?: SortOrder
  }

  export type CheckInResultMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    branch?: SortOrder
  }

  export type CheckInResultSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type CheckInItemCountOrderByAggregateInput = {
    id?: SortOrder
    dayName?: SortOrder
    stars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CheckInItemAvgOrderByAggregateInput = {
    id?: SortOrder
    stars?: SortOrder
  }

  export type CheckInItemMaxOrderByAggregateInput = {
    id?: SortOrder
    dayName?: SortOrder
    stars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CheckInItemMinOrderByAggregateInput = {
    id?: SortOrder
    dayName?: SortOrder
    stars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CheckInItemSumOrderByAggregateInput = {
    id?: SortOrder
    stars?: SortOrder
  }

  export type CheckInPromotionCountOrderByAggregateInput = {
    id?: SortOrder
    checkInItemId?: SortOrder
    coefficient?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CheckInPromotionAvgOrderByAggregateInput = {
    id?: SortOrder
    checkInItemId?: SortOrder
    coefficient?: SortOrder
  }

  export type CheckInPromotionMaxOrderByAggregateInput = {
    id?: SortOrder
    checkInItemId?: SortOrder
    coefficient?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CheckInPromotionMinOrderByAggregateInput = {
    id?: SortOrder
    checkInItemId?: SortOrder
    coefficient?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CheckInPromotionSumOrderByAggregateInput = {
    id?: SortOrder
    checkInItemId?: SortOrder
    coefficient?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ItemCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    image_url?: SortOrder
    rating?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    background?: SortOrder
    textColor?: SortOrder
  }

  export type ItemAvgOrderByAggregateInput = {
    id?: SortOrder
    rating?: SortOrder
    value?: SortOrder
  }

  export type ItemMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    image_url?: SortOrder
    rating?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    background?: SortOrder
    textColor?: SortOrder
  }

  export type ItemMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    image_url?: SortOrder
    rating?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    background?: SortOrder
    textColor?: SortOrder
  }

  export type ItemSumOrderByAggregateInput = {
    id?: SortOrder
    rating?: SortOrder
    value?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type GameItemMapCountOrderByAggregateInput = {
    id?: SortOrder
    gameId?: SortOrder
    itemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GameItemMapAvgOrderByAggregateInput = {
    id?: SortOrder
    gameId?: SortOrder
    itemId?: SortOrder
  }

  export type GameItemMapMaxOrderByAggregateInput = {
    id?: SortOrder
    gameId?: SortOrder
    itemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GameItemMapMinOrderByAggregateInput = {
    id?: SortOrder
    gameId?: SortOrder
    itemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GameItemMapSumOrderByAggregateInput = {
    id?: SortOrder
    gameId?: SortOrder
    itemId?: SortOrder
  }

  export type UserStarHistoryListRelationFilter = {
    every?: UserStarHistoryWhereInput
    some?: UserStarHistoryWhereInput
    none?: UserStarHistoryWhereInput
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserStarHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GameResultCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    itemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GameResultAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    itemId?: SortOrder
  }

  export type GameResultMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    itemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GameResultMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    itemId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GameResultSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    itemId?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type MissionRelationFilter = {
    is?: MissionWhereInput
    isNot?: MissionWhereInput
  }

  export type UserMissionMapCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    missionId?: SortOrder
    branch?: SortOrder
    isDone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMissionMapAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    missionId?: SortOrder
  }

  export type UserMissionMapMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    missionId?: SortOrder
    branch?: SortOrder
    isDone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMissionMapMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    missionId?: SortOrder
    branch?: SortOrder
    isDone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMissionMapSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    missionId?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type UserRewardMapListRelationFilter = {
    every?: UserRewardMapWhereInput
    some?: UserRewardMapWhereInput
    none?: UserRewardMapWhereInput
  }

  export type UserMissionMapListRelationFilter = {
    every?: UserMissionMapWhereInput
    some?: UserMissionMapWhereInput
    none?: UserMissionMapWhereInput
  }

  export type GameResultListRelationFilter = {
    every?: GameResultWhereInput
    some?: GameResultWhereInput
    none?: GameResultWhereInput
  }

  export type UserRewardMapOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserMissionMapOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GameResultOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    userName?: SortOrder
    userId?: SortOrder
    rankId?: SortOrder
    stars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    magicStone?: SortOrder
    branch?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    rankId?: SortOrder
    stars?: SortOrder
    magicStone?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    userName?: SortOrder
    userId?: SortOrder
    rankId?: SortOrder
    stars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    magicStone?: SortOrder
    branch?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    userName?: SortOrder
    userId?: SortOrder
    rankId?: SortOrder
    stars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    magicStone?: SortOrder
    branch?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    rankId?: SortOrder
    stars?: SortOrder
    magicStone?: SortOrder
  }

  export type EnumMission_typeFilter<$PrismaModel = never> = {
    equals?: $Enums.Mission_type | EnumMission_typeFieldRefInput<$PrismaModel>
    in?: $Enums.Mission_type[]
    notIn?: $Enums.Mission_type[]
    not?: NestedEnumMission_typeFilter<$PrismaModel> | $Enums.Mission_type
  }

  export type MissionCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    reward?: SortOrder
    startHours?: SortOrder
    endHours?: SortOrder
    createdAt?: SortOrder
    quantity?: SortOrder
    type?: SortOrder
  }

  export type MissionAvgOrderByAggregateInput = {
    id?: SortOrder
    reward?: SortOrder
    startHours?: SortOrder
    endHours?: SortOrder
    quantity?: SortOrder
  }

  export type MissionMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    reward?: SortOrder
    startHours?: SortOrder
    endHours?: SortOrder
    createdAt?: SortOrder
    quantity?: SortOrder
    type?: SortOrder
  }

  export type MissionMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    reward?: SortOrder
    startHours?: SortOrder
    endHours?: SortOrder
    createdAt?: SortOrder
    quantity?: SortOrder
    type?: SortOrder
  }

  export type MissionSumOrderByAggregateInput = {
    id?: SortOrder
    reward?: SortOrder
    startHours?: SortOrder
    endHours?: SortOrder
    quantity?: SortOrder
  }

  export type EnumMission_typeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Mission_type | EnumMission_typeFieldRefInput<$PrismaModel>
    in?: $Enums.Mission_type[]
    notIn?: $Enums.Mission_type[]
    not?: NestedEnumMission_typeWithAggregatesFilter<$PrismaModel> | $Enums.Mission_type
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMission_typeFilter<$PrismaModel>
    _max?: NestedEnumMission_typeFilter<$PrismaModel>
  }

  export type PromotionCodeNullableRelationFilter = {
    is?: PromotionCodeWhereInput | null
    isNot?: PromotionCodeWhereInput | null
  }

  export type UserNullableRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type RewardNullableRelationFilter = {
    is?: RewardWhereInput | null
    isNot?: RewardWhereInput | null
  }

  export type UserRewardMapCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    rewardId?: SortOrder
    promotionCodeId?: SortOrder
    duration?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isUsed?: SortOrder
    branch?: SortOrder
  }

  export type UserRewardMapAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    rewardId?: SortOrder
    promotionCodeId?: SortOrder
    duration?: SortOrder
  }

  export type UserRewardMapMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    rewardId?: SortOrder
    promotionCodeId?: SortOrder
    duration?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isUsed?: SortOrder
    branch?: SortOrder
  }

  export type UserRewardMapMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    rewardId?: SortOrder
    promotionCodeId?: SortOrder
    duration?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isUsed?: SortOrder
    branch?: SortOrder
  }

  export type UserRewardMapSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    rewardId?: SortOrder
    promotionCodeId?: SortOrder
    duration?: SortOrder
  }

  export type RewardCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    stars?: SortOrder
    value?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type RewardAvgOrderByAggregateInput = {
    id?: SortOrder
    stars?: SortOrder
    value?: SortOrder
  }

  export type RewardMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    stars?: SortOrder
    value?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type RewardMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    stars?: SortOrder
    value?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type RewardSumOrderByAggregateInput = {
    id?: SortOrder
    stars?: SortOrder
    value?: SortOrder
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type PromotionCodeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    value?: SortOrder
    branch?: SortOrder
    isUsed?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PromotionCodeAvgOrderByAggregateInput = {
    id?: SortOrder
    value?: SortOrder
  }

  export type PromotionCodeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    value?: SortOrder
    branch?: SortOrder
    isUsed?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PromotionCodeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    value?: SortOrder
    branch?: SortOrder
    isUsed?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PromotionCodeSumOrderByAggregateInput = {
    id?: SortOrder
    value?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type EnumUserStarHistory_typeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStarHistory_type | EnumUserStarHistory_typeFieldRefInput<$PrismaModel> | null
    in?: $Enums.UserStarHistory_type[] | null
    notIn?: $Enums.UserStarHistory_type[] | null
    not?: NestedEnumUserStarHistory_typeNullableFilter<$PrismaModel> | $Enums.UserStarHistory_type | null
  }

  export type GameResultNullableRelationFilter = {
    is?: GameResultWhereInput | null
    isNot?: GameResultWhereInput | null
  }

  export type UserStarHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    oldStars?: SortOrder
    newStars?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    targetId?: SortOrder
    branch?: SortOrder
    gameResultId?: SortOrder
  }

  export type UserStarHistoryAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    oldStars?: SortOrder
    newStars?: SortOrder
    targetId?: SortOrder
    gameResultId?: SortOrder
  }

  export type UserStarHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    oldStars?: SortOrder
    newStars?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    targetId?: SortOrder
    branch?: SortOrder
    gameResultId?: SortOrder
  }

  export type UserStarHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    oldStars?: SortOrder
    newStars?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    targetId?: SortOrder
    branch?: SortOrder
    gameResultId?: SortOrder
  }

  export type UserStarHistorySumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    oldStars?: SortOrder
    newStars?: SortOrder
    targetId?: SortOrder
    gameResultId?: SortOrder
  }

  export type EnumUserStarHistory_typeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStarHistory_type | EnumUserStarHistory_typeFieldRefInput<$PrismaModel> | null
    in?: $Enums.UserStarHistory_type[] | null
    notIn?: $Enums.UserStarHistory_type[] | null
    not?: NestedEnumUserStarHistory_typeNullableWithAggregatesFilter<$PrismaModel> | $Enums.UserStarHistory_type | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumUserStarHistory_typeNullableFilter<$PrismaModel>
    _max?: NestedEnumUserStarHistory_typeNullableFilter<$PrismaModel>
  }

  export type SavingPlanCountOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    name?: SortOrder
    price?: SortOrder
    description?: SortOrder
    isDelete?: SortOrder
  }

  export type SavingPlanAvgOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
  }

  export type SavingPlanMaxOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    name?: SortOrder
    price?: SortOrder
    description?: SortOrder
    isDelete?: SortOrder
  }

  export type SavingPlanMinOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    name?: SortOrder
    price?: SortOrder
    description?: SortOrder
    isDelete?: SortOrder
  }

  export type SavingPlanSumOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
  }

  export type ComputerCountOrderByAggregateInput = {
    id?: SortOrder
    fingerprintId?: SortOrder
    ip?: SortOrder
    name?: SortOrder
    branch?: SortOrder
    status?: SortOrder
    localIp?: SortOrder
  }

  export type ComputerAvgOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
  }

  export type ComputerMaxOrderByAggregateInput = {
    id?: SortOrder
    fingerprintId?: SortOrder
    ip?: SortOrder
    name?: SortOrder
    branch?: SortOrder
    status?: SortOrder
    localIp?: SortOrder
  }

  export type ComputerMinOrderByAggregateInput = {
    id?: SortOrder
    fingerprintId?: SortOrder
    ip?: SortOrder
    name?: SortOrder
    branch?: SortOrder
    status?: SortOrder
    localIp?: SortOrder
  }

  export type ComputerSumOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
  }

  export type FundHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    startValue?: SortOrder
    currentValue?: SortOrder
    endValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FundHistoryAvgOrderByAggregateInput = {
    id?: SortOrder
    startValue?: SortOrder
    currentValue?: SortOrder
    endValue?: SortOrder
    updatedAt?: SortOrder
  }

  export type FundHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    startValue?: SortOrder
    currentValue?: SortOrder
    endValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FundHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    startValue?: SortOrder
    currentValue?: SortOrder
    endValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FundHistorySumOrderByAggregateInput = {
    id?: SortOrder
    startValue?: SortOrder
    currentValue?: SortOrder
    endValue?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSpendMapCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    branch?: SortOrder
    totalSpend?: SortOrder
    date?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSpendMapAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalSpend?: SortOrder
  }

  export type UserSpendMapMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    branch?: SortOrder
    totalSpend?: SortOrder
    date?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSpendMapMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    branch?: SortOrder
    totalSpend?: SortOrder
    date?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSpendMapSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalSpend?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserStarHistoryCreateNestedManyWithoutGameResultInput = {
    create?: XOR<UserStarHistoryCreateWithoutGameResultInput, UserStarHistoryUncheckedCreateWithoutGameResultInput> | UserStarHistoryCreateWithoutGameResultInput[] | UserStarHistoryUncheckedCreateWithoutGameResultInput[]
    connectOrCreate?: UserStarHistoryCreateOrConnectWithoutGameResultInput | UserStarHistoryCreateOrConnectWithoutGameResultInput[]
    createMany?: UserStarHistoryCreateManyGameResultInputEnvelope
    connect?: UserStarHistoryWhereUniqueInput | UserStarHistoryWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutGameResultsInput = {
    create?: XOR<UserCreateWithoutGameResultsInput, UserUncheckedCreateWithoutGameResultsInput>
    connectOrCreate?: UserCreateOrConnectWithoutGameResultsInput
    connect?: UserWhereUniqueInput
  }

  export type UserStarHistoryUncheckedCreateNestedManyWithoutGameResultInput = {
    create?: XOR<UserStarHistoryCreateWithoutGameResultInput, UserStarHistoryUncheckedCreateWithoutGameResultInput> | UserStarHistoryCreateWithoutGameResultInput[] | UserStarHistoryUncheckedCreateWithoutGameResultInput[]
    connectOrCreate?: UserStarHistoryCreateOrConnectWithoutGameResultInput | UserStarHistoryCreateOrConnectWithoutGameResultInput[]
    createMany?: UserStarHistoryCreateManyGameResultInputEnvelope
    connect?: UserStarHistoryWhereUniqueInput | UserStarHistoryWhereUniqueInput[]
  }

  export type UserStarHistoryUpdateManyWithoutGameResultNestedInput = {
    create?: XOR<UserStarHistoryCreateWithoutGameResultInput, UserStarHistoryUncheckedCreateWithoutGameResultInput> | UserStarHistoryCreateWithoutGameResultInput[] | UserStarHistoryUncheckedCreateWithoutGameResultInput[]
    connectOrCreate?: UserStarHistoryCreateOrConnectWithoutGameResultInput | UserStarHistoryCreateOrConnectWithoutGameResultInput[]
    upsert?: UserStarHistoryUpsertWithWhereUniqueWithoutGameResultInput | UserStarHistoryUpsertWithWhereUniqueWithoutGameResultInput[]
    createMany?: UserStarHistoryCreateManyGameResultInputEnvelope
    set?: UserStarHistoryWhereUniqueInput | UserStarHistoryWhereUniqueInput[]
    disconnect?: UserStarHistoryWhereUniqueInput | UserStarHistoryWhereUniqueInput[]
    delete?: UserStarHistoryWhereUniqueInput | UserStarHistoryWhereUniqueInput[]
    connect?: UserStarHistoryWhereUniqueInput | UserStarHistoryWhereUniqueInput[]
    update?: UserStarHistoryUpdateWithWhereUniqueWithoutGameResultInput | UserStarHistoryUpdateWithWhereUniqueWithoutGameResultInput[]
    updateMany?: UserStarHistoryUpdateManyWithWhereWithoutGameResultInput | UserStarHistoryUpdateManyWithWhereWithoutGameResultInput[]
    deleteMany?: UserStarHistoryScalarWhereInput | UserStarHistoryScalarWhereInput[]
  }

  export type UserUpdateOneRequiredWithoutGameResultsNestedInput = {
    create?: XOR<UserCreateWithoutGameResultsInput, UserUncheckedCreateWithoutGameResultsInput>
    connectOrCreate?: UserCreateOrConnectWithoutGameResultsInput
    upsert?: UserUpsertWithoutGameResultsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutGameResultsInput, UserUpdateWithoutGameResultsInput>, UserUncheckedUpdateWithoutGameResultsInput>
  }

  export type UserStarHistoryUncheckedUpdateManyWithoutGameResultNestedInput = {
    create?: XOR<UserStarHistoryCreateWithoutGameResultInput, UserStarHistoryUncheckedCreateWithoutGameResultInput> | UserStarHistoryCreateWithoutGameResultInput[] | UserStarHistoryUncheckedCreateWithoutGameResultInput[]
    connectOrCreate?: UserStarHistoryCreateOrConnectWithoutGameResultInput | UserStarHistoryCreateOrConnectWithoutGameResultInput[]
    upsert?: UserStarHistoryUpsertWithWhereUniqueWithoutGameResultInput | UserStarHistoryUpsertWithWhereUniqueWithoutGameResultInput[]
    createMany?: UserStarHistoryCreateManyGameResultInputEnvelope
    set?: UserStarHistoryWhereUniqueInput | UserStarHistoryWhereUniqueInput[]
    disconnect?: UserStarHistoryWhereUniqueInput | UserStarHistoryWhereUniqueInput[]
    delete?: UserStarHistoryWhereUniqueInput | UserStarHistoryWhereUniqueInput[]
    connect?: UserStarHistoryWhereUniqueInput | UserStarHistoryWhereUniqueInput[]
    update?: UserStarHistoryUpdateWithWhereUniqueWithoutGameResultInput | UserStarHistoryUpdateWithWhereUniqueWithoutGameResultInput[]
    updateMany?: UserStarHistoryUpdateManyWithWhereWithoutGameResultInput | UserStarHistoryUpdateManyWithWhereWithoutGameResultInput[]
    deleteMany?: UserStarHistoryScalarWhereInput | UserStarHistoryScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutUserMissionMapInput = {
    create?: XOR<UserCreateWithoutUserMissionMapInput, UserUncheckedCreateWithoutUserMissionMapInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserMissionMapInput
    connect?: UserWhereUniqueInput
  }

  export type MissionCreateNestedOneWithoutUserMissionMapInput = {
    create?: XOR<MissionCreateWithoutUserMissionMapInput, MissionUncheckedCreateWithoutUserMissionMapInput>
    connectOrCreate?: MissionCreateOrConnectWithoutUserMissionMapInput
    connect?: MissionWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutUserMissionMapNestedInput = {
    create?: XOR<UserCreateWithoutUserMissionMapInput, UserUncheckedCreateWithoutUserMissionMapInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserMissionMapInput
    upsert?: UserUpsertWithoutUserMissionMapInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUserMissionMapInput, UserUpdateWithoutUserMissionMapInput>, UserUncheckedUpdateWithoutUserMissionMapInput>
  }

  export type MissionUpdateOneRequiredWithoutUserMissionMapNestedInput = {
    create?: XOR<MissionCreateWithoutUserMissionMapInput, MissionUncheckedCreateWithoutUserMissionMapInput>
    connectOrCreate?: MissionCreateOrConnectWithoutUserMissionMapInput
    upsert?: MissionUpsertWithoutUserMissionMapInput
    connect?: MissionWhereUniqueInput
    update?: XOR<XOR<MissionUpdateToOneWithWhereWithoutUserMissionMapInput, MissionUpdateWithoutUserMissionMapInput>, MissionUncheckedUpdateWithoutUserMissionMapInput>
  }

  export type UserRewardMapCreateNestedManyWithoutUserInput = {
    create?: XOR<UserRewardMapCreateWithoutUserInput, UserRewardMapUncheckedCreateWithoutUserInput> | UserRewardMapCreateWithoutUserInput[] | UserRewardMapUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutUserInput | UserRewardMapCreateOrConnectWithoutUserInput[]
    createMany?: UserRewardMapCreateManyUserInputEnvelope
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
  }

  export type UserMissionMapCreateNestedManyWithoutUsersInput = {
    create?: XOR<UserMissionMapCreateWithoutUsersInput, UserMissionMapUncheckedCreateWithoutUsersInput> | UserMissionMapCreateWithoutUsersInput[] | UserMissionMapUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: UserMissionMapCreateOrConnectWithoutUsersInput | UserMissionMapCreateOrConnectWithoutUsersInput[]
    createMany?: UserMissionMapCreateManyUsersInputEnvelope
    connect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
  }

  export type GameResultCreateNestedManyWithoutUsersInput = {
    create?: XOR<GameResultCreateWithoutUsersInput, GameResultUncheckedCreateWithoutUsersInput> | GameResultCreateWithoutUsersInput[] | GameResultUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: GameResultCreateOrConnectWithoutUsersInput | GameResultCreateOrConnectWithoutUsersInput[]
    createMany?: GameResultCreateManyUsersInputEnvelope
    connect?: GameResultWhereUniqueInput | GameResultWhereUniqueInput[]
  }

  export type UserRewardMapUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserRewardMapCreateWithoutUserInput, UserRewardMapUncheckedCreateWithoutUserInput> | UserRewardMapCreateWithoutUserInput[] | UserRewardMapUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutUserInput | UserRewardMapCreateOrConnectWithoutUserInput[]
    createMany?: UserRewardMapCreateManyUserInputEnvelope
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
  }

  export type UserMissionMapUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<UserMissionMapCreateWithoutUsersInput, UserMissionMapUncheckedCreateWithoutUsersInput> | UserMissionMapCreateWithoutUsersInput[] | UserMissionMapUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: UserMissionMapCreateOrConnectWithoutUsersInput | UserMissionMapCreateOrConnectWithoutUsersInput[]
    createMany?: UserMissionMapCreateManyUsersInputEnvelope
    connect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
  }

  export type GameResultUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<GameResultCreateWithoutUsersInput, GameResultUncheckedCreateWithoutUsersInput> | GameResultCreateWithoutUsersInput[] | GameResultUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: GameResultCreateOrConnectWithoutUsersInput | GameResultCreateOrConnectWithoutUsersInput[]
    createMany?: GameResultCreateManyUsersInputEnvelope
    connect?: GameResultWhereUniqueInput | GameResultWhereUniqueInput[]
  }

  export type UserRewardMapUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserRewardMapCreateWithoutUserInput, UserRewardMapUncheckedCreateWithoutUserInput> | UserRewardMapCreateWithoutUserInput[] | UserRewardMapUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutUserInput | UserRewardMapCreateOrConnectWithoutUserInput[]
    upsert?: UserRewardMapUpsertWithWhereUniqueWithoutUserInput | UserRewardMapUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserRewardMapCreateManyUserInputEnvelope
    set?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    disconnect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    delete?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    update?: UserRewardMapUpdateWithWhereUniqueWithoutUserInput | UserRewardMapUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserRewardMapUpdateManyWithWhereWithoutUserInput | UserRewardMapUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserRewardMapScalarWhereInput | UserRewardMapScalarWhereInput[]
  }

  export type UserMissionMapUpdateManyWithoutUsersNestedInput = {
    create?: XOR<UserMissionMapCreateWithoutUsersInput, UserMissionMapUncheckedCreateWithoutUsersInput> | UserMissionMapCreateWithoutUsersInput[] | UserMissionMapUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: UserMissionMapCreateOrConnectWithoutUsersInput | UserMissionMapCreateOrConnectWithoutUsersInput[]
    upsert?: UserMissionMapUpsertWithWhereUniqueWithoutUsersInput | UserMissionMapUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: UserMissionMapCreateManyUsersInputEnvelope
    set?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    disconnect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    delete?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    connect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    update?: UserMissionMapUpdateWithWhereUniqueWithoutUsersInput | UserMissionMapUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: UserMissionMapUpdateManyWithWhereWithoutUsersInput | UserMissionMapUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: UserMissionMapScalarWhereInput | UserMissionMapScalarWhereInput[]
  }

  export type GameResultUpdateManyWithoutUsersNestedInput = {
    create?: XOR<GameResultCreateWithoutUsersInput, GameResultUncheckedCreateWithoutUsersInput> | GameResultCreateWithoutUsersInput[] | GameResultUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: GameResultCreateOrConnectWithoutUsersInput | GameResultCreateOrConnectWithoutUsersInput[]
    upsert?: GameResultUpsertWithWhereUniqueWithoutUsersInput | GameResultUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: GameResultCreateManyUsersInputEnvelope
    set?: GameResultWhereUniqueInput | GameResultWhereUniqueInput[]
    disconnect?: GameResultWhereUniqueInput | GameResultWhereUniqueInput[]
    delete?: GameResultWhereUniqueInput | GameResultWhereUniqueInput[]
    connect?: GameResultWhereUniqueInput | GameResultWhereUniqueInput[]
    update?: GameResultUpdateWithWhereUniqueWithoutUsersInput | GameResultUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: GameResultUpdateManyWithWhereWithoutUsersInput | GameResultUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: GameResultScalarWhereInput | GameResultScalarWhereInput[]
  }

  export type UserRewardMapUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserRewardMapCreateWithoutUserInput, UserRewardMapUncheckedCreateWithoutUserInput> | UserRewardMapCreateWithoutUserInput[] | UserRewardMapUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutUserInput | UserRewardMapCreateOrConnectWithoutUserInput[]
    upsert?: UserRewardMapUpsertWithWhereUniqueWithoutUserInput | UserRewardMapUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserRewardMapCreateManyUserInputEnvelope
    set?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    disconnect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    delete?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    update?: UserRewardMapUpdateWithWhereUniqueWithoutUserInput | UserRewardMapUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserRewardMapUpdateManyWithWhereWithoutUserInput | UserRewardMapUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserRewardMapScalarWhereInput | UserRewardMapScalarWhereInput[]
  }

  export type UserMissionMapUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<UserMissionMapCreateWithoutUsersInput, UserMissionMapUncheckedCreateWithoutUsersInput> | UserMissionMapCreateWithoutUsersInput[] | UserMissionMapUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: UserMissionMapCreateOrConnectWithoutUsersInput | UserMissionMapCreateOrConnectWithoutUsersInput[]
    upsert?: UserMissionMapUpsertWithWhereUniqueWithoutUsersInput | UserMissionMapUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: UserMissionMapCreateManyUsersInputEnvelope
    set?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    disconnect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    delete?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    connect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    update?: UserMissionMapUpdateWithWhereUniqueWithoutUsersInput | UserMissionMapUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: UserMissionMapUpdateManyWithWhereWithoutUsersInput | UserMissionMapUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: UserMissionMapScalarWhereInput | UserMissionMapScalarWhereInput[]
  }

  export type GameResultUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<GameResultCreateWithoutUsersInput, GameResultUncheckedCreateWithoutUsersInput> | GameResultCreateWithoutUsersInput[] | GameResultUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: GameResultCreateOrConnectWithoutUsersInput | GameResultCreateOrConnectWithoutUsersInput[]
    upsert?: GameResultUpsertWithWhereUniqueWithoutUsersInput | GameResultUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: GameResultCreateManyUsersInputEnvelope
    set?: GameResultWhereUniqueInput | GameResultWhereUniqueInput[]
    disconnect?: GameResultWhereUniqueInput | GameResultWhereUniqueInput[]
    delete?: GameResultWhereUniqueInput | GameResultWhereUniqueInput[]
    connect?: GameResultWhereUniqueInput | GameResultWhereUniqueInput[]
    update?: GameResultUpdateWithWhereUniqueWithoutUsersInput | GameResultUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: GameResultUpdateManyWithWhereWithoutUsersInput | GameResultUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: GameResultScalarWhereInput | GameResultScalarWhereInput[]
  }

  export type UserMissionMapCreateNestedManyWithoutMissionInput = {
    create?: XOR<UserMissionMapCreateWithoutMissionInput, UserMissionMapUncheckedCreateWithoutMissionInput> | UserMissionMapCreateWithoutMissionInput[] | UserMissionMapUncheckedCreateWithoutMissionInput[]
    connectOrCreate?: UserMissionMapCreateOrConnectWithoutMissionInput | UserMissionMapCreateOrConnectWithoutMissionInput[]
    createMany?: UserMissionMapCreateManyMissionInputEnvelope
    connect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
  }

  export type UserMissionMapUncheckedCreateNestedManyWithoutMissionInput = {
    create?: XOR<UserMissionMapCreateWithoutMissionInput, UserMissionMapUncheckedCreateWithoutMissionInput> | UserMissionMapCreateWithoutMissionInput[] | UserMissionMapUncheckedCreateWithoutMissionInput[]
    connectOrCreate?: UserMissionMapCreateOrConnectWithoutMissionInput | UserMissionMapCreateOrConnectWithoutMissionInput[]
    createMany?: UserMissionMapCreateManyMissionInputEnvelope
    connect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
  }

  export type EnumMission_typeFieldUpdateOperationsInput = {
    set?: $Enums.Mission_type
  }

  export type UserMissionMapUpdateManyWithoutMissionNestedInput = {
    create?: XOR<UserMissionMapCreateWithoutMissionInput, UserMissionMapUncheckedCreateWithoutMissionInput> | UserMissionMapCreateWithoutMissionInput[] | UserMissionMapUncheckedCreateWithoutMissionInput[]
    connectOrCreate?: UserMissionMapCreateOrConnectWithoutMissionInput | UserMissionMapCreateOrConnectWithoutMissionInput[]
    upsert?: UserMissionMapUpsertWithWhereUniqueWithoutMissionInput | UserMissionMapUpsertWithWhereUniqueWithoutMissionInput[]
    createMany?: UserMissionMapCreateManyMissionInputEnvelope
    set?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    disconnect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    delete?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    connect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    update?: UserMissionMapUpdateWithWhereUniqueWithoutMissionInput | UserMissionMapUpdateWithWhereUniqueWithoutMissionInput[]
    updateMany?: UserMissionMapUpdateManyWithWhereWithoutMissionInput | UserMissionMapUpdateManyWithWhereWithoutMissionInput[]
    deleteMany?: UserMissionMapScalarWhereInput | UserMissionMapScalarWhereInput[]
  }

  export type UserMissionMapUncheckedUpdateManyWithoutMissionNestedInput = {
    create?: XOR<UserMissionMapCreateWithoutMissionInput, UserMissionMapUncheckedCreateWithoutMissionInput> | UserMissionMapCreateWithoutMissionInput[] | UserMissionMapUncheckedCreateWithoutMissionInput[]
    connectOrCreate?: UserMissionMapCreateOrConnectWithoutMissionInput | UserMissionMapCreateOrConnectWithoutMissionInput[]
    upsert?: UserMissionMapUpsertWithWhereUniqueWithoutMissionInput | UserMissionMapUpsertWithWhereUniqueWithoutMissionInput[]
    createMany?: UserMissionMapCreateManyMissionInputEnvelope
    set?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    disconnect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    delete?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    connect?: UserMissionMapWhereUniqueInput | UserMissionMapWhereUniqueInput[]
    update?: UserMissionMapUpdateWithWhereUniqueWithoutMissionInput | UserMissionMapUpdateWithWhereUniqueWithoutMissionInput[]
    updateMany?: UserMissionMapUpdateManyWithWhereWithoutMissionInput | UserMissionMapUpdateManyWithWhereWithoutMissionInput[]
    deleteMany?: UserMissionMapScalarWhereInput | UserMissionMapScalarWhereInput[]
  }

  export type PromotionCodeCreateNestedOneWithoutUserRewardMapInput = {
    create?: XOR<PromotionCodeCreateWithoutUserRewardMapInput, PromotionCodeUncheckedCreateWithoutUserRewardMapInput>
    connectOrCreate?: PromotionCodeCreateOrConnectWithoutUserRewardMapInput
    connect?: PromotionCodeWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutUserRewardMapInput = {
    create?: XOR<UserCreateWithoutUserRewardMapInput, UserUncheckedCreateWithoutUserRewardMapInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserRewardMapInput
    connect?: UserWhereUniqueInput
  }

  export type RewardCreateNestedOneWithoutUserRewardMapInput = {
    create?: XOR<RewardCreateWithoutUserRewardMapInput, RewardUncheckedCreateWithoutUserRewardMapInput>
    connectOrCreate?: RewardCreateOrConnectWithoutUserRewardMapInput
    connect?: RewardWhereUniqueInput
  }

  export type PromotionCodeUpdateOneWithoutUserRewardMapNestedInput = {
    create?: XOR<PromotionCodeCreateWithoutUserRewardMapInput, PromotionCodeUncheckedCreateWithoutUserRewardMapInput>
    connectOrCreate?: PromotionCodeCreateOrConnectWithoutUserRewardMapInput
    upsert?: PromotionCodeUpsertWithoutUserRewardMapInput
    disconnect?: PromotionCodeWhereInput | boolean
    delete?: PromotionCodeWhereInput | boolean
    connect?: PromotionCodeWhereUniqueInput
    update?: XOR<XOR<PromotionCodeUpdateToOneWithWhereWithoutUserRewardMapInput, PromotionCodeUpdateWithoutUserRewardMapInput>, PromotionCodeUncheckedUpdateWithoutUserRewardMapInput>
  }

  export type UserUpdateOneWithoutUserRewardMapNestedInput = {
    create?: XOR<UserCreateWithoutUserRewardMapInput, UserUncheckedCreateWithoutUserRewardMapInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserRewardMapInput
    upsert?: UserUpsertWithoutUserRewardMapInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUserRewardMapInput, UserUpdateWithoutUserRewardMapInput>, UserUncheckedUpdateWithoutUserRewardMapInput>
  }

  export type RewardUpdateOneWithoutUserRewardMapNestedInput = {
    create?: XOR<RewardCreateWithoutUserRewardMapInput, RewardUncheckedCreateWithoutUserRewardMapInput>
    connectOrCreate?: RewardCreateOrConnectWithoutUserRewardMapInput
    upsert?: RewardUpsertWithoutUserRewardMapInput
    disconnect?: RewardWhereInput | boolean
    delete?: RewardWhereInput | boolean
    connect?: RewardWhereUniqueInput
    update?: XOR<XOR<RewardUpdateToOneWithWhereWithoutUserRewardMapInput, RewardUpdateWithoutUserRewardMapInput>, RewardUncheckedUpdateWithoutUserRewardMapInput>
  }

  export type UserRewardMapCreateNestedManyWithoutRewardInput = {
    create?: XOR<UserRewardMapCreateWithoutRewardInput, UserRewardMapUncheckedCreateWithoutRewardInput> | UserRewardMapCreateWithoutRewardInput[] | UserRewardMapUncheckedCreateWithoutRewardInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutRewardInput | UserRewardMapCreateOrConnectWithoutRewardInput[]
    createMany?: UserRewardMapCreateManyRewardInputEnvelope
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
  }

  export type UserRewardMapUncheckedCreateNestedManyWithoutRewardInput = {
    create?: XOR<UserRewardMapCreateWithoutRewardInput, UserRewardMapUncheckedCreateWithoutRewardInput> | UserRewardMapCreateWithoutRewardInput[] | UserRewardMapUncheckedCreateWithoutRewardInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutRewardInput | UserRewardMapCreateOrConnectWithoutRewardInput[]
    createMany?: UserRewardMapCreateManyRewardInputEnvelope
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
  }

  export type UserRewardMapUpdateManyWithoutRewardNestedInput = {
    create?: XOR<UserRewardMapCreateWithoutRewardInput, UserRewardMapUncheckedCreateWithoutRewardInput> | UserRewardMapCreateWithoutRewardInput[] | UserRewardMapUncheckedCreateWithoutRewardInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutRewardInput | UserRewardMapCreateOrConnectWithoutRewardInput[]
    upsert?: UserRewardMapUpsertWithWhereUniqueWithoutRewardInput | UserRewardMapUpsertWithWhereUniqueWithoutRewardInput[]
    createMany?: UserRewardMapCreateManyRewardInputEnvelope
    set?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    disconnect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    delete?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    update?: UserRewardMapUpdateWithWhereUniqueWithoutRewardInput | UserRewardMapUpdateWithWhereUniqueWithoutRewardInput[]
    updateMany?: UserRewardMapUpdateManyWithWhereWithoutRewardInput | UserRewardMapUpdateManyWithWhereWithoutRewardInput[]
    deleteMany?: UserRewardMapScalarWhereInput | UserRewardMapScalarWhereInput[]
  }

  export type UserRewardMapUncheckedUpdateManyWithoutRewardNestedInput = {
    create?: XOR<UserRewardMapCreateWithoutRewardInput, UserRewardMapUncheckedCreateWithoutRewardInput> | UserRewardMapCreateWithoutRewardInput[] | UserRewardMapUncheckedCreateWithoutRewardInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutRewardInput | UserRewardMapCreateOrConnectWithoutRewardInput[]
    upsert?: UserRewardMapUpsertWithWhereUniqueWithoutRewardInput | UserRewardMapUpsertWithWhereUniqueWithoutRewardInput[]
    createMany?: UserRewardMapCreateManyRewardInputEnvelope
    set?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    disconnect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    delete?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    update?: UserRewardMapUpdateWithWhereUniqueWithoutRewardInput | UserRewardMapUpdateWithWhereUniqueWithoutRewardInput[]
    updateMany?: UserRewardMapUpdateManyWithWhereWithoutRewardInput | UserRewardMapUpdateManyWithWhereWithoutRewardInput[]
    deleteMany?: UserRewardMapScalarWhereInput | UserRewardMapScalarWhereInput[]
  }

  export type UserRewardMapCreateNestedManyWithoutPromotionCodeInput = {
    create?: XOR<UserRewardMapCreateWithoutPromotionCodeInput, UserRewardMapUncheckedCreateWithoutPromotionCodeInput> | UserRewardMapCreateWithoutPromotionCodeInput[] | UserRewardMapUncheckedCreateWithoutPromotionCodeInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutPromotionCodeInput | UserRewardMapCreateOrConnectWithoutPromotionCodeInput[]
    createMany?: UserRewardMapCreateManyPromotionCodeInputEnvelope
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
  }

  export type UserRewardMapUncheckedCreateNestedManyWithoutPromotionCodeInput = {
    create?: XOR<UserRewardMapCreateWithoutPromotionCodeInput, UserRewardMapUncheckedCreateWithoutPromotionCodeInput> | UserRewardMapCreateWithoutPromotionCodeInput[] | UserRewardMapUncheckedCreateWithoutPromotionCodeInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutPromotionCodeInput | UserRewardMapCreateOrConnectWithoutPromotionCodeInput[]
    createMany?: UserRewardMapCreateManyPromotionCodeInputEnvelope
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type UserRewardMapUpdateManyWithoutPromotionCodeNestedInput = {
    create?: XOR<UserRewardMapCreateWithoutPromotionCodeInput, UserRewardMapUncheckedCreateWithoutPromotionCodeInput> | UserRewardMapCreateWithoutPromotionCodeInput[] | UserRewardMapUncheckedCreateWithoutPromotionCodeInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutPromotionCodeInput | UserRewardMapCreateOrConnectWithoutPromotionCodeInput[]
    upsert?: UserRewardMapUpsertWithWhereUniqueWithoutPromotionCodeInput | UserRewardMapUpsertWithWhereUniqueWithoutPromotionCodeInput[]
    createMany?: UserRewardMapCreateManyPromotionCodeInputEnvelope
    set?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    disconnect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    delete?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    update?: UserRewardMapUpdateWithWhereUniqueWithoutPromotionCodeInput | UserRewardMapUpdateWithWhereUniqueWithoutPromotionCodeInput[]
    updateMany?: UserRewardMapUpdateManyWithWhereWithoutPromotionCodeInput | UserRewardMapUpdateManyWithWhereWithoutPromotionCodeInput[]
    deleteMany?: UserRewardMapScalarWhereInput | UserRewardMapScalarWhereInput[]
  }

  export type UserRewardMapUncheckedUpdateManyWithoutPromotionCodeNestedInput = {
    create?: XOR<UserRewardMapCreateWithoutPromotionCodeInput, UserRewardMapUncheckedCreateWithoutPromotionCodeInput> | UserRewardMapCreateWithoutPromotionCodeInput[] | UserRewardMapUncheckedCreateWithoutPromotionCodeInput[]
    connectOrCreate?: UserRewardMapCreateOrConnectWithoutPromotionCodeInput | UserRewardMapCreateOrConnectWithoutPromotionCodeInput[]
    upsert?: UserRewardMapUpsertWithWhereUniqueWithoutPromotionCodeInput | UserRewardMapUpsertWithWhereUniqueWithoutPromotionCodeInput[]
    createMany?: UserRewardMapCreateManyPromotionCodeInputEnvelope
    set?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    disconnect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    delete?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    connect?: UserRewardMapWhereUniqueInput | UserRewardMapWhereUniqueInput[]
    update?: UserRewardMapUpdateWithWhereUniqueWithoutPromotionCodeInput | UserRewardMapUpdateWithWhereUniqueWithoutPromotionCodeInput[]
    updateMany?: UserRewardMapUpdateManyWithWhereWithoutPromotionCodeInput | UserRewardMapUpdateManyWithWhereWithoutPromotionCodeInput[]
    deleteMany?: UserRewardMapScalarWhereInput | UserRewardMapScalarWhereInput[]
  }

  export type GameResultCreateNestedOneWithoutUserStarHistoryInput = {
    create?: XOR<GameResultCreateWithoutUserStarHistoryInput, GameResultUncheckedCreateWithoutUserStarHistoryInput>
    connectOrCreate?: GameResultCreateOrConnectWithoutUserStarHistoryInput
    connect?: GameResultWhereUniqueInput
  }

  export type NullableEnumUserStarHistory_typeFieldUpdateOperationsInput = {
    set?: $Enums.UserStarHistory_type | null
  }

  export type GameResultUpdateOneWithoutUserStarHistoryNestedInput = {
    create?: XOR<GameResultCreateWithoutUserStarHistoryInput, GameResultUncheckedCreateWithoutUserStarHistoryInput>
    connectOrCreate?: GameResultCreateOrConnectWithoutUserStarHistoryInput
    upsert?: GameResultUpsertWithoutUserStarHistoryInput
    disconnect?: GameResultWhereInput | boolean
    delete?: GameResultWhereInput | boolean
    connect?: GameResultWhereUniqueInput
    update?: XOR<XOR<GameResultUpdateToOneWithWhereWithoutUserStarHistoryInput, GameResultUpdateWithoutUserStarHistoryInput>, GameResultUncheckedUpdateWithoutUserStarHistoryInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumMission_typeFilter<$PrismaModel = never> = {
    equals?: $Enums.Mission_type | EnumMission_typeFieldRefInput<$PrismaModel>
    in?: $Enums.Mission_type[]
    notIn?: $Enums.Mission_type[]
    not?: NestedEnumMission_typeFilter<$PrismaModel> | $Enums.Mission_type
  }

  export type NestedEnumMission_typeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Mission_type | EnumMission_typeFieldRefInput<$PrismaModel>
    in?: $Enums.Mission_type[]
    notIn?: $Enums.Mission_type[]
    not?: NestedEnumMission_typeWithAggregatesFilter<$PrismaModel> | $Enums.Mission_type
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMission_typeFilter<$PrismaModel>
    _max?: NestedEnumMission_typeFilter<$PrismaModel>
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedEnumUserStarHistory_typeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStarHistory_type | EnumUserStarHistory_typeFieldRefInput<$PrismaModel> | null
    in?: $Enums.UserStarHistory_type[] | null
    notIn?: $Enums.UserStarHistory_type[] | null
    not?: NestedEnumUserStarHistory_typeNullableFilter<$PrismaModel> | $Enums.UserStarHistory_type | null
  }

  export type NestedEnumUserStarHistory_typeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStarHistory_type | EnumUserStarHistory_typeFieldRefInput<$PrismaModel> | null
    in?: $Enums.UserStarHistory_type[] | null
    notIn?: $Enums.UserStarHistory_type[] | null
    not?: NestedEnumUserStarHistory_typeNullableWithAggregatesFilter<$PrismaModel> | $Enums.UserStarHistory_type | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumUserStarHistory_typeNullableFilter<$PrismaModel>
    _max?: NestedEnumUserStarHistory_typeNullableFilter<$PrismaModel>
  }

  export type UserStarHistoryCreateWithoutGameResultInput = {
    userId?: number | null
    oldStars?: number | null
    newStars?: number | null
    type?: $Enums.UserStarHistory_type | null
    createdAt?: Date | string | null
    targetId?: number | null
    branch?: string | null
  }

  export type UserStarHistoryUncheckedCreateWithoutGameResultInput = {
    id?: number
    userId?: number | null
    oldStars?: number | null
    newStars?: number | null
    type?: $Enums.UserStarHistory_type | null
    createdAt?: Date | string | null
    targetId?: number | null
    branch?: string | null
  }

  export type UserStarHistoryCreateOrConnectWithoutGameResultInput = {
    where: UserStarHistoryWhereUniqueInput
    create: XOR<UserStarHistoryCreateWithoutGameResultInput, UserStarHistoryUncheckedCreateWithoutGameResultInput>
  }

  export type UserStarHistoryCreateManyGameResultInputEnvelope = {
    data: UserStarHistoryCreateManyGameResultInput | UserStarHistoryCreateManyGameResultInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutGameResultsInput = {
    userName?: string | null
    userId: number
    rankId: number
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
    magicStone?: number
    branch: string
    UserRewardMap?: UserRewardMapCreateNestedManyWithoutUserInput
    UserMissionMap?: UserMissionMapCreateNestedManyWithoutUsersInput
  }

  export type UserUncheckedCreateWithoutGameResultsInput = {
    id?: number
    userName?: string | null
    userId: number
    rankId: number
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
    magicStone?: number
    branch: string
    UserRewardMap?: UserRewardMapUncheckedCreateNestedManyWithoutUserInput
    UserMissionMap?: UserMissionMapUncheckedCreateNestedManyWithoutUsersInput
  }

  export type UserCreateOrConnectWithoutGameResultsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutGameResultsInput, UserUncheckedCreateWithoutGameResultsInput>
  }

  export type UserStarHistoryUpsertWithWhereUniqueWithoutGameResultInput = {
    where: UserStarHistoryWhereUniqueInput
    update: XOR<UserStarHistoryUpdateWithoutGameResultInput, UserStarHistoryUncheckedUpdateWithoutGameResultInput>
    create: XOR<UserStarHistoryCreateWithoutGameResultInput, UserStarHistoryUncheckedCreateWithoutGameResultInput>
  }

  export type UserStarHistoryUpdateWithWhereUniqueWithoutGameResultInput = {
    where: UserStarHistoryWhereUniqueInput
    data: XOR<UserStarHistoryUpdateWithoutGameResultInput, UserStarHistoryUncheckedUpdateWithoutGameResultInput>
  }

  export type UserStarHistoryUpdateManyWithWhereWithoutGameResultInput = {
    where: UserStarHistoryScalarWhereInput
    data: XOR<UserStarHistoryUpdateManyMutationInput, UserStarHistoryUncheckedUpdateManyWithoutGameResultInput>
  }

  export type UserStarHistoryScalarWhereInput = {
    AND?: UserStarHistoryScalarWhereInput | UserStarHistoryScalarWhereInput[]
    OR?: UserStarHistoryScalarWhereInput[]
    NOT?: UserStarHistoryScalarWhereInput | UserStarHistoryScalarWhereInput[]
    id?: IntFilter<"UserStarHistory"> | number
    userId?: IntNullableFilter<"UserStarHistory"> | number | null
    oldStars?: IntNullableFilter<"UserStarHistory"> | number | null
    newStars?: IntNullableFilter<"UserStarHistory"> | number | null
    type?: EnumUserStarHistory_typeNullableFilter<"UserStarHistory"> | $Enums.UserStarHistory_type | null
    createdAt?: DateTimeNullableFilter<"UserStarHistory"> | Date | string | null
    targetId?: IntNullableFilter<"UserStarHistory"> | number | null
    branch?: StringNullableFilter<"UserStarHistory"> | string | null
    gameResultId?: IntNullableFilter<"UserStarHistory"> | number | null
  }

  export type UserUpsertWithoutGameResultsInput = {
    update: XOR<UserUpdateWithoutGameResultsInput, UserUncheckedUpdateWithoutGameResultsInput>
    create: XOR<UserCreateWithoutGameResultsInput, UserUncheckedCreateWithoutGameResultsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutGameResultsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutGameResultsInput, UserUncheckedUpdateWithoutGameResultsInput>
  }

  export type UserUpdateWithoutGameResultsInput = {
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: IntFieldUpdateOperationsInput | number
    rankId?: IntFieldUpdateOperationsInput | number
    stars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    magicStone?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    UserRewardMap?: UserRewardMapUpdateManyWithoutUserNestedInput
    UserMissionMap?: UserMissionMapUpdateManyWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateWithoutGameResultsInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: IntFieldUpdateOperationsInput | number
    rankId?: IntFieldUpdateOperationsInput | number
    stars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    magicStone?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    UserRewardMap?: UserRewardMapUncheckedUpdateManyWithoutUserNestedInput
    UserMissionMap?: UserMissionMapUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type UserCreateWithoutUserMissionMapInput = {
    userName?: string | null
    userId: number
    rankId: number
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
    magicStone?: number
    branch: string
    UserRewardMap?: UserRewardMapCreateNestedManyWithoutUserInput
    GameResults?: GameResultCreateNestedManyWithoutUsersInput
  }

  export type UserUncheckedCreateWithoutUserMissionMapInput = {
    id?: number
    userName?: string | null
    userId: number
    rankId: number
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
    magicStone?: number
    branch: string
    UserRewardMap?: UserRewardMapUncheckedCreateNestedManyWithoutUserInput
    GameResults?: GameResultUncheckedCreateNestedManyWithoutUsersInput
  }

  export type UserCreateOrConnectWithoutUserMissionMapInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUserMissionMapInput, UserUncheckedCreateWithoutUserMissionMapInput>
  }

  export type MissionCreateWithoutUserMissionMapInput = {
    name: string
    description: string
    reward: number
    startHours: number
    endHours: number
    createdAt?: Date | string
    quantity: number
    type: $Enums.Mission_type
  }

  export type MissionUncheckedCreateWithoutUserMissionMapInput = {
    id?: number
    name: string
    description: string
    reward: number
    startHours: number
    endHours: number
    createdAt?: Date | string
    quantity: number
    type: $Enums.Mission_type
  }

  export type MissionCreateOrConnectWithoutUserMissionMapInput = {
    where: MissionWhereUniqueInput
    create: XOR<MissionCreateWithoutUserMissionMapInput, MissionUncheckedCreateWithoutUserMissionMapInput>
  }

  export type UserUpsertWithoutUserMissionMapInput = {
    update: XOR<UserUpdateWithoutUserMissionMapInput, UserUncheckedUpdateWithoutUserMissionMapInput>
    create: XOR<UserCreateWithoutUserMissionMapInput, UserUncheckedCreateWithoutUserMissionMapInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUserMissionMapInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUserMissionMapInput, UserUncheckedUpdateWithoutUserMissionMapInput>
  }

  export type UserUpdateWithoutUserMissionMapInput = {
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: IntFieldUpdateOperationsInput | number
    rankId?: IntFieldUpdateOperationsInput | number
    stars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    magicStone?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    UserRewardMap?: UserRewardMapUpdateManyWithoutUserNestedInput
    GameResults?: GameResultUpdateManyWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateWithoutUserMissionMapInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: IntFieldUpdateOperationsInput | number
    rankId?: IntFieldUpdateOperationsInput | number
    stars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    magicStone?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    UserRewardMap?: UserRewardMapUncheckedUpdateManyWithoutUserNestedInput
    GameResults?: GameResultUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type MissionUpsertWithoutUserMissionMapInput = {
    update: XOR<MissionUpdateWithoutUserMissionMapInput, MissionUncheckedUpdateWithoutUserMissionMapInput>
    create: XOR<MissionCreateWithoutUserMissionMapInput, MissionUncheckedCreateWithoutUserMissionMapInput>
    where?: MissionWhereInput
  }

  export type MissionUpdateToOneWithWhereWithoutUserMissionMapInput = {
    where?: MissionWhereInput
    data: XOR<MissionUpdateWithoutUserMissionMapInput, MissionUncheckedUpdateWithoutUserMissionMapInput>
  }

  export type MissionUpdateWithoutUserMissionMapInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    reward?: FloatFieldUpdateOperationsInput | number
    startHours?: IntFieldUpdateOperationsInput | number
    endHours?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: IntFieldUpdateOperationsInput | number
    type?: EnumMission_typeFieldUpdateOperationsInput | $Enums.Mission_type
  }

  export type MissionUncheckedUpdateWithoutUserMissionMapInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    reward?: FloatFieldUpdateOperationsInput | number
    startHours?: IntFieldUpdateOperationsInput | number
    endHours?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    quantity?: IntFieldUpdateOperationsInput | number
    type?: EnumMission_typeFieldUpdateOperationsInput | $Enums.Mission_type
  }

  export type UserRewardMapCreateWithoutUserInput = {
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
    promotionCode?: PromotionCodeCreateNestedOneWithoutUserRewardMapInput
    reward?: RewardCreateNestedOneWithoutUserRewardMapInput
  }

  export type UserRewardMapUncheckedCreateWithoutUserInput = {
    id?: number
    rewardId?: number | null
    promotionCodeId?: number | null
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
  }

  export type UserRewardMapCreateOrConnectWithoutUserInput = {
    where: UserRewardMapWhereUniqueInput
    create: XOR<UserRewardMapCreateWithoutUserInput, UserRewardMapUncheckedCreateWithoutUserInput>
  }

  export type UserRewardMapCreateManyUserInputEnvelope = {
    data: UserRewardMapCreateManyUserInput | UserRewardMapCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserMissionMapCreateWithoutUsersInput = {
    branch: string
    isDone?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mission: MissionCreateNestedOneWithoutUserMissionMapInput
  }

  export type UserMissionMapUncheckedCreateWithoutUsersInput = {
    id?: number
    missionId: number
    branch: string
    isDone?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserMissionMapCreateOrConnectWithoutUsersInput = {
    where: UserMissionMapWhereUniqueInput
    create: XOR<UserMissionMapCreateWithoutUsersInput, UserMissionMapUncheckedCreateWithoutUsersInput>
  }

  export type UserMissionMapCreateManyUsersInputEnvelope = {
    data: UserMissionMapCreateManyUsersInput | UserMissionMapCreateManyUsersInput[]
    skipDuplicates?: boolean
  }

  export type GameResultCreateWithoutUsersInput = {
    itemId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    userStarHistory?: UserStarHistoryCreateNestedManyWithoutGameResultInput
  }

  export type GameResultUncheckedCreateWithoutUsersInput = {
    id?: number
    itemId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    userStarHistory?: UserStarHistoryUncheckedCreateNestedManyWithoutGameResultInput
  }

  export type GameResultCreateOrConnectWithoutUsersInput = {
    where: GameResultWhereUniqueInput
    create: XOR<GameResultCreateWithoutUsersInput, GameResultUncheckedCreateWithoutUsersInput>
  }

  export type GameResultCreateManyUsersInputEnvelope = {
    data: GameResultCreateManyUsersInput | GameResultCreateManyUsersInput[]
    skipDuplicates?: boolean
  }

  export type UserRewardMapUpsertWithWhereUniqueWithoutUserInput = {
    where: UserRewardMapWhereUniqueInput
    update: XOR<UserRewardMapUpdateWithoutUserInput, UserRewardMapUncheckedUpdateWithoutUserInput>
    create: XOR<UserRewardMapCreateWithoutUserInput, UserRewardMapUncheckedCreateWithoutUserInput>
  }

  export type UserRewardMapUpdateWithWhereUniqueWithoutUserInput = {
    where: UserRewardMapWhereUniqueInput
    data: XOR<UserRewardMapUpdateWithoutUserInput, UserRewardMapUncheckedUpdateWithoutUserInput>
  }

  export type UserRewardMapUpdateManyWithWhereWithoutUserInput = {
    where: UserRewardMapScalarWhereInput
    data: XOR<UserRewardMapUpdateManyMutationInput, UserRewardMapUncheckedUpdateManyWithoutUserInput>
  }

  export type UserRewardMapScalarWhereInput = {
    AND?: UserRewardMapScalarWhereInput | UserRewardMapScalarWhereInput[]
    OR?: UserRewardMapScalarWhereInput[]
    NOT?: UserRewardMapScalarWhereInput | UserRewardMapScalarWhereInput[]
    id?: IntFilter<"UserRewardMap"> | number
    userId?: IntNullableFilter<"UserRewardMap"> | number | null
    rewardId?: IntNullableFilter<"UserRewardMap"> | number | null
    promotionCodeId?: IntNullableFilter<"UserRewardMap"> | number | null
    duration?: IntNullableFilter<"UserRewardMap"> | number | null
    createdAt?: DateTimeNullableFilter<"UserRewardMap"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"UserRewardMap"> | Date | string | null
    isUsed?: BoolFilter<"UserRewardMap"> | boolean
    branch?: StringNullableFilter<"UserRewardMap"> | string | null
  }

  export type UserMissionMapUpsertWithWhereUniqueWithoutUsersInput = {
    where: UserMissionMapWhereUniqueInput
    update: XOR<UserMissionMapUpdateWithoutUsersInput, UserMissionMapUncheckedUpdateWithoutUsersInput>
    create: XOR<UserMissionMapCreateWithoutUsersInput, UserMissionMapUncheckedCreateWithoutUsersInput>
  }

  export type UserMissionMapUpdateWithWhereUniqueWithoutUsersInput = {
    where: UserMissionMapWhereUniqueInput
    data: XOR<UserMissionMapUpdateWithoutUsersInput, UserMissionMapUncheckedUpdateWithoutUsersInput>
  }

  export type UserMissionMapUpdateManyWithWhereWithoutUsersInput = {
    where: UserMissionMapScalarWhereInput
    data: XOR<UserMissionMapUpdateManyMutationInput, UserMissionMapUncheckedUpdateManyWithoutUsersInput>
  }

  export type UserMissionMapScalarWhereInput = {
    AND?: UserMissionMapScalarWhereInput | UserMissionMapScalarWhereInput[]
    OR?: UserMissionMapScalarWhereInput[]
    NOT?: UserMissionMapScalarWhereInput | UserMissionMapScalarWhereInput[]
    id?: IntFilter<"UserMissionMap"> | number
    userId?: IntFilter<"UserMissionMap"> | number
    missionId?: IntFilter<"UserMissionMap"> | number
    branch?: StringFilter<"UserMissionMap"> | string
    isDone?: BoolFilter<"UserMissionMap"> | boolean
    createdAt?: DateTimeFilter<"UserMissionMap"> | Date | string
    updatedAt?: DateTimeFilter<"UserMissionMap"> | Date | string
  }

  export type GameResultUpsertWithWhereUniqueWithoutUsersInput = {
    where: GameResultWhereUniqueInput
    update: XOR<GameResultUpdateWithoutUsersInput, GameResultUncheckedUpdateWithoutUsersInput>
    create: XOR<GameResultCreateWithoutUsersInput, GameResultUncheckedCreateWithoutUsersInput>
  }

  export type GameResultUpdateWithWhereUniqueWithoutUsersInput = {
    where: GameResultWhereUniqueInput
    data: XOR<GameResultUpdateWithoutUsersInput, GameResultUncheckedUpdateWithoutUsersInput>
  }

  export type GameResultUpdateManyWithWhereWithoutUsersInput = {
    where: GameResultScalarWhereInput
    data: XOR<GameResultUpdateManyMutationInput, GameResultUncheckedUpdateManyWithoutUsersInput>
  }

  export type GameResultScalarWhereInput = {
    AND?: GameResultScalarWhereInput | GameResultScalarWhereInput[]
    OR?: GameResultScalarWhereInput[]
    NOT?: GameResultScalarWhereInput | GameResultScalarWhereInput[]
    id?: IntFilter<"GameResult"> | number
    userId?: IntFilter<"GameResult"> | number
    itemId?: IntFilter<"GameResult"> | number
    createdAt?: DateTimeFilter<"GameResult"> | Date | string
    updatedAt?: DateTimeFilter<"GameResult"> | Date | string
  }

  export type UserMissionMapCreateWithoutMissionInput = {
    branch: string
    isDone?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    users: UserCreateNestedOneWithoutUserMissionMapInput
  }

  export type UserMissionMapUncheckedCreateWithoutMissionInput = {
    id?: number
    userId: number
    branch: string
    isDone?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserMissionMapCreateOrConnectWithoutMissionInput = {
    where: UserMissionMapWhereUniqueInput
    create: XOR<UserMissionMapCreateWithoutMissionInput, UserMissionMapUncheckedCreateWithoutMissionInput>
  }

  export type UserMissionMapCreateManyMissionInputEnvelope = {
    data: UserMissionMapCreateManyMissionInput | UserMissionMapCreateManyMissionInput[]
    skipDuplicates?: boolean
  }

  export type UserMissionMapUpsertWithWhereUniqueWithoutMissionInput = {
    where: UserMissionMapWhereUniqueInput
    update: XOR<UserMissionMapUpdateWithoutMissionInput, UserMissionMapUncheckedUpdateWithoutMissionInput>
    create: XOR<UserMissionMapCreateWithoutMissionInput, UserMissionMapUncheckedCreateWithoutMissionInput>
  }

  export type UserMissionMapUpdateWithWhereUniqueWithoutMissionInput = {
    where: UserMissionMapWhereUniqueInput
    data: XOR<UserMissionMapUpdateWithoutMissionInput, UserMissionMapUncheckedUpdateWithoutMissionInput>
  }

  export type UserMissionMapUpdateManyWithWhereWithoutMissionInput = {
    where: UserMissionMapScalarWhereInput
    data: XOR<UserMissionMapUpdateManyMutationInput, UserMissionMapUncheckedUpdateManyWithoutMissionInput>
  }

  export type PromotionCodeCreateWithoutUserRewardMapInput = {
    name?: string | null
    code?: string | null
    value?: number | null
    branch?: string | null
    isUsed?: boolean | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type PromotionCodeUncheckedCreateWithoutUserRewardMapInput = {
    id?: number
    name?: string | null
    code?: string | null
    value?: number | null
    branch?: string | null
    isUsed?: boolean | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type PromotionCodeCreateOrConnectWithoutUserRewardMapInput = {
    where: PromotionCodeWhereUniqueInput
    create: XOR<PromotionCodeCreateWithoutUserRewardMapInput, PromotionCodeUncheckedCreateWithoutUserRewardMapInput>
  }

  export type UserCreateWithoutUserRewardMapInput = {
    userName?: string | null
    userId: number
    rankId: number
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
    magicStone?: number
    branch: string
    UserMissionMap?: UserMissionMapCreateNestedManyWithoutUsersInput
    GameResults?: GameResultCreateNestedManyWithoutUsersInput
  }

  export type UserUncheckedCreateWithoutUserRewardMapInput = {
    id?: number
    userName?: string | null
    userId: number
    rankId: number
    stars: number
    createdAt?: Date | string
    updatedAt?: Date | string
    magicStone?: number
    branch: string
    UserMissionMap?: UserMissionMapUncheckedCreateNestedManyWithoutUsersInput
    GameResults?: GameResultUncheckedCreateNestedManyWithoutUsersInput
  }

  export type UserCreateOrConnectWithoutUserRewardMapInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUserRewardMapInput, UserUncheckedCreateWithoutUserRewardMapInput>
  }

  export type RewardCreateWithoutUserRewardMapInput = {
    name?: string | null
    stars?: number | null
    value?: number | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    createdAt?: Date | string | null
    updateAt?: Date | string | null
  }

  export type RewardUncheckedCreateWithoutUserRewardMapInput = {
    id?: number
    name?: string | null
    stars?: number | null
    value?: number | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    createdAt?: Date | string | null
    updateAt?: Date | string | null
  }

  export type RewardCreateOrConnectWithoutUserRewardMapInput = {
    where: RewardWhereUniqueInput
    create: XOR<RewardCreateWithoutUserRewardMapInput, RewardUncheckedCreateWithoutUserRewardMapInput>
  }

  export type PromotionCodeUpsertWithoutUserRewardMapInput = {
    update: XOR<PromotionCodeUpdateWithoutUserRewardMapInput, PromotionCodeUncheckedUpdateWithoutUserRewardMapInput>
    create: XOR<PromotionCodeCreateWithoutUserRewardMapInput, PromotionCodeUncheckedCreateWithoutUserRewardMapInput>
    where?: PromotionCodeWhereInput
  }

  export type PromotionCodeUpdateToOneWithWhereWithoutUserRewardMapInput = {
    where?: PromotionCodeWhereInput
    data: XOR<PromotionCodeUpdateWithoutUserRewardMapInput, PromotionCodeUncheckedUpdateWithoutUserRewardMapInput>
  }

  export type PromotionCodeUpdateWithoutUserRewardMapInput = {
    name?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    isUsed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PromotionCodeUncheckedUpdateWithoutUserRewardMapInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    isUsed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUpsertWithoutUserRewardMapInput = {
    update: XOR<UserUpdateWithoutUserRewardMapInput, UserUncheckedUpdateWithoutUserRewardMapInput>
    create: XOR<UserCreateWithoutUserRewardMapInput, UserUncheckedCreateWithoutUserRewardMapInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUserRewardMapInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUserRewardMapInput, UserUncheckedUpdateWithoutUserRewardMapInput>
  }

  export type UserUpdateWithoutUserRewardMapInput = {
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: IntFieldUpdateOperationsInput | number
    rankId?: IntFieldUpdateOperationsInput | number
    stars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    magicStone?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    UserMissionMap?: UserMissionMapUpdateManyWithoutUsersNestedInput
    GameResults?: GameResultUpdateManyWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateWithoutUserRewardMapInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: IntFieldUpdateOperationsInput | number
    rankId?: IntFieldUpdateOperationsInput | number
    stars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    magicStone?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    UserMissionMap?: UserMissionMapUncheckedUpdateManyWithoutUsersNestedInput
    GameResults?: GameResultUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type RewardUpsertWithoutUserRewardMapInput = {
    update: XOR<RewardUpdateWithoutUserRewardMapInput, RewardUncheckedUpdateWithoutUserRewardMapInput>
    create: XOR<RewardCreateWithoutUserRewardMapInput, RewardUncheckedCreateWithoutUserRewardMapInput>
    where?: RewardWhereInput
  }

  export type RewardUpdateToOneWithWhereWithoutUserRewardMapInput = {
    where?: RewardWhereInput
    data: XOR<RewardUpdateWithoutUserRewardMapInput, RewardUncheckedUpdateWithoutUserRewardMapInput>
  }

  export type RewardUpdateWithoutUserRewardMapInput = {
    name?: NullableStringFieldUpdateOperationsInput | string | null
    stars?: NullableIntFieldUpdateOperationsInput | number | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updateAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RewardUncheckedUpdateWithoutUserRewardMapInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: NullableStringFieldUpdateOperationsInput | string | null
    stars?: NullableIntFieldUpdateOperationsInput | number | null
    value?: NullableIntFieldUpdateOperationsInput | number | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updateAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserRewardMapCreateWithoutRewardInput = {
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
    promotionCode?: PromotionCodeCreateNestedOneWithoutUserRewardMapInput
    user?: UserCreateNestedOneWithoutUserRewardMapInput
  }

  export type UserRewardMapUncheckedCreateWithoutRewardInput = {
    id?: number
    userId?: number | null
    promotionCodeId?: number | null
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
  }

  export type UserRewardMapCreateOrConnectWithoutRewardInput = {
    where: UserRewardMapWhereUniqueInput
    create: XOR<UserRewardMapCreateWithoutRewardInput, UserRewardMapUncheckedCreateWithoutRewardInput>
  }

  export type UserRewardMapCreateManyRewardInputEnvelope = {
    data: UserRewardMapCreateManyRewardInput | UserRewardMapCreateManyRewardInput[]
    skipDuplicates?: boolean
  }

  export type UserRewardMapUpsertWithWhereUniqueWithoutRewardInput = {
    where: UserRewardMapWhereUniqueInput
    update: XOR<UserRewardMapUpdateWithoutRewardInput, UserRewardMapUncheckedUpdateWithoutRewardInput>
    create: XOR<UserRewardMapCreateWithoutRewardInput, UserRewardMapUncheckedCreateWithoutRewardInput>
  }

  export type UserRewardMapUpdateWithWhereUniqueWithoutRewardInput = {
    where: UserRewardMapWhereUniqueInput
    data: XOR<UserRewardMapUpdateWithoutRewardInput, UserRewardMapUncheckedUpdateWithoutRewardInput>
  }

  export type UserRewardMapUpdateManyWithWhereWithoutRewardInput = {
    where: UserRewardMapScalarWhereInput
    data: XOR<UserRewardMapUpdateManyMutationInput, UserRewardMapUncheckedUpdateManyWithoutRewardInput>
  }

  export type UserRewardMapCreateWithoutPromotionCodeInput = {
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
    user?: UserCreateNestedOneWithoutUserRewardMapInput
    reward?: RewardCreateNestedOneWithoutUserRewardMapInput
  }

  export type UserRewardMapUncheckedCreateWithoutPromotionCodeInput = {
    id?: number
    userId?: number | null
    rewardId?: number | null
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
  }

  export type UserRewardMapCreateOrConnectWithoutPromotionCodeInput = {
    where: UserRewardMapWhereUniqueInput
    create: XOR<UserRewardMapCreateWithoutPromotionCodeInput, UserRewardMapUncheckedCreateWithoutPromotionCodeInput>
  }

  export type UserRewardMapCreateManyPromotionCodeInputEnvelope = {
    data: UserRewardMapCreateManyPromotionCodeInput | UserRewardMapCreateManyPromotionCodeInput[]
    skipDuplicates?: boolean
  }

  export type UserRewardMapUpsertWithWhereUniqueWithoutPromotionCodeInput = {
    where: UserRewardMapWhereUniqueInput
    update: XOR<UserRewardMapUpdateWithoutPromotionCodeInput, UserRewardMapUncheckedUpdateWithoutPromotionCodeInput>
    create: XOR<UserRewardMapCreateWithoutPromotionCodeInput, UserRewardMapUncheckedCreateWithoutPromotionCodeInput>
  }

  export type UserRewardMapUpdateWithWhereUniqueWithoutPromotionCodeInput = {
    where: UserRewardMapWhereUniqueInput
    data: XOR<UserRewardMapUpdateWithoutPromotionCodeInput, UserRewardMapUncheckedUpdateWithoutPromotionCodeInput>
  }

  export type UserRewardMapUpdateManyWithWhereWithoutPromotionCodeInput = {
    where: UserRewardMapScalarWhereInput
    data: XOR<UserRewardMapUpdateManyMutationInput, UserRewardMapUncheckedUpdateManyWithoutPromotionCodeInput>
  }

  export type GameResultCreateWithoutUserStarHistoryInput = {
    itemId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    users: UserCreateNestedOneWithoutGameResultsInput
  }

  export type GameResultUncheckedCreateWithoutUserStarHistoryInput = {
    id?: number
    userId: number
    itemId: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GameResultCreateOrConnectWithoutUserStarHistoryInput = {
    where: GameResultWhereUniqueInput
    create: XOR<GameResultCreateWithoutUserStarHistoryInput, GameResultUncheckedCreateWithoutUserStarHistoryInput>
  }

  export type GameResultUpsertWithoutUserStarHistoryInput = {
    update: XOR<GameResultUpdateWithoutUserStarHistoryInput, GameResultUncheckedUpdateWithoutUserStarHistoryInput>
    create: XOR<GameResultCreateWithoutUserStarHistoryInput, GameResultUncheckedCreateWithoutUserStarHistoryInput>
    where?: GameResultWhereInput
  }

  export type GameResultUpdateToOneWithWhereWithoutUserStarHistoryInput = {
    where?: GameResultWhereInput
    data: XOR<GameResultUpdateWithoutUserStarHistoryInput, GameResultUncheckedUpdateWithoutUserStarHistoryInput>
  }

  export type GameResultUpdateWithoutUserStarHistoryInput = {
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateOneRequiredWithoutGameResultsNestedInput
  }

  export type GameResultUncheckedUpdateWithoutUserStarHistoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserStarHistoryCreateManyGameResultInput = {
    id?: number
    userId?: number | null
    oldStars?: number | null
    newStars?: number | null
    type?: $Enums.UserStarHistory_type | null
    createdAt?: Date | string | null
    targetId?: number | null
    branch?: string | null
  }

  export type UserStarHistoryUpdateWithoutGameResultInput = {
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    oldStars?: NullableIntFieldUpdateOperationsInput | number | null
    newStars?: NullableIntFieldUpdateOperationsInput | number | null
    type?: NullableEnumUserStarHistory_typeFieldUpdateOperationsInput | $Enums.UserStarHistory_type | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    targetId?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserStarHistoryUncheckedUpdateWithoutGameResultInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    oldStars?: NullableIntFieldUpdateOperationsInput | number | null
    newStars?: NullableIntFieldUpdateOperationsInput | number | null
    type?: NullableEnumUserStarHistory_typeFieldUpdateOperationsInput | $Enums.UserStarHistory_type | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    targetId?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserStarHistoryUncheckedUpdateManyWithoutGameResultInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    oldStars?: NullableIntFieldUpdateOperationsInput | number | null
    newStars?: NullableIntFieldUpdateOperationsInput | number | null
    type?: NullableEnumUserStarHistory_typeFieldUpdateOperationsInput | $Enums.UserStarHistory_type | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    targetId?: NullableIntFieldUpdateOperationsInput | number | null
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserRewardMapCreateManyUserInput = {
    id?: number
    rewardId?: number | null
    promotionCodeId?: number | null
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
  }

  export type UserMissionMapCreateManyUsersInput = {
    id?: number
    missionId: number
    branch: string
    isDone?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GameResultCreateManyUsersInput = {
    id?: number
    itemId: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserRewardMapUpdateWithoutUserInput = {
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    promotionCode?: PromotionCodeUpdateOneWithoutUserRewardMapNestedInput
    reward?: RewardUpdateOneWithoutUserRewardMapNestedInput
  }

  export type UserRewardMapUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    rewardId?: NullableIntFieldUpdateOperationsInput | number | null
    promotionCodeId?: NullableIntFieldUpdateOperationsInput | number | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserRewardMapUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    rewardId?: NullableIntFieldUpdateOperationsInput | number | null
    promotionCodeId?: NullableIntFieldUpdateOperationsInput | number | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserMissionMapUpdateWithoutUsersInput = {
    branch?: StringFieldUpdateOperationsInput | string
    isDone?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mission?: MissionUpdateOneRequiredWithoutUserMissionMapNestedInput
  }

  export type UserMissionMapUncheckedUpdateWithoutUsersInput = {
    id?: IntFieldUpdateOperationsInput | number
    missionId?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    isDone?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMissionMapUncheckedUpdateManyWithoutUsersInput = {
    id?: IntFieldUpdateOperationsInput | number
    missionId?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    isDone?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameResultUpdateWithoutUsersInput = {
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userStarHistory?: UserStarHistoryUpdateManyWithoutGameResultNestedInput
  }

  export type GameResultUncheckedUpdateWithoutUsersInput = {
    id?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userStarHistory?: UserStarHistoryUncheckedUpdateManyWithoutGameResultNestedInput
  }

  export type GameResultUncheckedUpdateManyWithoutUsersInput = {
    id?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMissionMapCreateManyMissionInput = {
    id?: number
    userId: number
    branch: string
    isDone?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserMissionMapUpdateWithoutMissionInput = {
    branch?: StringFieldUpdateOperationsInput | string
    isDone?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateOneRequiredWithoutUserMissionMapNestedInput
  }

  export type UserMissionMapUncheckedUpdateWithoutMissionInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    isDone?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMissionMapUncheckedUpdateManyWithoutMissionInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    branch?: StringFieldUpdateOperationsInput | string
    isDone?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserRewardMapCreateManyRewardInput = {
    id?: number
    userId?: number | null
    promotionCodeId?: number | null
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
  }

  export type UserRewardMapUpdateWithoutRewardInput = {
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    promotionCode?: PromotionCodeUpdateOneWithoutUserRewardMapNestedInput
    user?: UserUpdateOneWithoutUserRewardMapNestedInput
  }

  export type UserRewardMapUncheckedUpdateWithoutRewardInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    promotionCodeId?: NullableIntFieldUpdateOperationsInput | number | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserRewardMapUncheckedUpdateManyWithoutRewardInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    promotionCodeId?: NullableIntFieldUpdateOperationsInput | number | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserRewardMapCreateManyPromotionCodeInput = {
    id?: number
    userId?: number | null
    rewardId?: number | null
    duration?: number | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    isUsed?: boolean
    branch?: string | null
  }

  export type UserRewardMapUpdateWithoutPromotionCodeInput = {
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneWithoutUserRewardMapNestedInput
    reward?: RewardUpdateOneWithoutUserRewardMapNestedInput
  }

  export type UserRewardMapUncheckedUpdateWithoutPromotionCodeInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    rewardId?: NullableIntFieldUpdateOperationsInput | number | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserRewardMapUncheckedUpdateManyWithoutPromotionCodeInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    rewardId?: NullableIntFieldUpdateOperationsInput | number | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isUsed?: BoolFieldUpdateOperationsInput | boolean
    branch?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use GameResultCountOutputTypeDefaultArgs instead
     */
    export type GameResultCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GameResultCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MissionCountOutputTypeDefaultArgs instead
     */
    export type MissionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MissionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RewardCountOutputTypeDefaultArgs instead
     */
    export type RewardCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RewardCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PromotionCodeCountOutputTypeDefaultArgs instead
     */
    export type PromotionCodeCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PromotionCodeCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RankDefaultArgs instead
     */
    export type RankArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RankDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GameDefaultArgs instead
     */
    export type GameArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GameDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CheckInResultDefaultArgs instead
     */
    export type CheckInResultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CheckInResultDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CheckInItemDefaultArgs instead
     */
    export type CheckInItemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CheckInItemDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CheckInPromotionDefaultArgs instead
     */
    export type CheckInPromotionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CheckInPromotionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ItemDefaultArgs instead
     */
    export type ItemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ItemDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GameItemMapDefaultArgs instead
     */
    export type GameItemMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GameItemMapDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GameResultDefaultArgs instead
     */
    export type GameResultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GameResultDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserMissionMapDefaultArgs instead
     */
    export type UserMissionMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserMissionMapDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MissionDefaultArgs instead
     */
    export type MissionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MissionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserRewardMapDefaultArgs instead
     */
    export type UserRewardMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserRewardMapDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RewardDefaultArgs instead
     */
    export type RewardArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RewardDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PromotionCodeDefaultArgs instead
     */
    export type PromotionCodeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PromotionCodeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserStarHistoryDefaultArgs instead
     */
    export type UserStarHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserStarHistoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SavingPlanDefaultArgs instead
     */
    export type SavingPlanArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SavingPlanDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ComputerDefaultArgs instead
     */
    export type ComputerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ComputerDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FundHistoryDefaultArgs instead
     */
    export type FundHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FundHistoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserSpendMapDefaultArgs instead
     */
    export type UserSpendMapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserSpendMapDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}