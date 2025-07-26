const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
      { name: 'Gạo', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Thịt heo', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Thịt bò', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Cá', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Rau cải', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Hành lá', reportType: 'BAO_CAO_BEP', isOnFood: true },
      { name: 'Dầu ăn', reportType: 'BAO_CAO_BEP', isOnFood: false },
      { name: 'Nước mắm', reportType: 'BAO_CAO_BEP', isOnFood: false },
      { name: 'Muối', reportType: 'BAO_CAO_BEP', isOnFood: false },
      { name: 'Đường', reportType: 'BAO_CAO_BEP', isOnFood: false },
    ];

    // Create materials for Báo cáo nước
    const drinkMaterials = [
      { name: 'Coca Cola', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Pepsi', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Sprite', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Fanta', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Nước suối', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Trà đá', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Cà phê', reportType: 'BAO_CAO_NUOC', isOnFood: false },
      { name: 'Sữa tươi', reportType: 'BAO_CAO_NUOC', isOnFood: false },
    ];

    const allMaterials = [...kitchenMaterials, ...drinkMaterials];

    // Insert materials
    for (const material of allMaterials) {
      await prisma.material.create({
        data: material
      });
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

      // Create handover materials for kitchen report
      const kitchenHandoverMaterials = [
        // Case 1: Ca sáng không update, ca chiều update thực tế
        {
          handoverReportId: kitchenReport.id,
          materialName: 'Gạo',
          materialType: 'NGUYEN_VAT_LIEU',
          // Ca sáng: không update (0)
          morningBeginning: 0,
          morningReceived: 0,
          morningIssued: 0,
          morningEnding: 0,
          // Ca chiều: update thực tế
          afternoonBeginning: 50, // Tồn đầu ca chiều
          afternoonReceived: 20,  // Nhập thêm
          afternoonIssued: 15,    // Xuất
          afternoonEnding: 55,    // Tồn cuối = 50 + 20 - 15
          // Ca tối: chưa có dữ liệu
          eveningBeginning: 0,
          eveningReceived: 0,
          eveningIssued: 0,
          eveningEnding: 0,
        },
        // Case 2: Ca sáng báo cáo sai - Tồn cuối 40, nhưng Tồn đầu ca chiều là 43
        {
          handoverReportId: kitchenReport.id,
          materialName: 'Thịt heo',
          materialType: 'NGUYEN_VAT_LIEU',
          // Ca sáng: báo cáo sai
          morningBeginning: 30,
          morningReceived: 15,
          morningIssued: 5,
          morningEnding: 40, // Báo cáo sai
          // Ca chiều: thực tế tồn đầu là 43 (không khớp với tồn cuối ca sáng)
          afternoonBeginning: 43, // Không khớp với morningEnding = 40
          afternoonReceived: 10,
          afternoonIssued: 8,
          afternoonEnding: 45,
          // Ca tối
          eveningBeginning: 0,
          eveningReceived: 0,
          eveningIssued: 0,
          eveningEnding: 0,
        },
        // Case 3: Ca sáng báo cáo sai - Tồn cuối 40, nhưng Tồn đầu ca chiều là 35
        {
          handoverReportId: kitchenReport.id,
          materialName: 'Thịt bò',
          materialType: 'NGUYEN_VAT_LIEU',
          // Ca sáng: báo cáo sai
          morningBeginning: 25,
          morningReceived: 20,
          morningIssued: 5,
          morningEnding: 40, // Báo cáo sai
          // Ca chiều: thực tế tồn đầu là 35 (ít hơn tồn cuối ca sáng)
          afternoonBeginning: 35, // Ít hơn morningEnding = 40
          afternoonReceived: 12,
          afternoonIssued: 7,
          afternoonEnding: 40,
          // Ca tối
          eveningBeginning: 0,
          eveningReceived: 0,
          eveningIssued: 0,
          eveningEnding: 0,
        },
        // Normal case - all shifts have data
        {
          handoverReportId: kitchenReport.id,
          materialName: 'Cá',
          materialType: 'NGUYEN_VAT_LIEU',
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
        },
        // Normal case - food item
        {
          handoverReportId: kitchenReport.id,
          materialName: 'Rau cải',
          materialType: 'NGUYEN_VAT_LIEU',
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
        },
        // Non-food item
        {
          handoverReportId: kitchenReport.id,
          materialName: 'Dầu ăn',
          materialType: 'NGUYEN_VAT_LIEU',
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
        }
      ];

      // Create handover materials for drink report
      const drinkHandoverMaterials = [
        // Case 1: Ca sáng không update
        {
          handoverReportId: drinkReport.id,
          materialName: 'Coca Cola',
          materialType: 'NUOC_UONG',
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
        },
        // Case 2: Báo cáo sai
        {
          handoverReportId: drinkReport.id,
          materialName: 'Pepsi',
          materialType: 'NUOC_UONG',
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
        },
        // Normal case
        {
          handoverReportId: drinkReport.id,
          materialName: 'Nước suối',
          materialType: 'NUOC_UONG',
          morningBeginning: 50,
          morningReceived: 20,
          morningIssued: 15,
          afternoonBeginning: 55,
          afternoonReceived: 25,
          afternoonIssued: 20,
          eveningBeginning: 60,
          eveningReceived: 10,
          eveningIssued: 15,
          eveningEnding: 55,
        }
      ];

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