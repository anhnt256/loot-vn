import { PrismaClient as MainPrismaClient } from "./generated/prisma-client";
import {
  PrismaClient as FnetGVPrismaClient,
  Prisma as FnetGVPrisma,
} from "./generated/fnet-gv-client";
import {
  PrismaClient as FnetTPPrismaClient,
  Prisma as FnetTPPrisma,
} from "./generated/fnet-tp-client";
import { BRANCH } from "./types";
import { cookies } from "next/headers";

declare global {
  var prisma: MainPrismaClient | undefined;
  var fnetGVPrisma: FnetGVPrismaClient | undefined;
  var fnetTPPrisma: FnetTPPrismaClient | undefined;
}

export const db = globalThis.prisma || new MainPrismaClient();

// Singleton instances for Fnet databases
const fnetGV =
  globalThis.fnetGVPrisma ||
  new FnetGVPrismaClient({
    datasources: {
      db: {
        url: process.env.FNET_GV_DATABASE_URL,
      },
    },
  });

const fnetTP =
  globalThis.fnetTPPrisma ||
  new FnetTPPrismaClient({
    datasources: {
      db: {
        url: process.env.FNET_TP_DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
  globalThis.fnetGVPrisma = fnetGV;
  globalThis.fnetTPPrisma = fnetTP;
}

/** Get Fnet DB by branch string (e.g. GO_VAP, TAN_PHU). Use when branch is from query/param. */
export function getFnetDBByBranch(branch: string) {
  const b = (branch || "").trim();
  switch (b) {
    case BRANCH.GOVAP:
      return fnetGV;
    case BRANCH.TANPHU:
      return fnetTP;
    default:
      return fnetGV;
  }
}

// Create a factory function that gets called for each request
export async function getFnetDB() {
  if (typeof window !== "undefined") {
    throw new Error("This code must be run on the server side");
  }

  const cookieStore = await cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  if (!branchFromCookie) {
    throw new Error("Branch cookie is required but not found");
  }

  return getFnetDBByBranch(branchFromCookie);
}

export async function getFnetPrisma() {
  if (typeof window !== "undefined") {
    throw new Error("This code must be run on the server side");
  }

  const cookieStore = await cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  if (!branchFromCookie) {
    throw new Error("Branch cookie is required but not found");
  }

  switch (branchFromCookie) {
    case BRANCH.GOVAP:
      return FnetGVPrisma;
    case BRANCH.TANPHU:
      return FnetTPPrisma;
    default:
      return FnetGVPrisma;
  }
}

// Function to disconnect all databases (useful for cleanup)
export async function disconnectAll() {
  try {
    await db.$disconnect();
    await fnetGV.$disconnect();
    await fnetTP.$disconnect();
  } catch (error) {
    console.error("Error disconnecting databases:", error);
  }
}
