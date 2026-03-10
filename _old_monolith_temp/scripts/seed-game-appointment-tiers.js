const { PrismaClient } = require('../prisma/generated/prisma-client');

const prisma = new PrismaClient();

const tierConfigurations = [
  {
    tierName: 'tier_tam_ho',
    questName: 'Tam Hổ',
    minMembers: 3,
    maxMembers: 4,
    minHours: 3,
    lockedAmount: 30000,
    tasks: [
      {
        taskId: 'quench_thirst',
        taskName: 'Giải Khát',
        challenge: 'Nhóm cùng nhau mua tối thiểu 3 ly nước (tự pha chế)',
        rewardAmount: 3000,
        requiredQuantity: 3,
        itemType: 'drinks'
      },
      {
        taskId: 'snack',
        taskName: 'Ăn Vặt',
        challenge: 'Nhóm cùng nhau mua tối thiểu 3 món ăn vặt',
        rewardAmount: 5000,
        requiredQuantity: 3,
        itemType: 'snacks'
      },
      {
        taskId: 'recharge_energy',
        taskName: 'Nạp Năng Lượng',
        challenge: 'Nhóm cùng nhau mua tối thiểu 3 suất ăn chính (cơm/mì)',
        rewardAmount: 7000,
        requiredQuantity: 3,
        itemType: 'main_dishes'
      }
    ],
    isActive: true
  },
  {
    tierName: 'tier_ngu_long',
    questName: 'Ngũ Long',
    minMembers: 5,
    maxMembers: null,
    minHours: 3,
    lockedAmount: 30000,
    tasks: [
      {
        taskId: 'quench_thirst',
        taskName: 'Giải Khát',
        challenge: 'Nhóm cùng nhau mua tối thiểu 5 ly nước (tự pha chế)',
        rewardAmount: 3000,
        requiredQuantity: 5,
        itemType: 'drinks'
      },
      {
        taskId: 'snack',
        taskName: 'Ăn Vặt',
        challenge: 'Nhóm cùng nhau mua tối thiểu 5 món ăn vặt',
        rewardAmount: 5000,
        requiredQuantity: 5,
        itemType: 'snacks'
      },
      {
        taskId: 'recharge_energy',
        taskName: 'Nạp Năng Lượng',
        challenge: 'Nhóm cùng nhau mua tối thiểu 5 suất ăn chính (cơm/mì)',
        rewardAmount: 7000,
        requiredQuantity: 5,
        itemType: 'main_dishes'
      }
    ],
    isActive: true
  }
];

async function seedGameAppointmentTiers() {
  try {
    console.log('🌱 Starting Game Appointment Tiers seed...');

    // Clear existing tiers
    await prisma.gameAppointmentTier.deleteMany({});
    console.log('🗑️ Cleared existing tiers');

    // Insert new tiers
    for (const tier of tierConfigurations) {
      await prisma.gameAppointmentTier.create({
        data: tier
      });
      console.log(`✅ Created tier: ${tier.tierName}`);
    }

    console.log('🎉 Game Appointment Tiers seed completed successfully!');
    
    // Print summary
    const tierCount = await prisma.gameAppointmentTier.count();
    
    console.log('\n📊 Summary:');
    console.log(`- Total Tiers: ${tierCount}`);
    
    // Display tier details
    const tiers = await prisma.gameAppointmentTier.findMany({
      orderBy: { minMembers: 'asc' }
    });
    
    console.log('\n📋 Tier Details:');
    tiers.forEach(tier => {
      const tasks = JSON.parse(JSON.stringify(tier.tasks));
      console.log(`- ${tier.tierName} (${tier.questName}): ${tier.minMembers}-${tier.maxMembers || '∞'} members, ${tier.minHours}+ hours`);
      console.log(`  Locked Amount: ${tier.lockedAmount.toLocaleString()} VNĐ per member`);
      console.log(`  Tasks:`);
      tasks.forEach(task => {
        console.log(`    • ${task.taskName}: ${task.challenge} → ${task.rewardAmount.toLocaleString()} VNĐ`);
      });
    });

  } catch (error) {
    console.error('❌ Error seeding Game Appointment Tiers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedGameAppointmentTiers()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
