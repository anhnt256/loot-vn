const { PrismaClient } = require('./libs/database/dist/src/lib/generated/tenant-client/index.js');
async function test() {
  const gatewayClient = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_TENANT || 'postgresql://fnet:fnet1234@localhost:5433/fnet_tenant_default' } } });
  
  const histories = await gatewayClient.deviceHistory.findMany({take: 5});
  console.log("Histories:", histories.map(h => ({id: h.id, computerId: h.computerId, deviceId: h.deviceId})));
  
  const computerIds = [...new Set(histories.map(h => h.computerId).filter(Boolean))];
  console.log("Computer IDs:", computerIds);

  const computers = await gatewayClient.computer.findMany({
    where: { id: { in: computerIds } },
    select: { id: true, name: true }
  });
  console.log("Computers found:", computers);
}
test().catch(console.error);
