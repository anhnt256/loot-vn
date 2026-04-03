const { TenantPrismaClient } = require('./libs/database/src/lib/generated/tenant-client');

async function checkLocalhostTenant() {
  const gmsPrisma = new TenantPrismaClient({
    datasources: { db: { url: 'mysql://gateway:BzhmGqGyuTNsxVYqJgYFpgpfDzhOBlAp@51.79.145.188:3306/gms' } }
  });

  try {
    const tenant = await gmsPrisma.tenant.findFirst({
      where: {
        OR: [
          { id: 'localhost' },
          { tenantId: 'localhost' }
        ]
      }
    });

    console.log('Tenant localhost info:', JSON.stringify(tenant, null, 2));
    
    if (tenant) {
        console.log('Database URL from tenant:', tenant.dbUrl || 'N/A');
    }

  } catch (err) {
    console.error('Error GMS:', err);
  } finally {
    await gmsPrisma.$disconnect();
  }
}

checkLocalhostTenant();
