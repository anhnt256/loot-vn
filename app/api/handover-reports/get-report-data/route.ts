import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { SHIFT_ENUM } from "@/constants/handover-reports.constants";

type HandoverReportType = "BAO_CAO_BEP" | "BAO_CAO_NUOC";

interface PreviousShiftData {
  materialName: string;
  ending: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const shift = searchParams.get("shift");
    const reportType = searchParams.get("reportType");
    const branch = await getBranchFromCookie();

    // Nay là ngày 27/07/2025
    // Nếu là ca sáng và chiều thì searchParam sẽ gửi lên ngày 27/07/2025
    // Nếu là ca đêm thì gửi lên ngày 26/07/2025


    if (!date || !shift || !reportType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: date, shift, reportType",
        },
        { status: 400 },
      );
    }

    console.log('date', date)

    // Get previous shift data for beginning inventory
    let previousShiftData: PreviousShiftData[] = [];

    // Tìm handoverReportId của ca trước
    // Convert date string to Date object for proper comparison
    const dateObj = new Date(date);
    const formattedDate = dateObj.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
    const previousReportResult = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM HandoverReport 
      WHERE DATE(date) = ${formattedDate}
      AND reportType = ${reportType}
      AND branch = ${branch}
      LIMIT 1
    `;

    console.log('previousReportResult', previousReportResult)

    if (previousReportResult.length > 0) {
      const handoverReportId = previousReportResult[0].id;

      console.log('Debug - handoverReportId:', handoverReportId);

      // Lấy materials với ending của ca trước dựa vào shift hiện tại
      const handoverMaterialsResult = await db.$queryRaw<{
        materialName: string;
        morningEnding: number;
        afternoonEnding: number;
        eveningEnding: number;
      }[]>`
        SELECT 
          m.name as materialName,
          hm.morningEnding,
          hm.afternoonEnding,
          hm.eveningEnding
        FROM HandoverMaterial hm
        LEFT JOIN Material m ON hm.materialId = m.id
        WHERE hm.handoverReportId = ${handoverReportId}
      `;

      console.log('Debug - handoverMaterialsResult:', handoverMaterialsResult);

      // Map ending của ca trước dựa vào shift hiện tại
      previousShiftData = handoverMaterialsResult.map((material) => {
        let ending = 0;
        
        if (shift === SHIFT_ENUM.SANG) {
          // Ca sáng: lấy eveningEnding của ca tối hôm trước
          ending = material.eveningEnding;
        } else if (shift === SHIFT_ENUM.CHIEU) {
          // Ca chiều: lấy morningEnding của ca sáng cùng ngày
          ending = material.morningEnding;
        } else if (shift === SHIFT_ENUM.TOI) {
          // Ca tối: lấy afternoonEnding của ca chiều cùng ngày
          ending = material.afternoonEnding;
        }

        return {
          materialName: material.materialName,
          ending: ending,
        };
      });
    }

    // Get materials for the report type using raw query
    const materialsResult = await db.$queryRaw<{
      id: string;
      name: string;
    }[]>`
      SELECT id, name 
      FROM Material 
      WHERE reportType = ${reportType}
      AND isActive = true
      ORDER BY name ASC
    `;

    // Combine materials with previous shift data
    const reportData = materialsResult.map((material) => {
      const previousData = previousShiftData.find(
        (p) => p.materialName === material.name,
      );
      return {
        id: material.id,
        materialName: material.name,
        beginning: previousData ? previousData.ending : 0,
        received: 0,
        issued: 0,
        ending: previousData ? previousData.ending : 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch report data" },
      { status: 500 },
    );
  }
}
