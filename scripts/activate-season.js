const { PrismaClient } = require("../prisma/generated/prisma-client");

const prisma = new PrismaClient();

async function activateSeason() {
  try {
    // Kích hoạt season đầu tiên
    const season = await prisma.battlePassSeason.update({
      where: { id: 1 },
      data: {
        isActive: true,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2026-12-31"),
      },
    });

    console.log(`✅ Đã kích hoạt season: "${season.name}" (ID: ${season.id})`);
    console.log(
      `📅 Thời gian: ${season.startDate.toISOString()} - ${season.endDate.toISOString()}`,
    );
  } catch (error) {
    console.error("❌ Lỗi khi kích hoạt season:", error);
  } finally {
    await prisma.$disconnect();
  }
}

activateSeason();
