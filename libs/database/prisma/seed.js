import { PrismaClient } from "../src/lib/generated/prisma-client/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu...");

  // Bảng XP từng mốc cho 30 cấp
  const expPerLevel = [
    600,
    600,
    600,
    600,
    600, // 1-5
    700,
    700,
    700,
    700,
    700, // 6-10
    750,
    750,
    750,
    750,
    750, // 11-15
    800,
    800,
    800,
    800,
    800, // 16-20
    850,
    850,
    850,
    850,
    850, // 21-25
    900,
    900,
    900,
    900,
    900, // 26-30
  ];
  // Bonus mỗi cấp +1000 XP
  const bonusExpPerLevel = 1000;

  // Dummy rewards cho seed (tùy chỉnh lại nếu muốn)
  const freeRewards = [
    { level: 1, name: "5000 Stars", rewardType: "stars", rewardValue: 5000 },
    { level: 3, name: "5000 Stars", rewardType: "stars", rewardValue: 5000 },
    { level: 5, name: "5000 Stars", rewardType: "stars", rewardValue: 5000 },
    { level: 7, name: "8000 Stars", rewardType: "stars", rewardValue: 8000 },
    { level: 9, name: "8000 Stars", rewardType: "stars", rewardValue: 8000 },
    { level: 11, name: "8000 Stars", rewardType: "stars", rewardValue: 8000 },
    { level: 13, name: "10000 Stars", rewardType: "stars", rewardValue: 10000 },
    { level: 15, name: "10000 Stars", rewardType: "stars", rewardValue: 10000 },
    { level: 17, name: "10000 Stars", rewardType: "stars", rewardValue: 10000 },
    { level: 19, name: "12000 Stars", rewardType: "stars", rewardValue: 12000 },
    { level: 21, name: "12000 Stars", rewardType: "stars", rewardValue: 12000 },
    { level: 23, name: "12000 Stars", rewardType: "stars", rewardValue: 12000 },
    { level: 25, name: "15000 Stars", rewardType: "stars", rewardValue: 15000 },
    { level: 27, name: "15000 Stars", rewardType: "stars", rewardValue: 15000 },
    { level: 29, name: "15000 Stars", rewardType: "stars", rewardValue: 15000 },
  ];
  const premiumRewards = [
    { level: 2, name: "7500 Stars", rewardType: "stars", rewardValue: 7500 },
    {
      level: 4,
      name: "1 voucher Free nước",
      rewardType: "voucher",
      rewardValue: 10000,
    },
    { level: 6, name: "15000 Stars", rewardType: "stars", rewardValue: 15000 },
    {
      level: 8,
      name: "1 voucher đồ ăn",
      rewardType: "voucher",
      rewardValue: 20000,
    },
    { level: 10, name: "22500 Stars", rewardType: "stars", rewardValue: 22500 },
    {
      level: 12,
      name: "1 combo nước + đồ ăn",
      rewardType: "voucher",
      rewardValue: 30000,
    },
    { level: 14, name: "30000 Stars", rewardType: "stars", rewardValue: 30000 },
    {
      level: 16,
      name: "1 combo nâng cao (F&B + giờ chơi)",
      rewardType: "voucher",
      rewardValue: 35000,
    },
    { level: 18, name: "37500 Stars", rewardType: "stars", rewardValue: 37500 },
    {
      level: 20,
      name: "1 voucher combo + extra nước",
      rewardType: "voucher",
      rewardValue: 40000,
    },
    { level: 22, name: "45000 Stars", rewardType: "stars", rewardValue: 45000 },
    {
      level: 24,
      name: "2 combo nước + đồ ăn",
      rewardType: "voucher",
      rewardValue: 45000,
    },
    { level: 26, name: "45000 Stars", rewardType: "stars", rewardValue: 45000 },
    {
      level: 28,
      name: "1 combo lớn + 1 giờ chơi",
      rewardType: "voucher",
      rewardValue: 48500,
    },
    {
      level: 30,
      name: "1 voucher lớn (F&B hoặc giờ chơi)",
      rewardType: "voucher",
      rewardValue: 49000,
    },
  ];

  // Bonus rewards
  const bonusRewards = [
    {
      level: 31,
      name: "20000 Stars",
      description: "Free bonus reward khi hoàn thành tất cả levels",
      type: "free",
      rewardType: "stars",
      rewardValue: 20000,
      isBonus: true,
      imageUrl: "/star.png",
    },
    {
      level: 32,
      name: "🎁 50.000đ nạp tài khoản chính",
      description: "Premium bonus reward khi hoàn thành tất cả levels",
      type: "premium",
      rewardType: "voucher",
      rewardValue: 50000,
      isBonus: true,
      imageUrl: "/voucher.png",
    },
    {
      level: 33,
      name: "🎁 Voucher tặng 100% khi nạp ≥50k",
      description: "Premium bonus reward cao cấp nhất",
      type: "premium",
      rewardType: "voucher",
      rewardValue: 50000,
      isBonus: true,
      imageUrl: "/voucher.png",
    },
  ];

  // Kiểm tra xem đã có BattlePassReward chưa
  const existingRewards = await prisma.battlePassReward.count({ where: { seasonId: 1 } });
  
  if (existingRewards === 0) {
    console.log("📝 Tạo BattlePassReward mới...");
    
    // Seed reward cho 30 cấp
    let cumulativeExp = 0;
    for (let i = 0; i < 30; i++) {
      cumulativeExp += expPerLevel[i];
      // Tìm reward free
      const free = freeRewards.find((r) => r.level === i + 1);
      if (free) {
        await prisma.battlePassReward.create({
          data: {
            seasonId: 1,
            level: free.level,
            name: free.name,
            description: `Free reward tại level ${free.level}`,
            type: "free",
            rewardType: free.rewardType,
            rewardValue: free.rewardValue,
            imageUrl: "/star.png",
            experience: cumulativeExp,
          },
        });
      }
      // Tìm reward premium
      const premium = premiumRewards.find((r) => r.level === i + 1);
      if (premium) {
        await prisma.battlePassReward.create({
          data: {
            seasonId: 1,
            level: premium.level,
            name: premium.name,
            description: `Premium reward tại level ${premium.level}`,
            type: "premium",
            rewardType: premium.rewardType,
            rewardValue: premium.rewardValue,
            imageUrl:
              premium.rewardType === "stars" ? "/star.png" : "/voucher.png",
            experience: cumulativeExp,
          },
        });
      }
    }

    // Seed bonus reward (level 31+)
    for (const reward of bonusRewards) {
      cumulativeExp += bonusExpPerLevel;
      await prisma.battlePassReward.create({
        data: {
          seasonId: 1,
          level: reward.level,
          name: reward.name,
          description: reward.description,
          type: reward.type,
          rewardType: reward.rewardType,
          rewardValue: reward.rewardValue,
          imageUrl: reward.imageUrl,
          isBonus: reward.isBonus,
          experience: cumulativeExp,
        },
      });
    }

    console.log("✅ Đã tạo BattlePassReward mới!");
  } else {
    console.log(`⏭️ BattlePassReward đã tồn tại (${existingRewards} records), bỏ qua...`);
  }

  // Seed PromotionCode data
  console.log("🌱 Kiểm tra PromotionCode data...");
  
  const existingPromoCodes = await prisma.promotionCode.count();
  
  if (existingPromoCodes === 0) {
    console.log("📝 Tạo PromotionCode mới...");
    
    // Tạo dữ liệu PromotionCode cho các reward
    const rewards = await prisma.reward.findMany();
    
    for (const reward of rewards) {
      if (reward.value) {
        // Tạo 10 promotion codes cho mỗi reward value
        for (let i = 1; i <= 10; i++) {
          await prisma.promotionCode.create({
            data: {
              name: `${reward.name || 'Reward'} - Code ${i}`,
              code: `PROMO_${reward.value}_${i}`,
              value: reward.value,
              branch: "GO_VAP",
              isUsed: false,
            },
          });
        }
        console.log(`✅ Đã tạo 10 promotion codes cho reward value ${reward.value}`);
      }
    }

    console.log("✅ Đã tạo PromotionCode mới!");
  } else {
    console.log(`⏭️ PromotionCode đã tồn tại (${existingPromoCodes} records), bỏ qua...`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
