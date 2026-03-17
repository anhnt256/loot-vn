"use server";

import { PrismaClient as MainPrismaClient } from "./generated/prisma-client";
import {
  PrismaClient as FnetPrismaClient,
  Prisma as FnetPrisma,
} from "./generated/fnet-client";

declare global {
  var prisma: MainPrismaClient | undefined;
}

export const db = globalThis.prisma || new MainPrismaClient();

// Cache to hold dynamic instantiations of Fnet clients mapped by fnetUrl
const fnetClientCache: Record<string, FnetPrismaClient> = {};

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

/** Get Fnet DB dynamically by URL. Use when retrieving URL from Tenant table. */
export function getFnetDB(fnetUrl: string): FnetPrismaClient {
  if (!fnetUrl) throw new Error("Fnet URL is required but not provided");
  
  if (!fnetClientCache[fnetUrl]) {
    fnetClientCache[fnetUrl] = new FnetPrismaClient({
      datasources: { db: { url: fnetUrl } },
    });
  }
  
  return fnetClientCache[fnetUrl];
}

export function getFnetPrisma(fnetUrl: string) {
  if (!fnetUrl) throw new Error("Fnet URL is required but not provided");
  return FnetPrisma;
}

// Function to disconnect all databases (useful for cleanup)
export async function disconnectAll() {
  try {
    await db.$disconnect();
    
    // Disconnect all dynamically cached Fnet clients
    const disconnectPromises = Object.values(fnetClientCache).map(client => client.$disconnect());
    await Promise.all(disconnectPromises);
    
  } catch (error) {
    console.error("Error disconnecting databases:", error);
  }
}
