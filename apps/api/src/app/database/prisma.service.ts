import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  PrismaClient,
} from '@gateway-workspace/database/prisma/prisma-client/index';
import {
  PrismaClient as FnetGVPrismaClient,
} from '@gateway-workspace/database/prisma/fnet-gv-client/index';
import {
  PrismaClient as FnetTPPrismaClient,
} from '@gateway-workspace/database/prisma/fnet-tp-client/index';

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
