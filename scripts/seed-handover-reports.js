const { PrismaClient } = require('../prisma/generated/prisma-client');
const prisma = new PrismaClient();

const materials = [
  {
    name: "Mì",
    type: "NGUYEN_VAT_LIEU",
    morning: { beginning: 50, received: 20, issued: 15, ending: 55 },
    afternoon: { beginning: 55, received: 10, issued: 25, ending: 40 },
    evening: { beginning: 40, received: 5, issued: 12, ending: 33 },
  },
  {
    name: "Khoai tây",
    type: "NGUYEN_VAT_LIEU",
    morning: { beginning: 30, received: 15, issued: 10, ending: 35 },
    afternoon: { beginning: 35, received: 8, issued: 18, ending: 25 },
    evening: { beginning: 25, received: 3, issued: 8, ending: 20 },
  },
  {
    name: "Chả cá",
    type: "NGUYEN_VAT_LIEU",
    morning: { beginning: 25, received: 12, issued: 8, ending: 29 },
    afternoon: { beginning: 29, received: 6, issued: 15, ending: 20 },
    evening: { beginning: 20, received: 2, issued: 6, ending: 16 },
  },
  {
    name: "Bò",
    type: "NGUYEN_VAT_LIEU",
    morning: { beginning: 40, received: 18, issued: 12, ending: 46 },
    afternoon: { beginning: 46, received: 9, issued: 22, ending: 33 },
    evening: { beginning: 33, received: 4, issued: 10, ending: 27 },
  },
  {
    name: "Ba rọi",
    type: "NGUYEN_VAT_LIEU",
    morning: { beginning: 35, received: 14, issued: 9, ending: 40 },
    afternoon: { beginning: 40, received: 7, issued: 19, ending: 28 },
    evening: { beginning: 28, received: 3, issued: 8, ending: 23 },
  },
  {
    name: "Coca Cola",
    type: "NUOC_UONG",
    morning: { beginning: 100, received: 50, issued: 30, ending: 120 },
    afternoon: { beginning: 120, received: 30, issued: 45, ending: 105 },
    evening: { beginning: 105, received: 20, issued: 25, ending: 100 },
  },
  {
    name: "Pepsi",
    type: "NUOC_UONG",
    morning: { beginning: 80, received: 40, issued: 25, ending: 95 },
    afternoon: { beginning: 95, received: 25, issued: 35, ending: 85 },
    evening: { beginning: 85, received: 15, issued: 20, ending: 80 },
  },
  {
    name: "Nước suối",
    type: "NUOC_UONG",
    morning: { beginning: 200, received: 100, issued: 60, ending: 240 },
    afternoon: { beginning: 240, received: 60, issued: 90, ending: 210 },
    evening: { beginning: 210, received: 40, issued: 50, ending: 200 },
  },
  {
    name: "Trà sữa",
    type: "NUOC_UONG",
    morning: { beginning: 150, received: 75, issued: 45, ending: 180 },
    afternoon: { beginning: 180, received: 45, issued: 67, ending: 158 },
    evening: { beginning: 158, received: 30, issued: 35, ending: 153 },
  },
  {
    name: "Cà phê",
    type: "NUOC_UONG",
    morning: { beginning: 120, received: 60, issued: 40, ending: 140 },
    afternoon: { beginning: 140, received: 35, issued: 55, ending: 120 },
    evening: { beginning: 120, received: 25, issued: 30, ending: 115 },
  },
];

const reportTypes = ["BAO_CAO_BEP", "BAO_CAO_NUOC"];

async function seedHandoverReports() {
  try {
    console.log('Starting to seed handover reports...');

    // Clear existing data
    console.log('Clearing existing handover data...');
    await prisma.handoverMaterial.deleteMany({});
    await prisma.handoverReport.deleteMany({});

    // Generate reports for the last 30 days
    const today = new Date();
    const reports = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      for (const reportType of reportTypes) {
        // Create 1 report per day per report type
        const report = await prisma.handoverReport.create({
          data: {
            date: date,
            reportType: reportType,
            branch: 'GO_VAP',
            note: `Báo cáo ${reportType === 'BAO_CAO_BEP' ? 'bếp' : 'nước'} ngày ${date.toLocaleDateString('vi-VN')}`,
          }
        });

        // Create materials for this report
        const filteredMaterials = materials.filter(m => 
          reportType === 'BAO_CAO_BEP' ? m.type === 'NGUYEN_VAT_LIEU' : m.type === 'NUOC_UONG'
        );

        for (const material of filteredMaterials) {
          await prisma.handoverMaterial.create({
            data: {
              handoverReportId: report.id,
              materialName: material.name,
              materialType: material.type,
              morningBeginning: material.morning.beginning,
              morningReceived: material.morning.received,
              morningIssued: material.morning.issued,
              morningEnding: material.morning.ending,
              afternoonBeginning: material.afternoon.beginning,
              afternoonReceived: material.afternoon.received,
              afternoonIssued: material.afternoon.issued,
              afternoonEnding: material.afternoon.ending,
              eveningBeginning: material.evening.beginning,
              eveningReceived: material.evening.received,
              eveningIssued: material.evening.issued,
              eveningEnding: material.evening.ending,
            }
          });
        }

        reports.push(report);
      }
    }

    console.log(`Successfully created ${reports.length} handover reports with materials`);
    
    // Log summary
    const totalMaterials = await prisma.handoverMaterial.count();
    const totalReports = await prisma.handoverReport.count();
    console.log(`Total reports created: ${totalReports}`);
    console.log(`Total materials created: ${totalMaterials}`);

    // Log breakdown by type
    const bepReports = await prisma.handoverReport.count({
      where: { reportType: 'BAO_CAO_BEP' }
    });
    const nuocReports = await prisma.handoverReport.count({
      where: { reportType: 'BAO_CAO_NUOC' }
    });
    console.log(`Báo cáo bếp: ${bepReports}`);
    console.log(`Báo cáo nước: ${nuocReports}`);

  } catch (error) {
    console.error('Error seeding handover reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedHandoverReports(); 