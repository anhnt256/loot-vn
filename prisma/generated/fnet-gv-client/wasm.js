
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

exports.Prisma.AccountingentrytbScalarFieldEnum = {
  ID: 'ID',
  CreateDate: 'CreateDate',
  CreateTime: 'CreateTime',
  StaffID: 'StaffID',
  FromDate: 'FromDate',
  FromTime: 'FromTime',
  NumBalance: 'NumBalance',
  ImportQuantity: 'ImportQuantity',
  ImportTotalAmount: 'ImportTotalAmount',
  SaleQuantity: 'SaleQuantity',
  SaleTotalAmount: 'SaleTotalAmount',
  NumInventoryExpected: 'NumInventoryExpected',
  NumInventoryReal: 'NumInventoryReal',
  NumAdjust: 'NumAdjust',
  Note: 'Note',
  ServiceID: 'ServiceID'
};

exports.Prisma.AnonymoustbScalarFieldEnum = {
  ID: 'ID',
  Name: 'Name',
  IDCard: 'IDCard',
  Address: 'Address',
  MachineID: 'MachineID',
  Session: 'Session',
  RecordDate: 'RecordDate'
};

exports.Prisma.ApplicationrenttbScalarFieldEnum = {
  ApplicationRentID: 'ApplicationRentID',
  Name: 'Name',
  Hash: 'Hash',
  AddBy: 'AddBy',
  Status: 'Status'
};

exports.Prisma.ApplicationtbScalarFieldEnum = {
  ApplicationId: 'ApplicationId',
  ApplicationName: 'ApplicationName',
  Description: 'Description',
  RestrictType: 'RestrictType',
  Hash: 'Hash',
  AppType: 'AppType',
  AddedBy: 'AddedBy'
};

exports.Prisma.BlacklisttbScalarFieldEnum = {
  URLId: 'URLId',
  URL: 'URL',
  Title: 'Title',
  Description: 'Description',
  RecordDate: 'RecordDate',
  Active: 'Active',
  AddedBy: 'AddedBy'
};

exports.Prisma.ChangepcdetailtbScalarFieldEnum = {
  ChangePCDetailId: 'ChangePCDetailId',
  VoucherId: 'VoucherId',
  FromMachineId: 'FromMachineId',
  ToMachineId: 'ToMachineId',
  TimeUsed: 'TimeUsed',
  MoneyUsed: 'MoneyUsed',
  SessionId: 'SessionId',
  ChangePCDate: 'ChangePCDate',
  ChangePCTime: 'ChangePCTime',
  BeginDateTime: 'BeginDateTime',
  LogNote: 'LogNote',
  MachineName: 'MachineName',
  LogType: 'LogType'
};

exports.Prisma.ClientatbScalarFieldEnum = {
  ID: 'ID',
  PubID: 'PubID',
  AID: 'AID',
  DateA: 'DateA',
  STime: 'STime',
  ETime: 'ETime',
  FName: 'FName',
  FLink: 'FLink',
  Area: 'Area',
  Panel: 'Panel',
  Row: 'Row',
  Col: 'Col',
  Method: 'Method',
  CountS: 'CountS',
  CountC: 'CountC',
  RecordDate: 'RecordDate'
};

exports.Prisma.ClientsystbScalarFieldEnum = {
  ID: 'ID',
  UserId: 'UserId',
  MAC: 'MAC',
  CPU: 'CPU',
  RAM: 'RAM',
  HD: 'HD',
  OS: 'OS',
  CardName: 'CardName',
  ChipType: 'ChipType',
  VGAMem: 'VGAMem',
  NIC: 'NIC',
  FreeSpace: 'FreeSpace',
  CPName: 'CPName',
  Active: 'Active',
  NTFS: 'NTFS',
  FAT: 'FAT',
  Mainboard: 'Mainboard',
  IP: 'IP',
  LAN: 'LAN',
  RamFree: 'RamFree',
  PageFile: 'PageFile',
  TempCPU: 'TempCPU',
  LoadCPU: 'LoadCPU',
  TempGPU: 'TempGPU',
  LoadGPU: 'LoadGPU',
  LastUpdate: 'LastUpdate',
  PCName: 'PCName',
  NetInfo: 'NetInfo'
};

exports.Prisma.CombodetailtbScalarFieldEnum = {
  ComboDetailID: 'ComboDetailID',
  UserID: 'UserID',
  ComboID: 'ComboID',
  VoucherID: 'VoucherID',
  Accept: 'Accept',
  CreateDate: 'CreateDate',
  CreateTime: 'CreateTime',
  FromDate: 'FromDate',
  FromTime: 'FromTime',
  ToDate: 'ToDate',
  ToTime: 'ToTime',
  Zone: 'Zone',
  LoginTime: 'LoginTime',
  Ownerid: 'Ownerid'
};

exports.Prisma.CombodonatetbScalarFieldEnum = {
  ComboDonateID: 'ComboDonateID',
  ComboID: 'ComboID',
  ServiceID: 'ServiceID',
  Quantity: 'Quantity'
};

exports.Prisma.CombotbScalarFieldEnum = {
  ComboID: 'ComboID',
  Name: 'Name',
  Price: 'Price',
  CreateDate: 'CreateDate',
  CreateTime: 'CreateTime',
  Type: 'Type',
  PreAlias: 'PreAlias',
  IsStatus: 'IsStatus',
  OrderPosition: 'OrderPosition',
  NumOfDay: 'NumOfDay'
};

exports.Prisma.CombousagetbScalarFieldEnum = {
  ComboUsageID: 'ComboUsageID',
  ComboID: 'ComboID',
  MachineGroupID: 'MachineGroupID',
  FromTime: 'FromTime',
  ToTime: 'ToTime'
};

exports.Prisma.ConvertunittbScalarFieldEnum = {
  ID: 'ID',
  ServiceID: 'ServiceID',
  UnitRootID: 'UnitRootID',
  ConvertUnitID: 'ConvertUnitID',
  Quantity: 'Quantity'
};

exports.Prisma.DptbScalarFieldEnum = {
  ComputerName: 'ComputerName',
  Status: 'Status',
  Type: 'Type',
  Version: 'Version',
  LastUpdate: 'LastUpdate',
  FNetVersion: 'FNetVersion',
  FNetReleaseDate: 'FNetReleaseDate',
  DPB: 'DPB'
};

exports.Prisma.FreetimedetailtbScalarFieldEnum = {
  FreeTimeDetailId: 'FreeTimeDetailId',
  UserId: 'UserId',
  FreeTime: 'FreeTime',
  FreeMoney: 'FreeMoney',
  Type: 'Type',
  RecordDate: 'RecordDate',
  VoucherId: 'VoucherId'
};

exports.Prisma.FunctiontbScalarFieldEnum = {
  FunctionCode: 'FunctionCode',
  FunctionName: 'FunctionName',
  ParentFunction: 'ParentFunction',
  LevelFunction: 'LevelFunction',
  OrderOfLevel: 'OrderOfLevel',
  Active: 'Active'
};

exports.Prisma.GamefoldertbScalarFieldEnum = {
  ID: 'ID',
  MachineID: 'MachineID',
  GameId: 'GameId',
  GamePath: 'GamePath'
};

exports.Prisma.GamelisttbScalarFieldEnum = {
  GameId: 'GameId',
  GameAlias: 'GameAlias',
  GameName: 'GameName',
  GameLauncher: 'GameLauncher',
  Active: 'Active',
  Protocol: 'Protocol',
  URL: 'URL',
  Checksum: 'Checksum',
  PublishDate: 'PublishDate',
  TorrentFile: 'TorrentFile',
  SetupFile: 'SetupFile',
  ShortcutPath: 'ShortcutPath',
  Type: 'Type',
  Size: 'Size',
  SetupType: 'SetupType',
  ConfigFile: 'ConfigFile',
  Checked: 'Checked'
};

exports.Prisma.HptbScalarFieldEnum = {
  ID: 'ID',
  MachineName: 'MachineName',
  IEHP: 'IEHP',
  FFHP: 'FFHP',
  GCHP: 'GCHP',
  LastUpdateDate: 'LastUpdateDate'
};

exports.Prisma.IntoptiontbScalarFieldEnum = {
  OptionId: 'OptionId',
  OptionName: 'OptionName',
  Value: 'Value',
  Active: 'Active'
};

exports.Prisma.InventorytbScalarFieldEnum = {
  ID: 'ID',
  CreateDate: 'CreateDate',
  CreateTime: 'CreateTime',
  StaffID: 'StaffID',
  Note: 'Note',
  ServiceID: 'ServiceID',
  ImportQuantity: 'ImportQuantity',
  ImportPrice: 'ImportPrice',
  ImportTotalAmount: 'ImportTotalAmount'
};

exports.Prisma.LegalapptbScalarFieldEnum = {
  AppName: 'AppName'
};

exports.Prisma.MachinegrouptbScalarFieldEnum = {
  MachineGroupId: 'MachineGroupId',
  MachineGroupName: 'MachineGroupName',
  PriceDefault: 'PriceDefault',
  Active: 'Active',
  Description: 'Description'
};

exports.Prisma.PaymenttbScalarFieldEnum = {
  VoucherId: 'VoucherId',
  UserId: 'UserId',
  VoucherNo: 'VoucherNo',
  VoucherDate: 'VoucherDate',
  VoucherTime: 'VoucherTime',
  ServeDate: 'ServeDate',
  ServeTime: 'ServeTime',
  Amount: 'Amount',
  AutoAmount: 'AutoAmount',
  TimeTotal: 'TimeTotal',
  Active: 'Active',
  UserNote: 'UserNote',
  Note: 'Note',
  ServicePaid: 'ServicePaid',
  StaffId: 'StaffId',
  MachineName: 'MachineName',
  PaymentType: 'PaymentType',
  PaymentWaitId: 'PaymentWaitId',
  zOid: 'zOid',
  zTid: 'zTid',
  zSig: 'zSig'
};

exports.Prisma.PaymentwaittbScalarFieldEnum = {
  PaymentWaitId: 'PaymentWaitId',
  MachineName: 'MachineName',
  TotalTimeUsed: 'TotalTimeUsed',
  TotalTimeFee: 'TotalTimeFee',
  BeginTime: 'BeginTime',
  EndTime: 'EndTime',
  TimeFee: 'TimeFee',
  TimeUsed: 'TimeUsed',
  RemainTime: 'RemainTime',
  TimePaid: 'TimePaid',
  FreeTime: 'FreeTime',
  ChangePCSessionId: 'ChangePCSessionId',
  AnonymId: 'AnonymId',
  PriceGroupId: 'PriceGroupId',
  MachineGroupId: 'MachineGroupId',
  Note: 'Note',
  PriceAppRentID: 'PriceAppRentID'
};

exports.Prisma.PriceapprenttbScalarFieldEnum = {
  PriceAppRentID: 'PriceAppRentID',
  PriceID: 'PriceID',
  MachineGroupID: 'MachineGroupID',
  Name: 'Name',
  Price: 'Price',
  Status: 'Status'
};

exports.Prisma.PriceapprentusetbScalarFieldEnum = {
  PriceAppRentUseID: 'PriceAppRentUseID',
  PriceAppRentID: 'PriceAppRentID',
  ApplicationRentID: 'ApplicationRentID'
};

exports.Prisma.PricedetailtbScalarFieldEnum = {
  PriceDetailId: 'PriceDetailId',
  PriceId: 'PriceId',
  MachineGroupId: 'MachineGroupId',
  Price: 'Price',
  Promotion: 'Promotion',
  PromotionTerm: 'PromotionTerm',
  FreeMoney: 'FreeMoney',
  FreeTime: 'FreeTime',
  BeginTime: 'BeginTime',
  EndTime: 'EndTime',
  Term: 'Term',
  PromotionOrder: 'PromotionOrder',
  BeginDate: 'BeginDate',
  EndDate: 'EndDate',
  DayOfWeekMask: 'DayOfWeekMask',
  PromotionType: 'PromotionType'
};

exports.Prisma.PricelisttbScalarFieldEnum = {
  PriceId: 'PriceId',
  PriceType: 'PriceType',
  Price: 'Price',
  Type: 'Type',
  Active: 'Active'
};

exports.Prisma.PricemachinetbScalarFieldEnum = {
  PriceMachineId: 'PriceMachineId',
  PriceId: 'PriceId',
  MachineGroupId: 'MachineGroupId',
  Price: 'Price'
};

exports.Prisma.PrintertbScalarFieldEnum = {
  ID: 'ID',
  PrinterName: 'PrinterName',
  Type: 'Type',
  Active: 'Active'
};

exports.Prisma.PrintservicetbScalarFieldEnum = {
  ID: 'ID',
  PrinterID: 'PrinterID',
  ServiceID: 'ServiceID'
};

exports.Prisma.ProcesstbScalarFieldEnum = {
  ID: 'ID',
  MachineName: 'MachineName',
  ProcessName: 'ProcessName',
  FileLocation: 'FileLocation',
  FileDescription: 'FileDescription',
  Type: 'Type',
  PreviousDate: 'PreviousDate',
  CurrentDate: 'CurrentDate'
};

exports.Prisma.RechargecarddetailtbScalarFieldEnum = {
  CardDetailId: 'CardDetailId',
  VoucherId: 'VoucherId',
  StaffId: 'StaffId',
  CardValue: 'CardValue',
  CardDate: 'CardDate',
  CardTime: 'CardTime',
  CardQuantity: 'CardQuantity',
  CardAmount: 'CardAmount',
  UserId: 'UserId',
  Accept: 'Accept'
};

exports.Prisma.RechargecardtbScalarFieldEnum = {
  CardId: 'CardId',
  cardcode: 'cardcode',
  CardValue: 'CardValue',
  ExpiryDate: 'ExpiryDate',
  CreateDate: 'CreateDate',
  CreateTime: 'CreateTime',
  ModifyDate: 'ModifyDate',
  ModifyTime: 'ModifyTime',
  Status: 'Status',
  UserId: 'UserId',
  Note: 'Note'
};

exports.Prisma.ReportdailyScalarFieldEnum = {
  ymd: 'ymd',
  prefix: 'prefix',
  mode: 'mode',
  f1: 'f1',
  f2: 'f2',
  f3: 'f3',
  f4: 'f4',
  f5: 'f5',
  f6: 'f6',
  f7: 'f7',
  f8: 'f8',
  f9: 'f9',
  f10: 'f10',
  f11: 'f11',
  f12: 'f12',
  f13: 'f13',
  f14: 'f14',
  f15: 'f15',
  f16: 'f16',
  f17: 'f17',
  f18: 'f18',
  f19: 'f19',
  f20: 'f20',
  ext: 'ext',
  hash: 'hash',
  create_date: 'create_date',
  update_date: 'update_date'
};

exports.Prisma.ReportmonthlyScalarFieldEnum = {
  ymd: 'ymd',
  prefix: 'prefix',
  mode: 'mode',
  f1: 'f1',
  f2: 'f2',
  f3: 'f3',
  f4: 'f4',
  f5: 'f5',
  f6: 'f6',
  f7: 'f7',
  f8: 'f8',
  f9: 'f9',
  f10: 'f10',
  f11: 'f11',
  f12: 'f12',
  f13: 'f13',
  f14: 'f14',
  f15: 'f15',
  f16: 'f16',
  f17: 'f17',
  f18: 'f18',
  f19: 'f19',
  f20: 'f20',
  ext: 'ext',
  hash: 'hash',
  create_date: 'create_date',
  update_date: 'update_date'
};

exports.Prisma.RighttbScalarFieldEnum = {
  RightId: 'RightId',
  UserId: 'UserId',
  FunctionCode: 'FunctionCode'
};

exports.Prisma.ServerlogtbScalarFieldEnum = {
  ServerLogId: 'ServerLogId',
  Status: 'Status',
  RecordDate: 'RecordDate',
  RecordTime: 'RecordTime',
  Period: 'Period',
  Note: 'Note'
};

exports.Prisma.ServicedetailtbScalarFieldEnum = {
  ServiceDetailId: 'ServiceDetailId',
  UserId: 'UserId',
  ServiceId: 'ServiceId',
  ServiceDate: 'ServiceDate',
  ServiceTime: 'ServiceTime',
  ServiceQuantity: 'ServiceQuantity',
  ServiceAmount: 'ServiceAmount',
  ServicePaid: 'ServicePaid',
  Accept: 'Accept',
  VoucherId: 'VoucherId',
  StaffId: 'StaffId',
  PaymentWaitId: 'PaymentWaitId',
  iCafeHash: 'iCafeHash',
  iCafeUsr: 'iCafeUsr'
};

exports.Prisma.ServicegiftsbagScalarFieldEnum = {
  recId: 'recId',
  recUuid: 'recUuid',
  userId: 'userId',
  userName: 'userName',
  createDate: 'createDate',
  expDate: 'expDate',
  sourceType: 'sourceType',
  serviceId: 'serviceId',
  serviceName: 'serviceName',
  servicePrice: 'servicePrice',
  serviceImg: 'serviceImg',
  status: 'status',
  requestDate: 'requestDate',
  acceptDate: 'acceptDate',
  sign: 'sign',
  staffId: 'staffId',
  staffName: 'staffName',
  transId: 'transId',
  serialId: 'serialId',
  ymd: 'ymd',
  totalDay: 'totalDay',
  groupId: 'groupId'
};

exports.Prisma.ServicegrouptbScalarFieldEnum = {
  ID: 'ID',
  ServiceGroupName: 'ServiceGroupName',
  IsOrder: 'IsOrder',
  Active: 'Active',
  TypeID: 'TypeID'
};

exports.Prisma.ServiceinfologtbScalarFieldEnum = {
  logId: 'logId',
  serviceId: 'serviceId',
  prefix: 'prefix',
  info: 'info',
  status: 'status',
  createDate: 'createDate',
  mode: 'mode',
  hash: 'hash'
};

exports.Prisma.ServiceinfotbScalarFieldEnum = {
  serviceId: 'serviceId',
  prefix: 'prefix',
  info: 'info',
  status: 'status',
  createDate: 'createDate',
  mode: 'mode',
  hash: 'hash'
};

exports.Prisma.ServicetbScalarFieldEnum = {
  ServiceId: 'ServiceId',
  ServiceName: 'ServiceName',
  ServicePrice: 'ServicePrice',
  Unit: 'Unit',
  Active: 'Active',
  InventoryManagement: 'InventoryManagement',
  Inventory: 'Inventory',
  WarningInventory: 'WarningInventory',
  ServiceGroupID: 'ServiceGroupID',
  NumInventoryExpected: 'NumInventoryExpected',
  UnitID: 'UnitID',
  SuggestID: 'SuggestID',
  ServiceImg: 'ServiceImg',
  ServiceDate: 'ServiceDate'
};

exports.Prisma.ServiceunittbScalarFieldEnum = {
  ID: 'ID',
  Unit: 'Unit',
  IsActive: 'IsActive'
};

exports.Prisma.ServicevisitScalarFieldEnum = {
  uid: 'uid',
  vstotal: 'vstotal',
  vsdetail: 'vsdetail',
  ym: 'ym',
  last_update: 'last_update',
  sign: 'sign',
  ssid: 'ssid',
  reset: 'reset'
};

exports.Prisma.SettingtbScalarFieldEnum = {
  SettingId: 'SettingId',
  Value: 'Value',
  Data: 'Data',
  Active: 'Active'
};

exports.Prisma.SoftwaretbScalarFieldEnum = {
  ID: 'ID',
  UserId: 'UserId',
  Name: 'Name',
  Version: 'Version',
  MAC: 'MAC',
  Active: 'Active'
};

exports.Prisma.SpecappdetailtbScalarFieldEnum = {
  ID: 'ID',
  MachineName: 'MachineName',
  AppName: 'AppName',
  Shortcut: 'Shortcut',
  InstallName: 'InstallName',
  InstallVersion: 'InstallVersion',
  InstallLocation: 'InstallLocation',
  LastUpdateDate: 'LastUpdateDate',
  Sent: 'Sent',
  AppRun: 'AppRun',
  SubRun: 'SubRun',
  SubRun2: 'SubRun2'
};

exports.Prisma.StandardservicetbScalarFieldEnum = {
  StandardServiceId: 'StandardServiceId',
  StandardServiceName: 'StandardServiceName',
  StandardServiceGroupID: 'StandardServiceGroupID',
  Active: 'Active'
};

exports.Prisma.StocktakingtbScalarFieldEnum = {
  ID: 'ID',
  CreateDate: 'CreateDate',
  CreateTime: 'CreateTime',
  StaffID: 'StaffID',
  NumInventoryExpected: 'NumInventoryExpected',
  NumInventoryReal: 'NumInventoryReal',
  NumAdjust: 'NumAdjust',
  NumPreAdjust: 'NumPreAdjust',
  Note: 'Note',
  ServiceID: 'ServiceID'
};

exports.Prisma.SupportsScalarFieldEnum = {
  supportId: 'supportId',
  supportTitle: 'supportTitle',
  supportImage: 'supportImage',
  suportCode: 'suportCode',
  supportHash: 'supportHash',
  status: 'status',
  order: 'order',
  supportCat: 'supportCat',
  totalClick: 'totalClick',
  ssId: 'ssId',
  createDate: 'createDate',
  modifyDate: 'modifyDate'
};

exports.Prisma.SystemfunctiontbScalarFieldEnum = {
  ResourceID: 'ResourceID',
  Status: 'Status'
};

exports.Prisma.SystemlogtbScalarFieldEnum = {
  SystemLogId: 'SystemLogId',
  UserId: 'UserId',
  MachineName: 'MachineName',
  IPAddress: 'IPAddress',
  EnterDate: 'EnterDate',
  EnterTime: 'EnterTime',
  EndDate: 'EndDate',
  EndTime: 'EndTime',
  Status: 'Status',
  Note: 'Note',
  TimeUsed: 'TimeUsed',
  MoneyUsed: 'MoneyUsed',
  PriceAppRentID: 'PriceAppRentID',
  AppRentMoneyUsed: 'AppRentMoneyUsed'
};

exports.Prisma.TrackappdetailtbScalarFieldEnum = {
  TrackAppDetailId: 'TrackAppDetailId',
  AppName: 'AppName',
  UserName: 'UserName',
  TrackingDate: 'TrackingDate',
  TrackingTime: 'TrackingTime',
  TimeTotal: 'TimeTotal',
  AppSession: 'AppSession',
  Sent: 'Sent',
  Machine: 'Machine',
  SessionId: 'SessionId',
  ETT: 'ETT'
};

exports.Prisma.TrackapptbScalarFieldEnum = {
  AppName: 'AppName',
  TrackingType: 'TrackingType'
};

exports.Prisma.TrackguitbScalarFieldEnum = {
  ID: 'ID',
  RecordDate: 'RecordDate',
  FromTime: 'FromTime',
  ToTime: 'ToTime',
  DialogID: 'DialogID',
  PrePath: 'PrePath',
  ControlID: 'ControlID',
  Type: 'Type',
  Param: 'Param',
  ActionCount: 'ActionCount'
};

exports.Prisma.TransferdetailtbScalarFieldEnum = {
  TransferDetailId: 'TransferDetailId',
  VoucherId: 'VoucherId',
  FromUserId: 'FromUserId',
  ToUserId: 'ToUserId',
  TransferDate: 'TransferDate',
  TransferTime: 'TransferTime'
};

exports.Prisma.UsagetimetbScalarFieldEnum = {
  UsageTimeId: 'UsageTimeId',
  UsageTimeName: 'UsageTimeName',
  FromAge: 'FromAge',
  ToAge: 'ToAge',
  UserType: 'UserType'
};

exports.Prisma.UsertbScalarFieldEnum = {
  UserId: 'UserId',
  FirstName: 'FirstName',
  LastName: 'LastName',
  MiddleName: 'MiddleName',
  UserName: 'UserName',
  Password: 'Password',
  ID: 'ID',
  Address: 'Address',
  Phone: 'Phone',
  Email: 'Email',
  City: 'City',
  State: 'State',
  Zipcode: 'Zipcode',
  Debit: 'Debit',
  CreditLimit: 'CreditLimit',
  Active: 'Active',
  RecordDate: 'RecordDate',
  ExpiryDate: 'ExpiryDate',
  UserType: 'UserType',
  Memo: 'Memo',
  Birthdate: 'Birthdate',
  SSN1: 'SSN1',
  SSN2: 'SSN2',
  SSN3: 'SSN3',
  TimePaid: 'TimePaid',
  TimeUsed: 'TimeUsed',
  MoneyPaid: 'MoneyPaid',
  MoneyUsed: 'MoneyUsed',
  RemainTime: 'RemainTime',
  FreeTime: 'FreeTime',
  TimeTransfer: 'TimeTransfer',
  RemainMoney: 'RemainMoney',
  FreeMoney: 'FreeMoney',
  MoneyTransfer: 'MoneyTransfer',
  UsageTimeId: 'UsageTimeId',
  PromotionTime: 'PromotionTime',
  PromotionMoney: 'PromotionMoney',
  MachineGroupId: 'MachineGroupId',
  MAC: 'MAC',
  changepcdetailId: 'changepcdetailId',
  MoneyUsedMin: 'MoneyUsedMin',
  CType: 'CType',
  Status: 'Status',
  LastLoginDate: 'LastLoginDate',
  PriceAppRentID: 'PriceAppRentID',
  EIType: 'EIType',
  pc_rptInfo: 'pc_rptInfo'
};

exports.Prisma.VersiontbScalarFieldEnum = {
  ComputerName: 'ComputerName',
  Version: 'Version',
  Type: 'Type',
  ReleaseDate: 'ReleaseDate',
  LastUpdate: 'LastUpdate',
  DPStatus: 'DPStatus',
  DPType: 'DPType',
  DPVersion: 'DPVersion'
};

exports.Prisma.WallettbScalarFieldEnum = {
  id: 'id',
  main: 'main',
  sub: 'sub',
  sub1: 'sub1',
  sub2: 'sub2',
  userid: 'userid',
  status: 'status',
  ts: 'ts',
  wsec: 'wsec',
  ssec: 'ssec'
};

exports.Prisma.WebhistorytbScalarFieldEnum = {
  URLId: 'URLId',
  URL: 'URL',
  RecordDate: 'RecordDate',
  UserId: 'UserId',
  Machine: 'Machine',
  Active: 'Active',
  Session: 'Session',
  AnonymousId: 'AnonymousId',
  BrowserType: 'BrowserType'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  accountingentrytb: 'accountingentrytb',
  anonymoustb: 'anonymoustb',
  applicationrenttb: 'applicationrenttb',
  applicationtb: 'applicationtb',
  blacklisttb: 'blacklisttb',
  changepcdetailtb: 'changepcdetailtb',
  clientatb: 'clientatb',
  clientsystb: 'clientsystb',
  combodetailtb: 'combodetailtb',
  combodonatetb: 'combodonatetb',
  combotb: 'combotb',
  combousagetb: 'combousagetb',
  convertunittb: 'convertunittb',
  dptb: 'dptb',
  freetimedetailtb: 'freetimedetailtb',
  functiontb: 'functiontb',
  gamefoldertb: 'gamefoldertb',
  gamelisttb: 'gamelisttb',
  hptb: 'hptb',
  intoptiontb: 'intoptiontb',
  inventorytb: 'inventorytb',
  legalapptb: 'legalapptb',
  machinegrouptb: 'machinegrouptb',
  paymenttb: 'paymenttb',
  paymentwaittb: 'paymentwaittb',
  priceapprenttb: 'priceapprenttb',
  priceapprentusetb: 'priceapprentusetb',
  pricedetailtb: 'pricedetailtb',
  pricelisttb: 'pricelisttb',
  pricemachinetb: 'pricemachinetb',
  printertb: 'printertb',
  printservicetb: 'printservicetb',
  processtb: 'processtb',
  rechargecarddetailtb: 'rechargecarddetailtb',
  rechargecardtb: 'rechargecardtb',
  reportdaily: 'reportdaily',
  reportmonthly: 'reportmonthly',
  righttb: 'righttb',
  serverlogtb: 'serverlogtb',
  servicedetailtb: 'servicedetailtb',
  servicegiftsbag: 'servicegiftsbag',
  servicegrouptb: 'servicegrouptb',
  serviceinfologtb: 'serviceinfologtb',
  serviceinfotb: 'serviceinfotb',
  servicetb: 'servicetb',
  serviceunittb: 'serviceunittb',
  servicevisit: 'servicevisit',
  settingtb: 'settingtb',
  softwaretb: 'softwaretb',
  specappdetailtb: 'specappdetailtb',
  standardservicetb: 'standardservicetb',
  stocktakingtb: 'stocktakingtb',
  supports: 'supports',
  systemfunctiontb: 'systemfunctiontb',
  systemlogtb: 'systemlogtb',
  trackappdetailtb: 'trackappdetailtb',
  trackapptb: 'trackapptb',
  trackguitb: 'trackguitb',
  transferdetailtb: 'transferdetailtb',
  usagetimetb: 'usagetimetb',
  usertb: 'usertb',
  versiontb: 'versiontb',
  wallettb: 'wallettb',
  webhistorytb: 'webhistorytb'
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
