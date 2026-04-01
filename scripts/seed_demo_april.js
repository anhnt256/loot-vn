const { PrismaClient } = require('../libs/database/src/lib/generated/prisma-client');

async function seedDemoData() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: "mysql://gateway:BzhmGqGyuTNsxVYqJgYFpgpfDzhOBlAp@51.79.145.188:3306/gateway_govap" }
    }
  });
  
  try {
    console.log("Starting to seed demo data for April 2026...");
    
    // 1. Ensure we have exactly 93 Materials for BAO_CAO_BEP
    const reportType = 'BAO_CAO_BEP';
    
    let currentMaterials = await prisma.material.findMany({
      where: { reportType }
    });
    
    if (currentMaterials.length < 93) {
      console.log(`Currently have ${currentMaterials.length} materials. Creating ${93 - currentMaterials.length} more...`);
      for (let i = currentMaterials.length + 1; i <= 93; i++) {
        await prisma.material.create({
          data: {
            name: `Mặt hàng Demo ${i} (${reportType})`,
            reportType: reportType,
            isActive: true
          }
        });
      }
      
      // Re-fetch
      currentMaterials = await prisma.material.findMany({
        where: { reportType }
      });
    } else if (currentMaterials.length > 93) {
        // limit to 93
        currentMaterials = currentMaterials.slice(0, 93);
    }
    
    console.log(`Prepared 93 materials. Starting daily insert...`);
    
    const materialIds = currentMaterials.map(m => m.id);

    // April 2026 has 30 days
    for (let day = 1; day <= 30; day++) {
      const dateString = `2026-04-${day.toString().padStart(2, '0')}T00:00:00.000Z`;
      const reportDate = new Date(dateString);
      
      console.log(`Processing report for ${dateString}...`);
      
      // Find if exists
      const existing = await prisma.handoverReport.findFirst({
        where: {
          date: reportDate,
          reportType: reportType
        }
      });
      
      if (existing) {
        // Delete old materials & report to start fresh
        console.log(`  Removing existing report for ${dateString}`);
        await prisma.handoverReport.delete({
          where: { id: existing.id }
        });
      }
      
      // Fake metadata for UI completeness
      const metadata = {
        "SANG": {
          start: { at: `2026-04-${day.toString().padStart(2, '0')}T06:00:00.000Z` },
          end: { at: `2026-04-${day.toString().padStart(2, '0')}T14:00:00.000Z` }
        },
        "CHIEU": {
          start: { at: `2026-04-${day.toString().padStart(2, '0')}T14:00:00.000Z` },
          end: { at: `2026-04-${day.toString().padStart(2, '0')}T22:00:00.000Z` }
        },
        "TOI": {
          start: { at: `2026-04-${day.toString().padStart(2, '0')}T22:00:00.000Z` },
          end: { at: `2026-04-${(day === 30 ? 30 : day + 1).toString().padStart(2, '0')}T06:00:00.000Z` }
        }
      };
      
      const materialsData = materialIds.map(materialId => {
        // Fake numbers
        // Morning
        const mb = Math.floor(Math.random() * 50);
        const mr = Math.floor(Math.random() * 20);
        const mi = Math.floor(Math.random() * 15);
        const me = mb + mr - mi;
        
        // Afternoon
        const ab = me;
        const ar = Math.floor(Math.random() * 20);
        const ai = Math.floor(Math.random() * 15);
        const ae = ab + ar - ai;
        
        // Evening
        const eb = ae;
        const er = Math.floor(Math.random() * 20);
        const ei = Math.floor(Math.random() * 15);
        const ee = eb + er - ei;

        return {
          materialId,
          morningBeginning: mb,
          morningReceived: mr,
          morningIssued: mi,
          morningEnding: me,
          afternoonBeginning: ab,
          afternoonReceived: ar,
          afternoonIssued: ai,
          afternoonEnding: ae,
          eveningBeginning: eb,
          eveningReceived: er,
          eveningIssued: ei,
          eveningEnding: ee,
        };
      });

      await prisma.handoverReport.create({
        data: {
          date: reportDate,
          reportType: reportType,
          isMorningComplete: true,
          isAfternoonComplete: true,
          isEveningComplete: true,
          metadata: metadata,
          materials: {
            create: materialsData
          }
        }
      });
      
    }
    
    console.log("Demo data seeding completed successfully!");
  } catch (err) {
    console.error("Error creating demo data:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoData();
