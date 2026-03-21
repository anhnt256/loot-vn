// Lấy trực tiếp PrismaClient đã được NX generate riêng trong folder libs thay vì global
const { PrismaClient } = require('../libs/database/src/lib/generated/tenant-client');
const readline = require('readline');

// Kết nối đến 2 DB
const dbOld = new PrismaClient({ datasources: { db: { url: "mysql://gateway:BzhmGqGyuTNsxVYqJgYFpgpfDzhOBlAp@51.79.145.188:3306/gw_core" } } });
const dbNew = new PrismaClient({ datasources: { db: { url: "mysql://gateway:BzhmGqGyuTNsxVYqJgYFpgpfDzhOBlAp@51.79.145.188:3306/gateway_govap" } } });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function getTables(db, dbName) {
  const result = await db.$queryRawUnsafe(`
    SELECT TABLE_NAME 
    FROM information_schema.tables 
    WHERE table_schema = '${dbName}' AND TABLE_TYPE = 'BASE TABLE'
  `);
  return result.map(r => r.TABLE_NAME || r.table_name || r.Table_name);
}

async function getColumns(db, dbName, tableName) {
  const result = await db.$queryRawUnsafe(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = '${dbName}' AND table_name = '${tableName}'
  `);
  return result.map(r => r.COLUMN_NAME || r.column_name || r.Column_name);
}

async function migrateAll() {
  console.log("Bắt đầu chuẩn bị cấu hình mapping giữa hai database...");

  try {
    // 1. Phân tích trực tiếp từ Database thực tế (bỏ qua Prisma Schema vì cấu trúc 2 bên lệch nhau)
    const oldTables = await getTables(dbOld, 'gw_core');
    const newTables = await getTables(dbNew, 'gateway_govap');
    
    // Tìm các bảng tồn tại ở cả hai database
    const commonTables = oldTables.filter(t => newTables.includes(t));
    
    console.log(`\nTìm thấy ${commonTables.length} bảng chung giữa DB cũ và DB mới.\n`);

    // 2. Chạy tuần tự qua các bảng chung
    for (const tableName of commonTables) {
      // Yêu cầu xác nhận
      const answer = await askQuestion(`Bạn có muốn tiếp tục migrate bảng '${tableName}' không? (Y/N): `);
      if (answer.trim().toLowerCase() !== 'y') {
        console.log(`-> Bỏ qua bảng ${tableName}.\n`);
        continue;
      }

      console.log(`\n[${tableName}] Đang phân tích các cột chung...`);
      
      try {
        // Lấy danh sách cột từ DB cũ và mới
        const oldCols = await getColumns(dbOld, 'gw_core', tableName);
        const newCols = await getColumns(dbNew, 'gateway_govap', tableName);
        
        // Chỉ lấy những cột tồn tại ở cả hai DB (ví dụ cột 'BranchId' có ở old nhưng không có mới thì sẽ tự bị bỏ qua)
        const commonCols = oldCols.filter(c => newCols.includes(c));
        
        if (commonCols.length === 0) {
          console.log(`[BỎ QUA] Không có cột chung nào giữa hai bảng ${tableName}.\n`);
          continue;
        }

        const selectColsRaw = commonCols.map(c => `\`${c}\``).join(', ');
        
        // Kiểm tra xem bảng gốc có cột nào lưu chi nhánh không (thường là 'BranchId' hoặc 'branch')
        const branchColName = oldCols.find(c => ['branchid', 'branch'].includes(c.toLowerCase()));
        const whereClause = branchColName ? `WHERE \`${branchColName}\` = 'GO_VAP'` : '';
        
        if (branchColName) {
          console.log(`[${tableName}] Đã phát hiện cột chi nhánh '${branchColName}'. Sẽ chỉ migrate dữ liệu của chi nhánh 'GO_VAP'.`);
        } else {
          console.log(`[${tableName}] Không tồn tại cột chi nhánh. Sẽ migrate toàn bộ bảng.`);
        }

        // Lấy số lượng dữ liệu sẽ migrate
        const countResult = await dbOld.$queryRawUnsafe(`SELECT COUNT(*) as total FROM \`${tableName}\` ${whereClause}`);
        // Xử lý kiểu BigInt trả về tùy driver
        let totalRecords = Number(countResult[0].total || countResult[0].TOTAL || 0);

        console.log(`[${tableName}] Lọc được ${totalRecords} bản ghi thoả điều kiện. Đã ánh xạ thành công ${commonCols.length} cột chung.`);

        // Thực hiện Xoá (TRUNCATE) bảng đích để đảm bảo đồng nhất, không giữ lại rác của DB mới
        console.log(`[${tableName}] Đang xoá sạch dữ liệu rác trên DB New...`);
        try {
          await dbNew.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
          await dbNew.$executeRawUnsafe(`TRUNCATE TABLE \`${tableName}\`;`);
          await dbNew.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
          console.log(`[${tableName}] Đã làm sạch bảng trên DB New. Bắt đầu chèn dữ liệu...`);
        } catch (e) {
          console.warn(`[${tableName}] Không thể TRUNCATE: ${e.message}. Sẽ fallback dùng lệnh DELETE FROM...`);
          await dbNew.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
          await dbNew.$executeRawUnsafe(`DELETE FROM \`${tableName}\`;`);
          await dbNew.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
        }

        if (totalRecords > 0) {
          let migrated = 0;
          const chunkSize = 2000;
          
          for (let offset = 0; offset < totalRecords; offset += chunkSize) {
            // Đọc batch DATA từ DBOld thông qua SQL thô
            const rows = await dbOld.$queryRawUnsafe(`
              SELECT ${selectColsRaw} 
              FROM \`${tableName}\` 
              ${whereClause}
              LIMIT ${chunkSize} OFFSET ${offset}
            `);

            if (!rows || rows.length === 0) break;

            // Xây dựng câu lệnh INSERT IGNORE INTO ... VALUES (...), (...), ...
            // IGNORE sẽ giúp db không bị crash và bỏ qua ngầm nếu data bị trùng Primary / Unique Keys
            const values = [];
            for (const row of rows) {
              const rowValues = commonCols.map(col => {
                const val = row[col];
                if (val === null || val === undefined) return 'NULL';
                if (typeof val === 'string') {
                  // Escape string cho SQL thô để tránh lỗi cú pháp (giải pháp giản lược)
                  return "'" + val.replace(/'/g, "''").replace(/\\/g, "\\\\") + "'";
                }
                if (val instanceof Date) return "'" + val.toISOString().slice(0, 19).replace('T', ' ') + "'";
                if (typeof val === 'object') return "'" + JSON.stringify(val).replace(/'/g, "''") + "'";
                return val;
              });
              values.push(`(${rowValues.join(', ')})`);
            }

            const insertQuery = `
              INSERT IGNORE INTO \`${tableName}\` (${selectColsRaw})
              VALUES ${values.join(', ')}
            `;

            await dbNew.$executeRawUnsafe(insertQuery);
            
            migrated += rows.length;
            console.log(`   - Đã chèn ${migrated}/${totalRecords} bản ghi...`);
          }
        }

        console.log(`[${tableName}] Migrate thành công!\n`);

      } catch (err) {
        console.error(`[${tableName}] Lỗi khi migrate bảng:`, err.message);
        
        const errAnswer = await askQuestion(`Có lỗi xảy ra ở bảng ${tableName}. Bạn có muốn tiếp tục những bảng còn lại không? (Y/N): `);
        if (errAnswer.trim().toLowerCase() !== 'y') {
          console.log("\nĐã dừng quá trình migrate do người dùng yêu cầu.");
          break;
        }
        console.log("\n");
      }
    }

  } catch (error) {
    console.error("Lỗi cấu trúc hoặc kết nối database:", error);
  } finally {
    await dbOld.$disconnect();
    await dbNew.$disconnect();
    rl.close();
    console.log("Hoàn tất quy trình chạy script Migrate!");
  }
}

migrateAll()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
