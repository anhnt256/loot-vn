import { PrismaClient } from "@/prisma/generated/prisma-client";
import { PrismaClient as FnetGVPrismaClient } from "@/prisma/generated/fnet-gv-client";
import { PrismaClient as FnetTPPrismaClient } from "@/prisma/generated/fnet-tp-client";
import { BRANCH } from "@/constants/enum.constant";
import { cookies } from "next/headers";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

// Create a factory function that gets called for each request
export function getFnetDB() {
  if (typeof window !== "undefined") {
    throw new Error("This code must be run on the server side");
  }

  const cookieStore = cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  if (!branchFromCookie) {
    throw new Error("Branch cookie is required but not found");
  }

  const fnetGV = new FnetGVPrismaClient();
  const fnetTP = new FnetTPPrismaClient();

  switch (branchFromCookie) {
    case BRANCH.GOVAP:
      return fnetGV;
    case BRANCH.TANPHU:
      return fnetTP;
    default:
      return fnetGV;
  }
}

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
