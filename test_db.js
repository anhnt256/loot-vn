const { PrismaClient } = require('./libs/database/src/lib/generated/prisma-client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
async function run() {
  const users = await prisma.$queryRawUnsafe(`SELECT * FROM User WHERE userId IN (13195, 16445)`);
  console.log(users);
  await prisma.$disconnect();
}
run();
