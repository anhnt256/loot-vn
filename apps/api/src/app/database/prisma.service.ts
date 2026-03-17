import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import {
  PrismaClient,
  FnetPrismaClient,
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

/** Gateway DB client by tenant dbUrl (from tenant table, not env). */
@Injectable()
export class GatewayPrismaService implements OnApplicationShutdown {
  private clientCache: Record<string, PrismaClient> = {};

  async getClient(dbUrl: string): Promise<PrismaClient> {
    if (!dbUrl || dbUrl.trim() === '') {
      throw new Error('Gateway dbUrl is required (use tenant.dbUrl from tenant table)');
    }
    const key = dbUrl.trim();
    if (!this.clientCache[key]) {
      const client = new PrismaClient({
        datasources: {
          db: { url: key },
        },
      });
      await client.$connect();
      this.clientCache[key] = client;
    }
    return this.clientCache[key];
  }

  async onApplicationShutdown() {
    await Promise.all(
      Object.values(this.clientCache).map((c) => c.$disconnect()),
    );
  }
}

@Injectable()
export class FnetPrismaService {
  private clientCache: Record<string, FnetPrismaClient> = {};

  async getClient(fnetUrl: string): Promise<FnetPrismaClient> {
    if (!fnetUrl) {
      throw new Error('Fnet URL is required but not provided');
    }

    if (!this.clientCache[fnetUrl]) {
      const client = new FnetPrismaClient({
        datasources: {
          db: {
            url: fnetUrl,
          },
        },
      });
      await client.$connect();
      this.clientCache[fnetUrl] = client;
    }

    return this.clientCache[fnetUrl];
  }

  async onApplicationShutdown() {
    const disconnectPromises = Object.values(this.clientCache).map((client) =>
      client.$disconnect(),
    );
    await Promise.all(disconnectPromises);
  }
}
