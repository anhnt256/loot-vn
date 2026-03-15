import { execSync } from 'child_process';

const dbUrl = process.argv[2];

if (!dbUrl) {
  console.error('\n❌ Error: Missing DATABASE_URL');
  console.log('Usage: node scripts/onboard-tenant.mjs <DATABASE_URL>');
  console.log('Example: node scripts/onboard-tenant.mjs "mysql://root:password@localhost:3306/new_tenant_db"\n');
  process.exit(1);
}

try {
  console.log(`\n🚀 Starting onboarding for tenant...`);
  console.log(`🔗 Database URL: ${dbUrl}\n`);

  // 1. Sync Schema using prisma db push
  // We use db push for faster initialization on new databases without needing migration history.
  console.log('📡 [1/2] Pushing schema to tenant database...');
  execSync(`npx prisma db push --schema libs/database/prisma/schema.prisma --accept-data-loss`, {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'inherit',
  });

  // 2. Run Seed script
  // Note: We run the seed script directly using node.
  console.log('\n🌱 [2/2] Seeding tenant database...');
  execSync(`node libs/database/prisma/seed.js`, {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'inherit',
  });

  console.log('\n✅ Tenant onboarded successfully!\n');
} catch (error) {
  console.error('\n❌ Failed to onboard tenant. Please check the database URL and connectivity.\n');
  process.exit(1);
}
