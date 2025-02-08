import { PrismaClient } from "@/prisma/generated/prisma-client";
import { PrismaClient as FnetPrismaClient } from "@/prisma/generated/fnet-gv-client";
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

  const fnetGV = new FnetPrismaClient();

  switch (branchFromCookie) {
    case BRANCH.GOVAP:
      return fnetGV;
    default:
      return fnetGV;
  }
}

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
