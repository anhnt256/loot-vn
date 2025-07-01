const { PrismaClient } = require("../prisma/generated/prisma-client");

const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log("🧪 Testing Battle Pass API...");

    // Test 1: Kiểm tra season có active không
    const currentSeason = await prisma.battlePassSeason.findFirst({
      where: {
        isActive: true,
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
    });

    console.log(
      "✅ Current season:",
      currentSeason ? currentSeason.name : "Not found",
    );

    if (!currentSeason) {
      console.log("❌ No active season found");
      return;
    }

    // Test 2: Kiểm tra user progress
    const userId = 2709;
    let userProgress = await prisma.userBattlePass.findFirst({
      where: {
        userId: userId,
        seasonId: currentSeason.id,
      },
    });

    console.log("✅ User progress:", userProgress ? "Found" : "Not found");

    if (!userProgress) {
      userProgress = await prisma.userBattlePass.create({
        data: {
          userId: userId,
          seasonId: currentSeason.id,
          level: 1,
          experience: 0,
          isPremium: false,
          totalSpent: 0,
          branch: "GO_VAP",
        },
      });
      console.log("✅ Created new user progress");
    }

    // Test 3: Kiểm tra claimed rewards
    const claimedRewards = await prisma.userBattlePassReward.findMany({
      where: {
        userId: userId,
        seasonId: currentSeason.id,
      },
      select: {
        rewardId: true,
      },
    });

    console.log("✅ Claimed rewards count:", claimedRewards.length);

    // Test 4: Kiểm tra available rewards
    const claimedRewardIds = claimedRewards.map((r) => r.rewardId);
    const availableRewards = await prisma.battlePassReward.findMany({
      where: {
        seasonId: currentSeason.id,
        level: {
          lte: userProgress.level,
        },
        id: {
          notIn: claimedRewardIds,
        },
      },
      orderBy: {
        level: "asc",
      },
    });

    console.log("✅ Available rewards count:", availableRewards.length);

    // Test 5: Tạo response giống API
    const response = {
      seasonId: currentSeason.id,
      isVip: userProgress.isPremium,
      level: userProgress.level,
      experience: userProgress.experience,
      totalSpent: userProgress.totalSpent,
      claimedRewards: claimedRewardIds,
      availableRewards,
      maxLevel: currentSeason.maxLevel,
    };

    console.log("✅ API Response:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("❌ Error testing API:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
