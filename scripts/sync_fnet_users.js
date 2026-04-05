/**
 * Sync FNET users (UserType = 2) to tenant gateway database.
 *
 * Steps:
 *   1. Delete existing users with UserType = 5 from gateway User table
 *   2. Upsert users with UserType = 2 from FNET into gateway User table
 *
 * Usage:
 *   node scripts/sync_fnet_users.js <tenantId>
 *
 * Example:
 *   node scripts/sync_fnet_users.js "govap"
 */

require('dotenv').config();

const { PrismaClient } = require('../libs/database/src/lib/generated/prisma-client');
const { PrismaClient: FnetPrismaClient } = require('../libs/database/src/lib/generated/fnet-client');
const { PrismaClient: TenantPrismaClient } = require('../libs/database/src/lib/generated/tenant-client');

async function syncFnetUsers() {
  const tenantId = process.argv[2];

  if (!tenantId) {
    console.error('\nUsage: node scripts/sync_fnet_users.js <tenantId>');
    console.log('Example: node scripts/sync_fnet_users.js "govap"\n');
    process.exit(1);
  }

  // 1. Kết nối MasterDB (GMS) để lấy thông tin tenant
  const masterDb = new TenantPrismaClient();

  let tenant;
  try {
    tenant = await masterDb.tenant.findFirst({
      where: { tenantId, deletedAt: null },
      select: { id: true, name: true, dbUrl: true, fnetUrl: true, clients: true },
    });
  } catch (err) {
    console.error('Failed to connect to MasterDB:', err.message);
    process.exit(1);
  }

  if (!tenant) {
    console.error(`Tenant "${tenantId}" not found in MasterDB.`);
    await masterDb.$disconnect();
    process.exit(1);
  }

  const dbUrl = tenant.dbUrl?.trim() ||
    (tenant.clients && typeof tenant.clients === 'object' && 'dbUrl' in tenant.clients
      ? String(tenant.clients.dbUrl).trim()
      : null);

  const fnetUrl = tenant.fnetUrl?.trim() || null;

  if (!dbUrl) {
    console.error(`Tenant "${tenantId}" has no dbUrl configured.`);
    await masterDb.$disconnect();
    process.exit(1);
  }

  if (!fnetUrl) {
    console.error(`Tenant "${tenantId}" has no fnetUrl configured.`);
    await masterDb.$disconnect();
    process.exit(1);
  }

  console.log(`Tenant: ${tenant.name} (${tenantId})`);
  console.log(`DB URL: ${dbUrl}`);
  console.log(`FNET URL: ${fnetUrl}\n`);

  await masterDb.$disconnect();

  // 2. Kết nối tenant DB và FNET DB
  const gateway = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  const fnet = new FnetPrismaClient({ datasources: { db: { url: fnetUrl } } });

  try {
    // 3. Xóa các user UserType = 5 khỏi gateway User table
    const userType5Ids = await fnet.$queryRawUnsafe(
      `SELECT UserId FROM usertb WHERE UserType = 5`
    );

    if (userType5Ids.length > 0) {
      const idsToDelete = userType5Ids.map((u) => Number(u.UserId));
      const deleteResult = await gateway.$executeRawUnsafe(
        `DELETE FROM User WHERE userId IN (${idsToDelete.join(',')})`
      );
      console.log(`Deleted ${deleteResult} users (UserType=5) from gateway User table`);
    } else {
      console.log('No UserType=5 users found to delete');
    }

    // 4. Lấy danh sách user UserType = 2 từ FNET
    const fnetUsers = await fnet.$queryRawUnsafe(
      `SELECT UserId, CASE WHEN LastLoginDate = '0000-00-00' OR LastLoginDate IS NULL THEN NULL ELSE LastLoginDate END AS LastLoginDate FROM usertb WHERE UserType = 2`
    );

    console.log(`Found ${fnetUsers.length} users with UserType = 2 in FNET`);

    if (fnetUsers.length === 0) {
      console.log('Nothing to sync.');
      return;
    }

    // 5. Bulk upsert
    const values = fnetUsers.map((u) => {
      const userId = Number(u.UserId);
      const lastLogin = u.LastLoginDate
        ? `'${new Date(u.LastLoginDate).toISOString().slice(0, 19).replace('T', ' ')}'`
        : 'NULL';
      return `(${userId}, 'HF-${userId}', 1, 0, 0, 1, '', ${lastLogin}, NOW(), NOW())`;
    }).join(',\n');

    const result = await gateway.$executeRawUnsafe(`
      INSERT INTO User (userId, userName, rankId, stars, magicStone, isUseApp, note, lastLogin, createdAt, updatedAt)
      VALUES ${values}
      ON DUPLICATE KEY UPDATE lastLogin = VALUES(lastLogin), updatedAt = NOW()
    `);

    console.log(`\nDone! Upserted ${fnetUsers.length} users (affected rows: ${result})`);
  } finally {
    await gateway.$disconnect();
    await fnet.$disconnect();
  }
}

syncFnetUsers().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
