import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { SHIFT_ENUM } from "@/constants/handover-reports.constants";
import {
  getCurrentTimeVNISO,
  getCurrentDateVNString,
} from "@/lib/timezone-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const branch = await getBranchFromCookie();

    const { date, shift, reportType, staffId, materials } = body;

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
    const currentTime = getCurrentTimeVNISO();

    // Use the input date directly since it's already in YYYY-MM-DD format
    const dateVN = date;

    console.log("Date parsing:", {
      inputDate: date,
      dateVN: dateVN,
      currentTime: currentTime,
      shift: shift,
      reportType: reportType,
    });

    // Check if report already exists for this exact date and report type using raw query
    // Convert date to Vietnam timezone for comparison
    console.log("Checking existing reports with dateVN:", dateVN);

    const existingReports = (await db.$queryRaw`
      SELECT hr.id, hr.date, hr.reportType, hr.branch, DATE(hr.date) as dateVN
      FROM HandoverReport hr
      WHERE hr.reportType = ${reportType} AND hr.branch = ${branch} AND DATE(hr.date) = ${dateVN}
      ORDER BY hr.createdAt DESC
    `) as any[];

    console.log(
      "Existing reports for this date, type and branch:",
      existingReports,
    );

    const existingReport = existingReports[0];

    let handoverReportId: number = 0;

    // Use transaction to handle both cases: create new or update existing
    await db.$transaction(async (tx) => {
      if (existingReport) {
        console.log("Found existing report:", {
          reportId: existingReport.id,
          reportDate: existingReport.date,
          reportType: existingReport.reportType,
          requestedDate: date,
          requestedShift: shift,
        });

        handoverReportId = existingReport.id;

        // Update staff information for the current shift
        const staffIdField =
          shift === SHIFT_ENUM.SANG
            ? "morningStaffId"
            : shift === SHIFT_ENUM.CHIEU
              ? "afternoonStaffId"
              : "eveningStaffId";

        await tx.$executeRawUnsafe(`
          UPDATE HandoverReport SET ${staffIdField} = ${Number(staffId)}, updatedAt = '${currentTime}'
          WHERE id = ${handoverReportId}
        `);

        // Check if materials already exist for this shift with complete data (all 4 fields: beginning, received, issued, ending)
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

        console.log("Existing materials for shift:", existingMaterials);

        // Check if any material already has complete data for this shift
        const hasCompleteData = existingMaterials.some(
          (material: any) => material.hasCompleteShiftData,
        );

        if (hasCompleteData) {
          throw new Error(
            `Ca làm việc ${shift} cho ngày ${date} đã có dữ liệu hoàn tất (đủ 4 cột: tồn đầu, nhập, xuất, tồn cuối). Không thể tạo báo cáo trùng.`,
          );
        }

        // Update existing materials for this shift
        for (const materialData of materials) {
          // Find material by name to get materialId
          const materials = (await tx.$queryRaw`
            SELECT id FROM Material WHERE name = ${materialData.materialName} LIMIT 1
          `) as any[];
          const materialRecord = materials[0];

          // Check if material already exists for this report
          const existingMaterial = (await tx.$queryRaw`
            SELECT id FROM HandoverMaterial 
            WHERE handoverReportId = ${handoverReportId} AND materialId = ${materialRecord?.id || null}
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

            await tx.$executeRawUnsafe(`
              UPDATE HandoverMaterial SET
                ${beginningField} = ${parseFloat(materialData.beginning || 0)},
                ${receivedField} = ${materialData.received === null ? "NULL" : parseFloat(materialData.received)},
                ${issuedField} = ${materialData.issued === null ? "NULL" : parseFloat(materialData.issued)},
                ${endingField} = ${parseFloat(materialData.ending || 0)},
                updatedAt = '${currentTime}'
              WHERE id = ${existingMaterial[0].id}
            `);
          } else {
            // Create new material record for this shift
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
                ${shift === SHIFT_ENUM.SANG ? parseFloat(materialData.beginning || 0) : null},
                ${shift === SHIFT_ENUM.SANG ? (materialData.received === null ? null : parseFloat(materialData.received)) : null},
                ${shift === SHIFT_ENUM.SANG ? (materialData.issued === null ? null : parseFloat(materialData.issued)) : null},
                ${shift === SHIFT_ENUM.SANG ? parseFloat(materialData.ending || 0) : null},
                ${shift === SHIFT_ENUM.CHIEU ? parseFloat(materialData.beginning || 0) : null},
                ${shift === SHIFT_ENUM.CHIEU ? (materialData.received === null ? null : parseFloat(materialData.received)) : null},
                ${shift === SHIFT_ENUM.CHIEU ? (materialData.issued === null ? null : parseFloat(materialData.issued)) : null},
                ${shift === SHIFT_ENUM.CHIEU ? parseFloat(materialData.ending || 0) : null},
                ${shift === SHIFT_ENUM.TOI ? parseFloat(materialData.beginning || 0) : null},
                ${shift === SHIFT_ENUM.TOI ? (materialData.received === null ? null : parseFloat(materialData.received)) : null},
                ${shift === SHIFT_ENUM.TOI ? (materialData.issued === null ? null : parseFloat(materialData.issued)) : null},
                ${shift === SHIFT_ENUM.TOI ? parseFloat(materialData.ending || 0) : null},
                ${currentTime},
                ${currentTime}
              )
            `;
          }
        }
      } else {
        // Create new report with staff information
        const staffIdField =
          shift === SHIFT_ENUM.SANG
            ? "morningStaffId"
            : shift === SHIFT_ENUM.CHIEU
              ? "afternoonStaffId"
              : "eveningStaffId";

        await tx.$executeRawUnsafe(`
          INSERT INTO HandoverReport (date, reportType, branch, note, ${staffIdField}, createdAt, updatedAt)
          VALUES ('${date}', '${reportType}', '${branch}', NULL, ${Number(staffId)}, '${currentTime}', '${currentTime}')
        `);

        // Get the created report ID
        const createdReport = (await tx.$queryRaw`
          SELECT id FROM HandoverReport 
          WHERE DATE(date) = ${dateVN} AND reportType = ${reportType} AND branch = ${branch}
          ORDER BY createdAt DESC LIMIT 1
        `) as any[];
        handoverReportId = createdReport[0].id;

        // Create materials for the specific shift
        for (const materialData of materials) {
          // Find material by name to get materialId
          const materials = (await tx.$queryRaw`
            SELECT id FROM Material WHERE name = ${materialData.materialName} LIMIT 1
          `) as any[];
          const materialRecord = materials[0];

          // Create new material using raw query
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
              ${shift === SHIFT_ENUM.SANG ? parseFloat(materialData.beginning || 0) : null},
              ${shift === SHIFT_ENUM.SANG ? (materialData.received === null ? null : parseFloat(materialData.received)) : null},
              ${shift === SHIFT_ENUM.SANG ? (materialData.issued === null ? null : parseFloat(materialData.issued)) : null},
              ${shift === SHIFT_ENUM.SANG ? parseFloat(materialData.ending || 0) : null},
              ${shift === SHIFT_ENUM.CHIEU ? parseFloat(materialData.beginning || 0) : null},
              ${shift === SHIFT_ENUM.CHIEU ? (materialData.received === null ? null : parseFloat(materialData.received)) : null},
              ${shift === SHIFT_ENUM.CHIEU ? (materialData.issued === null ? null : parseFloat(materialData.issued)) : null},
              ${shift === SHIFT_ENUM.CHIEU ? parseFloat(materialData.ending || 0) : null},
              ${shift === SHIFT_ENUM.TOI ? parseFloat(materialData.beginning || 0) : null},
              ${shift === SHIFT_ENUM.TOI ? (materialData.received === null ? null : parseFloat(materialData.received)) : null},
              ${shift === SHIFT_ENUM.TOI ? (materialData.issued === null ? null : parseFloat(materialData.issued)) : null},
              ${shift === SHIFT_ENUM.TOI ? parseFloat(materialData.ending || 0) : null},
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
