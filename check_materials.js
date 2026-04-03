const { PrismaClient } = require('./libs/database/src/lib/generated/prisma-client');
const prisma = new PrismaClient();

async function checkMaterials() {
  try {
    const count = await prisma.material.count();
    console.log(`Total materials: ${count}`);
    
    const materials = await prisma.material.findMany({
        take: 10
    });
    console.log('Sample materials:', JSON.stringify(materials, null, 2));

    const activeCount = await prisma.material.count({ where: { isActive: true } });
    console.log(`Active materials: ${activeCount}`);

    const reportTypes = await prisma.material.groupBy({
        by: ['reportType'],
        _count: { id: true }
    });
    console.log('Report types:', JSON.stringify(reportTypes, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkMaterials();
