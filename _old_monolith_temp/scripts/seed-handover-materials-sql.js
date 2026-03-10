const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gateway_app',
  port: process.env.DB_PORT || 3306
};

async function seedHandoverMaterials() {
  let connection;
  
  try {
    console.log('🌱 Starting handover materials seed...');
    
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Clear existing data
    await connection.execute('DELETE FROM HandoverMaterial');
    await connection.execute('DELETE FROM HandoverReport');
    await connection.execute('DELETE FROM Material');
    console.log('🗑️ Cleared existing data');

    // Create materials for Báo cáo bếp
    const kitchenMaterials = [
      ['Gạo', 'BAO_CAO_BEP', true],
      ['Thịt heo', 'BAO_CAO_BEP', true],
      ['Thịt bò', 'BAO_CAO_BEP', true],
      ['Cá', 'BAO_CAO_BEP', true],
      ['Rau cải', 'BAO_CAO_BEP', true],
      ['Hành lá', 'BAO_CAO_BEP', true],
      ['Dầu ăn', 'BAO_CAO_BEP', false],
      ['Nước mắm', 'BAO_CAO_BEP', false],
      ['Muối', 'BAO_CAO_BEP', false],
      ['Đường', 'BAO_CAO_BEP', false],
    ];

    // Create materials for Báo cáo nước
    const drinkMaterials = [
      ['Coca Cola', 'BAO_CAO_NUOC', false],
      ['Pepsi', 'BAO_CAO_NUOC', false],
      ['Sprite', 'BAO_CAO_NUOC', false],
      ['Fanta', 'BAO_CAO_NUOC', false],
      ['Nước suối', 'BAO_CAO_NUOC', false],
      ['Trà đá', 'BAO_CAO_NUOC', false],
      ['Cà phê', 'BAO_CAO_NUOC', false],
      ['Sữa tươi', 'BAO_CAO_NUOC', false],
    ];

    const allMaterials = [...kitchenMaterials, ...drinkMaterials];

    // Insert materials
    for (const [name, reportType, isOnFood] of allMaterials) {
      await connection.execute(
        'INSERT INTO Material (name, reportType, isOnFood, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [name, reportType, isOnFood, true]
      );
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
      const [kitchenResult] = await connection.execute(
        'INSERT INTO HandoverReport (date, reportType, branch, note, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [date, 'BAO_CAO_BEP', 'GO_VAP', `Báo cáo bếp ${label}`]
      );
      const kitchenReportId = kitchenResult.insertId;

      // Create Báo cáo nước
      const [drinkResult] = await connection.execute(
        'INSERT INTO HandoverReport (date, reportType, branch, note, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [date, 'BAO_CAO_NUOC', 'GO_VAP', `Báo cáo nước ${label}`]
      );
      const drinkReportId = drinkResult.insertId;

      // Create handover materials for kitchen report
      const kitchenHandoverMaterials = [
        // Case 1: Ca sáng không update, ca chiều update thực tế
        {
          handoverReportId: kitchenReportId,
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
          handoverReportId: kitchenReportId,
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
          handoverReportId: kitchenReportId,
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
          handoverReportId: kitchenReportId,
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
          handoverReportId: kitchenReportId,
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
          handoverReportId: kitchenReportId,
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
          handoverReportId: drinkReportId,
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
          handoverReportId: drinkReportId,
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
          handoverReportId: drinkReportId,
          materialName: 'Nước suối',
          materialType: 'NUOC_UONG',
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
        }
      ];

      // Insert all handover materials
      const allHandoverMaterials = [...kitchenHandoverMaterials, ...drinkHandoverMaterials];
      
      for (const material of allHandoverMaterials) {
        await connection.execute(
          `INSERT INTO HandoverMaterial (
            handoverReportId, materialName, materialType,
            morningBeginning, morningReceived, morningIssued, morningEnding,
            afternoonBeginning, afternoonReceived, afternoonIssued, afternoonEnding,
            eveningBeginning, eveningReceived, eveningIssued, eveningEnding,
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            material.handoverReportId,
            material.materialName,
            material.materialType,
            material.morningBeginning,
            material.morningReceived,
            material.morningIssued,
            material.morningEnding,
            material.afternoonBeginning,
            material.afternoonReceived,
            material.afternoonIssued,
            material.afternoonEnding,
            material.eveningBeginning,
            material.eveningReceived,
            material.eveningIssued,
            material.eveningEnding,
          ]
        );
      }

      console.log(`✅ Created ${allHandoverMaterials.length} handover materials for ${label}`);
    }

    console.log('🎉 Handover materials seed completed successfully!');
    
    // Print summary
    const [materialCount] = await connection.execute('SELECT COUNT(*) as count FROM Material');
    const [reportCount] = await connection.execute('SELECT COUNT(*) as count FROM HandoverReport');
    const [handoverMaterialCount] = await connection.execute('SELECT COUNT(*) as count FROM HandoverMaterial');
    
    console.log('\n📊 Summary:');
    console.log(`- Materials: ${materialCount[0].count}`);
    console.log(`- Handover Reports: ${reportCount[0].count}`);
    console.log(`- Handover Materials: ${handoverMaterialCount[0].count}`);

  } catch (error) {
    console.error('❌ Error seeding handover materials:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
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