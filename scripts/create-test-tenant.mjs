#!/usr/bin/env node
/**
 * Tạo test tenant DB mới (giữ nguyên cấu trúc, không ảnh hưởng production).
 *
 * Usage:
 *   node scripts/create-test-tenant.mjs <db_name> [--seed]
 *
 * Examples:
 *   node scripts/create-test-tenant.mjs test_loot          # Chỉ tạo DB + schema + đăng ký GMS
 *   node scripts/create-test-tenant.mjs test_loot --seed    # Tạo DB + schema + seed + đăng ký GMS
 *
 * Yêu cầu:
 *   - MySQL server đã chạy tại host trong .env (DATABASE_URL)
 *   - User MySQL có quyền CREATE DATABASE
 *   - GMS database đã tồn tại (DATABASE_GMS_URL)
 */

import { execSync } from 'child_process';
import { createConnection } from 'mysql2/promise';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Load .env
config({ path: resolve(rootDir, '.env') });

// ── Parse args ──
const args = process.argv.slice(2);
const dbName = args.find(a => !a.startsWith('--'));
const doSeed = args.includes('--seed');

if (!dbName) {
  console.error(`
  Tạo test tenant database

  Usage:  node scripts/create-test-tenant.mjs <db_name> [--seed]

  Options:
    --seed    Seed dữ liệu mẫu (BattlePass, PromotionCode)

  Example:
    node scripts/create-test-tenant.mjs test_loot --seed
  `);
  process.exit(1);
}

// ── Parse MySQL connection from DATABASE_URL ──
function parseMysqlUrl(url) {
  // mysql://user:pass@host:port/db
  const m = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!m) throw new Error(`Cannot parse MySQL URL: ${url}`);
  return { user: m[1], password: m[2], host: m[3], port: parseInt(m[4]), database: m[5] };
}

const prodUrl = process.env.DATABASE_URL;
const gmsUrl = process.env.DATABASE_GMS_URL;
if (!prodUrl) { console.error('Missing DATABASE_URL in .env'); process.exit(1); }
if (!gmsUrl) { console.error('Missing DATABASE_GMS_URL in .env'); process.exit(1); }

const prod = parseMysqlUrl(prodUrl);
const testDbUrl = `mysql://${prod.user}:${prod.password}@${prod.host}:${prod.port}/${dbName}`;
const tenantId = dbName.replace(/_/g, '-'); // test_loot -> test-loot

async function main() {
  console.log(`\n====================================`);
  console.log(`  Create Test Tenant: ${dbName}`);
  console.log(`====================================\n`);
  console.log(`  MySQL host:   ${prod.host}:${prod.port}`);
  console.log(`  DB name:      ${dbName}`);
  console.log(`  Tenant ID:    ${tenantId}`);
  console.log(`  DB URL:       ${testDbUrl}`);
  console.log(`  Seed:         ${doSeed ? 'Yes' : 'No'}\n`);

  // ── Step 1: Create database ──
  console.log('[1/4] Creating database...');
  const conn = await createConnection({
    host: prod.host,
    port: prod.port,
    user: prod.user,
    password: prod.password,
  });
  await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
  console.log(`      Database "${dbName}" created.\n`);

  // ── Step 2: Push schema (migrate deploy for migration history) ──
  console.log('[2/4] Applying migrations...');
  try {
    execSync(
      `npx prisma migrate deploy --schema libs/database/prisma/new/schema.prisma`,
      {
        cwd: rootDir,
        env: { ...process.env, DATABASE_URL: testDbUrl },
        stdio: 'inherit',
      }
    );
  } catch {
    // Fallback: db push nếu migrate deploy fail (DB mới chưa có migration table)
    console.log('      migrate deploy failed, falling back to db push...');
    execSync(
      `npx prisma db push --schema libs/database/prisma/new/schema.prisma --accept-data-loss`,
      {
        cwd: rootDir,
        env: { ...process.env, DATABASE_URL: testDbUrl },
        stdio: 'inherit',
      }
    );
  }
  console.log('      Schema applied.\n');

  // ── Step 3: Seed (optional) ──
  if (doSeed) {
    console.log('[3/4] Seeding data...');
    execSync(`node libs/database/prisma/seed.js`, {
      cwd: rootDir,
      env: { ...process.env, DATABASE_URL: testDbUrl },
      stdio: 'inherit',
    });
    console.log('      Seed completed.\n');
  } else {
    console.log('[3/4] Skipping seed (use --seed to enable).\n');
  }

  // ── Step 4: Register tenant in GMS ──
  console.log('[4/4] Registering tenant in GMS...');
  const gms = await createConnection({
    host: parseMysqlUrl(gmsUrl).host,
    port: parseMysqlUrl(gmsUrl).port,
    user: parseMysqlUrl(gmsUrl).user,
    password: parseMysqlUrl(gmsUrl).password,
    database: parseMysqlUrl(gmsUrl).database,
  });

  // Check if tenant already exists
  const [rows] = await gms.execute('SELECT id FROM Tenant WHERE tenantId = ? LIMIT 1', [tenantId]);
  if (Array.isArray(rows) && rows.length > 0) {
    // Update dbUrl
    await gms.execute('UPDATE Tenant SET dbUrl = ?, updatedAt = NOW() WHERE tenantId = ?', [testDbUrl, tenantId]);
    console.log(`      Tenant "${tenantId}" already exists, updated dbUrl.\n`);
  } else {
    // Insert new tenant
    await gms.execute(
      `INSERT INTO Tenant (id, tenantId, name, dbUrl, domainPrefix, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [tenantId, tenantId, `Test - ${dbName}`, testDbUrl, tenantId]
    );
    console.log(`      Tenant "${tenantId}" registered in GMS.\n`);
  }
  await gms.end();

  // ── Done ──
  console.log(`====================================`);
  console.log(`  Test tenant ready!`);
  console.log(`====================================`);
  console.log(`
  Tenant ID:  ${tenantId}
  DB URL:     ${testDbUrl}

  Cách sử dụng:

  1. Chạy API local với tenant này:
     - Header: x-tenant-id: ${tenantId}

  2. Apply migration mới lên test DB:
     DATABASE_URL="${testDbUrl}" npx prisma migrate deploy --schema libs/database/prisma/new/schema.prisma

  3. Xoá test DB khi không cần:
     node scripts/create-test-tenant.mjs --drop ${dbName}
  `);
}

// ── Drop mode ──
if (args.includes('--drop')) {
  const dropName = args.find(a => !a.startsWith('--'));
  if (!dropName) { console.error('Missing db_name for --drop'); process.exit(1); }

  (async () => {
    console.log(`\nDropping test database "${dropName}"...`);

    const conn = await createConnection({
      host: prod.host, port: prod.port, user: prod.user, password: prod.password,
    });
    await conn.execute(`DROP DATABASE IF EXISTS \`${dropName}\``);
    await conn.end();

    const dropTenantId = dropName.replace(/_/g, '-');
    const gmsConn = parseMysqlUrl(gmsUrl);
    const gms = await createConnection({
      host: gmsConn.host, port: gmsConn.port, user: gmsConn.user, password: gmsConn.password, database: gmsConn.database,
    });
    await gms.execute('DELETE FROM Tenant WHERE tenantId = ?', [dropTenantId]);
    await gms.end();

    console.log(`Database "${dropName}" and tenant "${dropTenantId}" removed.\n`);
  })();
} else {
  main().catch((err) => {
    console.error('\nFailed:', err.message);
    process.exit(1);
  });
}
