const { PrismaClient } = require('../prisma/generated/prisma-client');

const prisma = new PrismaClient();

const birthdayTiers = [
  {
    tierName: "Tier 1 - 600%",
    discountPercent: 600,
    milestoneAmount: 5000,
    additionalAmount: 5000,
    bonusAmount: 20000, // Chỉ 20.000₫ (không tính 1q)
    totalAtTier: 35000, // 5.000 + 30.000 = 35.000
    totalReceived: 30000,
    freeSpins: 1, // 1q
    isActive: true
  },
  {
    tierName: "Tier 2 - 500%", 
    discountPercent: 500,
    milestoneAmount: 10000,
    additionalAmount: 5000,
    bonusAmount: 25000, // 25.000₫ (không tính 0q)
    totalAtTier: 65000, // 10.000 + 55.000 = 65.000
    totalReceived: 55000,
    freeSpins: 0, // 0q
    isActive: true
  },
  {
    tierName: "Tier 3 - 450%",
    discountPercent: 450,
    milestoneAmount: 20000,
    additionalAmount: 10000,
    bonusAmount: 25000, // 25.000₫ (không tính 2q)
    totalAtTier: 120000, // 20.000 + 100.000 = 120.000
    totalReceived: 100000,
    freeSpins: 2, // 2q
    isActive: true
  },
  {
    tierName: "Tier 4 - 350%",
    discountPercent: 350,
    milestoneAmount: 50000,
    additionalAmount: 30000,
    bonusAmount: 65000, // 65.000₫ (không tính 4q)
    totalAtTier: 255000, // 50.000 + 205.000 = 255.000
    totalReceived: 205000,
    freeSpins: 4, // 4q
    isActive: true
  },
  {
    tierName: "Tier 5 - 250%",
    discountPercent: 250,
    milestoneAmount: 100000,
    additionalAmount: 50000,
    bonusAmount: 75000, // 75.000₫ (không tính 5q)
    totalAtTier: 430000, // 100.000 + 330.000 = 430.000
    totalReceived: 330000,
    freeSpins: 5, // 5q
    isActive: true
  },
  {
    tierName: "Tier 6 - 220%",
    discountPercent: 220,
    milestoneAmount: 200000,
    additionalAmount: 100000,
    bonusAmount: 140000, // 140.000₫ (không tính 8q)
    totalAtTier: 750000, // 200.000 + 550.000 = 750.000
    totalReceived: 550000,
    freeSpins: 8, // 8q
    isActive: true
  },
  {
    tierName: "Tier 7 - 150%",
    discountPercent: 150,
    milestoneAmount: 500000,
    additionalAmount: 300000,
    bonusAmount: 380000, // 380.000₫ (không tính 7q)
    totalAtTier: 1500000, // 500.000 + 1.000.000 = 1.500.000
    totalReceived: 730000,
    freeSpins: 7, // 7q
    isActive: true
  }
];

async function seedBirthdayTiers() {
  try {
    console.log('Starting to seed birthday tiers...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.birthdayTransaction.deleteMany();
    await prisma.userBirthdayProgress.deleteMany();
    await prisma.birthdayTier.deleteMany();
    
    // Insert new tiers
    console.log('Inserting new tiers...');
    for (const tier of birthdayTiers) {
      await prisma.birthdayTier.create({
        data: tier
      });
      
      console.log(`✓ Inserted ${tier.tierName}`);
    }
    
    console.log('Successfully seeded birthday tiers!');
    console.log(`Created ${birthdayTiers.length} tiers`);
    
  } catch (error) {
    console.error('Error seeding birthday tiers:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedBirthdayTiers(); 