
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
 * Model ApiKey
 * 
 */
export type ApiKey = $Result.DefaultSelection<Prisma.$ApiKeyPayload>
/**
 * Model FeatureFlag
 * 
 */
export type FeatureFlag = $Result.DefaultSelection<Prisma.$FeatureFlagPayload>
/**
 * Model TenantApiKey
 * 
 */
export type TenantApiKey = $Result.DefaultSelection<Prisma.$TenantApiKeyPayload>
/**
 * Model TenantConfiguration
 * 
 */
export type TenantConfiguration = $Result.DefaultSelection<Prisma.$TenantConfigurationPayload>
/**
 * Model Organization
 * 
 */
export type Organization = $Result.DefaultSelection<Prisma.$OrganizationPayload>
/**
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ApiKeys
 * const apiKeys = await prisma.apiKey.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
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
   * // Fetch zero or more ApiKeys
   * const apiKeys = await prisma.apiKey.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

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


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.apiKey`: Exposes CRUD operations for the **ApiKey** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApiKeys
    * const apiKeys = await prisma.apiKey.findMany()
    * ```
    */
  get apiKey(): Prisma.ApiKeyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.featureFlag`: Exposes CRUD operations for the **FeatureFlag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FeatureFlags
    * const featureFlags = await prisma.featureFlag.findMany()
    * ```
    */
  get featureFlag(): Prisma.FeatureFlagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantApiKey`: Exposes CRUD operations for the **TenantApiKey** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantApiKeys
    * const tenantApiKeys = await prisma.tenantApiKey.findMany()
    * ```
    */
  get tenantApiKey(): Prisma.TenantApiKeyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantConfiguration`: Exposes CRUD operations for the **TenantConfiguration** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantConfigurations
    * const tenantConfigurations = await prisma.tenantConfiguration.findMany()
    * ```
    */
  get tenantConfiguration(): Prisma.TenantConfigurationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.organization`: Exposes CRUD operations for the **Organization** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Organizations
    * const organizations = await prisma.organization.findMany()
    * ```
    */
  get organization(): Prisma.OrganizationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
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
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
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
    ApiKey: 'ApiKey',
    FeatureFlag: 'FeatureFlag',
    TenantApiKey: 'TenantApiKey',
    TenantConfiguration: 'TenantConfiguration',
    Organization: 'Organization',
    Tenant: 'Tenant'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "apiKey" | "featureFlag" | "tenantApiKey" | "tenantConfiguration" | "organization" | "tenant"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ApiKey: {
        payload: Prisma.$ApiKeyPayload<ExtArgs>
        fields: Prisma.ApiKeyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApiKeyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiKeyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApiKeyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiKeyPayload>
          }
          findFirst: {
            args: Prisma.ApiKeyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiKeyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApiKeyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiKeyPayload>
          }
          findMany: {
            args: Prisma.ApiKeyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiKeyPayload>[]
          }
          create: {
            args: Prisma.ApiKeyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiKeyPayload>
          }
          createMany: {
            args: Prisma.ApiKeyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ApiKeyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiKeyPayload>
          }
          update: {
            args: Prisma.ApiKeyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiKeyPayload>
          }
          deleteMany: {
            args: Prisma.ApiKeyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApiKeyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ApiKeyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiKeyPayload>
          }
          aggregate: {
            args: Prisma.ApiKeyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApiKey>
          }
          groupBy: {
            args: Prisma.ApiKeyGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApiKeyGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApiKeyCountArgs<ExtArgs>
            result: $Utils.Optional<ApiKeyCountAggregateOutputType> | number
          }
        }
      }
      FeatureFlag: {
        payload: Prisma.$FeatureFlagPayload<ExtArgs>
        fields: Prisma.FeatureFlagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FeatureFlagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FeatureFlagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          findFirst: {
            args: Prisma.FeatureFlagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FeatureFlagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          findMany: {
            args: Prisma.FeatureFlagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>[]
          }
          create: {
            args: Prisma.FeatureFlagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          createMany: {
            args: Prisma.FeatureFlagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.FeatureFlagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          update: {
            args: Prisma.FeatureFlagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          deleteMany: {
            args: Prisma.FeatureFlagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FeatureFlagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FeatureFlagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          aggregate: {
            args: Prisma.FeatureFlagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFeatureFlag>
          }
          groupBy: {
            args: Prisma.FeatureFlagGroupByArgs<ExtArgs>
            result: $Utils.Optional<FeatureFlagGroupByOutputType>[]
          }
          count: {
            args: Prisma.FeatureFlagCountArgs<ExtArgs>
            result: $Utils.Optional<FeatureFlagCountAggregateOutputType> | number
          }
        }
      }
      TenantApiKey: {
        payload: Prisma.$TenantApiKeyPayload<ExtArgs>
        fields: Prisma.TenantApiKeyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantApiKeyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantApiKeyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          findFirst: {
            args: Prisma.TenantApiKeyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantApiKeyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          findMany: {
            args: Prisma.TenantApiKeyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>[]
          }
          create: {
            args: Prisma.TenantApiKeyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          createMany: {
            args: Prisma.TenantApiKeyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.TenantApiKeyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          update: {
            args: Prisma.TenantApiKeyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          deleteMany: {
            args: Prisma.TenantApiKeyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantApiKeyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TenantApiKeyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          aggregate: {
            args: Prisma.TenantApiKeyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantApiKey>
          }
          groupBy: {
            args: Prisma.TenantApiKeyGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantApiKeyGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantApiKeyCountArgs<ExtArgs>
            result: $Utils.Optional<TenantApiKeyCountAggregateOutputType> | number
          }
        }
      }
      TenantConfiguration: {
        payload: Prisma.$TenantConfigurationPayload<ExtArgs>
        fields: Prisma.TenantConfigurationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantConfigurationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantConfigurationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantConfigurationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantConfigurationPayload>
          }
          findFirst: {
            args: Prisma.TenantConfigurationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantConfigurationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantConfigurationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantConfigurationPayload>
          }
          findMany: {
            args: Prisma.TenantConfigurationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantConfigurationPayload>[]
          }
          create: {
            args: Prisma.TenantConfigurationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantConfigurationPayload>
          }
          createMany: {
            args: Prisma.TenantConfigurationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.TenantConfigurationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantConfigurationPayload>
          }
          update: {
            args: Prisma.TenantConfigurationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantConfigurationPayload>
          }
          deleteMany: {
            args: Prisma.TenantConfigurationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantConfigurationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TenantConfigurationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantConfigurationPayload>
          }
          aggregate: {
            args: Prisma.TenantConfigurationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantConfiguration>
          }
          groupBy: {
            args: Prisma.TenantConfigurationGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantConfigurationGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantConfigurationCountArgs<ExtArgs>
            result: $Utils.Optional<TenantConfigurationCountAggregateOutputType> | number
          }
        }
      }
      Organization: {
        payload: Prisma.$OrganizationPayload<ExtArgs>
        fields: Prisma.OrganizationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganizationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganizationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findFirst: {
            args: Prisma.OrganizationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganizationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findMany: {
            args: Prisma.OrganizationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          create: {
            args: Prisma.OrganizationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          createMany: {
            args: Prisma.OrganizationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.OrganizationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          update: {
            args: Prisma.OrganizationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          deleteMany: {
            args: Prisma.OrganizationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganizationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrganizationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          aggregate: {
            args: Prisma.OrganizationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganization>
          }
          groupBy: {
            args: Prisma.OrganizationGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganizationCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationCountAggregateOutputType> | number
          }
        }
      }
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
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
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
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
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    apiKey?: ApiKeyOmit
    featureFlag?: FeatureFlagOmit
    tenantApiKey?: TenantApiKeyOmit
    tenantConfiguration?: TenantConfigurationOmit
    organization?: OrganizationOmit
    tenant?: TenantOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

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
    | 'updateManyAndReturn'
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
   * Count Type OrganizationCountOutputType
   */

  export type OrganizationCountOutputType = {
    tenants: number
  }

  export type OrganizationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenants?: boolean | OrganizationCountOutputTypeCountTenantsArgs
  }

  // Custom InputTypes
  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationCountOutputType
     */
    select?: OrganizationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountTenantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
  }


  /**
   * Models
   */

  /**
   * Model ApiKey
   */

  export type AggregateApiKey = {
    _count: ApiKeyCountAggregateOutputType | null
    _min: ApiKeyMinAggregateOutputType | null
    _max: ApiKeyMaxAggregateOutputType | null
  }

  export type ApiKeyMinAggregateOutputType = {
    id: string | null
    name: string | null
    keyId: string | null
    secretHash: string | null
    userId: string | null
    tenantId: string | null
    expiresAt: Date | null
    createdAt: Date | null
    createdBy: string | null
    updatedBy: string | null
    updatedAt: Date | null
    deletedAt: Date | null
    deletedBy: string | null
    revokedBy: string | null
    revokedAt: Date | null
  }

  export type ApiKeyMaxAggregateOutputType = {
    id: string | null
    name: string | null
    keyId: string | null
    secretHash: string | null
    userId: string | null
    tenantId: string | null
    expiresAt: Date | null
    createdAt: Date | null
    createdBy: string | null
    updatedBy: string | null
    updatedAt: Date | null
    deletedAt: Date | null
    deletedBy: string | null
    revokedBy: string | null
    revokedAt: Date | null
  }

  export type ApiKeyCountAggregateOutputType = {
    id: number
    name: number
    keyId: number
    secretHash: number
    userId: number
    tenantId: number
    scopes: number
    services: number
    expiresAt: number
    createdAt: number
    createdBy: number
    updatedBy: number
    updatedAt: number
    deletedAt: number
    deletedBy: number
    revokedBy: number
    revokedAt: number
    _all: number
  }


  export type ApiKeyMinAggregateInputType = {
    id?: true
    name?: true
    keyId?: true
    secretHash?: true
    userId?: true
    tenantId?: true
    expiresAt?: true
    createdAt?: true
    createdBy?: true
    updatedBy?: true
    updatedAt?: true
    deletedAt?: true
    deletedBy?: true
    revokedBy?: true
    revokedAt?: true
  }

  export type ApiKeyMaxAggregateInputType = {
    id?: true
    name?: true
    keyId?: true
    secretHash?: true
    userId?: true
    tenantId?: true
    expiresAt?: true
    createdAt?: true
    createdBy?: true
    updatedBy?: true
    updatedAt?: true
    deletedAt?: true
    deletedBy?: true
    revokedBy?: true
    revokedAt?: true
  }

  export type ApiKeyCountAggregateInputType = {
    id?: true
    name?: true
    keyId?: true
    secretHash?: true
    userId?: true
    tenantId?: true
    scopes?: true
    services?: true
    expiresAt?: true
    createdAt?: true
    createdBy?: true
    updatedBy?: true
    updatedAt?: true
    deletedAt?: true
    deletedBy?: true
    revokedBy?: true
    revokedAt?: true
    _all?: true
  }

  export type ApiKeyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiKey to aggregate.
     */
    where?: ApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiKeys to fetch.
     */
    orderBy?: ApiKeyOrderByWithRelationInput | ApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApiKeys
    **/
    _count?: true | ApiKeyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApiKeyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApiKeyMaxAggregateInputType
  }

  export type GetApiKeyAggregateType<T extends ApiKeyAggregateArgs> = {
        [P in keyof T & keyof AggregateApiKey]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApiKey[P]>
      : GetScalarType<T[P], AggregateApiKey[P]>
  }




  export type ApiKeyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiKeyWhereInput
    orderBy?: ApiKeyOrderByWithAggregationInput | ApiKeyOrderByWithAggregationInput[]
    by: ApiKeyScalarFieldEnum[] | ApiKeyScalarFieldEnum
    having?: ApiKeyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApiKeyCountAggregateInputType | true
    _min?: ApiKeyMinAggregateInputType
    _max?: ApiKeyMaxAggregateInputType
  }

  export type ApiKeyGroupByOutputType = {
    id: string
    name: string | null
    keyId: string
    secretHash: string
    userId: string | null
    tenantId: string
    scopes: JsonValue | null
    services: JsonValue | null
    expiresAt: Date | null
    createdAt: Date
    createdBy: string | null
    updatedBy: string | null
    updatedAt: Date
    deletedAt: Date | null
    deletedBy: string | null
    revokedBy: string | null
    revokedAt: Date | null
    _count: ApiKeyCountAggregateOutputType | null
    _min: ApiKeyMinAggregateOutputType | null
    _max: ApiKeyMaxAggregateOutputType | null
  }

  type GetApiKeyGroupByPayload<T extends ApiKeyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApiKeyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApiKeyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApiKeyGroupByOutputType[P]>
            : GetScalarType<T[P], ApiKeyGroupByOutputType[P]>
        }
      >
    >


  export type ApiKeySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    keyId?: boolean
    secretHash?: boolean
    userId?: boolean
    tenantId?: boolean
    scopes?: boolean
    services?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
    revokedBy?: boolean
    revokedAt?: boolean
  }, ExtArgs["result"]["apiKey"]>



  export type ApiKeySelectScalar = {
    id?: boolean
    name?: boolean
    keyId?: boolean
    secretHash?: boolean
    userId?: boolean
    tenantId?: boolean
    scopes?: boolean
    services?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
    revokedBy?: boolean
    revokedAt?: boolean
  }

  export type ApiKeyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "keyId" | "secretHash" | "userId" | "tenantId" | "scopes" | "services" | "expiresAt" | "createdAt" | "createdBy" | "updatedBy" | "updatedAt" | "deletedAt" | "deletedBy" | "revokedBy" | "revokedAt", ExtArgs["result"]["apiKey"]>

  export type $ApiKeyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApiKey"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string | null
      keyId: string
      secretHash: string
      userId: string | null
      tenantId: string
      scopes: Prisma.JsonValue | null
      services: Prisma.JsonValue | null
      expiresAt: Date | null
      createdAt: Date
      createdBy: string | null
      updatedBy: string | null
      updatedAt: Date
      deletedAt: Date | null
      deletedBy: string | null
      revokedBy: string | null
      revokedAt: Date | null
    }, ExtArgs["result"]["apiKey"]>
    composites: {}
  }

  type ApiKeyGetPayload<S extends boolean | null | undefined | ApiKeyDefaultArgs> = $Result.GetResult<Prisma.$ApiKeyPayload, S>

  type ApiKeyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApiKeyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApiKeyCountAggregateInputType | true
    }

  export interface ApiKeyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApiKey'], meta: { name: 'ApiKey' } }
    /**
     * Find zero or one ApiKey that matches the filter.
     * @param {ApiKeyFindUniqueArgs} args - Arguments to find a ApiKey
     * @example
     * // Get one ApiKey
     * const apiKey = await prisma.apiKey.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApiKeyFindUniqueArgs>(args: SelectSubset<T, ApiKeyFindUniqueArgs<ExtArgs>>): Prisma__ApiKeyClient<$Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApiKey that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApiKeyFindUniqueOrThrowArgs} args - Arguments to find a ApiKey
     * @example
     * // Get one ApiKey
     * const apiKey = await prisma.apiKey.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApiKeyFindUniqueOrThrowArgs>(args: SelectSubset<T, ApiKeyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApiKeyClient<$Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiKey that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiKeyFindFirstArgs} args - Arguments to find a ApiKey
     * @example
     * // Get one ApiKey
     * const apiKey = await prisma.apiKey.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApiKeyFindFirstArgs>(args?: SelectSubset<T, ApiKeyFindFirstArgs<ExtArgs>>): Prisma__ApiKeyClient<$Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiKey that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiKeyFindFirstOrThrowArgs} args - Arguments to find a ApiKey
     * @example
     * // Get one ApiKey
     * const apiKey = await prisma.apiKey.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApiKeyFindFirstOrThrowArgs>(args?: SelectSubset<T, ApiKeyFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApiKeyClient<$Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApiKeys that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiKeyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApiKeys
     * const apiKeys = await prisma.apiKey.findMany()
     * 
     * // Get first 10 ApiKeys
     * const apiKeys = await prisma.apiKey.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apiKeyWithIdOnly = await prisma.apiKey.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApiKeyFindManyArgs>(args?: SelectSubset<T, ApiKeyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApiKey.
     * @param {ApiKeyCreateArgs} args - Arguments to create a ApiKey.
     * @example
     * // Create one ApiKey
     * const ApiKey = await prisma.apiKey.create({
     *   data: {
     *     // ... data to create a ApiKey
     *   }
     * })
     * 
     */
    create<T extends ApiKeyCreateArgs>(args: SelectSubset<T, ApiKeyCreateArgs<ExtArgs>>): Prisma__ApiKeyClient<$Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApiKeys.
     * @param {ApiKeyCreateManyArgs} args - Arguments to create many ApiKeys.
     * @example
     * // Create many ApiKeys
     * const apiKey = await prisma.apiKey.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApiKeyCreateManyArgs>(args?: SelectSubset<T, ApiKeyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ApiKey.
     * @param {ApiKeyDeleteArgs} args - Arguments to delete one ApiKey.
     * @example
     * // Delete one ApiKey
     * const ApiKey = await prisma.apiKey.delete({
     *   where: {
     *     // ... filter to delete one ApiKey
     *   }
     * })
     * 
     */
    delete<T extends ApiKeyDeleteArgs>(args: SelectSubset<T, ApiKeyDeleteArgs<ExtArgs>>): Prisma__ApiKeyClient<$Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApiKey.
     * @param {ApiKeyUpdateArgs} args - Arguments to update one ApiKey.
     * @example
     * // Update one ApiKey
     * const apiKey = await prisma.apiKey.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApiKeyUpdateArgs>(args: SelectSubset<T, ApiKeyUpdateArgs<ExtArgs>>): Prisma__ApiKeyClient<$Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApiKeys.
     * @param {ApiKeyDeleteManyArgs} args - Arguments to filter ApiKeys to delete.
     * @example
     * // Delete a few ApiKeys
     * const { count } = await prisma.apiKey.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApiKeyDeleteManyArgs>(args?: SelectSubset<T, ApiKeyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiKeyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApiKeys
     * const apiKey = await prisma.apiKey.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApiKeyUpdateManyArgs>(args: SelectSubset<T, ApiKeyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ApiKey.
     * @param {ApiKeyUpsertArgs} args - Arguments to update or create a ApiKey.
     * @example
     * // Update or create a ApiKey
     * const apiKey = await prisma.apiKey.upsert({
     *   create: {
     *     // ... data to create a ApiKey
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApiKey we want to update
     *   }
     * })
     */
    upsert<T extends ApiKeyUpsertArgs>(args: SelectSubset<T, ApiKeyUpsertArgs<ExtArgs>>): Prisma__ApiKeyClient<$Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApiKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiKeyCountArgs} args - Arguments to filter ApiKeys to count.
     * @example
     * // Count the number of ApiKeys
     * const count = await prisma.apiKey.count({
     *   where: {
     *     // ... the filter for the ApiKeys we want to count
     *   }
     * })
    **/
    count<T extends ApiKeyCountArgs>(
      args?: Subset<T, ApiKeyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApiKeyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApiKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiKeyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ApiKeyAggregateArgs>(args: Subset<T, ApiKeyAggregateArgs>): Prisma.PrismaPromise<GetApiKeyAggregateType<T>>

    /**
     * Group by ApiKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiKeyGroupByArgs} args - Group by arguments.
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
      T extends ApiKeyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApiKeyGroupByArgs['orderBy'] }
        : { orderBy?: ApiKeyGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ApiKeyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApiKeyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApiKey model
   */
  readonly fields: ApiKeyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApiKey.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApiKeyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ApiKey model
   */
  interface ApiKeyFieldRefs {
    readonly id: FieldRef<"ApiKey", 'String'>
    readonly name: FieldRef<"ApiKey", 'String'>
    readonly keyId: FieldRef<"ApiKey", 'String'>
    readonly secretHash: FieldRef<"ApiKey", 'String'>
    readonly userId: FieldRef<"ApiKey", 'String'>
    readonly tenantId: FieldRef<"ApiKey", 'String'>
    readonly scopes: FieldRef<"ApiKey", 'Json'>
    readonly services: FieldRef<"ApiKey", 'Json'>
    readonly expiresAt: FieldRef<"ApiKey", 'DateTime'>
    readonly createdAt: FieldRef<"ApiKey", 'DateTime'>
    readonly createdBy: FieldRef<"ApiKey", 'String'>
    readonly updatedBy: FieldRef<"ApiKey", 'String'>
    readonly updatedAt: FieldRef<"ApiKey", 'DateTime'>
    readonly deletedAt: FieldRef<"ApiKey", 'DateTime'>
    readonly deletedBy: FieldRef<"ApiKey", 'String'>
    readonly revokedBy: FieldRef<"ApiKey", 'String'>
    readonly revokedAt: FieldRef<"ApiKey", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ApiKey findUnique
   */
  export type ApiKeyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiKey
     */
    select?: ApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiKey
     */
    omit?: ApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which ApiKey to fetch.
     */
    where: ApiKeyWhereUniqueInput
  }

  /**
   * ApiKey findUniqueOrThrow
   */
  export type ApiKeyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiKey
     */
    select?: ApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiKey
     */
    omit?: ApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which ApiKey to fetch.
     */
    where: ApiKeyWhereUniqueInput
  }

  /**
   * ApiKey findFirst
   */
  export type ApiKeyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiKey
     */
    select?: ApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiKey
     */
    omit?: ApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which ApiKey to fetch.
     */
    where?: ApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiKeys to fetch.
     */
    orderBy?: ApiKeyOrderByWithRelationInput | ApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiKeys.
     */
    cursor?: ApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiKeys.
     */
    distinct?: ApiKeyScalarFieldEnum | ApiKeyScalarFieldEnum[]
  }

  /**
   * ApiKey findFirstOrThrow
   */
  export type ApiKeyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiKey
     */
    select?: ApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiKey
     */
    omit?: ApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which ApiKey to fetch.
     */
    where?: ApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiKeys to fetch.
     */
    orderBy?: ApiKeyOrderByWithRelationInput | ApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiKeys.
     */
    cursor?: ApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiKeys.
     */
    distinct?: ApiKeyScalarFieldEnum | ApiKeyScalarFieldEnum[]
  }

  /**
   * ApiKey findMany
   */
  export type ApiKeyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiKey
     */
    select?: ApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiKey
     */
    omit?: ApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which ApiKeys to fetch.
     */
    where?: ApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiKeys to fetch.
     */
    orderBy?: ApiKeyOrderByWithRelationInput | ApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApiKeys.
     */
    cursor?: ApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiKeys.
     */
    skip?: number
    distinct?: ApiKeyScalarFieldEnum | ApiKeyScalarFieldEnum[]
  }

  /**
   * ApiKey create
   */
  export type ApiKeyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiKey
     */
    select?: ApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiKey
     */
    omit?: ApiKeyOmit<ExtArgs> | null
    /**
     * The data needed to create a ApiKey.
     */
    data: XOR<ApiKeyCreateInput, ApiKeyUncheckedCreateInput>
  }

  /**
   * ApiKey createMany
   */
  export type ApiKeyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApiKeys.
     */
    data: ApiKeyCreateManyInput | ApiKeyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApiKey update
   */
  export type ApiKeyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiKey
     */
    select?: ApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiKey
     */
    omit?: ApiKeyOmit<ExtArgs> | null
    /**
     * The data needed to update a ApiKey.
     */
    data: XOR<ApiKeyUpdateInput, ApiKeyUncheckedUpdateInput>
    /**
     * Choose, which ApiKey to update.
     */
    where: ApiKeyWhereUniqueInput
  }

  /**
   * ApiKey updateMany
   */
  export type ApiKeyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApiKeys.
     */
    data: XOR<ApiKeyUpdateManyMutationInput, ApiKeyUncheckedUpdateManyInput>
    /**
     * Filter which ApiKeys to update
     */
    where?: ApiKeyWhereInput
    /**
     * Limit how many ApiKeys to update.
     */
    limit?: number
  }

  /**
   * ApiKey upsert
   */
  export type ApiKeyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiKey
     */
    select?: ApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiKey
     */
    omit?: ApiKeyOmit<ExtArgs> | null
    /**
     * The filter to search for the ApiKey to update in case it exists.
     */
    where: ApiKeyWhereUniqueInput
    /**
     * In case the ApiKey found by the `where` argument doesn't exist, create a new ApiKey with this data.
     */
    create: XOR<ApiKeyCreateInput, ApiKeyUncheckedCreateInput>
    /**
     * In case the ApiKey was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApiKeyUpdateInput, ApiKeyUncheckedUpdateInput>
  }

  /**
   * ApiKey delete
   */
  export type ApiKeyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiKey
     */
    select?: ApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiKey
     */
    omit?: ApiKeyOmit<ExtArgs> | null
    /**
     * Filter which ApiKey to delete.
     */
    where: ApiKeyWhereUniqueInput
  }

  /**
   * ApiKey deleteMany
   */
  export type ApiKeyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiKeys to delete
     */
    where?: ApiKeyWhereInput
    /**
     * Limit how many ApiKeys to delete.
     */
    limit?: number
  }

  /**
   * ApiKey without action
   */
  export type ApiKeyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiKey
     */
    select?: ApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiKey
     */
    omit?: ApiKeyOmit<ExtArgs> | null
  }


  /**
   * Model FeatureFlag
   */

  export type AggregateFeatureFlag = {
    _count: FeatureFlagCountAggregateOutputType | null
    _min: FeatureFlagMinAggregateOutputType | null
    _max: FeatureFlagMaxAggregateOutputType | null
  }

  export type FeatureFlagMinAggregateOutputType = {
    id: string | null
    key: string | null
    description: string | null
    tenantId: string | null
    enabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
    created_by: string | null
    updated_by: string | null
  }

  export type FeatureFlagMaxAggregateOutputType = {
    id: string | null
    key: string | null
    description: string | null
    tenantId: string | null
    enabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
    created_by: string | null
    updated_by: string | null
  }

  export type FeatureFlagCountAggregateOutputType = {
    id: number
    key: number
    description: number
    tenantId: number
    enabled: number
    target: number
    metadata: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    created_by: number
    updated_by: number
    _all: number
  }


  export type FeatureFlagMinAggregateInputType = {
    id?: true
    key?: true
    description?: true
    tenantId?: true
    enabled?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    created_by?: true
    updated_by?: true
  }

  export type FeatureFlagMaxAggregateInputType = {
    id?: true
    key?: true
    description?: true
    tenantId?: true
    enabled?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    created_by?: true
    updated_by?: true
  }

  export type FeatureFlagCountAggregateInputType = {
    id?: true
    key?: true
    description?: true
    tenantId?: true
    enabled?: true
    target?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    created_by?: true
    updated_by?: true
    _all?: true
  }

  export type FeatureFlagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FeatureFlag to aggregate.
     */
    where?: FeatureFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FeatureFlags to fetch.
     */
    orderBy?: FeatureFlagOrderByWithRelationInput | FeatureFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FeatureFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FeatureFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FeatureFlags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FeatureFlags
    **/
    _count?: true | FeatureFlagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FeatureFlagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FeatureFlagMaxAggregateInputType
  }

  export type GetFeatureFlagAggregateType<T extends FeatureFlagAggregateArgs> = {
        [P in keyof T & keyof AggregateFeatureFlag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFeatureFlag[P]>
      : GetScalarType<T[P], AggregateFeatureFlag[P]>
  }




  export type FeatureFlagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FeatureFlagWhereInput
    orderBy?: FeatureFlagOrderByWithAggregationInput | FeatureFlagOrderByWithAggregationInput[]
    by: FeatureFlagScalarFieldEnum[] | FeatureFlagScalarFieldEnum
    having?: FeatureFlagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FeatureFlagCountAggregateInputType | true
    _min?: FeatureFlagMinAggregateInputType
    _max?: FeatureFlagMaxAggregateInputType
  }

  export type FeatureFlagGroupByOutputType = {
    id: string
    key: string
    description: string | null
    tenantId: string
    enabled: boolean
    target: JsonValue | null
    metadata: JsonValue | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    created_by: string | null
    updated_by: string | null
    _count: FeatureFlagCountAggregateOutputType | null
    _min: FeatureFlagMinAggregateOutputType | null
    _max: FeatureFlagMaxAggregateOutputType | null
  }

  type GetFeatureFlagGroupByPayload<T extends FeatureFlagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FeatureFlagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FeatureFlagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FeatureFlagGroupByOutputType[P]>
            : GetScalarType<T[P], FeatureFlagGroupByOutputType[P]>
        }
      >
    >


  export type FeatureFlagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    description?: boolean
    tenantId?: boolean
    enabled?: boolean
    target?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    created_by?: boolean
    updated_by?: boolean
  }, ExtArgs["result"]["featureFlag"]>



  export type FeatureFlagSelectScalar = {
    id?: boolean
    key?: boolean
    description?: boolean
    tenantId?: boolean
    enabled?: boolean
    target?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    created_by?: boolean
    updated_by?: boolean
  }

  export type FeatureFlagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "key" | "description" | "tenantId" | "enabled" | "target" | "metadata" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by", ExtArgs["result"]["featureFlag"]>

  export type $FeatureFlagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FeatureFlag"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      description: string | null
      tenantId: string
      enabled: boolean
      target: Prisma.JsonValue | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
      created_by: string | null
      updated_by: string | null
    }, ExtArgs["result"]["featureFlag"]>
    composites: {}
  }

  type FeatureFlagGetPayload<S extends boolean | null | undefined | FeatureFlagDefaultArgs> = $Result.GetResult<Prisma.$FeatureFlagPayload, S>

  type FeatureFlagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FeatureFlagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FeatureFlagCountAggregateInputType | true
    }

  export interface FeatureFlagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FeatureFlag'], meta: { name: 'FeatureFlag' } }
    /**
     * Find zero or one FeatureFlag that matches the filter.
     * @param {FeatureFlagFindUniqueArgs} args - Arguments to find a FeatureFlag
     * @example
     * // Get one FeatureFlag
     * const featureFlag = await prisma.featureFlag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FeatureFlagFindUniqueArgs>(args: SelectSubset<T, FeatureFlagFindUniqueArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FeatureFlag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FeatureFlagFindUniqueOrThrowArgs} args - Arguments to find a FeatureFlag
     * @example
     * // Get one FeatureFlag
     * const featureFlag = await prisma.featureFlag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FeatureFlagFindUniqueOrThrowArgs>(args: SelectSubset<T, FeatureFlagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FeatureFlag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagFindFirstArgs} args - Arguments to find a FeatureFlag
     * @example
     * // Get one FeatureFlag
     * const featureFlag = await prisma.featureFlag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FeatureFlagFindFirstArgs>(args?: SelectSubset<T, FeatureFlagFindFirstArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FeatureFlag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagFindFirstOrThrowArgs} args - Arguments to find a FeatureFlag
     * @example
     * // Get one FeatureFlag
     * const featureFlag = await prisma.featureFlag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FeatureFlagFindFirstOrThrowArgs>(args?: SelectSubset<T, FeatureFlagFindFirstOrThrowArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FeatureFlags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FeatureFlags
     * const featureFlags = await prisma.featureFlag.findMany()
     * 
     * // Get first 10 FeatureFlags
     * const featureFlags = await prisma.featureFlag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const featureFlagWithIdOnly = await prisma.featureFlag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FeatureFlagFindManyArgs>(args?: SelectSubset<T, FeatureFlagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FeatureFlag.
     * @param {FeatureFlagCreateArgs} args - Arguments to create a FeatureFlag.
     * @example
     * // Create one FeatureFlag
     * const FeatureFlag = await prisma.featureFlag.create({
     *   data: {
     *     // ... data to create a FeatureFlag
     *   }
     * })
     * 
     */
    create<T extends FeatureFlagCreateArgs>(args: SelectSubset<T, FeatureFlagCreateArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FeatureFlags.
     * @param {FeatureFlagCreateManyArgs} args - Arguments to create many FeatureFlags.
     * @example
     * // Create many FeatureFlags
     * const featureFlag = await prisma.featureFlag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FeatureFlagCreateManyArgs>(args?: SelectSubset<T, FeatureFlagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a FeatureFlag.
     * @param {FeatureFlagDeleteArgs} args - Arguments to delete one FeatureFlag.
     * @example
     * // Delete one FeatureFlag
     * const FeatureFlag = await prisma.featureFlag.delete({
     *   where: {
     *     // ... filter to delete one FeatureFlag
     *   }
     * })
     * 
     */
    delete<T extends FeatureFlagDeleteArgs>(args: SelectSubset<T, FeatureFlagDeleteArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FeatureFlag.
     * @param {FeatureFlagUpdateArgs} args - Arguments to update one FeatureFlag.
     * @example
     * // Update one FeatureFlag
     * const featureFlag = await prisma.featureFlag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FeatureFlagUpdateArgs>(args: SelectSubset<T, FeatureFlagUpdateArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FeatureFlags.
     * @param {FeatureFlagDeleteManyArgs} args - Arguments to filter FeatureFlags to delete.
     * @example
     * // Delete a few FeatureFlags
     * const { count } = await prisma.featureFlag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FeatureFlagDeleteManyArgs>(args?: SelectSubset<T, FeatureFlagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FeatureFlags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FeatureFlags
     * const featureFlag = await prisma.featureFlag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FeatureFlagUpdateManyArgs>(args: SelectSubset<T, FeatureFlagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FeatureFlag.
     * @param {FeatureFlagUpsertArgs} args - Arguments to update or create a FeatureFlag.
     * @example
     * // Update or create a FeatureFlag
     * const featureFlag = await prisma.featureFlag.upsert({
     *   create: {
     *     // ... data to create a FeatureFlag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FeatureFlag we want to update
     *   }
     * })
     */
    upsert<T extends FeatureFlagUpsertArgs>(args: SelectSubset<T, FeatureFlagUpsertArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FeatureFlags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagCountArgs} args - Arguments to filter FeatureFlags to count.
     * @example
     * // Count the number of FeatureFlags
     * const count = await prisma.featureFlag.count({
     *   where: {
     *     // ... the filter for the FeatureFlags we want to count
     *   }
     * })
    **/
    count<T extends FeatureFlagCountArgs>(
      args?: Subset<T, FeatureFlagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FeatureFlagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FeatureFlag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FeatureFlagAggregateArgs>(args: Subset<T, FeatureFlagAggregateArgs>): Prisma.PrismaPromise<GetFeatureFlagAggregateType<T>>

    /**
     * Group by FeatureFlag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagGroupByArgs} args - Group by arguments.
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
      T extends FeatureFlagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FeatureFlagGroupByArgs['orderBy'] }
        : { orderBy?: FeatureFlagGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FeatureFlagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFeatureFlagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FeatureFlag model
   */
  readonly fields: FeatureFlagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FeatureFlag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FeatureFlagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the FeatureFlag model
   */
  interface FeatureFlagFieldRefs {
    readonly id: FieldRef<"FeatureFlag", 'String'>
    readonly key: FieldRef<"FeatureFlag", 'String'>
    readonly description: FieldRef<"FeatureFlag", 'String'>
    readonly tenantId: FieldRef<"FeatureFlag", 'String'>
    readonly enabled: FieldRef<"FeatureFlag", 'Boolean'>
    readonly target: FieldRef<"FeatureFlag", 'Json'>
    readonly metadata: FieldRef<"FeatureFlag", 'Json'>
    readonly createdAt: FieldRef<"FeatureFlag", 'DateTime'>
    readonly updatedAt: FieldRef<"FeatureFlag", 'DateTime'>
    readonly deletedAt: FieldRef<"FeatureFlag", 'DateTime'>
    readonly created_by: FieldRef<"FeatureFlag", 'String'>
    readonly updated_by: FieldRef<"FeatureFlag", 'String'>
  }
    

  // Custom InputTypes
  /**
   * FeatureFlag findUnique
   */
  export type FeatureFlagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter, which FeatureFlag to fetch.
     */
    where: FeatureFlagWhereUniqueInput
  }

  /**
   * FeatureFlag findUniqueOrThrow
   */
  export type FeatureFlagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter, which FeatureFlag to fetch.
     */
    where: FeatureFlagWhereUniqueInput
  }

  /**
   * FeatureFlag findFirst
   */
  export type FeatureFlagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter, which FeatureFlag to fetch.
     */
    where?: FeatureFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FeatureFlags to fetch.
     */
    orderBy?: FeatureFlagOrderByWithRelationInput | FeatureFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FeatureFlags.
     */
    cursor?: FeatureFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FeatureFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FeatureFlags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FeatureFlags.
     */
    distinct?: FeatureFlagScalarFieldEnum | FeatureFlagScalarFieldEnum[]
  }

  /**
   * FeatureFlag findFirstOrThrow
   */
  export type FeatureFlagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter, which FeatureFlag to fetch.
     */
    where?: FeatureFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FeatureFlags to fetch.
     */
    orderBy?: FeatureFlagOrderByWithRelationInput | FeatureFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FeatureFlags.
     */
    cursor?: FeatureFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FeatureFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FeatureFlags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FeatureFlags.
     */
    distinct?: FeatureFlagScalarFieldEnum | FeatureFlagScalarFieldEnum[]
  }

  /**
   * FeatureFlag findMany
   */
  export type FeatureFlagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter, which FeatureFlags to fetch.
     */
    where?: FeatureFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FeatureFlags to fetch.
     */
    orderBy?: FeatureFlagOrderByWithRelationInput | FeatureFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FeatureFlags.
     */
    cursor?: FeatureFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FeatureFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FeatureFlags.
     */
    skip?: number
    distinct?: FeatureFlagScalarFieldEnum | FeatureFlagScalarFieldEnum[]
  }

  /**
   * FeatureFlag create
   */
  export type FeatureFlagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * The data needed to create a FeatureFlag.
     */
    data: XOR<FeatureFlagCreateInput, FeatureFlagUncheckedCreateInput>
  }

  /**
   * FeatureFlag createMany
   */
  export type FeatureFlagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FeatureFlags.
     */
    data: FeatureFlagCreateManyInput | FeatureFlagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FeatureFlag update
   */
  export type FeatureFlagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * The data needed to update a FeatureFlag.
     */
    data: XOR<FeatureFlagUpdateInput, FeatureFlagUncheckedUpdateInput>
    /**
     * Choose, which FeatureFlag to update.
     */
    where: FeatureFlagWhereUniqueInput
  }

  /**
   * FeatureFlag updateMany
   */
  export type FeatureFlagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FeatureFlags.
     */
    data: XOR<FeatureFlagUpdateManyMutationInput, FeatureFlagUncheckedUpdateManyInput>
    /**
     * Filter which FeatureFlags to update
     */
    where?: FeatureFlagWhereInput
    /**
     * Limit how many FeatureFlags to update.
     */
    limit?: number
  }

  /**
   * FeatureFlag upsert
   */
  export type FeatureFlagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * The filter to search for the FeatureFlag to update in case it exists.
     */
    where: FeatureFlagWhereUniqueInput
    /**
     * In case the FeatureFlag found by the `where` argument doesn't exist, create a new FeatureFlag with this data.
     */
    create: XOR<FeatureFlagCreateInput, FeatureFlagUncheckedCreateInput>
    /**
     * In case the FeatureFlag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FeatureFlagUpdateInput, FeatureFlagUncheckedUpdateInput>
  }

  /**
   * FeatureFlag delete
   */
  export type FeatureFlagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter which FeatureFlag to delete.
     */
    where: FeatureFlagWhereUniqueInput
  }

  /**
   * FeatureFlag deleteMany
   */
  export type FeatureFlagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FeatureFlags to delete
     */
    where?: FeatureFlagWhereInput
    /**
     * Limit how many FeatureFlags to delete.
     */
    limit?: number
  }

  /**
   * FeatureFlag without action
   */
  export type FeatureFlagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
  }


  /**
   * Model TenantApiKey
   */

  export type AggregateTenantApiKey = {
    _count: TenantApiKeyCountAggregateOutputType | null
    _min: TenantApiKeyMinAggregateOutputType | null
    _max: TenantApiKeyMaxAggregateOutputType | null
  }

  export type TenantApiKeyMinAggregateOutputType = {
    id: string | null
    name: string | null
    apiKey: string | null
    tenantId: string | null
    entryCode: string | null
    passCode: string | null
    createdBy: string | null
    updatedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type TenantApiKeyMaxAggregateOutputType = {
    id: string | null
    name: string | null
    apiKey: string | null
    tenantId: string | null
    entryCode: string | null
    passCode: string | null
    createdBy: string | null
    updatedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type TenantApiKeyCountAggregateOutputType = {
    id: number
    name: number
    apiKey: number
    tenantId: number
    entryCode: number
    passCode: number
    attributes: number
    createdBy: number
    updatedBy: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type TenantApiKeyMinAggregateInputType = {
    id?: true
    name?: true
    apiKey?: true
    tenantId?: true
    entryCode?: true
    passCode?: true
    createdBy?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type TenantApiKeyMaxAggregateInputType = {
    id?: true
    name?: true
    apiKey?: true
    tenantId?: true
    entryCode?: true
    passCode?: true
    createdBy?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type TenantApiKeyCountAggregateInputType = {
    id?: true
    name?: true
    apiKey?: true
    tenantId?: true
    entryCode?: true
    passCode?: true
    attributes?: true
    createdBy?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type TenantApiKeyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantApiKey to aggregate.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantApiKeys
    **/
    _count?: true | TenantApiKeyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantApiKeyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantApiKeyMaxAggregateInputType
  }

  export type GetTenantApiKeyAggregateType<T extends TenantApiKeyAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantApiKey]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantApiKey[P]>
      : GetScalarType<T[P], AggregateTenantApiKey[P]>
  }




  export type TenantApiKeyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantApiKeyWhereInput
    orderBy?: TenantApiKeyOrderByWithAggregationInput | TenantApiKeyOrderByWithAggregationInput[]
    by: TenantApiKeyScalarFieldEnum[] | TenantApiKeyScalarFieldEnum
    having?: TenantApiKeyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantApiKeyCountAggregateInputType | true
    _min?: TenantApiKeyMinAggregateInputType
    _max?: TenantApiKeyMaxAggregateInputType
  }

  export type TenantApiKeyGroupByOutputType = {
    id: string
    name: string
    apiKey: string
    tenantId: string
    entryCode: string
    passCode: string
    attributes: JsonValue | null
    createdBy: string | null
    updatedBy: string | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: TenantApiKeyCountAggregateOutputType | null
    _min: TenantApiKeyMinAggregateOutputType | null
    _max: TenantApiKeyMaxAggregateOutputType | null
  }

  type GetTenantApiKeyGroupByPayload<T extends TenantApiKeyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantApiKeyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantApiKeyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantApiKeyGroupByOutputType[P]>
            : GetScalarType<T[P], TenantApiKeyGroupByOutputType[P]>
        }
      >
    >


  export type TenantApiKeySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    apiKey?: boolean
    tenantId?: boolean
    entryCode?: boolean
    passCode?: boolean
    attributes?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["tenantApiKey"]>



  export type TenantApiKeySelectScalar = {
    id?: boolean
    name?: boolean
    apiKey?: boolean
    tenantId?: boolean
    entryCode?: boolean
    passCode?: boolean
    attributes?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type TenantApiKeyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "apiKey" | "tenantId" | "entryCode" | "passCode" | "attributes" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["tenantApiKey"]>

  export type $TenantApiKeyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantApiKey"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      apiKey: string
      tenantId: string
      entryCode: string
      passCode: string
      attributes: Prisma.JsonValue | null
      createdBy: string | null
      updatedBy: string | null
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["tenantApiKey"]>
    composites: {}
  }

  type TenantApiKeyGetPayload<S extends boolean | null | undefined | TenantApiKeyDefaultArgs> = $Result.GetResult<Prisma.$TenantApiKeyPayload, S>

  type TenantApiKeyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantApiKeyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantApiKeyCountAggregateInputType | true
    }

  export interface TenantApiKeyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantApiKey'], meta: { name: 'TenantApiKey' } }
    /**
     * Find zero or one TenantApiKey that matches the filter.
     * @param {TenantApiKeyFindUniqueArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantApiKeyFindUniqueArgs>(args: SelectSubset<T, TenantApiKeyFindUniqueArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantApiKey that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantApiKeyFindUniqueOrThrowArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantApiKeyFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantApiKeyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantApiKey that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyFindFirstArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantApiKeyFindFirstArgs>(args?: SelectSubset<T, TenantApiKeyFindFirstArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantApiKey that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyFindFirstOrThrowArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantApiKeyFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantApiKeyFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantApiKeys that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantApiKeys
     * const tenantApiKeys = await prisma.tenantApiKey.findMany()
     * 
     * // Get first 10 TenantApiKeys
     * const tenantApiKeys = await prisma.tenantApiKey.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantApiKeyWithIdOnly = await prisma.tenantApiKey.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantApiKeyFindManyArgs>(args?: SelectSubset<T, TenantApiKeyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantApiKey.
     * @param {TenantApiKeyCreateArgs} args - Arguments to create a TenantApiKey.
     * @example
     * // Create one TenantApiKey
     * const TenantApiKey = await prisma.tenantApiKey.create({
     *   data: {
     *     // ... data to create a TenantApiKey
     *   }
     * })
     * 
     */
    create<T extends TenantApiKeyCreateArgs>(args: SelectSubset<T, TenantApiKeyCreateArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantApiKeys.
     * @param {TenantApiKeyCreateManyArgs} args - Arguments to create many TenantApiKeys.
     * @example
     * // Create many TenantApiKeys
     * const tenantApiKey = await prisma.tenantApiKey.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantApiKeyCreateManyArgs>(args?: SelectSubset<T, TenantApiKeyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a TenantApiKey.
     * @param {TenantApiKeyDeleteArgs} args - Arguments to delete one TenantApiKey.
     * @example
     * // Delete one TenantApiKey
     * const TenantApiKey = await prisma.tenantApiKey.delete({
     *   where: {
     *     // ... filter to delete one TenantApiKey
     *   }
     * })
     * 
     */
    delete<T extends TenantApiKeyDeleteArgs>(args: SelectSubset<T, TenantApiKeyDeleteArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantApiKey.
     * @param {TenantApiKeyUpdateArgs} args - Arguments to update one TenantApiKey.
     * @example
     * // Update one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantApiKeyUpdateArgs>(args: SelectSubset<T, TenantApiKeyUpdateArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantApiKeys.
     * @param {TenantApiKeyDeleteManyArgs} args - Arguments to filter TenantApiKeys to delete.
     * @example
     * // Delete a few TenantApiKeys
     * const { count } = await prisma.tenantApiKey.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantApiKeyDeleteManyArgs>(args?: SelectSubset<T, TenantApiKeyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantApiKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantApiKeys
     * const tenantApiKey = await prisma.tenantApiKey.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantApiKeyUpdateManyArgs>(args: SelectSubset<T, TenantApiKeyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TenantApiKey.
     * @param {TenantApiKeyUpsertArgs} args - Arguments to update or create a TenantApiKey.
     * @example
     * // Update or create a TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.upsert({
     *   create: {
     *     // ... data to create a TenantApiKey
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantApiKey we want to update
     *   }
     * })
     */
    upsert<T extends TenantApiKeyUpsertArgs>(args: SelectSubset<T, TenantApiKeyUpsertArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantApiKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyCountArgs} args - Arguments to filter TenantApiKeys to count.
     * @example
     * // Count the number of TenantApiKeys
     * const count = await prisma.tenantApiKey.count({
     *   where: {
     *     // ... the filter for the TenantApiKeys we want to count
     *   }
     * })
    **/
    count<T extends TenantApiKeyCountArgs>(
      args?: Subset<T, TenantApiKeyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantApiKeyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantApiKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantApiKeyAggregateArgs>(args: Subset<T, TenantApiKeyAggregateArgs>): Prisma.PrismaPromise<GetTenantApiKeyAggregateType<T>>

    /**
     * Group by TenantApiKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyGroupByArgs} args - Group by arguments.
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
      T extends TenantApiKeyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantApiKeyGroupByArgs['orderBy'] }
        : { orderBy?: TenantApiKeyGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantApiKeyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantApiKeyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantApiKey model
   */
  readonly fields: TenantApiKeyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantApiKey.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantApiKeyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TenantApiKey model
   */
  interface TenantApiKeyFieldRefs {
    readonly id: FieldRef<"TenantApiKey", 'String'>
    readonly name: FieldRef<"TenantApiKey", 'String'>
    readonly apiKey: FieldRef<"TenantApiKey", 'String'>
    readonly tenantId: FieldRef<"TenantApiKey", 'String'>
    readonly entryCode: FieldRef<"TenantApiKey", 'String'>
    readonly passCode: FieldRef<"TenantApiKey", 'String'>
    readonly attributes: FieldRef<"TenantApiKey", 'Json'>
    readonly createdBy: FieldRef<"TenantApiKey", 'String'>
    readonly updatedBy: FieldRef<"TenantApiKey", 'String'>
    readonly createdAt: FieldRef<"TenantApiKey", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantApiKey", 'DateTime'>
    readonly deletedAt: FieldRef<"TenantApiKey", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantApiKey findUnique
   */
  export type TenantApiKeyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey findUniqueOrThrow
   */
  export type TenantApiKeyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey findFirst
   */
  export type TenantApiKeyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantApiKeys.
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantApiKeys.
     */
    distinct?: TenantApiKeyScalarFieldEnum | TenantApiKeyScalarFieldEnum[]
  }

  /**
   * TenantApiKey findFirstOrThrow
   */
  export type TenantApiKeyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantApiKeys.
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantApiKeys.
     */
    distinct?: TenantApiKeyScalarFieldEnum | TenantApiKeyScalarFieldEnum[]
  }

  /**
   * TenantApiKey findMany
   */
  export type TenantApiKeyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which TenantApiKeys to fetch.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantApiKeys.
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    distinct?: TenantApiKeyScalarFieldEnum | TenantApiKeyScalarFieldEnum[]
  }

  /**
   * TenantApiKey create
   */
  export type TenantApiKeyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * The data needed to create a TenantApiKey.
     */
    data: XOR<TenantApiKeyCreateInput, TenantApiKeyUncheckedCreateInput>
  }

  /**
   * TenantApiKey createMany
   */
  export type TenantApiKeyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantApiKeys.
     */
    data: TenantApiKeyCreateManyInput | TenantApiKeyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantApiKey update
   */
  export type TenantApiKeyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * The data needed to update a TenantApiKey.
     */
    data: XOR<TenantApiKeyUpdateInput, TenantApiKeyUncheckedUpdateInput>
    /**
     * Choose, which TenantApiKey to update.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey updateMany
   */
  export type TenantApiKeyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantApiKeys.
     */
    data: XOR<TenantApiKeyUpdateManyMutationInput, TenantApiKeyUncheckedUpdateManyInput>
    /**
     * Filter which TenantApiKeys to update
     */
    where?: TenantApiKeyWhereInput
    /**
     * Limit how many TenantApiKeys to update.
     */
    limit?: number
  }

  /**
   * TenantApiKey upsert
   */
  export type TenantApiKeyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * The filter to search for the TenantApiKey to update in case it exists.
     */
    where: TenantApiKeyWhereUniqueInput
    /**
     * In case the TenantApiKey found by the `where` argument doesn't exist, create a new TenantApiKey with this data.
     */
    create: XOR<TenantApiKeyCreateInput, TenantApiKeyUncheckedCreateInput>
    /**
     * In case the TenantApiKey was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantApiKeyUpdateInput, TenantApiKeyUncheckedUpdateInput>
  }

  /**
   * TenantApiKey delete
   */
  export type TenantApiKeyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter which TenantApiKey to delete.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey deleteMany
   */
  export type TenantApiKeyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantApiKeys to delete
     */
    where?: TenantApiKeyWhereInput
    /**
     * Limit how many TenantApiKeys to delete.
     */
    limit?: number
  }

  /**
   * TenantApiKey without action
   */
  export type TenantApiKeyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
  }


  /**
   * Model TenantConfiguration
   */

  export type AggregateTenantConfiguration = {
    _count: TenantConfigurationCountAggregateOutputType | null
    _min: TenantConfigurationMinAggregateOutputType | null
    _max: TenantConfigurationMaxAggregateOutputType | null
  }

  export type TenantConfigurationMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
    createdBy: string | null
    updatedBy: string | null
    name: string | null
    description: string | null
    tenantId: string | null
    serviceType: string | null
    isDefault: boolean | null
    isActive: boolean | null
    altName: string | null
    altDescription: string | null
  }

  export type TenantConfigurationMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
    createdBy: string | null
    updatedBy: string | null
    name: string | null
    description: string | null
    tenantId: string | null
    serviceType: string | null
    isDefault: boolean | null
    isActive: boolean | null
    altName: string | null
    altDescription: string | null
  }

  export type TenantConfigurationCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    createdBy: number
    updatedBy: number
    name: number
    description: number
    tenantId: number
    serviceType: number
    metadata: number
    isDefault: number
    isActive: number
    altName: number
    altDescription: number
    _all: number
  }


  export type TenantConfigurationMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    createdBy?: true
    updatedBy?: true
    name?: true
    description?: true
    tenantId?: true
    serviceType?: true
    isDefault?: true
    isActive?: true
    altName?: true
    altDescription?: true
  }

  export type TenantConfigurationMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    createdBy?: true
    updatedBy?: true
    name?: true
    description?: true
    tenantId?: true
    serviceType?: true
    isDefault?: true
    isActive?: true
    altName?: true
    altDescription?: true
  }

  export type TenantConfigurationCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    createdBy?: true
    updatedBy?: true
    name?: true
    description?: true
    tenantId?: true
    serviceType?: true
    metadata?: true
    isDefault?: true
    isActive?: true
    altName?: true
    altDescription?: true
    _all?: true
  }

  export type TenantConfigurationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantConfiguration to aggregate.
     */
    where?: TenantConfigurationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantConfigurations to fetch.
     */
    orderBy?: TenantConfigurationOrderByWithRelationInput | TenantConfigurationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantConfigurationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantConfigurations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantConfigurations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantConfigurations
    **/
    _count?: true | TenantConfigurationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantConfigurationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantConfigurationMaxAggregateInputType
  }

  export type GetTenantConfigurationAggregateType<T extends TenantConfigurationAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantConfiguration]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantConfiguration[P]>
      : GetScalarType<T[P], AggregateTenantConfiguration[P]>
  }




  export type TenantConfigurationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantConfigurationWhereInput
    orderBy?: TenantConfigurationOrderByWithAggregationInput | TenantConfigurationOrderByWithAggregationInput[]
    by: TenantConfigurationScalarFieldEnum[] | TenantConfigurationScalarFieldEnum
    having?: TenantConfigurationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantConfigurationCountAggregateInputType | true
    _min?: TenantConfigurationMinAggregateInputType
    _max?: TenantConfigurationMaxAggregateInputType
  }

  export type TenantConfigurationGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    createdBy: string | null
    updatedBy: string | null
    name: string
    description: string | null
    tenantId: string
    serviceType: string | null
    metadata: JsonValue | null
    isDefault: boolean
    isActive: boolean
    altName: string | null
    altDescription: string | null
    _count: TenantConfigurationCountAggregateOutputType | null
    _min: TenantConfigurationMinAggregateOutputType | null
    _max: TenantConfigurationMaxAggregateOutputType | null
  }

  type GetTenantConfigurationGroupByPayload<T extends TenantConfigurationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantConfigurationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantConfigurationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantConfigurationGroupByOutputType[P]>
            : GetScalarType<T[P], TenantConfigurationGroupByOutputType[P]>
        }
      >
    >


  export type TenantConfigurationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    name?: boolean
    description?: boolean
    tenantId?: boolean
    serviceType?: boolean
    metadata?: boolean
    isDefault?: boolean
    isActive?: boolean
    altName?: boolean
    altDescription?: boolean
  }, ExtArgs["result"]["tenantConfiguration"]>



  export type TenantConfigurationSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    name?: boolean
    description?: boolean
    tenantId?: boolean
    serviceType?: boolean
    metadata?: boolean
    isDefault?: boolean
    isActive?: boolean
    altName?: boolean
    altDescription?: boolean
  }

  export type TenantConfigurationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "deletedAt" | "createdBy" | "updatedBy" | "name" | "description" | "tenantId" | "serviceType" | "metadata" | "isDefault" | "isActive" | "altName" | "altDescription", ExtArgs["result"]["tenantConfiguration"]>

  export type $TenantConfigurationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantConfiguration"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
      createdBy: string | null
      updatedBy: string | null
      name: string
      description: string | null
      tenantId: string
      serviceType: string | null
      metadata: Prisma.JsonValue | null
      isDefault: boolean
      isActive: boolean
      altName: string | null
      altDescription: string | null
    }, ExtArgs["result"]["tenantConfiguration"]>
    composites: {}
  }

  type TenantConfigurationGetPayload<S extends boolean | null | undefined | TenantConfigurationDefaultArgs> = $Result.GetResult<Prisma.$TenantConfigurationPayload, S>

  type TenantConfigurationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantConfigurationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantConfigurationCountAggregateInputType | true
    }

  export interface TenantConfigurationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantConfiguration'], meta: { name: 'TenantConfiguration' } }
    /**
     * Find zero or one TenantConfiguration that matches the filter.
     * @param {TenantConfigurationFindUniqueArgs} args - Arguments to find a TenantConfiguration
     * @example
     * // Get one TenantConfiguration
     * const tenantConfiguration = await prisma.tenantConfiguration.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantConfigurationFindUniqueArgs>(args: SelectSubset<T, TenantConfigurationFindUniqueArgs<ExtArgs>>): Prisma__TenantConfigurationClient<$Result.GetResult<Prisma.$TenantConfigurationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantConfiguration that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantConfigurationFindUniqueOrThrowArgs} args - Arguments to find a TenantConfiguration
     * @example
     * // Get one TenantConfiguration
     * const tenantConfiguration = await prisma.tenantConfiguration.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantConfigurationFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantConfigurationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantConfigurationClient<$Result.GetResult<Prisma.$TenantConfigurationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantConfiguration that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantConfigurationFindFirstArgs} args - Arguments to find a TenantConfiguration
     * @example
     * // Get one TenantConfiguration
     * const tenantConfiguration = await prisma.tenantConfiguration.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantConfigurationFindFirstArgs>(args?: SelectSubset<T, TenantConfigurationFindFirstArgs<ExtArgs>>): Prisma__TenantConfigurationClient<$Result.GetResult<Prisma.$TenantConfigurationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantConfiguration that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantConfigurationFindFirstOrThrowArgs} args - Arguments to find a TenantConfiguration
     * @example
     * // Get one TenantConfiguration
     * const tenantConfiguration = await prisma.tenantConfiguration.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantConfigurationFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantConfigurationFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantConfigurationClient<$Result.GetResult<Prisma.$TenantConfigurationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantConfigurations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantConfigurationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantConfigurations
     * const tenantConfigurations = await prisma.tenantConfiguration.findMany()
     * 
     * // Get first 10 TenantConfigurations
     * const tenantConfigurations = await prisma.tenantConfiguration.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantConfigurationWithIdOnly = await prisma.tenantConfiguration.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantConfigurationFindManyArgs>(args?: SelectSubset<T, TenantConfigurationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantConfigurationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantConfiguration.
     * @param {TenantConfigurationCreateArgs} args - Arguments to create a TenantConfiguration.
     * @example
     * // Create one TenantConfiguration
     * const TenantConfiguration = await prisma.tenantConfiguration.create({
     *   data: {
     *     // ... data to create a TenantConfiguration
     *   }
     * })
     * 
     */
    create<T extends TenantConfigurationCreateArgs>(args: SelectSubset<T, TenantConfigurationCreateArgs<ExtArgs>>): Prisma__TenantConfigurationClient<$Result.GetResult<Prisma.$TenantConfigurationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantConfigurations.
     * @param {TenantConfigurationCreateManyArgs} args - Arguments to create many TenantConfigurations.
     * @example
     * // Create many TenantConfigurations
     * const tenantConfiguration = await prisma.tenantConfiguration.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantConfigurationCreateManyArgs>(args?: SelectSubset<T, TenantConfigurationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a TenantConfiguration.
     * @param {TenantConfigurationDeleteArgs} args - Arguments to delete one TenantConfiguration.
     * @example
     * // Delete one TenantConfiguration
     * const TenantConfiguration = await prisma.tenantConfiguration.delete({
     *   where: {
     *     // ... filter to delete one TenantConfiguration
     *   }
     * })
     * 
     */
    delete<T extends TenantConfigurationDeleteArgs>(args: SelectSubset<T, TenantConfigurationDeleteArgs<ExtArgs>>): Prisma__TenantConfigurationClient<$Result.GetResult<Prisma.$TenantConfigurationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantConfiguration.
     * @param {TenantConfigurationUpdateArgs} args - Arguments to update one TenantConfiguration.
     * @example
     * // Update one TenantConfiguration
     * const tenantConfiguration = await prisma.tenantConfiguration.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantConfigurationUpdateArgs>(args: SelectSubset<T, TenantConfigurationUpdateArgs<ExtArgs>>): Prisma__TenantConfigurationClient<$Result.GetResult<Prisma.$TenantConfigurationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantConfigurations.
     * @param {TenantConfigurationDeleteManyArgs} args - Arguments to filter TenantConfigurations to delete.
     * @example
     * // Delete a few TenantConfigurations
     * const { count } = await prisma.tenantConfiguration.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantConfigurationDeleteManyArgs>(args?: SelectSubset<T, TenantConfigurationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantConfigurations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantConfigurationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantConfigurations
     * const tenantConfiguration = await prisma.tenantConfiguration.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantConfigurationUpdateManyArgs>(args: SelectSubset<T, TenantConfigurationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TenantConfiguration.
     * @param {TenantConfigurationUpsertArgs} args - Arguments to update or create a TenantConfiguration.
     * @example
     * // Update or create a TenantConfiguration
     * const tenantConfiguration = await prisma.tenantConfiguration.upsert({
     *   create: {
     *     // ... data to create a TenantConfiguration
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantConfiguration we want to update
     *   }
     * })
     */
    upsert<T extends TenantConfigurationUpsertArgs>(args: SelectSubset<T, TenantConfigurationUpsertArgs<ExtArgs>>): Prisma__TenantConfigurationClient<$Result.GetResult<Prisma.$TenantConfigurationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantConfigurations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantConfigurationCountArgs} args - Arguments to filter TenantConfigurations to count.
     * @example
     * // Count the number of TenantConfigurations
     * const count = await prisma.tenantConfiguration.count({
     *   where: {
     *     // ... the filter for the TenantConfigurations we want to count
     *   }
     * })
    **/
    count<T extends TenantConfigurationCountArgs>(
      args?: Subset<T, TenantConfigurationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantConfigurationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantConfiguration.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantConfigurationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantConfigurationAggregateArgs>(args: Subset<T, TenantConfigurationAggregateArgs>): Prisma.PrismaPromise<GetTenantConfigurationAggregateType<T>>

    /**
     * Group by TenantConfiguration.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantConfigurationGroupByArgs} args - Group by arguments.
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
      T extends TenantConfigurationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantConfigurationGroupByArgs['orderBy'] }
        : { orderBy?: TenantConfigurationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantConfigurationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantConfigurationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantConfiguration model
   */
  readonly fields: TenantConfigurationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantConfiguration.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantConfigurationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TenantConfiguration model
   */
  interface TenantConfigurationFieldRefs {
    readonly id: FieldRef<"TenantConfiguration", 'String'>
    readonly createdAt: FieldRef<"TenantConfiguration", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantConfiguration", 'DateTime'>
    readonly deletedAt: FieldRef<"TenantConfiguration", 'DateTime'>
    readonly createdBy: FieldRef<"TenantConfiguration", 'String'>
    readonly updatedBy: FieldRef<"TenantConfiguration", 'String'>
    readonly name: FieldRef<"TenantConfiguration", 'String'>
    readonly description: FieldRef<"TenantConfiguration", 'String'>
    readonly tenantId: FieldRef<"TenantConfiguration", 'String'>
    readonly serviceType: FieldRef<"TenantConfiguration", 'String'>
    readonly metadata: FieldRef<"TenantConfiguration", 'Json'>
    readonly isDefault: FieldRef<"TenantConfiguration", 'Boolean'>
    readonly isActive: FieldRef<"TenantConfiguration", 'Boolean'>
    readonly altName: FieldRef<"TenantConfiguration", 'String'>
    readonly altDescription: FieldRef<"TenantConfiguration", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TenantConfiguration findUnique
   */
  export type TenantConfigurationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantConfiguration
     */
    select?: TenantConfigurationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantConfiguration
     */
    omit?: TenantConfigurationOmit<ExtArgs> | null
    /**
     * Filter, which TenantConfiguration to fetch.
     */
    where: TenantConfigurationWhereUniqueInput
  }

  /**
   * TenantConfiguration findUniqueOrThrow
   */
  export type TenantConfigurationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantConfiguration
     */
    select?: TenantConfigurationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantConfiguration
     */
    omit?: TenantConfigurationOmit<ExtArgs> | null
    /**
     * Filter, which TenantConfiguration to fetch.
     */
    where: TenantConfigurationWhereUniqueInput
  }

  /**
   * TenantConfiguration findFirst
   */
  export type TenantConfigurationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantConfiguration
     */
    select?: TenantConfigurationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantConfiguration
     */
    omit?: TenantConfigurationOmit<ExtArgs> | null
    /**
     * Filter, which TenantConfiguration to fetch.
     */
    where?: TenantConfigurationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantConfigurations to fetch.
     */
    orderBy?: TenantConfigurationOrderByWithRelationInput | TenantConfigurationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantConfigurations.
     */
    cursor?: TenantConfigurationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantConfigurations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantConfigurations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantConfigurations.
     */
    distinct?: TenantConfigurationScalarFieldEnum | TenantConfigurationScalarFieldEnum[]
  }

  /**
   * TenantConfiguration findFirstOrThrow
   */
  export type TenantConfigurationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantConfiguration
     */
    select?: TenantConfigurationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantConfiguration
     */
    omit?: TenantConfigurationOmit<ExtArgs> | null
    /**
     * Filter, which TenantConfiguration to fetch.
     */
    where?: TenantConfigurationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantConfigurations to fetch.
     */
    orderBy?: TenantConfigurationOrderByWithRelationInput | TenantConfigurationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantConfigurations.
     */
    cursor?: TenantConfigurationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantConfigurations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantConfigurations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantConfigurations.
     */
    distinct?: TenantConfigurationScalarFieldEnum | TenantConfigurationScalarFieldEnum[]
  }

  /**
   * TenantConfiguration findMany
   */
  export type TenantConfigurationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantConfiguration
     */
    select?: TenantConfigurationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantConfiguration
     */
    omit?: TenantConfigurationOmit<ExtArgs> | null
    /**
     * Filter, which TenantConfigurations to fetch.
     */
    where?: TenantConfigurationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantConfigurations to fetch.
     */
    orderBy?: TenantConfigurationOrderByWithRelationInput | TenantConfigurationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantConfigurations.
     */
    cursor?: TenantConfigurationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantConfigurations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantConfigurations.
     */
    skip?: number
    distinct?: TenantConfigurationScalarFieldEnum | TenantConfigurationScalarFieldEnum[]
  }

  /**
   * TenantConfiguration create
   */
  export type TenantConfigurationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantConfiguration
     */
    select?: TenantConfigurationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantConfiguration
     */
    omit?: TenantConfigurationOmit<ExtArgs> | null
    /**
     * The data needed to create a TenantConfiguration.
     */
    data: XOR<TenantConfigurationCreateInput, TenantConfigurationUncheckedCreateInput>
  }

  /**
   * TenantConfiguration createMany
   */
  export type TenantConfigurationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantConfigurations.
     */
    data: TenantConfigurationCreateManyInput | TenantConfigurationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantConfiguration update
   */
  export type TenantConfigurationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantConfiguration
     */
    select?: TenantConfigurationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantConfiguration
     */
    omit?: TenantConfigurationOmit<ExtArgs> | null
    /**
     * The data needed to update a TenantConfiguration.
     */
    data: XOR<TenantConfigurationUpdateInput, TenantConfigurationUncheckedUpdateInput>
    /**
     * Choose, which TenantConfiguration to update.
     */
    where: TenantConfigurationWhereUniqueInput
  }

  /**
   * TenantConfiguration updateMany
   */
  export type TenantConfigurationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantConfigurations.
     */
    data: XOR<TenantConfigurationUpdateManyMutationInput, TenantConfigurationUncheckedUpdateManyInput>
    /**
     * Filter which TenantConfigurations to update
     */
    where?: TenantConfigurationWhereInput
    /**
     * Limit how many TenantConfigurations to update.
     */
    limit?: number
  }

  /**
   * TenantConfiguration upsert
   */
  export type TenantConfigurationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantConfiguration
     */
    select?: TenantConfigurationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantConfiguration
     */
    omit?: TenantConfigurationOmit<ExtArgs> | null
    /**
     * The filter to search for the TenantConfiguration to update in case it exists.
     */
    where: TenantConfigurationWhereUniqueInput
    /**
     * In case the TenantConfiguration found by the `where` argument doesn't exist, create a new TenantConfiguration with this data.
     */
    create: XOR<TenantConfigurationCreateInput, TenantConfigurationUncheckedCreateInput>
    /**
     * In case the TenantConfiguration was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantConfigurationUpdateInput, TenantConfigurationUncheckedUpdateInput>
  }

  /**
   * TenantConfiguration delete
   */
  export type TenantConfigurationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantConfiguration
     */
    select?: TenantConfigurationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantConfiguration
     */
    omit?: TenantConfigurationOmit<ExtArgs> | null
    /**
     * Filter which TenantConfiguration to delete.
     */
    where: TenantConfigurationWhereUniqueInput
  }

  /**
   * TenantConfiguration deleteMany
   */
  export type TenantConfigurationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantConfigurations to delete
     */
    where?: TenantConfigurationWhereInput
    /**
     * Limit how many TenantConfigurations to delete.
     */
    limit?: number
  }

  /**
   * TenantConfiguration without action
   */
  export type TenantConfigurationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantConfiguration
     */
    select?: TenantConfigurationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantConfiguration
     */
    omit?: TenantConfigurationOmit<ExtArgs> | null
  }


  /**
   * Model Organization
   */

  export type AggregateOrganization = {
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  export type OrganizationMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    status: string | null
    rootDomain: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type OrganizationMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    status: string | null
    rootDomain: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type OrganizationCountAggregateOutputType = {
    id: number
    name: number
    description: number
    status: number
    rootDomain: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type OrganizationMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    status?: true
    rootDomain?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type OrganizationMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    status?: true
    rootDomain?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type OrganizationCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    status?: true
    rootDomain?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type OrganizationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organization to aggregate.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Organizations
    **/
    _count?: true | OrganizationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationMaxAggregateInputType
  }

  export type GetOrganizationAggregateType<T extends OrganizationAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganization]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganization[P]>
      : GetScalarType<T[P], AggregateOrganization[P]>
  }




  export type OrganizationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationWhereInput
    orderBy?: OrganizationOrderByWithAggregationInput | OrganizationOrderByWithAggregationInput[]
    by: OrganizationScalarFieldEnum[] | OrganizationScalarFieldEnum
    having?: OrganizationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationCountAggregateInputType | true
    _min?: OrganizationMinAggregateInputType
    _max?: OrganizationMaxAggregateInputType
  }

  export type OrganizationGroupByOutputType = {
    id: string
    name: string
    description: string | null
    status: string
    rootDomain: string | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  type GetOrganizationGroupByPayload<T extends OrganizationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
        }
      >
    >


  export type OrganizationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    status?: boolean
    rootDomain?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    tenants?: boolean | Organization$tenantsArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organization"]>



  export type OrganizationSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    status?: boolean
    rootDomain?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type OrganizationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "status" | "rootDomain" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["organization"]>
  export type OrganizationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenants?: boolean | Organization$tenantsArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $OrganizationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Organization"
    objects: {
      tenants: Prisma.$TenantPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      status: string
      rootDomain: string | null
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["organization"]>
    composites: {}
  }

  type OrganizationGetPayload<S extends boolean | null | undefined | OrganizationDefaultArgs> = $Result.GetResult<Prisma.$OrganizationPayload, S>

  type OrganizationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganizationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationCountAggregateInputType | true
    }

  export interface OrganizationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Organization'], meta: { name: 'Organization' } }
    /**
     * Find zero or one Organization that matches the filter.
     * @param {OrganizationFindUniqueArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganizationFindUniqueArgs>(args: SelectSubset<T, OrganizationFindUniqueArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Organization that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganizationFindUniqueOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganizationFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganizationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganizationFindFirstArgs>(args?: SelectSubset<T, OrganizationFindFirstArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganizationFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganizationFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Organizations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Organizations
     * const organizations = await prisma.organization.findMany()
     * 
     * // Get first 10 Organizations
     * const organizations = await prisma.organization.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organizationWithIdOnly = await prisma.organization.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganizationFindManyArgs>(args?: SelectSubset<T, OrganizationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Organization.
     * @param {OrganizationCreateArgs} args - Arguments to create a Organization.
     * @example
     * // Create one Organization
     * const Organization = await prisma.organization.create({
     *   data: {
     *     // ... data to create a Organization
     *   }
     * })
     * 
     */
    create<T extends OrganizationCreateArgs>(args: SelectSubset<T, OrganizationCreateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Organizations.
     * @param {OrganizationCreateManyArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganizationCreateManyArgs>(args?: SelectSubset<T, OrganizationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Organization.
     * @param {OrganizationDeleteArgs} args - Arguments to delete one Organization.
     * @example
     * // Delete one Organization
     * const Organization = await prisma.organization.delete({
     *   where: {
     *     // ... filter to delete one Organization
     *   }
     * })
     * 
     */
    delete<T extends OrganizationDeleteArgs>(args: SelectSubset<T, OrganizationDeleteArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Organization.
     * @param {OrganizationUpdateArgs} args - Arguments to update one Organization.
     * @example
     * // Update one Organization
     * const organization = await prisma.organization.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganizationUpdateArgs>(args: SelectSubset<T, OrganizationUpdateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Organizations.
     * @param {OrganizationDeleteManyArgs} args - Arguments to filter Organizations to delete.
     * @example
     * // Delete a few Organizations
     * const { count } = await prisma.organization.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganizationDeleteManyArgs>(args?: SelectSubset<T, OrganizationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganizationUpdateManyArgs>(args: SelectSubset<T, OrganizationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Organization.
     * @param {OrganizationUpsertArgs} args - Arguments to update or create a Organization.
     * @example
     * // Update or create a Organization
     * const organization = await prisma.organization.upsert({
     *   create: {
     *     // ... data to create a Organization
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Organization we want to update
     *   }
     * })
     */
    upsert<T extends OrganizationUpsertArgs>(args: SelectSubset<T, OrganizationUpsertArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationCountArgs} args - Arguments to filter Organizations to count.
     * @example
     * // Count the number of Organizations
     * const count = await prisma.organization.count({
     *   where: {
     *     // ... the filter for the Organizations we want to count
     *   }
     * })
    **/
    count<T extends OrganizationCountArgs>(
      args?: Subset<T, OrganizationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrganizationAggregateArgs>(args: Subset<T, OrganizationAggregateArgs>): Prisma.PrismaPromise<GetOrganizationAggregateType<T>>

    /**
     * Group by Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationGroupByArgs} args - Group by arguments.
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
      T extends OrganizationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganizationGroupByArgs['orderBy'] }
        : { orderBy?: OrganizationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrganizationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Organization model
   */
  readonly fields: OrganizationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Organization.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganizationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenants<T extends Organization$tenantsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$tenantsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Organization model
   */
  interface OrganizationFieldRefs {
    readonly id: FieldRef<"Organization", 'String'>
    readonly name: FieldRef<"Organization", 'String'>
    readonly description: FieldRef<"Organization", 'String'>
    readonly status: FieldRef<"Organization", 'String'>
    readonly rootDomain: FieldRef<"Organization", 'String'>
    readonly createdAt: FieldRef<"Organization", 'DateTime'>
    readonly updatedAt: FieldRef<"Organization", 'DateTime'>
    readonly deletedAt: FieldRef<"Organization", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Organization findUnique
   */
  export type OrganizationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findUniqueOrThrow
   */
  export type OrganizationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findFirst
   */
  export type OrganizationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findFirstOrThrow
   */
  export type OrganizationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findMany
   */
  export type OrganizationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organizations to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization create
   */
  export type OrganizationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to create a Organization.
     */
    data: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
  }

  /**
   * Organization createMany
   */
  export type OrganizationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization update
   */
  export type OrganizationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to update a Organization.
     */
    data: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
    /**
     * Choose, which Organization to update.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization updateMany
   */
  export type OrganizationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization upsert
   */
  export type OrganizationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The filter to search for the Organization to update in case it exists.
     */
    where: OrganizationWhereUniqueInput
    /**
     * In case the Organization found by the `where` argument doesn't exist, create a new Organization with this data.
     */
    create: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
    /**
     * In case the Organization was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
  }

  /**
   * Organization delete
   */
  export type OrganizationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter which Organization to delete.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization deleteMany
   */
  export type OrganizationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organizations to delete
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to delete.
     */
    limit?: number
  }

  /**
   * Organization.tenants
   */
  export type Organization$tenantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    cursor?: TenantWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Organization without action
   */
  export type OrganizationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
  }


  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
    createdBy: string | null
    updatedBy: string | null
    name: string | null
    description: string | null
    domain: string | null
    tenantId: string | null
    dbUrl: string | null
    fnetUrl: string | null
    altName: string | null
    altDescription: string | null
    isWorkflowEnabled: boolean | null
    apiKey: string | null
    domainPrefix: string | null
    organizationId: string | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
    createdBy: string | null
    updatedBy: string | null
    name: string | null
    description: string | null
    domain: string | null
    tenantId: string | null
    dbUrl: string | null
    fnetUrl: string | null
    altName: string | null
    altDescription: string | null
    isWorkflowEnabled: boolean | null
    apiKey: string | null
    domainPrefix: string | null
    organizationId: string | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    createdBy: number
    updatedBy: number
    name: number
    description: number
    domain: number
    tenantId: number
    clients: number
    dbUrl: number
    fnetUrl: number
    logo: number
    altName: number
    altDescription: number
    isWorkflowEnabled: number
    apiKey: number
    domainPrefix: number
    organizationId: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    createdBy?: true
    updatedBy?: true
    name?: true
    description?: true
    domain?: true
    tenantId?: true
    dbUrl?: true
    fnetUrl?: true
    altName?: true
    altDescription?: true
    isWorkflowEnabled?: true
    apiKey?: true
    domainPrefix?: true
    organizationId?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    createdBy?: true
    updatedBy?: true
    name?: true
    description?: true
    domain?: true
    tenantId?: true
    dbUrl?: true
    fnetUrl?: true
    altName?: true
    altDescription?: true
    isWorkflowEnabled?: true
    apiKey?: true
    domainPrefix?: true
    organizationId?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    createdBy?: true
    updatedBy?: true
    name?: true
    description?: true
    domain?: true
    tenantId?: true
    clients?: true
    dbUrl?: true
    fnetUrl?: true
    logo?: true
    altName?: true
    altDescription?: true
    isWorkflowEnabled?: true
    apiKey?: true
    domainPrefix?: true
    organizationId?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    createdBy: string | null
    updatedBy: string | null
    name: string
    description: string | null
    domain: string | null
    tenantId: string
    clients: JsonValue | null
    dbUrl: string | null
    fnetUrl: string | null
    logo: JsonValue | null
    altName: string | null
    altDescription: string | null
    isWorkflowEnabled: boolean
    apiKey: string | null
    domainPrefix: string | null
    organizationId: string | null
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    name?: boolean
    description?: boolean
    domain?: boolean
    tenantId?: boolean
    clients?: boolean
    dbUrl?: boolean
    fnetUrl?: boolean
    logo?: boolean
    altName?: boolean
    altDescription?: boolean
    isWorkflowEnabled?: boolean
    apiKey?: boolean
    domainPrefix?: boolean
    organizationId?: boolean
    organization?: boolean | Tenant$organizationArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>



  export type TenantSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    name?: boolean
    description?: boolean
    domain?: boolean
    tenantId?: boolean
    clients?: boolean
    dbUrl?: boolean
    fnetUrl?: boolean
    logo?: boolean
    altName?: boolean
    altDescription?: boolean
    isWorkflowEnabled?: boolean
    apiKey?: boolean
    domainPrefix?: boolean
    organizationId?: boolean
  }

  export type TenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "deletedAt" | "createdBy" | "updatedBy" | "name" | "description" | "domain" | "tenantId" | "clients" | "dbUrl" | "fnetUrl" | "logo" | "altName" | "altDescription" | "isWorkflowEnabled" | "apiKey" | "domainPrefix" | "organizationId", ExtArgs["result"]["tenant"]>
  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | Tenant$organizationArgs<ExtArgs>
  }

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
      createdBy: string | null
      updatedBy: string | null
      name: string
      description: string | null
      domain: string | null
      tenantId: string
      clients: Prisma.JsonValue | null
      dbUrl: string | null
      fnetUrl: string | null
      logo: Prisma.JsonValue | null
      altName: string | null
      altDescription: string | null
      isWorkflowEnabled: boolean
      apiKey: string | null
      domainPrefix: string | null
      organizationId: string | null
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
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
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends Tenant$organizationArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$organizationArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Tenant model
   */
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly createdAt: FieldRef<"Tenant", 'DateTime'>
    readonly updatedAt: FieldRef<"Tenant", 'DateTime'>
    readonly deletedAt: FieldRef<"Tenant", 'DateTime'>
    readonly createdBy: FieldRef<"Tenant", 'String'>
    readonly updatedBy: FieldRef<"Tenant", 'String'>
    readonly name: FieldRef<"Tenant", 'String'>
    readonly description: FieldRef<"Tenant", 'String'>
    readonly domain: FieldRef<"Tenant", 'String'>
    readonly tenantId: FieldRef<"Tenant", 'String'>
    readonly clients: FieldRef<"Tenant", 'Json'>
    readonly dbUrl: FieldRef<"Tenant", 'String'>
    readonly fnetUrl: FieldRef<"Tenant", 'String'>
    readonly logo: FieldRef<"Tenant", 'Json'>
    readonly altName: FieldRef<"Tenant", 'String'>
    readonly altDescription: FieldRef<"Tenant", 'String'>
    readonly isWorkflowEnabled: FieldRef<"Tenant", 'Boolean'>
    readonly apiKey: FieldRef<"Tenant", 'String'>
    readonly domainPrefix: FieldRef<"Tenant", 'String'>
    readonly organizationId: FieldRef<"Tenant", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to delete.
     */
    limit?: number
  }

  /**
   * Tenant.organization
   */
  export type Tenant$organizationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    where?: OrganizationWhereInput
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
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


  export const ApiKeyScalarFieldEnum: {
    id: 'id',
    name: 'name',
    keyId: 'keyId',
    secretHash: 'secretHash',
    userId: 'userId',
    tenantId: 'tenantId',
    scopes: 'scopes',
    services: 'services',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    deletedBy: 'deletedBy',
    revokedBy: 'revokedBy',
    revokedAt: 'revokedAt'
  };

  export type ApiKeyScalarFieldEnum = (typeof ApiKeyScalarFieldEnum)[keyof typeof ApiKeyScalarFieldEnum]


  export const FeatureFlagScalarFieldEnum: {
    id: 'id',
    key: 'key',
    description: 'description',
    tenantId: 'tenantId',
    enabled: 'enabled',
    target: 'target',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    created_by: 'created_by',
    updated_by: 'updated_by'
  };

  export type FeatureFlagScalarFieldEnum = (typeof FeatureFlagScalarFieldEnum)[keyof typeof FeatureFlagScalarFieldEnum]


  export const TenantApiKeyScalarFieldEnum: {
    id: 'id',
    name: 'name',
    apiKey: 'apiKey',
    tenantId: 'tenantId',
    entryCode: 'entryCode',
    passCode: 'passCode',
    attributes: 'attributes',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type TenantApiKeyScalarFieldEnum = (typeof TenantApiKeyScalarFieldEnum)[keyof typeof TenantApiKeyScalarFieldEnum]


  export const TenantConfigurationScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    name: 'name',
    description: 'description',
    tenantId: 'tenantId',
    serviceType: 'serviceType',
    metadata: 'metadata',
    isDefault: 'isDefault',
    isActive: 'isActive',
    altName: 'altName',
    altDescription: 'altDescription'
  };

  export type TenantConfigurationScalarFieldEnum = (typeof TenantConfigurationScalarFieldEnum)[keyof typeof TenantConfigurationScalarFieldEnum]


  export const OrganizationScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    status: 'status',
    rootDomain: 'rootDomain',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type OrganizationScalarFieldEnum = (typeof OrganizationScalarFieldEnum)[keyof typeof OrganizationScalarFieldEnum]


  export const TenantScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    name: 'name',
    description: 'description',
    domain: 'domain',
    tenantId: 'tenantId',
    clients: 'clients',
    dbUrl: 'dbUrl',
    fnetUrl: 'fnetUrl',
    logo: 'logo',
    altName: 'altName',
    altDescription: 'altDescription',
    isWorkflowEnabled: 'isWorkflowEnabled',
    apiKey: 'apiKey',
    domainPrefix: 'domainPrefix',
    organizationId: 'organizationId'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const ApiKeyOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    keyId: 'keyId',
    secretHash: 'secretHash',
    userId: 'userId',
    tenantId: 'tenantId',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    deletedBy: 'deletedBy',
    revokedBy: 'revokedBy'
  };

  export type ApiKeyOrderByRelevanceFieldEnum = (typeof ApiKeyOrderByRelevanceFieldEnum)[keyof typeof ApiKeyOrderByRelevanceFieldEnum]


  export const FeatureFlagOrderByRelevanceFieldEnum: {
    id: 'id',
    key: 'key',
    description: 'description',
    tenantId: 'tenantId',
    created_by: 'created_by',
    updated_by: 'updated_by'
  };

  export type FeatureFlagOrderByRelevanceFieldEnum = (typeof FeatureFlagOrderByRelevanceFieldEnum)[keyof typeof FeatureFlagOrderByRelevanceFieldEnum]


  export const TenantApiKeyOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    apiKey: 'apiKey',
    tenantId: 'tenantId',
    entryCode: 'entryCode',
    passCode: 'passCode',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
  };

  export type TenantApiKeyOrderByRelevanceFieldEnum = (typeof TenantApiKeyOrderByRelevanceFieldEnum)[keyof typeof TenantApiKeyOrderByRelevanceFieldEnum]


  export const TenantConfigurationOrderByRelevanceFieldEnum: {
    id: 'id',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    name: 'name',
    description: 'description',
    tenantId: 'tenantId',
    serviceType: 'serviceType',
    altName: 'altName',
    altDescription: 'altDescription'
  };

  export type TenantConfigurationOrderByRelevanceFieldEnum = (typeof TenantConfigurationOrderByRelevanceFieldEnum)[keyof typeof TenantConfigurationOrderByRelevanceFieldEnum]


  export const OrganizationOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    status: 'status',
    rootDomain: 'rootDomain'
  };

  export type OrganizationOrderByRelevanceFieldEnum = (typeof OrganizationOrderByRelevanceFieldEnum)[keyof typeof OrganizationOrderByRelevanceFieldEnum]


  export const TenantOrderByRelevanceFieldEnum: {
    id: 'id',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    name: 'name',
    description: 'description',
    domain: 'domain',
    tenantId: 'tenantId',
    dbUrl: 'dbUrl',
    fnetUrl: 'fnetUrl',
    altName: 'altName',
    altDescription: 'altDescription',
    apiKey: 'apiKey',
    domainPrefix: 'domainPrefix',
    organizationId: 'organizationId'
  };

  export type TenantOrderByRelevanceFieldEnum = (typeof TenantOrderByRelevanceFieldEnum)[keyof typeof TenantOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    
  /**
   * Deep Input Types
   */


  export type ApiKeyWhereInput = {
    AND?: ApiKeyWhereInput | ApiKeyWhereInput[]
    OR?: ApiKeyWhereInput[]
    NOT?: ApiKeyWhereInput | ApiKeyWhereInput[]
    id?: StringFilter<"ApiKey"> | string
    name?: StringNullableFilter<"ApiKey"> | string | null
    keyId?: StringFilter<"ApiKey"> | string
    secretHash?: StringFilter<"ApiKey"> | string
    userId?: StringNullableFilter<"ApiKey"> | string | null
    tenantId?: StringFilter<"ApiKey"> | string
    scopes?: JsonNullableFilter<"ApiKey">
    services?: JsonNullableFilter<"ApiKey">
    expiresAt?: DateTimeNullableFilter<"ApiKey"> | Date | string | null
    createdAt?: DateTimeFilter<"ApiKey"> | Date | string
    createdBy?: StringNullableFilter<"ApiKey"> | string | null
    updatedBy?: StringNullableFilter<"ApiKey"> | string | null
    updatedAt?: DateTimeFilter<"ApiKey"> | Date | string
    deletedAt?: DateTimeNullableFilter<"ApiKey"> | Date | string | null
    deletedBy?: StringNullableFilter<"ApiKey"> | string | null
    revokedBy?: StringNullableFilter<"ApiKey"> | string | null
    revokedAt?: DateTimeNullableFilter<"ApiKey"> | Date | string | null
  }

  export type ApiKeyOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    keyId?: SortOrder
    secretHash?: SortOrder
    userId?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    scopes?: SortOrderInput | SortOrder
    services?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    revokedBy?: SortOrderInput | SortOrder
    revokedAt?: SortOrderInput | SortOrder
    _relevance?: ApiKeyOrderByRelevanceInput
  }

  export type ApiKeyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    keyId?: string
    AND?: ApiKeyWhereInput | ApiKeyWhereInput[]
    OR?: ApiKeyWhereInput[]
    NOT?: ApiKeyWhereInput | ApiKeyWhereInput[]
    name?: StringNullableFilter<"ApiKey"> | string | null
    secretHash?: StringFilter<"ApiKey"> | string
    userId?: StringNullableFilter<"ApiKey"> | string | null
    tenantId?: StringFilter<"ApiKey"> | string
    scopes?: JsonNullableFilter<"ApiKey">
    services?: JsonNullableFilter<"ApiKey">
    expiresAt?: DateTimeNullableFilter<"ApiKey"> | Date | string | null
    createdAt?: DateTimeFilter<"ApiKey"> | Date | string
    createdBy?: StringNullableFilter<"ApiKey"> | string | null
    updatedBy?: StringNullableFilter<"ApiKey"> | string | null
    updatedAt?: DateTimeFilter<"ApiKey"> | Date | string
    deletedAt?: DateTimeNullableFilter<"ApiKey"> | Date | string | null
    deletedBy?: StringNullableFilter<"ApiKey"> | string | null
    revokedBy?: StringNullableFilter<"ApiKey"> | string | null
    revokedAt?: DateTimeNullableFilter<"ApiKey"> | Date | string | null
  }, "id" | "keyId">

  export type ApiKeyOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    keyId?: SortOrder
    secretHash?: SortOrder
    userId?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    scopes?: SortOrderInput | SortOrder
    services?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    revokedBy?: SortOrderInput | SortOrder
    revokedAt?: SortOrderInput | SortOrder
    _count?: ApiKeyCountOrderByAggregateInput
    _max?: ApiKeyMaxOrderByAggregateInput
    _min?: ApiKeyMinOrderByAggregateInput
  }

  export type ApiKeyScalarWhereWithAggregatesInput = {
    AND?: ApiKeyScalarWhereWithAggregatesInput | ApiKeyScalarWhereWithAggregatesInput[]
    OR?: ApiKeyScalarWhereWithAggregatesInput[]
    NOT?: ApiKeyScalarWhereWithAggregatesInput | ApiKeyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApiKey"> | string
    name?: StringNullableWithAggregatesFilter<"ApiKey"> | string | null
    keyId?: StringWithAggregatesFilter<"ApiKey"> | string
    secretHash?: StringWithAggregatesFilter<"ApiKey"> | string
    userId?: StringNullableWithAggregatesFilter<"ApiKey"> | string | null
    tenantId?: StringWithAggregatesFilter<"ApiKey"> | string
    scopes?: JsonNullableWithAggregatesFilter<"ApiKey">
    services?: JsonNullableWithAggregatesFilter<"ApiKey">
    expiresAt?: DateTimeNullableWithAggregatesFilter<"ApiKey"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ApiKey"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"ApiKey"> | string | null
    updatedBy?: StringNullableWithAggregatesFilter<"ApiKey"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"ApiKey"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"ApiKey"> | Date | string | null
    deletedBy?: StringNullableWithAggregatesFilter<"ApiKey"> | string | null
    revokedBy?: StringNullableWithAggregatesFilter<"ApiKey"> | string | null
    revokedAt?: DateTimeNullableWithAggregatesFilter<"ApiKey"> | Date | string | null
  }

  export type FeatureFlagWhereInput = {
    AND?: FeatureFlagWhereInput | FeatureFlagWhereInput[]
    OR?: FeatureFlagWhereInput[]
    NOT?: FeatureFlagWhereInput | FeatureFlagWhereInput[]
    id?: StringFilter<"FeatureFlag"> | string
    key?: StringFilter<"FeatureFlag"> | string
    description?: StringNullableFilter<"FeatureFlag"> | string | null
    tenantId?: StringFilter<"FeatureFlag"> | string
    enabled?: BoolFilter<"FeatureFlag"> | boolean
    target?: JsonNullableFilter<"FeatureFlag">
    metadata?: JsonNullableFilter<"FeatureFlag">
    createdAt?: DateTimeFilter<"FeatureFlag"> | Date | string
    updatedAt?: DateTimeFilter<"FeatureFlag"> | Date | string
    deletedAt?: DateTimeNullableFilter<"FeatureFlag"> | Date | string | null
    created_by?: StringNullableFilter<"FeatureFlag"> | string | null
    updated_by?: StringNullableFilter<"FeatureFlag"> | string | null
  }

  export type FeatureFlagOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    description?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    enabled?: SortOrder
    target?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    created_by?: SortOrderInput | SortOrder
    updated_by?: SortOrderInput | SortOrder
    _relevance?: FeatureFlagOrderByRelevanceInput
  }

  export type FeatureFlagWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FeatureFlagWhereInput | FeatureFlagWhereInput[]
    OR?: FeatureFlagWhereInput[]
    NOT?: FeatureFlagWhereInput | FeatureFlagWhereInput[]
    key?: StringFilter<"FeatureFlag"> | string
    description?: StringNullableFilter<"FeatureFlag"> | string | null
    tenantId?: StringFilter<"FeatureFlag"> | string
    enabled?: BoolFilter<"FeatureFlag"> | boolean
    target?: JsonNullableFilter<"FeatureFlag">
    metadata?: JsonNullableFilter<"FeatureFlag">
    createdAt?: DateTimeFilter<"FeatureFlag"> | Date | string
    updatedAt?: DateTimeFilter<"FeatureFlag"> | Date | string
    deletedAt?: DateTimeNullableFilter<"FeatureFlag"> | Date | string | null
    created_by?: StringNullableFilter<"FeatureFlag"> | string | null
    updated_by?: StringNullableFilter<"FeatureFlag"> | string | null
  }, "id">

  export type FeatureFlagOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    description?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    enabled?: SortOrder
    target?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    created_by?: SortOrderInput | SortOrder
    updated_by?: SortOrderInput | SortOrder
    _count?: FeatureFlagCountOrderByAggregateInput
    _max?: FeatureFlagMaxOrderByAggregateInput
    _min?: FeatureFlagMinOrderByAggregateInput
  }

  export type FeatureFlagScalarWhereWithAggregatesInput = {
    AND?: FeatureFlagScalarWhereWithAggregatesInput | FeatureFlagScalarWhereWithAggregatesInput[]
    OR?: FeatureFlagScalarWhereWithAggregatesInput[]
    NOT?: FeatureFlagScalarWhereWithAggregatesInput | FeatureFlagScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FeatureFlag"> | string
    key?: StringWithAggregatesFilter<"FeatureFlag"> | string
    description?: StringNullableWithAggregatesFilter<"FeatureFlag"> | string | null
    tenantId?: StringWithAggregatesFilter<"FeatureFlag"> | string
    enabled?: BoolWithAggregatesFilter<"FeatureFlag"> | boolean
    target?: JsonNullableWithAggregatesFilter<"FeatureFlag">
    metadata?: JsonNullableWithAggregatesFilter<"FeatureFlag">
    createdAt?: DateTimeWithAggregatesFilter<"FeatureFlag"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FeatureFlag"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"FeatureFlag"> | Date | string | null
    created_by?: StringNullableWithAggregatesFilter<"FeatureFlag"> | string | null
    updated_by?: StringNullableWithAggregatesFilter<"FeatureFlag"> | string | null
  }

  export type TenantApiKeyWhereInput = {
    AND?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    OR?: TenantApiKeyWhereInput[]
    NOT?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    id?: StringFilter<"TenantApiKey"> | string
    name?: StringFilter<"TenantApiKey"> | string
    apiKey?: StringFilter<"TenantApiKey"> | string
    tenantId?: StringFilter<"TenantApiKey"> | string
    entryCode?: StringFilter<"TenantApiKey"> | string
    passCode?: StringFilter<"TenantApiKey"> | string
    attributes?: JsonNullableFilter<"TenantApiKey">
    createdBy?: StringNullableFilter<"TenantApiKey"> | string | null
    updatedBy?: StringNullableFilter<"TenantApiKey"> | string | null
    createdAt?: DateTimeFilter<"TenantApiKey"> | Date | string
    updatedAt?: DateTimeFilter<"TenantApiKey"> | Date | string
    deletedAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
  }

  export type TenantApiKeyOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    apiKey?: SortOrder
    tenantId?: SortOrder
    entryCode?: SortOrder
    passCode?: SortOrder
    attributes?: SortOrderInput | SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _relevance?: TenantApiKeyOrderByRelevanceInput
  }

  export type TenantApiKeyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    OR?: TenantApiKeyWhereInput[]
    NOT?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    name?: StringFilter<"TenantApiKey"> | string
    apiKey?: StringFilter<"TenantApiKey"> | string
    tenantId?: StringFilter<"TenantApiKey"> | string
    entryCode?: StringFilter<"TenantApiKey"> | string
    passCode?: StringFilter<"TenantApiKey"> | string
    attributes?: JsonNullableFilter<"TenantApiKey">
    createdBy?: StringNullableFilter<"TenantApiKey"> | string | null
    updatedBy?: StringNullableFilter<"TenantApiKey"> | string | null
    createdAt?: DateTimeFilter<"TenantApiKey"> | Date | string
    updatedAt?: DateTimeFilter<"TenantApiKey"> | Date | string
    deletedAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
  }, "id">

  export type TenantApiKeyOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    apiKey?: SortOrder
    tenantId?: SortOrder
    entryCode?: SortOrder
    passCode?: SortOrder
    attributes?: SortOrderInput | SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: TenantApiKeyCountOrderByAggregateInput
    _max?: TenantApiKeyMaxOrderByAggregateInput
    _min?: TenantApiKeyMinOrderByAggregateInput
  }

  export type TenantApiKeyScalarWhereWithAggregatesInput = {
    AND?: TenantApiKeyScalarWhereWithAggregatesInput | TenantApiKeyScalarWhereWithAggregatesInput[]
    OR?: TenantApiKeyScalarWhereWithAggregatesInput[]
    NOT?: TenantApiKeyScalarWhereWithAggregatesInput | TenantApiKeyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TenantApiKey"> | string
    name?: StringWithAggregatesFilter<"TenantApiKey"> | string
    apiKey?: StringWithAggregatesFilter<"TenantApiKey"> | string
    tenantId?: StringWithAggregatesFilter<"TenantApiKey"> | string
    entryCode?: StringWithAggregatesFilter<"TenantApiKey"> | string
    passCode?: StringWithAggregatesFilter<"TenantApiKey"> | string
    attributes?: JsonNullableWithAggregatesFilter<"TenantApiKey">
    createdBy?: StringNullableWithAggregatesFilter<"TenantApiKey"> | string | null
    updatedBy?: StringNullableWithAggregatesFilter<"TenantApiKey"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TenantApiKey"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantApiKey"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"TenantApiKey"> | Date | string | null
  }

  export type TenantConfigurationWhereInput = {
    AND?: TenantConfigurationWhereInput | TenantConfigurationWhereInput[]
    OR?: TenantConfigurationWhereInput[]
    NOT?: TenantConfigurationWhereInput | TenantConfigurationWhereInput[]
    id?: StringFilter<"TenantConfiguration"> | string
    createdAt?: DateTimeFilter<"TenantConfiguration"> | Date | string
    updatedAt?: DateTimeFilter<"TenantConfiguration"> | Date | string
    deletedAt?: DateTimeNullableFilter<"TenantConfiguration"> | Date | string | null
    createdBy?: StringNullableFilter<"TenantConfiguration"> | string | null
    updatedBy?: StringNullableFilter<"TenantConfiguration"> | string | null
    name?: StringFilter<"TenantConfiguration"> | string
    description?: StringNullableFilter<"TenantConfiguration"> | string | null
    tenantId?: StringFilter<"TenantConfiguration"> | string
    serviceType?: StringNullableFilter<"TenantConfiguration"> | string | null
    metadata?: JsonNullableFilter<"TenantConfiguration">
    isDefault?: BoolFilter<"TenantConfiguration"> | boolean
    isActive?: BoolFilter<"TenantConfiguration"> | boolean
    altName?: StringNullableFilter<"TenantConfiguration"> | string | null
    altDescription?: StringNullableFilter<"TenantConfiguration"> | string | null
  }

  export type TenantConfigurationOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    serviceType?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    isDefault?: SortOrder
    isActive?: SortOrder
    altName?: SortOrderInput | SortOrder
    altDescription?: SortOrderInput | SortOrder
    _relevance?: TenantConfigurationOrderByRelevanceInput
  }

  export type TenantConfigurationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TenantConfigurationWhereInput | TenantConfigurationWhereInput[]
    OR?: TenantConfigurationWhereInput[]
    NOT?: TenantConfigurationWhereInput | TenantConfigurationWhereInput[]
    createdAt?: DateTimeFilter<"TenantConfiguration"> | Date | string
    updatedAt?: DateTimeFilter<"TenantConfiguration"> | Date | string
    deletedAt?: DateTimeNullableFilter<"TenantConfiguration"> | Date | string | null
    createdBy?: StringNullableFilter<"TenantConfiguration"> | string | null
    updatedBy?: StringNullableFilter<"TenantConfiguration"> | string | null
    name?: StringFilter<"TenantConfiguration"> | string
    description?: StringNullableFilter<"TenantConfiguration"> | string | null
    tenantId?: StringFilter<"TenantConfiguration"> | string
    serviceType?: StringNullableFilter<"TenantConfiguration"> | string | null
    metadata?: JsonNullableFilter<"TenantConfiguration">
    isDefault?: BoolFilter<"TenantConfiguration"> | boolean
    isActive?: BoolFilter<"TenantConfiguration"> | boolean
    altName?: StringNullableFilter<"TenantConfiguration"> | string | null
    altDescription?: StringNullableFilter<"TenantConfiguration"> | string | null
  }, "id">

  export type TenantConfigurationOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    serviceType?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    isDefault?: SortOrder
    isActive?: SortOrder
    altName?: SortOrderInput | SortOrder
    altDescription?: SortOrderInput | SortOrder
    _count?: TenantConfigurationCountOrderByAggregateInput
    _max?: TenantConfigurationMaxOrderByAggregateInput
    _min?: TenantConfigurationMinOrderByAggregateInput
  }

  export type TenantConfigurationScalarWhereWithAggregatesInput = {
    AND?: TenantConfigurationScalarWhereWithAggregatesInput | TenantConfigurationScalarWhereWithAggregatesInput[]
    OR?: TenantConfigurationScalarWhereWithAggregatesInput[]
    NOT?: TenantConfigurationScalarWhereWithAggregatesInput | TenantConfigurationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TenantConfiguration"> | string
    createdAt?: DateTimeWithAggregatesFilter<"TenantConfiguration"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantConfiguration"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"TenantConfiguration"> | Date | string | null
    createdBy?: StringNullableWithAggregatesFilter<"TenantConfiguration"> | string | null
    updatedBy?: StringNullableWithAggregatesFilter<"TenantConfiguration"> | string | null
    name?: StringWithAggregatesFilter<"TenantConfiguration"> | string
    description?: StringNullableWithAggregatesFilter<"TenantConfiguration"> | string | null
    tenantId?: StringWithAggregatesFilter<"TenantConfiguration"> | string
    serviceType?: StringNullableWithAggregatesFilter<"TenantConfiguration"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"TenantConfiguration">
    isDefault?: BoolWithAggregatesFilter<"TenantConfiguration"> | boolean
    isActive?: BoolWithAggregatesFilter<"TenantConfiguration"> | boolean
    altName?: StringNullableWithAggregatesFilter<"TenantConfiguration"> | string | null
    altDescription?: StringNullableWithAggregatesFilter<"TenantConfiguration"> | string | null
  }

  export type OrganizationWhereInput = {
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    id?: StringFilter<"Organization"> | string
    name?: StringFilter<"Organization"> | string
    description?: StringNullableFilter<"Organization"> | string | null
    status?: StringFilter<"Organization"> | string
    rootDomain?: StringNullableFilter<"Organization"> | string | null
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Organization"> | Date | string | null
    tenants?: TenantListRelationFilter
  }

  export type OrganizationOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    rootDomain?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    tenants?: TenantOrderByRelationAggregateInput
    _relevance?: OrganizationOrderByRelevanceInput
  }

  export type OrganizationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    name?: StringFilter<"Organization"> | string
    description?: StringNullableFilter<"Organization"> | string | null
    status?: StringFilter<"Organization"> | string
    rootDomain?: StringNullableFilter<"Organization"> | string | null
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Organization"> | Date | string | null
    tenants?: TenantListRelationFilter
  }, "id">

  export type OrganizationOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    rootDomain?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: OrganizationCountOrderByAggregateInput
    _max?: OrganizationMaxOrderByAggregateInput
    _min?: OrganizationMinOrderByAggregateInput
  }

  export type OrganizationScalarWhereWithAggregatesInput = {
    AND?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    OR?: OrganizationScalarWhereWithAggregatesInput[]
    NOT?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Organization"> | string
    name?: StringWithAggregatesFilter<"Organization"> | string
    description?: StringNullableWithAggregatesFilter<"Organization"> | string | null
    status?: StringWithAggregatesFilter<"Organization"> | string
    rootDomain?: StringNullableWithAggregatesFilter<"Organization"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Organization"> | Date | string | null
  }

  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: StringFilter<"Tenant"> | string
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    createdBy?: StringNullableFilter<"Tenant"> | string | null
    updatedBy?: StringNullableFilter<"Tenant"> | string | null
    name?: StringFilter<"Tenant"> | string
    description?: StringNullableFilter<"Tenant"> | string | null
    domain?: StringNullableFilter<"Tenant"> | string | null
    tenantId?: StringFilter<"Tenant"> | string
    clients?: JsonNullableFilter<"Tenant">
    dbUrl?: StringNullableFilter<"Tenant"> | string | null
    fnetUrl?: StringNullableFilter<"Tenant"> | string | null
    logo?: JsonNullableFilter<"Tenant">
    altName?: StringNullableFilter<"Tenant"> | string | null
    altDescription?: StringNullableFilter<"Tenant"> | string | null
    isWorkflowEnabled?: BoolFilter<"Tenant"> | boolean
    apiKey?: StringNullableFilter<"Tenant"> | string | null
    domainPrefix?: StringNullableFilter<"Tenant"> | string | null
    organizationId?: StringNullableFilter<"Tenant"> | string | null
    organization?: XOR<OrganizationNullableScalarRelationFilter, OrganizationWhereInput> | null
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    domain?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    clients?: SortOrderInput | SortOrder
    dbUrl?: SortOrderInput | SortOrder
    fnetUrl?: SortOrderInput | SortOrder
    logo?: SortOrderInput | SortOrder
    altName?: SortOrderInput | SortOrder
    altDescription?: SortOrderInput | SortOrder
    isWorkflowEnabled?: SortOrder
    apiKey?: SortOrderInput | SortOrder
    domainPrefix?: SortOrderInput | SortOrder
    organizationId?: SortOrderInput | SortOrder
    organization?: OrganizationOrderByWithRelationInput
    _relevance?: TenantOrderByRelevanceInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    createdBy?: StringNullableFilter<"Tenant"> | string | null
    updatedBy?: StringNullableFilter<"Tenant"> | string | null
    name?: StringFilter<"Tenant"> | string
    description?: StringNullableFilter<"Tenant"> | string | null
    domain?: StringNullableFilter<"Tenant"> | string | null
    tenantId?: StringFilter<"Tenant"> | string
    clients?: JsonNullableFilter<"Tenant">
    dbUrl?: StringNullableFilter<"Tenant"> | string | null
    fnetUrl?: StringNullableFilter<"Tenant"> | string | null
    logo?: JsonNullableFilter<"Tenant">
    altName?: StringNullableFilter<"Tenant"> | string | null
    altDescription?: StringNullableFilter<"Tenant"> | string | null
    isWorkflowEnabled?: BoolFilter<"Tenant"> | boolean
    apiKey?: StringNullableFilter<"Tenant"> | string | null
    domainPrefix?: StringNullableFilter<"Tenant"> | string | null
    organizationId?: StringNullableFilter<"Tenant"> | string | null
    organization?: XOR<OrganizationNullableScalarRelationFilter, OrganizationWhereInput> | null
  }, "id">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    domain?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    clients?: SortOrderInput | SortOrder
    dbUrl?: SortOrderInput | SortOrder
    fnetUrl?: SortOrderInput | SortOrder
    logo?: SortOrderInput | SortOrder
    altName?: SortOrderInput | SortOrder
    altDescription?: SortOrderInput | SortOrder
    isWorkflowEnabled?: SortOrder
    apiKey?: SortOrderInput | SortOrder
    domainPrefix?: SortOrderInput | SortOrder
    organizationId?: SortOrderInput | SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tenant"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Tenant"> | Date | string | null
    createdBy?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    updatedBy?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    name?: StringWithAggregatesFilter<"Tenant"> | string
    description?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    domain?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    tenantId?: StringWithAggregatesFilter<"Tenant"> | string
    clients?: JsonNullableWithAggregatesFilter<"Tenant">
    dbUrl?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    fnetUrl?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    logo?: JsonNullableWithAggregatesFilter<"Tenant">
    altName?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    altDescription?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    isWorkflowEnabled?: BoolWithAggregatesFilter<"Tenant"> | boolean
    apiKey?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    domainPrefix?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    organizationId?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
  }

  export type ApiKeyCreateInput = {
    id?: string
    name?: string | null
    keyId: string
    secretHash: string
    userId?: string | null
    tenantId: string
    scopes?: NullableJsonNullValueInput | InputJsonValue
    services?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    deletedBy?: string | null
    revokedBy?: string | null
    revokedAt?: Date | string | null
  }

  export type ApiKeyUncheckedCreateInput = {
    id?: string
    name?: string | null
    keyId: string
    secretHash: string
    userId?: string | null
    tenantId: string
    scopes?: NullableJsonNullValueInput | InputJsonValue
    services?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    deletedBy?: string | null
    revokedBy?: string | null
    revokedAt?: Date | string | null
  }

  export type ApiKeyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    keyId?: StringFieldUpdateOperationsInput | string
    secretHash?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    scopes?: NullableJsonNullValueInput | InputJsonValue
    services?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    revokedBy?: NullableStringFieldUpdateOperationsInput | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ApiKeyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    keyId?: StringFieldUpdateOperationsInput | string
    secretHash?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    scopes?: NullableJsonNullValueInput | InputJsonValue
    services?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    revokedBy?: NullableStringFieldUpdateOperationsInput | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ApiKeyCreateManyInput = {
    id?: string
    name?: string | null
    keyId: string
    secretHash: string
    userId?: string | null
    tenantId: string
    scopes?: NullableJsonNullValueInput | InputJsonValue
    services?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    deletedBy?: string | null
    revokedBy?: string | null
    revokedAt?: Date | string | null
  }

  export type ApiKeyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    keyId?: StringFieldUpdateOperationsInput | string
    secretHash?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    scopes?: NullableJsonNullValueInput | InputJsonValue
    services?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    revokedBy?: NullableStringFieldUpdateOperationsInput | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ApiKeyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    keyId?: StringFieldUpdateOperationsInput | string
    secretHash?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    scopes?: NullableJsonNullValueInput | InputJsonValue
    services?: NullableJsonNullValueInput | InputJsonValue
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    revokedBy?: NullableStringFieldUpdateOperationsInput | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type FeatureFlagCreateInput = {
    id?: string
    key: string
    description?: string | null
    tenantId: string
    enabled?: boolean
    target?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    created_by?: string | null
    updated_by?: string | null
  }

  export type FeatureFlagUncheckedCreateInput = {
    id?: string
    key: string
    description?: string | null
    tenantId: string
    enabled?: boolean
    target?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    created_by?: string | null
    updated_by?: string | null
  }

  export type FeatureFlagUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    target?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    updated_by?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FeatureFlagUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    target?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    updated_by?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FeatureFlagCreateManyInput = {
    id?: string
    key: string
    description?: string | null
    tenantId: string
    enabled?: boolean
    target?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    created_by?: string | null
    updated_by?: string | null
  }

  export type FeatureFlagUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    target?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    updated_by?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FeatureFlagUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    target?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    updated_by?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TenantApiKeyCreateInput = {
    id?: string
    name: string
    apiKey: string
    tenantId: string
    entryCode: string
    passCode: string
    attributes?: NullableJsonNullValueInput | InputJsonValue
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type TenantApiKeyUncheckedCreateInput = {
    id?: string
    name: string
    apiKey: string
    tenantId: string
    entryCode: string
    passCode: string
    attributes?: NullableJsonNullValueInput | InputJsonValue
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type TenantApiKeyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apiKey?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    entryCode?: StringFieldUpdateOperationsInput | string
    passCode?: StringFieldUpdateOperationsInput | string
    attributes?: NullableJsonNullValueInput | InputJsonValue
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantApiKeyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apiKey?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    entryCode?: StringFieldUpdateOperationsInput | string
    passCode?: StringFieldUpdateOperationsInput | string
    attributes?: NullableJsonNullValueInput | InputJsonValue
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantApiKeyCreateManyInput = {
    id?: string
    name: string
    apiKey: string
    tenantId: string
    entryCode: string
    passCode: string
    attributes?: NullableJsonNullValueInput | InputJsonValue
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type TenantApiKeyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apiKey?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    entryCode?: StringFieldUpdateOperationsInput | string
    passCode?: StringFieldUpdateOperationsInput | string
    attributes?: NullableJsonNullValueInput | InputJsonValue
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantApiKeyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apiKey?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    entryCode?: StringFieldUpdateOperationsInput | string
    passCode?: StringFieldUpdateOperationsInput | string
    attributes?: NullableJsonNullValueInput | InputJsonValue
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantConfigurationCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    createdBy?: string | null
    updatedBy?: string | null
    name: string
    description?: string | null
    tenantId: string
    serviceType?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    isDefault?: boolean
    isActive?: boolean
    altName?: string | null
    altDescription?: string | null
  }

  export type TenantConfigurationUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    createdBy?: string | null
    updatedBy?: string | null
    name: string
    description?: string | null
    tenantId: string
    serviceType?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    isDefault?: boolean
    isActive?: boolean
    altName?: string | null
    altDescription?: string | null
  }

  export type TenantConfigurationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    serviceType?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    altName?: NullableStringFieldUpdateOperationsInput | string | null
    altDescription?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TenantConfigurationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    serviceType?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    altName?: NullableStringFieldUpdateOperationsInput | string | null
    altDescription?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TenantConfigurationCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    createdBy?: string | null
    updatedBy?: string | null
    name: string
    description?: string | null
    tenantId: string
    serviceType?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    isDefault?: boolean
    isActive?: boolean
    altName?: string | null
    altDescription?: string | null
  }

  export type TenantConfigurationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    serviceType?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    altName?: NullableStringFieldUpdateOperationsInput | string | null
    altDescription?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TenantConfigurationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    serviceType?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    altName?: NullableStringFieldUpdateOperationsInput | string | null
    altDescription?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrganizationCreateInput = {
    id?: string
    name: string
    description?: string | null
    status?: string
    rootDomain?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    tenants?: TenantCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    status?: string
    rootDomain?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    tenants?: TenantUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    rootDomain?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tenants?: TenantUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    rootDomain?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tenants?: TenantUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    status?: string
    rootDomain?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type OrganizationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    rootDomain?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrganizationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    rootDomain?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    createdBy?: string | null
    updatedBy?: string | null
    name: string
    description?: string | null
    domain?: string | null
    tenantId: string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: string | null
    fnetUrl?: string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: string | null
    altDescription?: string | null
    isWorkflowEnabled?: boolean
    apiKey?: string | null
    domainPrefix?: string | null
    organization?: OrganizationCreateNestedOneWithoutTenantsInput
  }

  export type TenantUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    createdBy?: string | null
    updatedBy?: string | null
    name: string
    description?: string | null
    domain?: string | null
    tenantId: string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: string | null
    fnetUrl?: string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: string | null
    altDescription?: string | null
    isWorkflowEnabled?: boolean
    apiKey?: string | null
    domainPrefix?: string | null
    organizationId?: string | null
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fnetUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: NullableStringFieldUpdateOperationsInput | string | null
    altDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isWorkflowEnabled?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    domainPrefix?: NullableStringFieldUpdateOperationsInput | string | null
    organization?: OrganizationUpdateOneWithoutTenantsNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fnetUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: NullableStringFieldUpdateOperationsInput | string | null
    altDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isWorkflowEnabled?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    domainPrefix?: NullableStringFieldUpdateOperationsInput | string | null
    organizationId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TenantCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    createdBy?: string | null
    updatedBy?: string | null
    name: string
    description?: string | null
    domain?: string | null
    tenantId: string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: string | null
    fnetUrl?: string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: string | null
    altDescription?: string | null
    isWorkflowEnabled?: boolean
    apiKey?: string | null
    domainPrefix?: string | null
    organizationId?: string | null
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fnetUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: NullableStringFieldUpdateOperationsInput | string | null
    altDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isWorkflowEnabled?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    domainPrefix?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fnetUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: NullableStringFieldUpdateOperationsInput | string | null
    altDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isWorkflowEnabled?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    domainPrefix?: NullableStringFieldUpdateOperationsInput | string | null
    organizationId?: NullableStringFieldUpdateOperationsInput | string | null
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
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
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
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
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

  export type ApiKeyOrderByRelevanceInput = {
    fields: ApiKeyOrderByRelevanceFieldEnum | ApiKeyOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ApiKeyCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    keyId?: SortOrder
    secretHash?: SortOrder
    userId?: SortOrder
    tenantId?: SortOrder
    scopes?: SortOrder
    services?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    revokedBy?: SortOrder
    revokedAt?: SortOrder
  }

  export type ApiKeyMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    keyId?: SortOrder
    secretHash?: SortOrder
    userId?: SortOrder
    tenantId?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    revokedBy?: SortOrder
    revokedAt?: SortOrder
  }

  export type ApiKeyMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    keyId?: SortOrder
    secretHash?: SortOrder
    userId?: SortOrder
    tenantId?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    revokedBy?: SortOrder
    revokedAt?: SortOrder
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
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type FeatureFlagOrderByRelevanceInput = {
    fields: FeatureFlagOrderByRelevanceFieldEnum | FeatureFlagOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type FeatureFlagCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    description?: SortOrder
    tenantId?: SortOrder
    enabled?: SortOrder
    target?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    created_by?: SortOrder
    updated_by?: SortOrder
  }

  export type FeatureFlagMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    description?: SortOrder
    tenantId?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    created_by?: SortOrder
    updated_by?: SortOrder
  }

  export type FeatureFlagMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    description?: SortOrder
    tenantId?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    created_by?: SortOrder
    updated_by?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type TenantApiKeyOrderByRelevanceInput = {
    fields: TenantApiKeyOrderByRelevanceFieldEnum | TenantApiKeyOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type TenantApiKeyCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    apiKey?: SortOrder
    tenantId?: SortOrder
    entryCode?: SortOrder
    passCode?: SortOrder
    attributes?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type TenantApiKeyMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    apiKey?: SortOrder
    tenantId?: SortOrder
    entryCode?: SortOrder
    passCode?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type TenantApiKeyMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    apiKey?: SortOrder
    tenantId?: SortOrder
    entryCode?: SortOrder
    passCode?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type TenantConfigurationOrderByRelevanceInput = {
    fields: TenantConfigurationOrderByRelevanceFieldEnum | TenantConfigurationOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type TenantConfigurationCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    name?: SortOrder
    description?: SortOrder
    tenantId?: SortOrder
    serviceType?: SortOrder
    metadata?: SortOrder
    isDefault?: SortOrder
    isActive?: SortOrder
    altName?: SortOrder
    altDescription?: SortOrder
  }

  export type TenantConfigurationMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    name?: SortOrder
    description?: SortOrder
    tenantId?: SortOrder
    serviceType?: SortOrder
    isDefault?: SortOrder
    isActive?: SortOrder
    altName?: SortOrder
    altDescription?: SortOrder
  }

  export type TenantConfigurationMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    name?: SortOrder
    description?: SortOrder
    tenantId?: SortOrder
    serviceType?: SortOrder
    isDefault?: SortOrder
    isActive?: SortOrder
    altName?: SortOrder
    altDescription?: SortOrder
  }

  export type TenantListRelationFilter = {
    every?: TenantWhereInput
    some?: TenantWhereInput
    none?: TenantWhereInput
  }

  export type TenantOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrganizationOrderByRelevanceInput = {
    fields: OrganizationOrderByRelevanceFieldEnum | OrganizationOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type OrganizationCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    status?: SortOrder
    rootDomain?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type OrganizationMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    status?: SortOrder
    rootDomain?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type OrganizationMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    status?: SortOrder
    rootDomain?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type OrganizationNullableScalarRelationFilter = {
    is?: OrganizationWhereInput | null
    isNot?: OrganizationWhereInput | null
  }

  export type TenantOrderByRelevanceInput = {
    fields: TenantOrderByRelevanceFieldEnum | TenantOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    name?: SortOrder
    description?: SortOrder
    domain?: SortOrder
    tenantId?: SortOrder
    clients?: SortOrder
    dbUrl?: SortOrder
    fnetUrl?: SortOrder
    logo?: SortOrder
    altName?: SortOrder
    altDescription?: SortOrder
    isWorkflowEnabled?: SortOrder
    apiKey?: SortOrder
    domainPrefix?: SortOrder
    organizationId?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    name?: SortOrder
    description?: SortOrder
    domain?: SortOrder
    tenantId?: SortOrder
    dbUrl?: SortOrder
    fnetUrl?: SortOrder
    altName?: SortOrder
    altDescription?: SortOrder
    isWorkflowEnabled?: SortOrder
    apiKey?: SortOrder
    domainPrefix?: SortOrder
    organizationId?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    name?: SortOrder
    description?: SortOrder
    domain?: SortOrder
    tenantId?: SortOrder
    dbUrl?: SortOrder
    fnetUrl?: SortOrder
    altName?: SortOrder
    altDescription?: SortOrder
    isWorkflowEnabled?: SortOrder
    apiKey?: SortOrder
    domainPrefix?: SortOrder
    organizationId?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type TenantCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<TenantCreateWithoutOrganizationInput, TenantUncheckedCreateWithoutOrganizationInput> | TenantCreateWithoutOrganizationInput[] | TenantUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutOrganizationInput | TenantCreateOrConnectWithoutOrganizationInput[]
    createMany?: TenantCreateManyOrganizationInputEnvelope
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
  }

  export type TenantUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<TenantCreateWithoutOrganizationInput, TenantUncheckedCreateWithoutOrganizationInput> | TenantCreateWithoutOrganizationInput[] | TenantUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutOrganizationInput | TenantCreateOrConnectWithoutOrganizationInput[]
    createMany?: TenantCreateManyOrganizationInputEnvelope
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
  }

  export type TenantUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<TenantCreateWithoutOrganizationInput, TenantUncheckedCreateWithoutOrganizationInput> | TenantCreateWithoutOrganizationInput[] | TenantUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutOrganizationInput | TenantCreateOrConnectWithoutOrganizationInput[]
    upsert?: TenantUpsertWithWhereUniqueWithoutOrganizationInput | TenantUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: TenantCreateManyOrganizationInputEnvelope
    set?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    disconnect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    delete?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    update?: TenantUpdateWithWhereUniqueWithoutOrganizationInput | TenantUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: TenantUpdateManyWithWhereWithoutOrganizationInput | TenantUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: TenantScalarWhereInput | TenantScalarWhereInput[]
  }

  export type TenantUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<TenantCreateWithoutOrganizationInput, TenantUncheckedCreateWithoutOrganizationInput> | TenantCreateWithoutOrganizationInput[] | TenantUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutOrganizationInput | TenantCreateOrConnectWithoutOrganizationInput[]
    upsert?: TenantUpsertWithWhereUniqueWithoutOrganizationInput | TenantUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: TenantCreateManyOrganizationInputEnvelope
    set?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    disconnect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    delete?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    update?: TenantUpdateWithWhereUniqueWithoutOrganizationInput | TenantUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: TenantUpdateManyWithWhereWithoutOrganizationInput | TenantUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: TenantScalarWhereInput | TenantScalarWhereInput[]
  }

  export type OrganizationCreateNestedOneWithoutTenantsInput = {
    create?: XOR<OrganizationCreateWithoutTenantsInput, OrganizationUncheckedCreateWithoutTenantsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutTenantsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type OrganizationUpdateOneWithoutTenantsNestedInput = {
    create?: XOR<OrganizationCreateWithoutTenantsInput, OrganizationUncheckedCreateWithoutTenantsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutTenantsInput
    upsert?: OrganizationUpsertWithoutTenantsInput
    disconnect?: OrganizationWhereInput | boolean
    delete?: OrganizationWhereInput | boolean
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutTenantsInput, OrganizationUpdateWithoutTenantsInput>, OrganizationUncheckedUpdateWithoutTenantsInput>
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
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
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
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
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
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
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
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
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

  export type TenantCreateWithoutOrganizationInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    createdBy?: string | null
    updatedBy?: string | null
    name: string
    description?: string | null
    domain?: string | null
    tenantId: string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: string | null
    fnetUrl?: string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: string | null
    altDescription?: string | null
    isWorkflowEnabled?: boolean
    apiKey?: string | null
    domainPrefix?: string | null
  }

  export type TenantUncheckedCreateWithoutOrganizationInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    createdBy?: string | null
    updatedBy?: string | null
    name: string
    description?: string | null
    domain?: string | null
    tenantId: string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: string | null
    fnetUrl?: string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: string | null
    altDescription?: string | null
    isWorkflowEnabled?: boolean
    apiKey?: string | null
    domainPrefix?: string | null
  }

  export type TenantCreateOrConnectWithoutOrganizationInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutOrganizationInput, TenantUncheckedCreateWithoutOrganizationInput>
  }

  export type TenantCreateManyOrganizationInputEnvelope = {
    data: TenantCreateManyOrganizationInput | TenantCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: TenantWhereUniqueInput
    update: XOR<TenantUpdateWithoutOrganizationInput, TenantUncheckedUpdateWithoutOrganizationInput>
    create: XOR<TenantCreateWithoutOrganizationInput, TenantUncheckedCreateWithoutOrganizationInput>
  }

  export type TenantUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: TenantWhereUniqueInput
    data: XOR<TenantUpdateWithoutOrganizationInput, TenantUncheckedUpdateWithoutOrganizationInput>
  }

  export type TenantUpdateManyWithWhereWithoutOrganizationInput = {
    where: TenantScalarWhereInput
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type TenantScalarWhereInput = {
    AND?: TenantScalarWhereInput | TenantScalarWhereInput[]
    OR?: TenantScalarWhereInput[]
    NOT?: TenantScalarWhereInput | TenantScalarWhereInput[]
    id?: StringFilter<"Tenant"> | string
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    createdBy?: StringNullableFilter<"Tenant"> | string | null
    updatedBy?: StringNullableFilter<"Tenant"> | string | null
    name?: StringFilter<"Tenant"> | string
    description?: StringNullableFilter<"Tenant"> | string | null
    domain?: StringNullableFilter<"Tenant"> | string | null
    tenantId?: StringFilter<"Tenant"> | string
    clients?: JsonNullableFilter<"Tenant">
    dbUrl?: StringNullableFilter<"Tenant"> | string | null
    fnetUrl?: StringNullableFilter<"Tenant"> | string | null
    logo?: JsonNullableFilter<"Tenant">
    altName?: StringNullableFilter<"Tenant"> | string | null
    altDescription?: StringNullableFilter<"Tenant"> | string | null
    isWorkflowEnabled?: BoolFilter<"Tenant"> | boolean
    apiKey?: StringNullableFilter<"Tenant"> | string | null
    domainPrefix?: StringNullableFilter<"Tenant"> | string | null
    organizationId?: StringNullableFilter<"Tenant"> | string | null
  }

  export type OrganizationCreateWithoutTenantsInput = {
    id?: string
    name: string
    description?: string | null
    status?: string
    rootDomain?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type OrganizationUncheckedCreateWithoutTenantsInput = {
    id?: string
    name: string
    description?: string | null
    status?: string
    rootDomain?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type OrganizationCreateOrConnectWithoutTenantsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutTenantsInput, OrganizationUncheckedCreateWithoutTenantsInput>
  }

  export type OrganizationUpsertWithoutTenantsInput = {
    update: XOR<OrganizationUpdateWithoutTenantsInput, OrganizationUncheckedUpdateWithoutTenantsInput>
    create: XOR<OrganizationCreateWithoutTenantsInput, OrganizationUncheckedCreateWithoutTenantsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutTenantsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutTenantsInput, OrganizationUncheckedUpdateWithoutTenantsInput>
  }

  export type OrganizationUpdateWithoutTenantsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    rootDomain?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrganizationUncheckedUpdateWithoutTenantsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    rootDomain?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantCreateManyOrganizationInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    createdBy?: string | null
    updatedBy?: string | null
    name: string
    description?: string | null
    domain?: string | null
    tenantId: string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: string | null
    fnetUrl?: string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: string | null
    altDescription?: string | null
    isWorkflowEnabled?: boolean
    apiKey?: string | null
    domainPrefix?: string | null
  }

  export type TenantUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fnetUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: NullableStringFieldUpdateOperationsInput | string | null
    altDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isWorkflowEnabled?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    domainPrefix?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TenantUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fnetUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: NullableStringFieldUpdateOperationsInput | string | null
    altDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isWorkflowEnabled?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    domainPrefix?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TenantUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    clients?: NullableJsonNullValueInput | InputJsonValue
    dbUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fnetUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableJsonNullValueInput | InputJsonValue
    altName?: NullableStringFieldUpdateOperationsInput | string | null
    altDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isWorkflowEnabled?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    domainPrefix?: NullableStringFieldUpdateOperationsInput | string | null
  }



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