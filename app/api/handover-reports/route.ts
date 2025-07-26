import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/utils";

// GET - Lấy danh sách báo cáo bàn giao
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const shift = searchParams.get("shift");
    const employee = searchParams.get("employee");
    const reportType = searchParams.get("reportType");
    const branch = getBranchFromCookie(request);

    let whereClause = "WHERE hr.branch = ?";
    const params: any[] = [branch];

    if (date) {
      whereClause += " AND DATE(hr.date) = ?";
      params.push(date);
    }

    if (shift && shift !== "Tất cả") {
      const shiftMap: { [key: string]: string } = {
        "Sáng": "SANG",
        "Chiều": "CHIEU", 
        "Tối": "TOI"
      };
      whereClause += " AND hr.shift = ?";
      params.push(shiftMap[shift]);
    }

    if (employee && employee !== "Tất cả") {
      whereClause += " AND s.userName = ?";
      params.push(employee);
    }

    if (reportType) {
      const reportTypeMap: { [key: string]: string } = {
        "Báo cáo bếp": "BAO_CAO_BEP",
        "Báo cáo nước": "BAO_CAO_NUOC"
      };
      whereClause += " AND hr.reportType = ?";
      params.push(reportTypeMap[reportType]);
    }

    const query = `
      SELECT 
        hr.id,
        hr.date,
        hr.shift,
        hr.reportType,
        hr.note,
        s.userName as staffName,
        hm.id as materialId,
        hm.materialName,
        hm.materialType,
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
        hm.eveningEnding,
        hm.morningAfterConfirmation
      FROM HandoverReport hr
      LEFT JOIN Staff s ON hr.staffId = s.id
      LEFT JOIN HandoverMaterial hm ON hr.id = hm.handoverReportId
      ${whereClause}
      ORDER BY hr.date DESC, hr.shift ASC, hm.materialName ASC
    `;

    const results = await db.$queryRawUnsafe(query, ...params);

    // Group materials by report
    const reportsMap = new Map();
    
    (results as any[]).forEach((row: any) => {
      if (!reportsMap.has(row.id)) {
        reportsMap.set(row.id, {
          id: row.id,
          date: row.date,
          shift: row.shift,
          reportType: row.reportType,
          note: row.note,
          staffName: row.staffName,
          materials: []
        });
      }
      
      if (row.materialId) {
        const report = reportsMap.get(row.id);
        report.materials.push({
          id: row.materialId,
          materialName: row.materialName,
          materialType: row.materialType,
          morning: {
            beginning: row.morningBeginning,
            received: row.morningReceived,
            issued: row.morningIssued,
            ending: row.morningEnding
          },
          afternoon: {
            beginning: row.afternoonBeginning,
            received: row.afternoonReceived,
            issued: row.afternoonIssued,
            ending: row.afternoonEnding
          },
          evening: {
            beginning: row.eveningBeginning,
            received: row.eveningReceived,
            issued: row.eveningIssued,
            ending: row.eveningEnding
          },
          morningAfterConfirmation: row.morningAfterConfirmation
        });
      }
    });

    const reports = Array.from(reportsMap.values());

    return NextResponse.json({
      success: true,
      data: reports
    });

  } catch (error) {
    console.error("Error fetching handover reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST - Tạo báo cáo bàn giao mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const branch = getBranchFromCookie(request);
    
    const {
      date,
      shift,
      reportType,
      staffId,
      note,
      materials
    } = body;

    // Validate required fields
    if (!date || !shift || !reportType || !staffId || !materials) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create handover report
    const handoverReport = await db.handoverReport.create({
      data: {
        date: new Date(date),
        shift: shift,
        reportType: reportType,
        branch: branch,
        staffId: parseInt(staffId),
        note: note || null
      }
    });

    // Create materials
    const materialData = materials.map((material: any) => ({
      handoverReportId: handoverReport.id,
      materialName: material.materialName,
      materialType: material.materialType,
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
      morningAfterConfirmation: parseFloat(material.morningAfterConfirmation || 0)
    }));

    await db.handoverMaterial.createMany({
      data: materialData
    });

    return NextResponse.json({
      success: true,
      data: handoverReport
    });

  } catch (error) {
    console.error("Error creating handover report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create report" },
      { status: 500 }
    );
  }
} 