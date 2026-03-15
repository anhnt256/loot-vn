
import { TenantPrismaService } from './apps/api/src/app/database/prisma.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function debug() {
  const prisma = new TenantPrismaService();
  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        deletedAt: null,
      },
    });
    console.log('Number of tenants:', tenants.length);
    console.log('Tenants:', JSON.stringify(tenants, null, 2));
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
