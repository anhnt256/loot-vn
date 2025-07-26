import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { SHIFT_ENUM } from "@/constants/handover-reports.constants";
import { getCurrentTimeVNISO, getCurrentDateVNString } from "@/lib/timezone-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const branch = await getBranchFromCookie();
    
    const {
      date,
      shift,
      reportType,
      staffId,
      materials
    } = body;

    // Validate required fields
    if (!date || !shift || !reportType || !staffId || !materials) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse date using timezone-utils
    const currentTime = getCurrentTimeVNISO();
    
    // Use the input date directly since it's already in YYYY-MM-DD format
    const dateVN = date;

    console.log('Date parsing:', {
      inputDate: date,
      dateVN: dateVN,
      currentTime: currentTime,
      shift: shift,
      reportType: reportType
    });

    // Check if report already exists for this exact date and report type using raw query
    // Convert date to Vietnam timezone for comparison
    console.log('Checking existing reports with dateVN:', dateVN);
    
    const existingReports = await db.$queryRaw`
      SELECT hr.id, hr.date, hr.reportType, hr.branch, DATE(CONVERT_TZ(hr.date, '+00:00', '+07:00')) as dateVN
      FROM HandoverReport hr
      WHERE hr.reportType = ${reportType} AND hr.branch = ${branch}
      ORDER BY hr.createdAt DESC
      LIMIT 5
    ` as any[];
    
    console.log('All existing reports for this type and branch:', existingReports);
    
    const existingReport = existingReports.find(report => report.dateVN === dateVN);

    // Check if materials for this specific shift already exist
    if (existingReport) {
      console.log('Found existing report:', {
        reportId: existingReport.id,
        reportDate: existingReport.date,
        reportType: existingReport.reportType,
        requestedDate: date,
        requestedShift: shift
      });

      // Check existing materials for this shift using raw query
      const existingMaterials = await db.$queryRaw`
        SELECT hm.id, hm.materialId, m.name as materialName,
               hm.morningBeginning, hm.morningReceived, hm.morningIssued, hm.morningEnding,
               hm.afternoonBeginning, hm.afternoonReceived, hm.afternoonIssued, hm.afternoonEnding,
               hm.eveningBeginning, hm.eveningReceived, hm.eveningIssued, hm.eveningEnding
        FROM HandoverMaterial hm
        LEFT JOIN Material m ON hm.materialId = m.id
        WHERE hm.handoverReportId = ${existingReport.id}
      ` as any[];

      const hasShiftData = existingMaterials.some(material => {
        let hasData = false;
        if (shift === SHIFT_ENUM.SANG) {
          hasData = material.morningBeginning !== null || material.morningReceived !== null || 
                   material.morningIssued !== null || material.morningEnding !== null;
        } else if (shift === SHIFT_ENUM.CHIEU) {
          hasData = material.afternoonBeginning !== null || material.afternoonReceived !== null || 
                   material.afternoonIssued !== null || material.afternoonEnding !== null;
        } else if (shift === SHIFT_ENUM.TOI) {
          hasData = material.eveningBeginning !== null || material.eveningReceived !== null || 
                   material.eveningIssued !== null || material.eveningEnding !== null;
        }
        
        if (hasData) {
          console.log('Found existing shift data for material:', material.materialName);
        }
        
        return hasData;
      });

      if (hasShiftData) {
        console.log('Blocking duplicate submission for shift:', shift, 'date:', date);
        return NextResponse.json(
          { 
            success: false, 
            error: `Báo cáo cho ca ${shift} ngày ${date} đã tồn tại. Không thể gửi báo cáo trùng.` 
          },
          { status: 409 }
        );
      }
    }

    let handoverReportId;

    if (existingReport) {
      // Use existing report
      handoverReportId = existingReport.id;
    } else {
      // Create new report using raw query with proper timezone
      const result = await db.$executeRaw`
        INSERT INTO HandoverReport (date, reportType, branch, note, createdAt, updatedAt)
        VALUES (${new Date(date)}, ${reportType}, ${branch}, NULL, ${currentTime}, ${currentTime})
      `;
      
      // Get the created report ID
      const createdReport = await db.$queryRaw`
        SELECT id FROM HandoverReport 
        WHERE DATE(CONVERT_TZ(date, '+00:00', '+07:00')) = ${dateVN} AND reportType = ${reportType} AND branch = ${branch}
        ORDER BY createdAt DESC LIMIT 1
      ` as any[];
      handoverReportId = createdReport[0].id;
    }

    // Update materials for the specific shift using raw queries
    for (const materialData of materials) {
      // Find material by name to get materialId
      const materials = await db.$queryRaw`
        SELECT id FROM Material WHERE name = ${materialData.materialName} LIMIT 1
      ` as any[];
      const materialRecord = materials[0];

      // Check if material already exists for this report
      const existingMaterials = await db.$queryRaw`
        SELECT id FROM HandoverMaterial 
        WHERE handoverReportId = ${handoverReportId} AND materialId = ${materialRecord?.id || null}
        LIMIT 1
      ` as any[];
      const existingMaterial = existingMaterials[0];

      if (existingMaterial) {
        // Update existing material using raw query
        if (shift === SHIFT_ENUM.SANG) {
          await db.$executeRaw`
            UPDATE HandoverMaterial 
            SET morningBeginning = ${parseFloat(materialData.beginning || 0)}, 
                morningReceived = ${parseFloat(materialData.received || 0)}, 
                morningIssued = ${parseFloat(materialData.issued || 0)}, 
                morningEnding = ${parseFloat(materialData.ending || 0)}, 
                updatedAt = ${currentTime}
            WHERE id = ${existingMaterial.id}
          `;
        } else if (shift === SHIFT_ENUM.CHIEU) {
          await db.$executeRaw`
            UPDATE HandoverMaterial 
            SET afternoonBeginning = ${parseFloat(materialData.beginning || 0)}, 
                afternoonReceived = ${parseFloat(materialData.received || 0)}, 
                afternoonIssued = ${parseFloat(materialData.issued || 0)}, 
                afternoonEnding = ${parseFloat(materialData.ending || 0)}, 
                updatedAt = ${currentTime}
            WHERE id = ${existingMaterial.id}
          `;
        } else if (shift === SHIFT_ENUM.TOI) {
          await db.$executeRaw`
            UPDATE HandoverMaterial 
            SET eveningBeginning = ${parseFloat(materialData.beginning || 0)}, 
                eveningReceived = ${parseFloat(materialData.received || 0)}, 
                eveningIssued = ${parseFloat(materialData.issued || 0)}, 
                eveningEnding = ${parseFloat(materialData.ending || 0)}, 
                updatedAt = ${currentTime}
            WHERE id = ${existingMaterial.id}
          `;
        }
      } else {
        // Create new material using raw query
        await db.$executeRaw`
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
            ${shift === SHIFT_ENUM.SANG ? parseFloat(materialData.received || 0) : null},
            ${shift === SHIFT_ENUM.SANG ? parseFloat(materialData.issued || 0) : null},
            ${shift === SHIFT_ENUM.SANG ? parseFloat(materialData.ending || 0) : null},
            ${shift === SHIFT_ENUM.CHIEU ? parseFloat(materialData.beginning || 0) : null},
            ${shift === SHIFT_ENUM.CHIEU ? parseFloat(materialData.received || 0) : null},
            ${shift === SHIFT_ENUM.CHIEU ? parseFloat(materialData.issued || 0) : null},
            ${shift === SHIFT_ENUM.CHIEU ? parseFloat(materialData.ending || 0) : null},
            ${shift === SHIFT_ENUM.TOI ? parseFloat(materialData.beginning || 0) : null},
            ${shift === SHIFT_ENUM.TOI ? parseFloat(materialData.received || 0) : null},
            ${shift === SHIFT_ENUM.TOI ? parseFloat(materialData.issued || 0) : null},
            ${shift === SHIFT_ENUM.TOI ? parseFloat(materialData.ending || 0) : null},
            ${currentTime},
            ${currentTime}
          )
        `;
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: handoverReportId }
    });

  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit report" },
      { status: 500 }
    );
  }
} 