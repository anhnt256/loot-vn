import {
  PrismaClient,
  FnetGVPrismaClient,
  FnetTPPrismaClient,
  FnetGVPrisma,
  FnetTPPrisma,
} from '@gateway-workspace/database';
import { BRANCH } from '@/constants/enum.constant';

export const db = new PrismaClient();
const fnetGV = new FnetGVPrismaClient({
  datasources: { db: { url: process.env.FNET_GV_DATABASE_URL } },
});
const fnetTP = new FnetTPPrismaClient({
  datasources: { db: { url: process.env.FNET_TP_DATABASE_URL } },
});

export function getFnetDBByBranch(branch: string) {
  const b = (branch || '').trim();
  switch (b) {
    case BRANCH.GOVAP:
      return fnetGV;
    case BRANCH.TANPHU:
      return fnetTP;
    default:
      return fnetGV;
  }
}

export async function getFnetDB(branch: string) {
  if (!branch) throw new Error('Branch is required but not found');
  return getFnetDBByBranch(branch);
}

export async function getFnetPrisma(branch: string) {
  if (!branch) throw new Error('Branch is required but not found');
  switch (branch) {
    case BRANCH.GOVAP:
      return FnetGVPrisma;
    case BRANCH.TANPHU:
      return FnetTPPrisma;
    default:
      return FnetGVPrisma;
  }
}

export async function disconnectAll() {
  try {
    await db.$disconnect();
    await fnetGV.$disconnect();
    await fnetTP.$disconnect();
  } catch (error) {
    console.error('Error disconnecting databases:', error);
  }
}
