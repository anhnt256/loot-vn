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

  const bigIntMiddleware: Parameters<typeof fnetGV.$use>[0] = async (
    params,
    next,
  ) => {
    const result = await next(params);

    // Format BigInt to string for serialization
    const formatBigInt = (obj: any): any => {
      if (obj === null || typeof obj !== "object") return obj;

      if (Array.isArray(obj)) {
        return obj.map(formatBigInt);
      }

      if (obj instanceof Date) {
        return obj; // Giữ nguyên Date object
      }

      const formatted: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Date) {
          formatted[key] = value; // Giữ nguyên Date
        } else if (typeof value === "bigint") {
          formatted[key] = value.toString();
        } else if (typeof value === "object" && value !== null) {
          formatted[key] = formatBigInt(value);
        } else {
          formatted[key] = value;
        }
      }
      return formatted;
    };

    // Return formatted result
    return formatBigInt(result);
  };

  fnetGV.$use(bigIntMiddleware);

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
