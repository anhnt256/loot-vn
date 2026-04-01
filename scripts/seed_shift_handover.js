const { PrismaClient } = require('../libs/database/src/lib/generated/prisma-client');


// Nếu bị lỗi kết nối, bạn hãy đảm bảo terminal của bạn đang chạy npm script này
// có thể truy cập được database.

async function seedShiftHandover() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL || "mysql://gateway:BzhmGqGyuTNsxVYqJgYFpgpfDzhOBlAp@51.79.145.188:3306/gateway_govap" }
    }
  });

  try {
    console.log("Đang lấy danh sách các ca làm việc (WorkShift)...");
    let workShifts = await prisma.workShift.findMany();
    
    // Nếu chưa có ca nào, tạo 3 ca mặc định (Sáng, Chiều, Tối)
    if (workShifts.length === 0) {
      console.log("Chưa có WorkShift nào, hệ thống sẽ tự động tạo 3 ca: Sáng, Chiều, Tối...");
      await prisma.workShift.createMany({
        data: [
          { name: "Sáng", startTime: new Date("1970-01-01T06:00:00Z"), endTime: new Date("1970-01-01T14:00:00Z") },
          { name: "Chiều", startTime: new Date("1970-01-01T14:00:00Z"), endTime: new Date("1970-01-01T22:00:00Z") },
          { name: "Tối", startTime: new Date("1970-01-01T22:00:00Z"), endTime: new Date("1970-01-01T06:00:00Z"), isOvernight: true },
        ]
      });
      workShifts = await prisma.workShift.findMany();
    }
    
    // Đảm bảo chỉ dùng 3 ca đầu tiên (để ra đủ 3 ca x 31 ngày = 93 dòng)
    const activeShifts = workShifts.slice(0, 3);
    console.log(`Sử dụng ${activeShifts.length} ca làm việc:`, activeShifts.map(s => s.name).join(", "));
    
    // Xóa dữ liệu cũ của tháng 4 & tháng 5 (để test) để tránh lỗi duplicate (unique [date, workShiftId])
    console.log("Dọn dẹp báo cáo kết ca (ShiftHandoverReport) cũ của tháng 4...");
    const startDate = new Date("2026-04-01T00:00:00Z");
    const endDate = new Date("2026-05-02T00:00:00Z");
    
    await prisma.shiftHandoverReport.deleteMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    console.log("Bắt đầu tạo 93 dòng báo cáo kết ca (31 ngày x 3 ca)...");
    
    const reportsToCreate = [];
    
    // Lặp 31 ngày (ví dụ 1/4 đến 1/5 để đủ 31 ngày)
    for (let i = 0; i < 31; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        
        for (const shift of activeShifts) {
            reportsToCreate.push({
                date: d,
                workShiftId: shift.id,
                fnetRevenue: Math.floor(Math.random() * 500000) + 100000,
                gcpRevenue: Math.floor(Math.random() * 200000) + 50000,
                momoRevenue: Math.floor(Math.random() * 1000000) + 200000,
                cashRevenue: Math.floor(Math.random() * 1500000) + 300000,
                cashExpense: Math.floor(Math.random() * 200000),
                actualReceived: Math.floor(Math.random() * 1000000) + 100000,
                note: `Báo cáo test tự động ca ${shift.name} ngày ${d.toISOString().split('T')[0]}`
            });
        }
    }

    // Insert to DB
    await prisma.shiftHandoverReport.createMany({
        data: reportsToCreate
    });

    console.log(`Đã tạo thành công ${reportsToCreate.length} báo cáo kết ca (ShiftHandoverReport)!`);

  } catch (err) {
    console.error("Lỗi khi tạo dữ liệu demo:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedShiftHandover();
