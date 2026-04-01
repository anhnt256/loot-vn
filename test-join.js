const { PrismaClient } = require('./libs/database/dist/src/lib/generated/tenant-client/index.js');
async function test() {
  const gatewayClient = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_TENANT || 'postgresql://fnet:fnet1234@localhost:5433/fnet_tenant_default' } } });
  
  const histories = await gatewayClient.deviceHistory.findMany({take: 5});
  const computerIds = [...new Set(histories.map(h => h.computerId).filter(Boolean))];
  
  const computers = await gatewayClient.computer.findMany({
    where: { id: { in: computerIds } },
    select: { id: true, name: true }
  });
  
  console.log("Found Computers:", computers);
  console.log("History records computerIds:", computerIds);
}
test().catch(console.error);
