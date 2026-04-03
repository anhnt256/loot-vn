/**
 * Script sync dữ liệu máy tính từ fnet (systemlogtb) sang table Computer của tenant.
 *
 * Usage:
 *   node sync_computers_from_fnet.js <tenantId>
 *
 * Ví dụ:
 *   node sync_computers_from_fnet.js tenant-a-
 */

const { PrismaClient } = require('./libs/database/src/lib/generated/prisma-client');
const { PrismaClient: TenantPrismaClient } = require('./libs/database/src/lib/generated/tenant-client');

const tenantId = process.argv[2] || 'localhost';

async function main() {
  // 1. Lấy tenant info từ GMS để có fnetUrl và dbUrl
  const gmsPrisma = new TenantPrismaClient({
    datasources: { db: { url: 'mysql://gateway:BzhmGqGyuTNsxVYqJgYFpgpfDzhOBlAp@51.79.145.188:3306/gms' } }
  });

  let tenant;
  try {
    tenant = await gmsPrisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantId }, { tenantId: tenantId }],
        deletedAt: null,
      },
    });
  } finally {
    await gmsPrisma.$disconnect();
  }

  if (!tenant) {
    console.error(`Tenant "${tenantId}" không tìm thấy.`);
    process.exit(1);
  }

  const fnetUrl = tenant.fnetUrl;
  const dbUrl = tenant.dbUrl || (tenant.clients && typeof tenant.clients === 'object' && !Array.isArray(tenant.clients) ? tenant.clients.dbUrl : null);

  if (!fnetUrl) {
    console.error('Tenant chưa cấu hình fnetUrl.');
    process.exit(1);
  }
  if (!dbUrl) {
    console.error('Tenant chưa cấu hình dbUrl.');
    process.exit(1);
  }

  console.log(`Tenant: ${tenant.name} (${tenant.tenantId})`);
  console.log(`Fnet URL: ${fnetUrl}`);
  console.log(`DB URL: ${dbUrl}`);

  // 2. Kết nối fnet và gateway DB (cùng dùng PrismaClient vì đều là MySQL)
  const fnet = new PrismaClient({ datasources: { db: { url: fnetUrl } } });
  const gateway = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    // 3. Query danh sách máy từ fnet
    const fnetComputers = await fnet.$queryRawUnsafe(`
      SELECT DISTINCT MachineName, IPAddress
      FROM systemlogtb s
      ORDER BY s.MachineName ASC
    `);

    console.log(`\nTìm thấy ${fnetComputers.length} máy từ fnet.`);

    // 4. Lấy danh sách computer hiện có trong gateway
    const existingComputers = await gateway.computer.findMany({
      select: { id: true, name: true, ip: true },
    });
    const existingMap = new Map(existingComputers.map(c => [c.name, c]));

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of fnetComputers) {
      const name = row.MachineName;
      const ip = row.IPAddress || null;

      if (!name) {
        skipped++;
        continue;
      }

      const existing = existingMap.get(name);

      if (existing) {
        // Cập nhật IP nếu khác
        if (existing.ip !== ip) {
          await gateway.computer.update({
            where: { id: existing.id },
            data: { ip },
          });
          console.log(`  [UPDATE] ${name}: ip ${existing.ip} -> ${ip}`);
          updated++;
        } else {
          skipped++;
        }
      } else {
        // Tạo mới
        await gateway.computer.create({
          data: {
            name,
            ip,
            fingerprintId: '',
            status: 0,
          },
        });
        console.log(`  [CREATE] ${name} (${ip})`);
        created++;
      }
    }

    console.log(`\n--- Kết quả ---`);
    console.log(`Tạo mới: ${created}`);
    console.log(`Cập nhật IP: ${updated}`);
    console.log(`Bỏ qua (đã tồn tại, không đổi): ${skipped}`);
  } finally {
    await fnet.$disconnect();
    await gateway.$disconnect();
  }
}

main().catch((err) => {
  console.error('Lỗi:', err);
  process.exit(1);
});
