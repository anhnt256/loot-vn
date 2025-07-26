import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const reportType = searchParams.get("reportType");
    const branch = await getBranchFromCookie();
    console.log("Branch from cookie:", branch);

    // Build where clause for finding the report for the specific date
    const whereClause: any = {
      branch: branch,
      ...(reportType && { reportType: reportType }),
    };

    // If date is provided, find report for that specific date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      whereClause.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const reports = await db.handoverReport.findMany({
      where: whereClause,
      include: {
        materials: {
          include: {
            material: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { reportType: "asc" }],
    });

    console.log("Found reports count:", reports.length);

    // Transform data to match expected format - each report represents 1 day with all 3 shifts
    const transformedReports = reports.map((report) => ({
      id: report.id,
      date: report.date,
      reportType: report.reportType,
      note: report.note,
      materials: report.materials
        .map((material) => ({
          id: material.id,
          materialName: material.material?.name || "Unknown",
          materialType: material.material?.reportType || "DAILY",
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
        .sort((a, b) => a.materialName.localeCompare(b.materialName)), // Sort by material name for consistent order
    }));

    return NextResponse.json({
      success: true,
      data: transformedReports,
    });
  } catch (error) {
    console.error("Error fetching handover reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}

// POST - Tạo hoặc update báo cáo bàn giao
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const branch = await getBranchFromCookie();

    const { date, reportType, note, materials } = body;

    // Validate required fields
    if (!date || !reportType || !materials) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if report already exists for this date and report type
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const existingReport = await db.handoverReport.findFirst({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
        reportType: reportType,
        branch: branch,
      },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
      },
    });

    let handoverReport;

    if (existingReport) {
      // Update existing report
      handoverReport = existingReport;

      // Update note if provided
      if (note) {
        await db.handoverReport.update({
          where: { id: existingReport.id },
          data: { note: note },
        });
      }
    } else {
      // Create new report
      handoverReport = await db.handoverReport.create({
        data: {
          date: new Date(date),
          reportType: reportType,
          branch: branch,
          note: note || null,
        },
      });
    }

    // Update materials for all shifts
    for (const material of materials) {
      const existingMaterial = existingReport?.materials.find(
        (m) => m.material?.name === material.materialName,
      );

      // Find material by name to get materialId
      const materialRecord = await db.material.findFirst({
        where: { name: material.materialName },
      });

      const updateData: any = {
        materialId: materialRecord?.id || null,
        // Update all shift data
        morningBeginning: parseFloat(material.morning?.beginning || 0),
        morningReceived: parseFloat(material.morning?.received || 0),
        morningIssued: parseFloat(material.morning?.issued || 0),
        morningEnding: parseFloat(material.morning?.ending || 0),
        afternoonBeginning: parseFloat(material.afternoon?.beginning || 0),
        afternoonReceived: parseFloat(material.afternoon?.received || 0),
        afternoonIssued: parseFloat(material.afternoon?.issued || 0),
        afternoonEnding: parseFloat(material.afternoon?.ending || 0),
        eveningBeginning: parseFloat(material.evening?.beginning || 0),
        eveningReceived: parseFloat(material.evening?.received || 0),
        eveningIssued: parseFloat(material.evening?.issued || 0),
        eveningEnding: parseFloat(material.evening?.ending || 0),
      };

      if (existingMaterial) {
        // Update existing material
        await db.handoverMaterial.update({
          where: { id: existingMaterial.id },
          data: updateData,
        });
      } else {
        // Create new material
        await db.handoverMaterial.create({
          data: {
            handoverReportId: handoverReport.id,
            ...updateData,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: handoverReport.id },
    });
  } catch (error) {
    console.error("Error creating/updating handover report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create/update report" },
      { status: 500 },
    );
  }
}
