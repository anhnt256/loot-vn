import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { GatewayPrismaService, TenantPrismaService } from '../../database/prisma.service';
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
    private readonly tenantPrisma: TenantPrismaService,
    private readonly gatewayPrisma: GatewayPrismaService
  ) {}

  private async getGatewayClient(tenantId: string) {
    let tenant = await this.tenantPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.tenantPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');

    return await this.gatewayPrisma.getClient(dbUrl);
  }

  // Thay vì dùng `getBranchFromCookie()`, ta sẽ dùng `tenantId` như tham số đại diện cho branch
  private getBranchFromTenantId(tenantId: string) {
    // Trong kiến trúc đa tenant, tenantId thay thế trực tiếp cho branch
    return tenantId;
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

  async getMaterials(tenantId: string, reportType: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);
      
      const materials = await gatewayClient.$queryRaw`
        SELECT 
          id,
          name,
          reportType,
          isActive,
          isOnFood
        FROM Material
        WHERE reportType = ${reportType}
          AND isActive = true
        ORDER BY name ASC
      `;

      return {
        success: true,
        data: (materials as any[]).map((material) => ({
          id: material.id,
          materialName: material.name,
          materialType: material.reportType,
          isDeleted: !material.isActive,
          isFood: material.isOnFood,
        })),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch materials');
    }
  }

  async createMaterial(tenantId: string, body: any) {
    try {
      const {
        materialName,
        materialType,
        isDeleted = false,
        isFood = true,
      } = body;

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

  async updateMaterial(tenantId: string, body: any) {
    try {
      const {
        id,
        materialName,
        materialType,
        isDeleted = false,
        isFood = true,
      } = body;

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
        const handoverReportId = currentReportResult[0].id;
        
        const reportStaffInfo = await gatewayClient.$queryRaw`
          SELECT 
            morningStaffId, afternoonStaffId, eveningStaffId,
            morningSubmissionCount, afternoonSubmissionCount, eveningSubmissionCount,
            isMorningComplete, isAfternoonComplete, isEveningComplete
          FROM HandoverReport
          WHERE id = ${handoverReportId}
        ` as any[];

        staffInfo = reportStaffInfo[0] || {
          morningStaffId: null,
          afternoonStaffId: null,
          eveningStaffId: null,
        };

        submissionTracking = reportStaffInfo[0] ? {
          morningSubmissionCount: reportStaffInfo[0].morningSubmissionCount,
          afternoonSubmissionCount: reportStaffInfo[0].afternoonSubmissionCount,
          eveningSubmissionCount: reportStaffInfo[0].eveningSubmissionCount,
          isMorningComplete: reportStaffInfo[0].isMorningComplete,
          isAfternoonComplete: reportStaffInfo[0].isAfternoonComplete,
          isEveningComplete: reportStaffInfo[0].isEveningComplete,
        } : null;

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

      const previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - 1);
      const formattedPreviousDate = previousDate.toISOString().split('T')[0];

      const previousReportResult = await gatewayClient.$queryRaw`
        SELECT id FROM HandoverReport 
        WHERE DATE(date) = ${formattedPreviousDate}
        AND reportType = ${reportType}
        LIMIT 1
      ` as any[];

      let previousEveningData: any[] = [];
      if (previousReportResult.length > 0) {
        const previousHandoverReportId = previousReportResult[0].id;
        const previousMaterialsResult = await gatewayClient.$queryRaw`
          SELECT 
            m.id as materialId,
            m.name as materialName,
            hm.eveningEnding
          FROM HandoverMaterial hm
          LEFT JOIN Material m ON hm.materialId = m.id
          WHERE hm.handoverReportId = ${previousHandoverReportId}
          AND m.reportType = ${reportType}
        ` as any[];
        previousEveningData = previousMaterialsResult.map((material) => ({
          id: material.materialId,
          materialName: material.materialName,
          ending: material.eveningEnding || 0,
        }));
      }

      let currentMorningData: any[] = [];
      let currentAfternoonData: any[] = [];
      if (currentReportResult.length > 0) {
        const handoverReportId = currentReportResult[0].id;
        const currentShiftMaterialsResult = await gatewayClient.$queryRaw`
          SELECT 
            m.id as materialId,
            m.name as materialName,
            hm.morningEnding,
            hm.afternoonEnding
          FROM HandoverMaterial hm
          LEFT JOIN Material m ON hm.materialId = m.id
          WHERE hm.handoverReportId = ${handoverReportId}
          AND m.reportType = ${reportType}
        ` as any[];

        currentMorningData = currentShiftMaterialsResult.map((material) => ({
          id: material.materialId,
          materialName: material.materialName,
          ending: material.morningEnding || 0,
        }));
        currentAfternoonData = currentShiftMaterialsResult.map((material) => ({
          id: material.materialId,
          materialName: material.materialName,
          ending: material.afternoonEnding || 0,
        }));
      }

      const isInitialData = currentReportResult.length === 0 && previousReportResult.length === 0;

      return {
        success: true,
        data: {
          materials: {
            currentDay: currentDayData,
            previousDay: previousEveningData,
            currentMorning: currentMorningData,
            currentAfternoon: currentAfternoonData,
            availableMaterials: availableMaterials,
          },
          staffInfo: staffInfo,
          submissionTracking: submissionTracking,
          isInitialData: isInitialData,
        },
      };

    } catch (error) {
       console.error(error);
       throw new InternalServerErrorException('Failed to fetch report data');
    }
  }

  async submitReport(tenantId: string, body: any) {
    try {
      const { date, shift, reportType, staffId, materials } = body;
      const gatewayClient = await this.getGatewayClient(tenantId);

      if (!date || !shift || !reportType || !staffId || !materials) {
        throw new BadRequestException("Missing required fields");
      }
      if (isNaN(Number(staffId)) || Number(staffId) <= 0) {
        throw new BadRequestException("Invalid staffId");
      }

      const currentTime = new Date();
      const dateVN = date;

      const existingReports = await gatewayClient.$queryRaw`
        SELECT hr.id, hr.date, hr.reportType, DATE(hr.date) as dateVN
        FROM HandoverReport hr
        WHERE hr.reportType = ${reportType} AND DATE(hr.date) = ${dateVN}
        ORDER BY hr.createdAt DESC
      ` as any[];

      const existingReport = existingReports[0];
      let handoverReportId: number = 0;

      await gatewayClient.$transaction(async (tx) => {
        if (existingReport) {
          handoverReportId = existingReport.id;
          
          const currentReport = await tx.$queryRaw`
            SELECT 
              morningSubmissionCount, afternoonSubmissionCount, eveningSubmissionCount,
              isMorningComplete, isAfternoonComplete, isEveningComplete
            FROM HandoverReport 
            WHERE id = ${handoverReportId}
          ` as any[];

          const reportData = currentReport[0];
          const currentSubmissionCount =
            shift === SHIFT_ENUM.SANG ? reportData.morningSubmissionCount :
            shift === SHIFT_ENUM.CHIEU ? reportData.afternoonSubmissionCount : reportData.eveningSubmissionCount;

          if (currentSubmissionCount >= 2) {
            const isShiftComplete =
              shift === SHIFT_ENUM.SANG ? reportData.isMorningComplete :
              shift === SHIFT_ENUM.CHIEU ? reportData.isAfternoonComplete : reportData.isEveningComplete;

            if (isShiftComplete) {
              throw new BadRequestException(`Ca làm việc ${shift} cho ngày ${date} đã hoàn tất.`);
            }
          }

          if (currentSubmissionCount >= 3) {
            throw new BadRequestException(`Ca làm việc ${shift} cho ngày ${date} đạt tối đa.`);
          }

          const newSubmissionCount = currentSubmissionCount + 1;
          const willBeComplete = newSubmissionCount >= 2;

          if (shift === SHIFT_ENUM.SANG) {
            await tx.$executeRaw`
              UPDATE HandoverReport SET 
                morningStaffId = ${Number(staffId)}, 
                morningSubmissionCount = ${newSubmissionCount},
                isMorningComplete = ${willBeComplete},
                updatedAt = ${currentTime}
              WHERE id = ${handoverReportId}
            `;
          } else if (shift === SHIFT_ENUM.CHIEU) {
            await tx.$executeRaw`
              UPDATE HandoverReport SET 
                afternoonStaffId = ${Number(staffId)}, 
                afternoonSubmissionCount = ${newSubmissionCount},
                isAfternoonComplete = ${willBeComplete},
                updatedAt = ${currentTime}
              WHERE id = ${handoverReportId}
            `;
          } else {
            await tx.$executeRaw`
              UPDATE HandoverReport SET 
                eveningStaffId = ${Number(staffId)}, 
                eveningSubmissionCount = ${newSubmissionCount},
                isEveningComplete = ${willBeComplete},
                updatedAt = ${currentTime}
              WHERE id = ${handoverReportId}
            `;
          }

          if (currentSubmissionCount >= 2) {
            const existingMaterials = await tx.$queryRaw`
              SELECT hm.id, hm.materialId, m.name as materialName,
                CASE 
                  WHEN ${shift} = 'SANG' THEN (
                    hm.morningBeginning IS NOT NULL AND 
                    hm.morningReceived IS NOT NULL AND 
                    hm.morningIssued IS NOT NULL AND 
                    hm.morningEnding IS NOT NULL
                  )
                  WHEN ${shift} = 'CHIEU' THEN (
                    hm.afternoonBeginning IS NOT NULL AND 
                    hm.afternoonReceived IS NOT NULL AND 
                    hm.afternoonIssued IS NOT NULL AND 
                    hm.afternoonEnding IS NOT NULL
                  )
                  WHEN ${shift} = 'TOI' THEN (
                    hm.eveningBeginning IS NOT NULL AND 
                    hm.eveningReceived IS NOT NULL AND 
                    hm.eveningIssued IS NOT NULL AND 
                    hm.eveningEnding IS NOT NULL
                  )
                END as hasCompleteShiftData
              FROM HandoverMaterial hm
              LEFT JOIN Material m ON hm.materialId = m.id
              WHERE hm.handoverReportId = ${handoverReportId}
            ` as any[];

            const hasCompleteData = existingMaterials.some((mat: any) => mat.hasCompleteShiftData);
            if (hasCompleteData) {
              throw new BadRequestException(`Ca làm việc ${shift} đã có dữ liệu hoàn tất.`);
            }
          }

          for (const materialData of materials) {
            if (!materialData.materialName) throw new BadRequestException('Material name required');

            const mats = await tx.$queryRaw`SELECT id FROM Material WHERE name = ${materialData.materialName} LIMIT 1` as any[];
            const materialRecord = mats[0];
            if (!materialRecord?.id) throw new BadRequestException('Material not found: ' + materialData.materialName);

            const existingMaterial = await tx.$queryRaw`
              SELECT id FROM HandoverMaterial 
              WHERE handoverReportId = ${handoverReportId} AND materialId = ${materialRecord.id}
              LIMIT 1
            ` as any[];

            const beginning = parseFloat(materialData.beginning || 0);
            const received = materialData.received === null || materialData.received === undefined ? 0 : parseFloat(materialData.received);
            const issued = materialData.issued === null || materialData.issued === undefined ? 0 : parseFloat(materialData.issued);
            const calculatedEnding = beginning + received - issued;

            if (existingMaterial.length > 0) {
              if (shift === SHIFT_ENUM.SANG) {
                await tx.$executeRaw`
                  UPDATE HandoverMaterial SET
                    morningBeginning = ${beginning},
                    morningReceived = ${materialData.received === null || materialData.received === undefined ? null : received},
                    morningIssued = ${materialData.issued === null || materialData.issued === undefined ? null : issued},
                    morningEnding = ${calculatedEnding},
                    updatedAt = ${currentTime}
                  WHERE id = ${existingMaterial[0].id}
                `;
              } else if (shift === SHIFT_ENUM.CHIEU) {
                await tx.$executeRaw`
                  UPDATE HandoverMaterial SET
                    afternoonBeginning = ${beginning},
                    afternoonReceived = ${materialData.received === null || materialData.received === undefined ? null : received},
                    afternoonIssued = ${materialData.issued === null || materialData.issued === undefined ? null : issued},
                    afternoonEnding = ${calculatedEnding},
                    updatedAt = ${currentTime}
                  WHERE id = ${existingMaterial[0].id}
                `;
              } else {
                await tx.$executeRaw`
                  UPDATE HandoverMaterial SET
                    eveningBeginning = ${beginning},
                    eveningReceived = ${materialData.received === null || materialData.received === undefined ? null : received},
                    eveningIssued = ${materialData.issued === null || materialData.issued === undefined ? null : issued},
                    eveningEnding = ${calculatedEnding},
                    updatedAt = ${currentTime}
                  WHERE id = ${existingMaterial[0].id}
                `;
              }
            } else {
              await tx.$executeRaw`
                INSERT INTO HandoverMaterial (
                  handoverReportId, materialId, 
                  morningBeginning, morningReceived, morningIssued, morningEnding,
                  afternoonBeginning, afternoonReceived, afternoonIssued, afternoonEnding,
                  eveningBeginning, eveningReceived, eveningIssued, eveningEnding,
                  createdAt, updatedAt
                ) VALUES (
                  ${handoverReportId}, ${materialRecord.id},
                  ${shift === SHIFT_ENUM.SANG ? beginning : null},
                  ${shift === SHIFT_ENUM.SANG ? (materialData.received === null || materialData.received === undefined ? null : received) : null},
                  ${shift === SHIFT_ENUM.SANG ? (materialData.issued === null || materialData.issued === undefined ? null : issued) : null},
                  ${shift === SHIFT_ENUM.SANG ? calculatedEnding : null},
                  ${shift === SHIFT_ENUM.CHIEU ? beginning : null},
                  ${shift === SHIFT_ENUM.CHIEU ? (materialData.received === null || materialData.received === undefined ? null : received) : null},
                  ${shift === SHIFT_ENUM.CHIEU ? (materialData.issued === null || materialData.issued === undefined ? null : issued) : null},
                  ${shift === SHIFT_ENUM.CHIEU ? calculatedEnding : null},
                  ${shift === SHIFT_ENUM.TOI ? beginning : null},
                  ${shift === SHIFT_ENUM.TOI ? (materialData.received === null || materialData.received === undefined ? null : received) : null},
                  ${shift === SHIFT_ENUM.TOI ? (materialData.issued === null || materialData.issued === undefined ? null : issued) : null},
                  ${shift === SHIFT_ENUM.TOI ? calculatedEnding : null},
                  ${currentTime}, ${currentTime}
                )
              `;
            }
          }
        } else {
          const tdate = new Date(date);
          if (shift === SHIFT_ENUM.SANG) {
            await tx.$executeRaw`
              INSERT INTO HandoverReport (
                date, reportType, note, morningStaffId, 
                morningSubmissionCount, createdAt, updatedAt
              ) VALUES (${tdate}, ${reportType}, NULL, ${Number(staffId)}, 1, ${currentTime}, ${currentTime})
            `;
          } else if (shift === SHIFT_ENUM.CHIEU) {
            await tx.$executeRaw`
              INSERT INTO HandoverReport (
                date, reportType, note, afternoonStaffId, 
                afternoonSubmissionCount, createdAt, updatedAt
              ) VALUES (${tdate}, ${reportType}, NULL, ${Number(staffId)}, 1, ${currentTime}, ${currentTime})
            `;
          } else {
            await tx.$executeRaw`
              INSERT INTO HandoverReport (
                date, reportType, note, eveningStaffId, 
                eveningSubmissionCount, createdAt, updatedAt
              ) VALUES (${tdate}, ${reportType}, NULL, ${Number(staffId)}, 1, ${currentTime}, ${currentTime})
            `;
          }

          const createdReport = await tx.$queryRaw`
            SELECT id FROM HandoverReport 
            WHERE DATE(date) = ${dateVN} AND reportType = ${reportType}
            ORDER BY createdAt DESC LIMIT 1
          ` as any[];
          handoverReportId = createdReport[0].id;

          for (const materialData of materials) {
            const mats = await tx.$queryRaw`SELECT id FROM Material WHERE name = ${materialData.materialName} LIMIT 1` as any[];
            const materialRecord = mats[0];
            
            const beginning = parseFloat(materialData.beginning || 0);
            const received = materialData.received === null || materialData.received === undefined ? 0 : parseFloat(materialData.received);
            const issued = materialData.issued === null || materialData.issued === undefined ? 0 : parseFloat(materialData.issued);
            const calculatedEnding = beginning + received - issued;

            await tx.$executeRaw`
              INSERT INTO HandoverMaterial (
                handoverReportId, materialId, 
                morningBeginning, morningReceived, morningIssued, morningEnding,
                afternoonBeginning, afternoonReceived, afternoonIssued, afternoonEnding,
                eveningBeginning, eveningReceived, eveningIssued, eveningEnding,
                createdAt, updatedAt
              ) VALUES (
                ${handoverReportId}, ${materialRecord?.id || null},
                ${shift === SHIFT_ENUM.SANG ? beginning : null},
                ${shift === SHIFT_ENUM.SANG ? (materialData.received === null || materialData.received === undefined ? null : received) : null},
                ${shift === SHIFT_ENUM.SANG ? (materialData.issued === null || materialData.issued === undefined ? null : issued) : null},
                ${shift === SHIFT_ENUM.SANG ? calculatedEnding : null},
                ${shift === SHIFT_ENUM.CHIEU ? beginning : null},
                ${shift === SHIFT_ENUM.CHIEU ? (materialData.received === null || materialData.received === undefined ? null : received) : null},
                ${shift === SHIFT_ENUM.CHIEU ? (materialData.issued === null || materialData.issued === undefined ? null : issued) : null},
                ${shift === SHIFT_ENUM.CHIEU ? calculatedEnding : null},
                ${shift === SHIFT_ENUM.TOI ? beginning : null},
                ${shift === SHIFT_ENUM.TOI ? (materialData.received === null || materialData.received === undefined ? null : received) : null},
                ${shift === SHIFT_ENUM.TOI ? (materialData.issued === null || materialData.issued === undefined ? null : issued) : null},
                ${shift === SHIFT_ENUM.TOI ? calculatedEnding : null},
                ${currentTime}, ${currentTime}
              )
            `;
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
