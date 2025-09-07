import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { SHIFT_ENUM } from "@/constants/handover-reports.constants";
import {
  getCurrentTimeVNDB,
  getCurrentDateVNString,
} from "@/lib/timezone-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const branch = await getBranchFromCookie();

    const { date, shift, reportType, staffId, materials } = body;
    
    // // console.log(`Debug request body:`, { materials, staffId, shift, reportType, date });

    // Validate required fields
    if (!date || !shift || !reportType || !staffId || !materials) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields. staffId is required for each shift.",
        },
        { status: 400 },
      );
    }

    // Validate staffId is a valid number
    if (isNaN(Number(staffId)) || Number(staffId) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid staffId. Must be a positive number.",
        },
        { status: 400 },
      );
    }

    // Parse date using timezone-utils
    const currentTime = getCurrentTimeVNDB();

    // Use the input date directly since it's already in YYYY-MM-DD format
    const dateVN = date;

    // // console.log("Date parsing:", {
    //   inputDate: date,
    //   dateVN: dateVN,
    //   currentTime: currentTime,
    //   shift: shift,
    //   reportType: reportType,
    // });

    // Check if report already exists for this exact date and report type using raw query
    // Convert date to Vietnam timezone for comparison
    // console.log("Checking existing reports with dateVN:", dateVN);

    const existingReports = (await db.$queryRaw`
      SELECT hr.id, hr.date, hr.reportType, hr.branch, DATE(hr.date) as dateVN
      FROM HandoverReport hr
      WHERE hr.reportType = ${reportType} AND hr.branch = ${branch} AND DATE(hr.date) = ${dateVN}
      ORDER BY hr.createdAt DESC
    `) as any[];

    // console.log(
      "Existing reports for this date, type and branch:",
      existingReports,
    );

    const existingReport = existingReports[0];

    let handoverReportId: number = 0;

    // Use transaction to handle both cases: create new or update existing
    await db.$transaction(async (tx) => {
      if (existingReport) {
        // console.log("Found existing report:", {
          reportId: existingReport.id,
          reportDate: existingReport.date,
          reportType: existingReport.reportType,
          requestedDate: date,
          requestedShift: shift,
        });

        handoverReportId = existingReport.id;
        if (!handoverReportId || handoverReportId <= 0) {
          throw new Error(`Invalid handoverReportId: ${handoverReportId}`);
        }

        // Get current submission count and completion status for this shift
        const currentReport = (await tx.$queryRaw`
          SELECT 
            morningSubmissionCount, afternoonSubmissionCount, eveningSubmissionCount,
            isMorningComplete, isAfternoonComplete, isEveningComplete
          FROM HandoverReport 
          WHERE id = ${handoverReportId}
        `) as any[];

        const reportData = currentReport[0];

        // Determine submission count field and current count
        const submissionCountField =
          shift === SHIFT_ENUM.SANG
            ? "morningSubmissionCount"
            : shift === SHIFT_ENUM.CHIEU
              ? "afternoonSubmissionCount"
              : "eveningSubmissionCount";

        const currentSubmissionCount =
          shift === SHIFT_ENUM.SANG
            ? reportData.morningSubmissionCount
            : shift === SHIFT_ENUM.CHIEU
              ? reportData.afternoonSubmissionCount
              : reportData.eveningSubmissionCount;

        // Check if shift is already complete
        // Chỉ kiểm tra khi submissionCount >= 2 (ca đã hoàn tất)
        if (currentSubmissionCount >= 2) {
          const isShiftComplete =
            shift === SHIFT_ENUM.SANG
              ? reportData.isMorningComplete
              : shift === SHIFT_ENUM.CHIEU
                ? reportData.isAfternoonComplete
                : reportData.isEveningComplete;

          if (isShiftComplete) {
            throw new Error(
              `Ca làm việc ${shift} cho ngày ${date} đã hoàn tất. Không thể gửi thêm báo cáo.`,
            );
          }
        }

        if (currentSubmissionCount >= 3) {
          throw new Error(
            `Ca làm việc ${shift} cho ngày ${date} đã đạt tối đa 2 lần gửi báo cáo.`,
          );
        }

        // Increment submission count
        const newSubmissionCount = currentSubmissionCount + 1;

        // Check if this will be the final submission (2nd submission)
        const willBeComplete = newSubmissionCount >= 2;

        // Determine completion status field
        const completionStatusField =
          shift === SHIFT_ENUM.SANG
            ? "isMorningComplete"
            : shift === SHIFT_ENUM.CHIEU
              ? "isAfternoonComplete"
              : "isEveningComplete";

        // Update staff information and submission tracking for the current shift
        const staffIdField =
          shift === SHIFT_ENUM.SANG
            ? "morningStaffId"
            : shift === SHIFT_ENUM.CHIEU
              ? "afternoonStaffId"
              : "eveningStaffId";

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

        // Check if materials already exist for this shift with complete data (all 4 fields: beginning, received, issued, ending)
        // Chỉ kiểm tra khi submissionCount >= 2 (ca đã hoàn tất)
        if (currentSubmissionCount >= 2) {
          const existingMaterials = (await tx.$queryRaw`
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
          `) as any[];

          // console.log("Existing materials for shift:", existingMaterials);

          // Check if any material already has complete data for this shift
          const hasCompleteData = existingMaterials.some(
            (material: any) => material.hasCompleteShiftData,
          );

          if (hasCompleteData) {
            throw new Error(
              `Ca làm việc ${shift} cho ngày ${date} đã có dữ liệu hoàn tất (đủ 4 cột: tồn đầu, nhập, xuất, tồn cuối). Không thể tạo báo cáo trùng.`,
            );
          }
        }

        // Update existing materials for this shift
        for (const materialData of materials) {
          // console.log(`Debug materialData:`, materialData);
          
          // Find material by name to get materialId
          if (!materialData.materialName) {
            throw new Error(`Material name is required but got: ${materialData.materialName}`);
          }
          
          const materials = (await tx.$queryRaw`
            SELECT id FROM Material WHERE name = ${materialData.materialName} LIMIT 1
          `) as any[];
          const materialRecord = materials[0];
          if (!materialRecord?.id) {
            throw new Error(`Material not found for name: ${materialData.materialName}`);
          }

          // Check if material already exists for this report
          const existingMaterial = (await tx.$queryRaw`
            SELECT id FROM HandoverMaterial 
            WHERE handoverReportId = ${handoverReportId} AND materialId = ${materialRecord.id}
            LIMIT 1
          `) as any[];

          if (existingMaterial.length > 0) {
            // Update existing material record for this shift
            const beginningField =
              shift === SHIFT_ENUM.SANG
                ? "morningBeginning"
                : shift === SHIFT_ENUM.CHIEU
                  ? "afternoonBeginning"
                  : "eveningBeginning";
            const receivedField =
              shift === SHIFT_ENUM.SANG
                ? "morningReceived"
                : shift === SHIFT_ENUM.CHIEU
                  ? "afternoonReceived"
                  : "eveningReceived";
            const issuedField =
              shift === SHIFT_ENUM.SANG
                ? "morningIssued"
                : shift === SHIFT_ENUM.CHIEU
                  ? "afternoonIssued"
                  : "eveningIssued";
            const endingField =
              shift === SHIFT_ENUM.SANG
                ? "morningEnding"
                : shift === SHIFT_ENUM.CHIEU
                  ? "afternoonEnding"
                  : "eveningEnding";

            // Calculate ending based on beginning, received, and issued
            // console.log(`Debug beginning value:`, { 
              beginning: materialData.beginning, 
              type: typeof materialData.beginning
            });
            
            const beginning = parseFloat(materialData.beginning || 0);
            if (isNaN(beginning)) {
              throw new Error(`Invalid beginning value: ${materialData.beginning} (type: ${typeof materialData.beginning})`);
            }
            
            // console.log(`Debug received value:`, { 
              received: materialData.received, 
              type: typeof materialData.received,
              isNull: materialData.received === null,
              isUndefined: materialData.received === undefined
            });
            
            const received = materialData.received === null || materialData.received === undefined
              ? 0
              : parseFloat(materialData.received);
            if (materialData.received !== null && materialData.received !== undefined && isNaN(received)) {
              throw new Error(`Invalid received value: ${materialData.received} (type: ${typeof materialData.received})`);
            }
            
            // console.log(`Debug issued value:`, { 
              issued: materialData.issued, 
              type: typeof materialData.issued,
              isNull: materialData.issued === null,
              isUndefined: materialData.issued === undefined
            });
            
            const issued = materialData.issued === null || materialData.issued === undefined
              ? 0
              : parseFloat(materialData.issued);
            if (materialData.issued !== null && materialData.issued !== undefined && isNaN(issued)) {
              throw new Error(`Invalid issued value: ${materialData.issued} (type: ${typeof materialData.issued})`);
            }
            const calculatedEnding = beginning + received - issued;

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
            // Create new material record for this shift
            // Calculate ending based on beginning, received, and issued
            // console.log(`Debug beginning value:`, { 
              beginning: materialData.beginning, 
              type: typeof materialData.beginning
            });
            
            const beginning = parseFloat(materialData.beginning || 0);
            if (isNaN(beginning)) {
              throw new Error(`Invalid beginning value: ${materialData.beginning} (type: ${typeof materialData.beginning})`);
            }
            
            // console.log(`Debug received value:`, { 
              received: materialData.received, 
              type: typeof materialData.received,
              isNull: materialData.received === null,
              isUndefined: materialData.received === undefined
            });
            
            const received = materialData.received === null || materialData.received === undefined
              ? 0
              : parseFloat(materialData.received);
            if (materialData.received !== null && materialData.received !== undefined && isNaN(received)) {
              throw new Error(`Invalid received value: ${materialData.received} (type: ${typeof materialData.received})`);
            }
            
            // console.log(`Debug issued value:`, { 
              issued: materialData.issued, 
              type: typeof materialData.issued,
              isNull: materialData.issued === null,
              isUndefined: materialData.issued === undefined
            });
            
            const issued = materialData.issued === null || materialData.issued === undefined
              ? 0
              : parseFloat(materialData.issued);
            if (materialData.issued !== null && materialData.issued !== undefined && isNaN(issued)) {
              throw new Error(`Invalid issued value: ${materialData.issued} (type: ${typeof materialData.issued})`);
            }
            const calculatedEnding = beginning + received - issued;

            await tx.$executeRaw`
              INSERT INTO HandoverMaterial (
                handoverReportId, materialId, 
                morningBeginning, morningReceived, morningIssued, morningEnding,
                afternoonBeginning, afternoonReceived, afternoonIssued, afternoonEnding,
                eveningBeginning, eveningReceived, eveningIssued, eveningEnding,
                createdAt, updatedAt
              ) VALUES (
                ${handoverReportId},
                ${materialRecord.id},
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
                ${currentTime},
                ${currentTime}
              )
            `;
          }
        }
      } else {
        // Create new report with staff information and initial submission tracking
        const staffIdField =
          shift === SHIFT_ENUM.SANG
            ? "morningStaffId"
            : shift === SHIFT_ENUM.CHIEU
              ? "afternoonStaffId"
              : "eveningStaffId";

        // Set initial submission count for this shift to 1
        const submissionCountField =
          shift === SHIFT_ENUM.SANG
            ? "morningSubmissionCount"
            : shift === SHIFT_ENUM.CHIEU
              ? "afternoonSubmissionCount"
              : "eveningSubmissionCount";

        if (shift === SHIFT_ENUM.SANG) {
          await tx.$executeRaw`
            INSERT INTO HandoverReport (
              date, reportType, branch, note, morningStaffId, 
              morningSubmissionCount, createdAt, updatedAt
            )
            VALUES (
              ${date}, ${reportType}, ${branch}, NULL, ${Number(staffId)}, 
              1, ${currentTime}, ${currentTime}
            )
          `;
        } else if (shift === SHIFT_ENUM.CHIEU) {
          await tx.$executeRaw`
            INSERT INTO HandoverReport (
              date, reportType, branch, note, afternoonStaffId, 
              afternoonSubmissionCount, createdAt, updatedAt
            )
            VALUES (
              ${date}, ${reportType}, ${branch}, NULL, ${Number(staffId)}, 
              1, ${currentTime}, ${currentTime}
            )
          `;
        } else {
          await tx.$executeRaw`
            INSERT INTO HandoverReport (
              date, reportType, branch, note, eveningStaffId, 
              eveningSubmissionCount, createdAt, updatedAt
            )
            VALUES (
              ${date}, ${reportType}, ${branch}, NULL, ${Number(staffId)}, 
              1, ${currentTime}, ${currentTime}
            )
          `;
        }

        // Get the created report ID
        const createdReport = (await tx.$queryRaw`
          SELECT id FROM HandoverReport 
          WHERE DATE(date) = ${dateVN} AND reportType = ${reportType} AND branch = ${branch}
          ORDER BY createdAt DESC LIMIT 1
        `) as any[];
        handoverReportId = createdReport[0].id;
        if (!handoverReportId || handoverReportId <= 0) {
          throw new Error(`Failed to create handover report, got invalid ID: ${handoverReportId}`);
        }

        // Create materials for the specific shift
        for (const materialData of materials) {
          // console.log(`Debug materialData:`, materialData);
          
          // Find material by name to get materialId
          if (!materialData.materialName) {
            throw new Error(`Material name is required but got: ${materialData.materialName}`);
          }
          
          const materials = (await tx.$queryRaw`
            SELECT id FROM Material WHERE name = ${materialData.materialName} LIMIT 1
          `) as any[];
          const materialRecord = materials[0];

          // Create new material using raw query
          // Calculate ending based on beginning, received, and issued
          const beginning = parseFloat(materialData.beginning || 0);
          if (isNaN(beginning)) {
            throw new Error(`Invalid beginning value: ${materialData.beginning}`);
          }
          
          const received = materialData.received === null || materialData.received === undefined
            ? 0
            : parseFloat(materialData.received);
          if (materialData.received !== null && materialData.received !== undefined && isNaN(received)) {
            throw new Error(`Invalid received value: ${materialData.received}`);
          }
          
          const issued = materialData.issued === null || materialData.issued === undefined 
            ? 0 
            : parseFloat(materialData.issued);
          if (materialData.issued !== null && materialData.issued !== undefined && isNaN(issued)) {
            throw new Error(`Invalid issued value: ${materialData.issued}`);
          }
          const calculatedEnding = beginning + received - issued;

          await tx.$executeRaw`
            INSERT INTO HandoverMaterial (
              handoverReportId, materialId, 
              morningBeginning, morningReceived, morningIssued, morningEnding,
              afternoonBeginning, afternoonReceived, afternoonIssued, afternoonEnding,
              eveningBeginning, eveningReceived, eveningIssued, eveningEnding,
              createdAt, updatedAt
            ) VALUES (
              ${handoverReportId},
              ${materialRecord?.id || null},
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
              ${currentTime},
              ${currentTime}
            )
          `;
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: handoverReportId },
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit report" },
      { status: 500 },
    );
  }
}
