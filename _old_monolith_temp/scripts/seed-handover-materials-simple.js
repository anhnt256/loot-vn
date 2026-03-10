const { PrismaClient } = require('../prisma/generated/prisma-client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/gateway_app'
    }
  }
});

async function seedHandoverMaterials() {
  try {
    console.log('🌱 Starting handover materials seed...');

    // Clear existing data
    await prisma.handoverMaterial.deleteMany({});
    await prisma.handoverReport.deleteMany({});
    await prisma.material.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create materials for Báo cáo bếp
    const kitchenMaterials = [
      { name: 'Mì', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Khoai tây', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Chả cá', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Bò', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Ba rọi', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Gà', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Bò viên', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Xúc xích', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Cá viên', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Trứng', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Hải sản', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Xúc xích nhỏ', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Mì cay', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Phở trộn', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Mực', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Đùi gà', reportType: 'BAO_CAO_BEP', isOnFood: true },
    ];

    // Create materials for Báo cáo nước
    const drinkMaterials = [
      { name: '7Up', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Pepsi', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Sting Dâu', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Sting Gold', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Warrior Dâu', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Warrior Nho', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Twister', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Trà Ô Long Tea+', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Redbull', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'C2 Chanh', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'C2 Đào', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Mirinda xá xị', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Doctor Thanh', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Suối', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Monster NB', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Monster Xoài', reportType: 'BAO_CAO_NUOC', isOnFood: false },
    ];

    const allMaterials = [...kitchenMaterials, ...drinkMaterials];

    // Insert materials and store their IDs
    const materialMap = new Map();
    for (const material of allMaterials) {
      const createdMaterial = await prisma.material.create({
        data: material
      });
      materialMap.set(material.name, createdMaterial.id);
    }

    console.log(`✅ Created ${allMaterials.length} materials`);

    // Create handover reports for different dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const reportDates = [
      { date: today, label: 'Today' },
      { date: yesterday, label: 'Yesterday' },
      { date: twoDaysAgo, label: 'Two days ago' }
    ];

    for (const { date, label } of reportDates) {
      console.log(`📅 Creating reports for ${label} (${date.toISOString().split('T')[0]})`);

      // Create Báo cáo bếp
      const kitchenReport = await prisma.handoverReport.create({
        data: {
          date: date,
          reportType: 'BAO_CAO_BEP',
          branch: 'GO_VAP',
          note: `Báo cáo bếp ${label}`
        }
      });

      // Create Báo cáo nước
      const drinkReport = await prisma.handoverReport.create({
        data: {
          date: date,
          reportType: 'BAO_CAO_NUOC',
          branch: 'GO_VAP',
          note: `Báo cáo nước ${label}`
        }
      });

      // Create handover materials for kitchen report - map all kitchen materials
      const kitchenHandoverMaterials = [];
      
      for (const material of kitchenMaterials) {
        const materialId = materialMap.get(material.name);
        
        // Generate different data patterns for different materials
        let handoverData;
        
        if (material.name === 'Mì') {
          // Case 1: Ca sáng không update, ca chiều update thực tế
          handoverData = {
            handoverReportId: kitchenReport.id,
            materialId: materialId,
            morningBeginning: 0,
            morningReceived: 0,
            morningIssued: 0,
            morningEnding: 0,
            afternoonBeginning: 50,
            afternoonReceived: 20,
            afternoonIssued: 15,
            afternoonEnding: 55,
            eveningBeginning: 0,
            eveningReceived: 0,
            eveningIssued: 0,
            eveningEnding: 0,
          };
        } else if (material.name === 'Bò') {
          // Case 2: Ca sáng báo cáo sai - Tồn cuối 40, nhưng Tồn đầu ca chiều là 43
          handoverData = {
            handoverReportId: kitchenReport.id,
            materialId: materialId,
            morningBeginning: 30,
            morningReceived: 15,
            morningIssued: 5,
            morningEnding: 40, // Báo cáo sai
            afternoonBeginning: 43, // Không khớp với morningEnding = 40
            afternoonReceived: 10,
            afternoonIssued: 8,
            afternoonEnding: 45,
            eveningBeginning: 0,
            eveningReceived: 0,
            eveningIssued: 0,
            eveningEnding: 0,
          };
        } else if (material.name === 'Gà') {
          // Case 3: Ca sáng báo cáo sai - Tồn cuối 40, nhưng Tồn đầu ca chiều là 35
          handoverData = {
            handoverReportId: kitchenReport.id,
            materialId: materialId,
            morningBeginning: 25,
            morningReceived: 20,
            morningIssued: 5,
            morningEnding: 40, // Báo cáo sai
            afternoonBeginning: 35, // Ít hơn morningEnding = 40
            afternoonReceived: 12,
            afternoonIssued: 7,
            afternoonEnding: 40,
            eveningBeginning: 0,
            eveningReceived: 0,
            eveningIssued: 0,
            eveningEnding: 0,
          };
        } else if (material.name === 'Chả cá') {
          // Normal case - all shifts have data
          handoverData = {
            handoverReportId: kitchenReport.id,
            materialId: materialId,
            morningBeginning: 20,
            morningReceived: 10,
            morningIssued: 8,
            morningEnding: 22,
            afternoonBeginning: 22,
            afternoonReceived: 15,
            afternoonIssued: 12,
            afternoonEnding: 25,
            eveningBeginning: 25,
            eveningReceived: 5,
            eveningIssued: 10,
            eveningEnding: 20,
          };
        } else if (material.name === 'Khoai tây') {
          // Normal case - food item
          handoverData = {
            handoverReportId: kitchenReport.id,
            materialId: materialId,
            morningBeginning: 5,
            morningReceived: 8,
            morningIssued: 6,
            morningEnding: 7,
            afternoonBeginning: 7,
            afternoonReceived: 5,
            afternoonIssued: 4,
            afternoonEnding: 8,
            eveningBeginning: 8,
            eveningReceived: 3,
            eveningIssued: 5,
            eveningEnding: 6,
          };
        } else {
          // Default case for other materials
          handoverData = {
            handoverReportId: kitchenReport.id,
            materialId: materialId,
            morningBeginning: 10,
            morningReceived: 5,
            morningIssued: 3,
            morningEnding: 12,
            afternoonBeginning: 12,
            afternoonReceived: 2,
            afternoonIssued: 4,
            afternoonEnding: 10,
            eveningBeginning: 10,
            eveningReceived: 1,
            eveningIssued: 2,
            eveningEnding: 9,
          };
        }
        
        kitchenHandoverMaterials.push(handoverData);
      }

      // Create handover materials for drink report - map all drink materials
      const drinkHandoverMaterials = [];
      
      for (const material of drinkMaterials) {
        const materialId = materialMap.get(material.name);
        
        let handoverData;
        
        if (material.name === '7Up') {
          // Case 1: Ca sáng không update
          handoverData = {
            handoverReportId: drinkReport.id,
            materialId: materialId,
            morningBeginning: 0,
            morningReceived: 0,
            morningIssued: 0,
            morningEnding: 0,
            afternoonBeginning: 100,
            afternoonReceived: 50,
            afternoonIssued: 30,
            afternoonEnding: 120,
            eveningBeginning: 0,
            eveningReceived: 0,
            eveningIssued: 0,
            eveningEnding: 0,
          };
        } else if (material.name === 'Pepsi') {
          // Case 2: Báo cáo sai
          handoverData = {
            handoverReportId: drinkReport.id,
            materialId: materialId,
            morningBeginning: 80,
            morningReceived: 20,
            morningIssued: 15,
            morningEnding: 85, // Báo cáo sai
            afternoonBeginning: 90, // Không khớp với morningEnding
            afternoonReceived: 30,
            afternoonIssued: 25,
            afternoonEnding: 95,
            eveningBeginning: 0,
            eveningReceived: 0,
            eveningIssued: 0,
            eveningEnding: 0,
          };
        } else if (material.name === 'Suối') {
          // Normal case
          handoverData = {
            handoverReportId: drinkReport.id,
            materialId: materialId,
            morningBeginning: 50,
            morningReceived: 20,
            morningIssued: 15,
            morningEnding: 55,
            afternoonBeginning: 55,
            afternoonReceived: 25,
            afternoonIssued: 20,
            afternoonEnding: 60,
            eveningBeginning: 60,
            eveningReceived: 10,
            eveningIssued: 15,
            eveningEnding: 55,
          };
        } else {
          // Default case for other drink materials
          handoverData = {
            handoverReportId: drinkReport.id,
            materialId: materialId,
            morningBeginning: 30,
            morningReceived: 15,
            morningIssued: 10,
            morningEnding: 35,
            afternoonBeginning: 35,
            afternoonReceived: 20,
            afternoonIssued: 15,
            afternoonEnding: 40,
            eveningBeginning: 40,
            eveningReceived: 10,
            eveningIssued: 12,
            eveningEnding: 38,
          };
        }
        
        drinkHandoverMaterials.push(handoverData);
      }

      // Insert all handover materials
      const allHandoverMaterials = [...kitchenHandoverMaterials, ...drinkHandoverMaterials];
      
      for (const material of allHandoverMaterials) {
        await prisma.handoverMaterial.create({
          data: material
        });
      }

      console.log(`✅ Created ${allHandoverMaterials.length} handover materials for ${label}`);
    }

    console.log('🎉 Handover materials seed completed successfully!');
    
    // Print summary
    const materialCount = await prisma.material.count();
    const reportCount = await prisma.handoverReport.count();
    const handoverMaterialCount = await prisma.handoverMaterial.count();
    
    console.log('\n📊 Summary:');
    console.log(`- Materials: ${materialCount}`);
    console.log(`- Handover Reports: ${reportCount}`);
    console.log(`- Handover Materials: ${handoverMaterialCount}`);

  } catch (error) {
    console.error('❌ Error seeding handover materials:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedHandoverMaterials()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }); 