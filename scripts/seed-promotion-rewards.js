const { PrismaClient } = require('../prisma/generated/prisma-client');

const prisma = new PrismaClient();

async function seedPromotionRewards() {
  console.log('🌱 Bắt đầu seed dữ liệu PromotionReward...');

  try {
    // Kiểm tra xem đã có dữ liệu chưa
    const existingCount = await prisma.promotionReward.count();
    
    if (existingCount > 0) {
      console.log(`⏭️ PromotionReward đã tồn tại (${existingCount} records), bỏ qua...`);
      return;
    }

    // Dữ liệu promotion rewards
    const promotionRewards = [
      {
        name: "Thẻ cào 10k",
        value: 10000,
        starsValue: 13000,
        branch: "GO_VAP",
        quantity: 10000,
        isActive: true
      },
      {
        name: "Thẻ cào 10k",
        value: 10000,
        starsValue: 13000,
        branch: "TAN_PHU",
        quantity: 10000,
        isActive: true
      },
      {
        name: "Thẻ cào 20k",
        value: 20000,
        starsValue: 25000,
        branch: "GO_VAP",
        quantity: 7000,
        isActive: true
      },
      {
        name: "Thẻ cào 20k",
        value: 20000,
        starsValue: 25000,
        branch: "TAN_PHU",
        quantity: 7000,
        isActive: true
      },
      {
        name: "Thẻ cào 50k",
        value: 50000,
        starsValue: 50000,
        branch: "GO_VAP",
        quantity: 5000,
        isActive: true
      },
      {
        name: "Thẻ cào 50k",
        value: 50000,
        starsValue: 50000,
        branch: "TAN_PHU",
        quantity: 5000,
        isActive: true
      },
      {
        name: "Thẻ cào 100k",
        value: 100000,
        starsValue: 95000,
        branch: "GO_VAP",
        quantity: 2000,
        isActive: true
      },
      {
        name: "Thẻ cào 100k",
        value: 100000,
        starsValue: 95000,
        branch: "TAN_PHU",
        quantity: 2000,
        isActive: true
      },
      {
        name: "Thẻ cào 200k",
        value: 200000,
        starsValue: 180000,
        branch: "GO_VAP",
        quantity: 1000,
        isActive: true
      },
      {
        name: "Thẻ cào 200k",
        value: 200000,
        starsValue: 180000,
        branch: "TAN_PHU",
        quantity: 1000,
        isActive: true
      },
      {
        name: "Thẻ cào 500k",
        value: 500000,
        starsValue: 450000,
        branch: "GO_VAP",
        quantity: 500,
        isActive: true
      },
      {
        name: "Thẻ cào 500k",
        value: 500000,
        starsValue: 450000,
        branch: "TAN_PHU",
        quantity: 500,
        isActive: true
      }
    ];

    // Tạo dữ liệu
    for (const reward of promotionRewards) {
      await prisma.promotionReward.create({
        data: reward
      });
      console.log(`✅ Đã tạo: ${reward.name} - ${reward.value.toLocaleString()} VND (${reward.starsValue.toLocaleString()} sao) - ${reward.branch} - Số lượng: ${reward.quantity.toLocaleString()}`);
    }

    console.log('🎉 Hoàn thành seed dữ liệu PromotionReward!');
    
    // Hiển thị tổng kết
    const totalRewards = await prisma.promotionReward.count();
    const totalValue = await prisma.promotionReward.aggregate({
      _sum: {
        value: true
      }
    });
    const totalQuantity = await prisma.promotionReward.aggregate({
      _sum: {
        quantity: true
      }
    });

    console.log('\n📊 Tổng kết:');
    console.log(`- Tổng số loại thẻ: ${totalRewards}`);
    console.log(`- Tổng giá trị: ${totalValue._sum.value?.toLocaleString()} VND`);
    console.log(`- Tổng số lượng: ${totalQuantity._sum.quantity?.toLocaleString()} thẻ`);

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy seed nếu file được gọi trực tiếp
if (require.main === module) {
  seedPromotionRewards()
    .then(() => {
      console.log('✅ Seed hoàn thành!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed thất bại:', error);
      process.exit(1);
    });
}

module.exports = { seedPromotionRewards };