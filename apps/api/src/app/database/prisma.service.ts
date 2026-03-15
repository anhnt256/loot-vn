import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  PrismaClient,
  FnetGVPrismaClient,
  FnetTPPrismaClient,
  TenantPrismaClient,
} from '@gateway-workspace/database';

@Injectable()
// @ts-ignore: PrismaClient missing index signature
export class TenantPrismaService
  extends TenantPrismaClient
  implements OnModuleInit
{
  async onModuleInit() {
    await this.$connect();
  }
}

@Injectable()
// @ts-ignore: PrismaClient missing index signature
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}

@Injectable()
// @ts-ignore: PrismaClient missing index signature
export class FnetGVPrismaService
  extends FnetGVPrismaClient
  implements OnModuleInit
{
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.FNET_GV_DATABASE_URL,
        },
      },
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
}

@Injectable()
// @ts-ignore: PrismaClient missing index signature
export class FnetTPPrismaService
  extends FnetTPPrismaClient
  implements OnModuleInit
{
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.FNET_TP_DATABASE_URL,
        },
      },
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
