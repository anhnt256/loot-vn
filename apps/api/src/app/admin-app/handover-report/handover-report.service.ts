import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { TenantPrismaService, MasterPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';

const SHIFT_ENUM = {
  SANG: "SANG",
  CHIEU: "CHIEU",
  TOI: "TOI"
};

// Hàm helper để tính ngày (bỏ qua timezone)
function getCurrentTimeVNDB() {
  return new Date();
}

@Injectable()
export class HandoverReportService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService
  ) {}

  private async getGatewayClient(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');

    return await this.tenantPrisma.getClient(dbUrl);
  }

  // Thay vì dùng `getBranchFromCookie()`, ta sẽ dùng `tenantId` như tham số đại diện cho branch
  private getBranchFromTenantId(tenantId: string) {
    // Trong kiến trúc đa tenant, tenantId thay thế trực tiếp cho branch
    return tenantId;
  }

  async getWorkShifts(tenantId: string) {
    const gatewayClient = await this.getGatewayClient(tenantId);
    const shifts = await gatewayClient.workShift.findMany({
      orderBy: { startTime: 'asc' },
      include: { staffs: { select: { id: true, fullName: true }, where: { isDeleted: false } } },
    });
    return { success: true, data: shifts };
  }

  async getReports(tenantId: string, date?: string, reportType?: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);
      const branch = this.getBranchFromTenantId(tenantId);

      const whereClause: any = {
        // DB mới có thể không có cột branch, hoặc ta check xem
        // Tạm thời bỏ qua filter `branch = branch` nếu schema không có.
        // Wait, schema.prisma does not have branch column in HandoverReport?
        // Let's check: I saw HandoverReport definition, it doesn't have `branch` column. The DB is already scoped by tenant!
      };

      if (reportType) {
        whereClause.reportType = reportType;
      }

      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        whereClause.date = {
          gte: startDate,
          lt: endDate,
        };
      }

      const reports = await gatewayClient.handoverReport.findMany({
        where: whereClause,
        include: {
          materials: {
            include: {
              material: true,
            },
          },
          morningStaff: { select: { fullName: true } },
          afternoonStaff: { select: { fullName: true } },
          eveningStaff: { select: { fullName: true } },
        },
        orderBy: [{ date: 'desc' }, { reportType: 'asc' }],
      });

      const transformedReports = reports.map((report: any) => ({
        id: report.id,
        date: report.date,
        reportType: report.reportType,
        note: report.note,
        morningStaffId: report.morningStaffId,
        morningStaffName: report.morningStaff?.fullName || null,
        afternoonStaffId: report.afternoonStaffId,
        afternoonStaffName: report.afternoonStaff?.fullName || null,
        eveningStaffId: report.eveningStaffId,
        eveningStaffName: report.eveningStaff?.fullName || null,
        metadata: report.metadata,
        materials: report.materials
          .filter((material: any) => material.material?.reportType === report.reportType)
          .map((material: any) => ({
            id: material.id,
            materialName: material.material?.name || 'Unknown',
            materialType: material.material?.reportType || 'DAILY',
            morning: {
              beginning: material.morningBeginning,
              received: material.morningReceived,
              issued: material.morningIssued,
              ending: material.morningEnding,
            },
            afternoon: {
              beginning: material.afternoonBeginning,
              received: material.afternoonReceived,
              issued: material.afternoonIssued,
              ending: material.afternoonEnding,
            },
            evening: {
              beginning: material.eveningBeginning,
              received: material.eveningReceived,
              issued: material.eveningIssued,
              ending: material.eveningEnding,
            },
          }))
          .sort((a, b) => a.materialName.localeCompare(b.materialName)),
      }));

      return { success: true, data: transformedReports };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch reports');
    }
  }

  async getStaffs(tenantId: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);
      const staffs = await gatewayClient.staff.findMany({
        select: { id: true, fullName: true, userName: true },
        where: { isDeleted: false },
        orderBy: { fullName: 'asc' },
      });
      return { success: true, data: staffs };
    } catch (error) {
       // fallback if isDeleted doesn't exist
       try {
         const gatewayClient = await this.getGatewayClient(tenantId);
         const staffs = await gatewayClient.staff.findMany({
           select: { id: true, fullName: true, userName: true },
           orderBy: { fullName: 'asc' },
         });
         return { success: true, data: staffs };
       } catch (innerError) {
         console.error(innerError);
         throw new InternalServerErrorException('Failed to fetch staffs');
       }
    }
  }

  async getMaterials(tenantId: string, reportType?: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);
      
      let query = "SELECT id, name as materialName, reportType as materialType, isActive, isOnFood FROM Material WHERE 1=1 ";
      const params: any[] = [];
      
      if (reportType && reportType !== "") {
        query += " AND reportType = ?";
        params.push(reportType);
      }
      
      query += " ORDER BY name ASC";
      
      console.log(`[DEBUG] Executing SQL: ${query} with params:`, params);
      const materials = await (gatewayClient as any).$queryRawUnsafe(query, ...params);
      
      console.log(`[DEBUG] Found ${materials?.length || 0} materials in DB.`);

      return {
        success: true,
        data: (materials as any[]).map((m) => ({
          id: m.id,
          materialName: m.materialName,
          materialType: m.materialType,
          isDeleted: m.isActive === 0 || m.isActive === false,
          isFood: m.isOnFood === 1 || m.isOnFood === true,
        })),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch materials');
    }
  }

  async createMaterial(tenantId: string, payload: any) {
    try {
      const {
        materialName,
        materialType,
        isDeleted = false,
        isFood = true,
      } = payload;

      const gatewayClient = await this.getGatewayClient(tenantId);

      const existingMaterial = await gatewayClient.$queryRaw`
        SELECT id FROM Material 
        WHERE name = ${materialName} 
          AND reportType = ${materialType}
        LIMIT 1
      `;

      if ((existingMaterial as any[]).length > 0) {
        throw new BadRequestException('Material already exists');
      }

      await gatewayClient.$queryRaw`
        INSERT INTO Material (name, reportType, isActive, isOnFood, createdAt, updatedAt)
        VALUES (${materialName}, ${materialType}, ${!isDeleted}, ${isFood}, NOW(), NOW())
      `;

      const newMaterial = await gatewayClient.$queryRaw`
         SELECT * FROM Material ORDER BY createdAt DESC LIMIT 1
      `;

      return {
        success: true,
        data: {
          id: (newMaterial as any)[0].id,
          materialName: (newMaterial as any)[0].name,
          materialType: (newMaterial as any)[0].reportType,
          isDeleted: !(newMaterial as any)[0].isActive,
          isFood: (newMaterial as any)[0].isOnFood,
        },
      };
    } catch (error) {
       console.error(error);
       if (error instanceof BadRequestException) throw error;
       throw new InternalServerErrorException('Failed to create material');
    }
  }

  async updateMaterial(tenantId: string, payload: any) {
    try {
      const {
        id,
        materialName,
        materialType,
        isDeleted = false,
        isFood = true,
      } = payload;

      const gatewayClient = await this.getGatewayClient(tenantId);

      const existingMaterial = await gatewayClient.$queryRaw`
        SELECT id FROM Material WHERE id = ${parseInt(id)} LIMIT 1
      `;

      if ((existingMaterial as any[]).length === 0) {
        throw new NotFoundException('Material not found');
      }

      const duplicateMaterial = await gatewayClient.$queryRaw`
        SELECT id FROM Material 
        WHERE name = ${materialName} 
          AND reportType = ${materialType}
          AND id != ${parseInt(id)}
        LIMIT 1
      `;

      if ((duplicateMaterial as any[]).length > 0) {
        throw new BadRequestException('Material name already exists');
      }

      await gatewayClient.$queryRaw`
        UPDATE Material 
        SET name = ${materialName}, 
            reportType = ${materialType}, 
            isActive = ${!isDeleted}, 
            isOnFood = ${isFood}, 
            updatedAt = NOW()
        WHERE id = ${parseInt(id)}
      `;

      const updatedMaterial = await gatewayClient.$queryRaw`
        SELECT * FROM Material WHERE id = ${parseInt(id)} LIMIT 1
      `;

      return {
        success: true,
        data: {
          id: (updatedMaterial as any)[0].id,
          materialName: (updatedMaterial as any)[0].name,
          materialType: (updatedMaterial as any)[0].reportType,
          isDeleted: !(updatedMaterial as any)[0].isActive,
          isFood: (updatedMaterial as any)[0].isOnFood,
        },
      };

    } catch (error) {
       console.error(error);
       if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
       throw new InternalServerErrorException('Failed to update material');
    }
  }

  async getReportData(tenantId: string, date: string, reportType: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);
      
      const currentDate = new Date(date);
      const formattedCurrentDate = currentDate.toISOString().split('T')[0];

      const currentReportResult = await gatewayClient.$queryRaw`
        SELECT id FROM HandoverReport 
        WHERE DATE(date) = ${formattedCurrentDate}
        AND reportType = ${reportType}
        LIMIT 1
      ` as any[];

      let currentDayData: any[] = [];
      let staffInfo: any = null;
      let submissionTracking: any = null;
      let availableMaterials: any[] = [];

      if (currentReportResult.length > 0) {
      const reportStaffInfo = currentReportResult.length > 0 ? await gatewayClient.$queryRaw`
          SELECT 
            morningStaffId, afternoonStaffId, eveningStaffId,
            morningSubmissionCount, afternoonSubmissionCount, eveningSubmissionCount,
            isMorningComplete, isAfternoonComplete, isEveningComplete,
            metadata
          FROM HandoverReport
          WHERE id = ${currentReportResult[0].id}
        ` as any[] : [];

      staffInfo = reportStaffInfo[0] || {
        morningStaffId: null,
        afternoonStaffId: null,
        eveningStaffId: null,
      };

      let metadata = reportStaffInfo[0]?.metadata || {};
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          metadata = {};
        }
      }

      submissionTracking = reportStaffInfo[0] ? {
        morningSubmissionCount: reportStaffInfo[0].morningSubmissionCount,
        afternoonSubmissionCount: reportStaffInfo[0].afternoonSubmissionCount,
        eveningSubmissionCount: reportStaffInfo[0].eveningSubmissionCount,
        isMorningComplete: reportStaffInfo[0].isMorningComplete,
        isAfternoonComplete: reportStaffInfo[0].isAfternoonComplete,
        isEveningComplete: reportStaffInfo[0].isEveningComplete,
        metadata: metadata
      } : { metadata: {} };
      }

      if (currentReportResult.length > 0) {
        const handoverReportId = currentReportResult[0].id;
        
        const currentMaterialsResult = await gatewayClient.$queryRaw`
          SELECT 
            m.id as materialId,
            m.name as materialName,
            hm.morningBeginning,
            hm.morningReceived,
            hm.morningIssued,
            hm.morningEnding,
            hm.afternoonBeginning,
            hm.afternoonReceived,
            hm.afternoonIssued,
            hm.afternoonEnding,
            hm.eveningBeginning,
            hm.eveningReceived,
            hm.eveningIssued,
            hm.eveningEnding
          FROM HandoverMaterial hm
          LEFT JOIN Material m ON hm.materialId = m.id
          WHERE hm.handoverReportId = ${handoverReportId}
          AND m.reportType = ${reportType}
        ` as any[];

        currentDayData = currentMaterialsResult.map((material) => ({
          id: material.materialId,
          materialName: material.materialName,
          morning: {
            beginning: material.morningBeginning || 0,
            received: material.morningReceived || 0,
            issued: material.morningIssued || 0,
            ending: material.morningEnding || 0,
          },
          afternoon: {
            beginning: material.afternoonBeginning || 0,
            received: material.afternoonReceived || 0,
            issued: material.afternoonIssued || 0,
            ending: material.afternoonEnding || 0,
          },
          evening: {
            beginning: material.eveningBeginning || 0,
            received: material.eveningReceived || 0,
            issued: material.eveningIssued || 0,
            ending: material.eveningEnding || 0,
          },
        }));
      }

      const materialsResult = await gatewayClient.$queryRaw`
        SELECT id, name 
        FROM Material 
        WHERE reportType = ${reportType} 
        AND isActive = true
        ORDER BY name
      ` as any[];

      availableMaterials = materialsResult.map((material) => ({
        id: material.id,
        materialName: material.name,
        morning: { beginning: 0, received: 0, issued: 0, ending: 0 },
        afternoon: { beginning: 0, received: 0, issued: 0, ending: 0 },
        evening: { beginning: 0, received: 0, issued: 0, ending: 0 },
      }));

      // Fetch suggested beginning balances from current quantityInStock in Material table
      const currentStock = await gatewayClient.$queryRaw`
        SELECT id, quantityInStock
        FROM Material
        WHERE reportType = ${reportType} AND isActive = true
      ` as any[];

      const stockMap = currentStock.map((m: any) => ({ id: m.id, ending: Number(m.quantityInStock) || 0 }));

      return {
        success: true,
        data: {
          materials: {
            currentDay: currentDayData,
            availableMaterials: availableMaterials,
            suggestedBeginning: {
              SANG: stockMap,
              CHIEU: stockMap,
              TOI: stockMap,
            }
          },
          staffInfo: staffInfo,
          submissionTracking: submissionTracking,
        },
      };

    } catch (error) {
       console.error(error);
       throw new InternalServerErrorException('Failed to fetch report data');
    }
  }

  async getShiftInventorySummary(tenantId: string, date: string, shift: string, reportType: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);

      // Match work shift by name keywords
      const SHIFT_NAME_KEYWORDS: Record<string, string[]> = {
        [SHIFT_ENUM.SANG]: ['sáng', 'sang'],
        [SHIFT_ENUM.CHIEU]: ['đêm', 'dem', 'chiều', 'chieu'],
        [SHIFT_ENUM.TOI]: ['tối', 'toi'],
      };

      const workShifts = await gatewayClient.workShift.findMany();
      const keywords = SHIFT_NAME_KEYWORDS[shift] || [];
      const workShift = workShifts.find((ws: any) =>
        keywords.some((kw: string) => ws.name?.toLowerCase().includes(kw))
      );

      if (!workShift) {
        return { success: true, data: [] };
      }

      const dateStr = new Date(date).toISOString().split('T')[0];
      const pad = (n: number) => String(n).padStart(2, '0');

      const startTime = workShift.startTime;
      const endTime = workShift.endTime;
      const startTimeStr = `${pad(startTime.getUTCHours())}:${pad(startTime.getUTCMinutes())}:${pad(startTime.getUTCSeconds())}`;
      const endTimeStr = `${pad(endTime.getUTCHours())}:${pad(endTime.getUTCMinutes())}:${pad(endTime.getUTCSeconds())}`;

      const shiftStartDatetime = `${dateStr} ${startTimeStr}`;
      let shiftEndDatetime: string;

      if (workShift.isOvernight) {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        shiftEndDatetime = `${nextDate.toISOString().split('T')[0]} ${endTimeStr}`;
      } else {
        shiftEndDatetime = `${dateStr} ${endTimeStr}`;
      }

      console.log(`[ShiftInventory] shift=${shift}, workShift=${workShift?.name}, startTime=${startTimeStr}, endTime=${endTimeStr}`);
      console.log(`[ShiftInventory] query range: ${shiftStartDatetime} -> ${shiftEndDatetime}, reportType=${reportType}`);

      // Also check if there are ANY transactions for this date regardless of time
      const debugAll = await gatewayClient.$queryRawUnsafe(`
        SELECT it.id, it.materialId, m.name, it.quantityChange, it.type, it.createdAt
        FROM InventoryTransaction it
        JOIN Material m ON it.materialId = m.id
        WHERE m.reportType = ?
          AND DATE(it.createdAt) = ?
        ORDER BY it.createdAt DESC
        LIMIT 10
      `, reportType, dateStr);
      console.log(`[ShiftInventory] all transactions for date:`, JSON.stringify(debugAll, (_, v) => typeof v === 'bigint' ? Number(v) : v));

      const summary = await gatewayClient.$queryRawUnsafe(`
        SELECT
          it.materialId,
          COALESCE(SUM(CASE WHEN it.quantityChange > 0 THEN it.quantityChange ELSE 0 END), 0) as totalReceived,
          COALESCE(SUM(CASE WHEN it.quantityChange < 0 THEN ABS(it.quantityChange) ELSE 0 END), 0) as totalIssued
        FROM InventoryTransaction it
        JOIN Material m ON it.materialId = m.id
        WHERE m.reportType = ?
          AND m.isActive = true
          AND it.createdAt >= ?
          AND it.createdAt < ?
        GROUP BY it.materialId
      `, reportType, shiftStartDatetime, shiftEndDatetime);

      console.log(`[ShiftInventory] summary results: ${(summary as any[]).length} materials found`);

      return {
        success: true,
        data: (summary as any[]).map(s => ({
          materialId: Number(s.materialId),
          totalReceived: Number(s.totalReceived) || 0,
          totalIssued: Number(s.totalIssued) || 0,
        }))
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch shift inventory summary');
    }
  }

  async submitReport(tenantId: string, payload: any) {
    try {
      const { date, shift, reportType, staffId, materials, step } = payload;
      const gatewayClient = await this.getGatewayClient(tenantId);

      if (!date || !shift || !reportType || !staffId || !materials || !step) {
        throw new BadRequestException("Missing required fields (including step)");
      }

      const currentTime = new Date();
      const dateVN = date;

      const existingReports = await gatewayClient.$queryRaw`
        SELECT hr.id, hr.metadata
        FROM HandoverReport hr
        WHERE hr.reportType = ${reportType} AND DATE(hr.date) = ${dateVN}
        LIMIT 1
      ` as any[];

      let handoverReportId: number = 0;
      let metadata: any = existingReports[0]?.metadata || {};
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          metadata = {};
        }
      }

      await gatewayClient.$transaction(async (tx) => {
        if (existingReports.length > 0) {
          handoverReportId = existingReports[0].id;
        } else {
          // Create new report if not exists
          const tdate = new Date(date);
          await tx.$executeRaw`
            INSERT INTO HandoverReport (date, reportType, createdAt, updatedAt)
            VALUES (${tdate}, ${reportType}, ${currentTime}, ${currentTime})
          `;
          const created = await tx.$queryRaw`SELECT id FROM HandoverReport WHERE DATE(date) = ${dateVN} AND reportType = ${reportType} ORDER BY id DESC LIMIT 1` as any[];
          handoverReportId = created[0].id;
        }

        // Update Metadata
        if (!metadata[shift]) metadata[shift] = { start: null, end: null };
        if (step === 'START') {
          metadata[shift].start = { staffId, at: currentTime, note: payload.note || '' };
        } else {
          metadata[shift].end = { staffId, at: currentTime, note: payload.note || '' };
        }

        // Update specific Staff ID columns for backward compatibility if possible
        let updateFields = "";
        if (shift === SHIFT_ENUM.SANG) {
          updateFields = `morningStaffId = ${staffId}, morningSubmissionCount = morningSubmissionCount + 1, isMorningComplete = ${step === 'END'}`;
        } else if (shift === SHIFT_ENUM.CHIEU) {
          updateFields = `afternoonStaffId = ${staffId}, afternoonSubmissionCount = afternoonSubmissionCount + 1, isAfternoonComplete = ${step === 'END'}`;
        } else {
          updateFields = `eveningStaffId = ${staffId}, eveningSubmissionCount = eveningSubmissionCount + 1, isEveningComplete = ${step === 'END'}`;
        }

        await tx.$executeRawUnsafe(`UPDATE HandoverReport SET ${updateFields}, metadata = ?, updatedAt = ? WHERE id = ?`, 
          JSON.stringify(metadata), currentTime, handoverReportId
        );

        for (const materialData of materials) {
          const materialId = materialData.id;
          const beginning = parseFloat(materialData.beginning || 0);
          const received = parseFloat(materialData.received || 0);
          const issued = parseFloat(materialData.issued || 0);
          
          if (received < 0 || issued < 0) throw new BadRequestException(`Amount cannot be negative for ${materialData.materialName || materialId}`);
          
          const ending = beginning + received - issued;
          if (ending < 0 && step === 'END') throw new BadRequestException(`Ending balance cannot be negative for ${materialData.materialName || materialId}`);

          const existingHM = await tx.$queryRaw`SELECT id FROM HandoverMaterial WHERE handoverReportId = ${handoverReportId} AND materialId = ${materialId} LIMIT 1` as any[];

          if (existingHM.length > 0) {
            let sql = "";
            if (shift === SHIFT_ENUM.SANG) {
               sql = step === 'START' 
                 ? `UPDATE HandoverMaterial SET morningBeginning = ${beginning}, updatedAt = NOW() WHERE id = ${existingHM[0].id}`
                 : `UPDATE HandoverMaterial SET morningBeginning = ${beginning}, morningReceived = ${received}, morningIssued = ${issued}, morningEnding = ${ending}, updatedAt = NOW() WHERE id = ${existingHM[0].id}`;
            } else if (shift === SHIFT_ENUM.CHIEU) {
               sql = step === 'START'
                 ? `UPDATE HandoverMaterial SET afternoonBeginning = ${beginning}, updatedAt = NOW() WHERE id = ${existingHM[0].id}`
                 : `UPDATE HandoverMaterial SET afternoonBeginning = ${beginning}, afternoonReceived = ${received}, afternoonIssued = ${issued}, afternoonEnding = ${ending}, updatedAt = NOW() WHERE id = ${existingHM[0].id}`;
            } else {
               sql = step === 'START'
                 ? `UPDATE HandoverMaterial SET eveningBeginning = ${beginning}, updatedAt = NOW() WHERE id = ${existingHM[0].id}`
                 : `UPDATE HandoverMaterial SET eveningBeginning = ${beginning}, eveningReceived = ${received}, eveningIssued = ${issued}, eveningEnding = ${ending}, updatedAt = NOW() WHERE id = ${existingHM[0].id}`;
            }
            await tx.$executeRawUnsafe(sql);
          } else {
            // Insert new HandoverMaterial
            let cols = "handoverReportId, materialId, createdAt, updatedAt";
            let vals = `${handoverReportId}, ${materialId}, NOW(), NOW()`;
            if (shift === SHIFT_ENUM.SANG) {
              cols += ", morningBeginning" + (step === 'END' ? ", morningReceived, morningIssued, morningEnding" : "");
              vals += `, ${beginning}` + (step === 'END' ? `, ${received}, ${issued}, ${ending}` : "");
            } else if (shift === SHIFT_ENUM.CHIEU) {
              cols += ", afternoonBeginning" + (step === 'END' ? ", afternoonReceived, afternoonIssued, afternoonEnding" : "");
              vals += `, ${beginning}` + (step === 'END' ? `, ${received}, ${issued}, ${ending}` : "");
            } else {
              cols += ", eveningBeginning" + (step === 'END' ? ", eveningReceived, eveningIssued, eveningEnding" : "");
              vals += `, ${beginning}` + (step === 'END' ? `, ${received}, ${issued}, ${ending}` : "");
            }
            await tx.$executeRawUnsafe(`INSERT INTO HandoverMaterial (${cols}) VALUES (${vals})`);
          }
        }
      });

      return { success: true, data: { id: handoverReportId } };
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException("Failed to submit report");
    }
  }
}
