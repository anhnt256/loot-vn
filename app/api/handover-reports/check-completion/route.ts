import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const shift = searchParams.get("shift");
    const reportType = searchParams.get("reportType");

    if (!date || !shift || !reportType) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const branch = await getBranchFromCookie();
    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch not found" },
        { status: 401 },
      );
    }

    // Check if report exists for this date, shift and report type
    const report = await db.$queryRaw<any[]>`
      SELECT 
        hr.id,
        hr.date,
        hr.reportType,
        hr.branch
      FROM HandoverReport hr
      WHERE DATE(hr.date) = ${date} 
        AND hr.reportType = ${reportType} 
        AND hr.branch = ${branch}
      LIMIT 1
    `;

    if (report.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          isCompleted: false,
          reportId: null,
          reportDate: null,
          reportType: null,
        },
      });
    }

    const reportId = Number(report[0].id);

    // Check if all materials have complete data for the specified shift
    const materialsCompletion = await db.$queryRaw<any[]>`
      SELECT 
        hm.id,
        hm.materialId,
        m.name as materialName,
        CASE 
          WHEN ${shift} = 'SANG' THEN 
            hm.morningBeginning IS NOT NULL 
            AND hm.morningReceived IS NOT NULL 
            AND hm.morningIssued IS NOT NULL 
            AND hm.morningEnding IS NOT NULL
          WHEN ${shift} = 'CHIEU' THEN 
            hm.afternoonBeginning IS NOT NULL 
            AND hm.afternoonReceived IS NOT NULL 
            AND hm.afternoonIssued IS NOT NULL 
            AND hm.afternoonEnding IS NOT NULL
          WHEN ${shift} = 'TOI' THEN 
            hm.eveningBeginning IS NOT NULL 
            AND hm.eveningReceived IS NOT NULL 
            AND hm.eveningIssued IS NOT NULL 
            AND hm.eveningEnding IS NOT NULL
          ELSE FALSE
        END as isComplete
      FROM HandoverMaterial hm
      LEFT JOIN Material m ON hm.materialId = m.id
      WHERE hm.handoverReportId = ${reportId}
        AND m.reportType = ${reportType}
        AND m.isActive = true
    `;

    // Report is completed if all materials have complete data
    const totalMaterials = materialsCompletion.length;
    const completedMaterials = materialsCompletion.filter(
      (m) => m.isComplete,
    ).length;
    const isCompleted =
      totalMaterials > 0 && totalMaterials === completedMaterials;

    return NextResponse.json({
      success: true,
      data: {
        isCompleted,
        reportId: Number(report[0].id),
        reportDate: report[0].date,
        reportType: report[0].reportType,
        completionDetails: {
          totalMaterials,
          completedMaterials,
          materials: materialsCompletion.map((m) => ({
            id: Number(m.id),
            materialId: m.materialId ? Number(m.materialId) : null,
            materialName: m.materialName,
            isComplete: Boolean(m.isComplete),
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error checking report completion:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
