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

    console.log("date", date);

    // Kiểm tra xem ca hiện tại đã có dữ liệu chưa
    const currentDate = new Date(date);
    const formattedCurrentDate = currentDate.toISOString().split("T")[0];
    
    const currentReportResult = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM HandoverReport 
      WHERE DATE(date) = ${formattedCurrentDate}
      AND reportType = ${reportType}
      AND branch = ${branch}
      LIMIT 1
    `;

    console.log("currentReportResult", currentReportResult);

    let reportData: any[] = [];

    if (currentReportResult.length > 0) {
      // Ca hiện tại đã có dữ liệu -> lấy dữ liệu thực tế
      const handoverReportId = currentReportResult[0].id;
      
      const currentMaterialsResult = await db.$queryRaw<
        {
          materialId: string;
          materialName: string;
          morningBeginning: number;
          morningReceived: number;
          morningIssued: number;
          morningEnding: number;
          morningStaffId: number;
          afternoonBeginning: number;
          afternoonReceived: number;
          afternoonIssued: number;
          afternoonEnding: number;
          afternoonStaffId: number;
          eveningBeginning: number;
          eveningReceived: number;
          eveningIssued: number;
          eveningEnding: number;
          eveningStaffId: number;
        }[]
      >`
        SELECT 
          m.id as materialId,
          m.name as materialName,
          hm.morningBeginning,
          hm.morningReceived,
          hm.morningIssued,
          hm.morningEnding,
          hm.morningStaffId,
          hm.afternoonBeginning,
          hm.afternoonReceived,
          hm.afternoonIssued,
          hm.afternoonEnding,
          hm.afternoonStaffId,
          hm.eveningBeginning,
          hm.eveningReceived,
          hm.eveningIssued,
          hm.eveningEnding,
          hm.eveningStaffId
        FROM HandoverMaterial hm
        LEFT JOIN Material m ON hm.materialId = m.id
        WHERE hm.handoverReportId = ${handoverReportId}
      `;

      console.log("Debug - currentMaterialsResult:", currentMaterialsResult);

      // Map dữ liệu thực tế của ca hiện tại
      reportData = currentMaterialsResult.map((material) => {
        let beginning = 0;
        let received = 0;
        let issued = 0;
        let ending = 0;

        if (shift === SHIFT_ENUM.SANG) {
          beginning = material.morningBeginning || 0;
          received = material.morningReceived || 0;
          issued = material.morningIssued || 0;
          ending = material.morningEnding || 0;
        } else if (shift === SHIFT_ENUM.CHIEU) {
          beginning = material.afternoonBeginning || 0;
          received = material.afternoonReceived || 0;
          issued = material.afternoonIssued || 0;
          ending = material.afternoonEnding || 0;
        } else if (shift === SHIFT_ENUM.TOI) {
          beginning = material.eveningBeginning || 0;
          received = material.eveningReceived || 0;
          issued = material.eveningIssued || 0;
          ending = material.eveningEnding || 0;
        }

        let staffId = null;
        if (shift === SHIFT_ENUM.SANG) {
          staffId = material.morningStaffId;
        } else if (shift === SHIFT_ENUM.CHIEU) {
          staffId = material.afternoonStaffId;
        } else if (shift === SHIFT_ENUM.TOI) {
          staffId = material.eveningStaffId;
        }

        return {
          id: material.materialId,
          materialName: material.materialName,
          beginning: beginning,
          received: received,
          issued: issued,
          ending: ending,
          staffId: staffId,
        };
      });
    } else {
      // Ca hiện tại chưa có dữ liệu -> lấy tồn cuối của ca trước để init
      let previousShiftData: PreviousShiftData[] = [];

      // Tìm handoverReportId của ca trước
      const dateObj = new Date(date);
      let targetDate = dateObj;
      let targetShift = "";

      if (shift === SHIFT_ENUM.SANG) {
        // Ca sáng: lấy eveningEnding của ca tối hôm trước
        targetDate = new Date(dateObj);
        targetDate.setDate(targetDate.getDate() - 1);
        targetShift = SHIFT_ENUM.TOI;
      } else if (shift === SHIFT_ENUM.CHIEU) {
        // Ca chiều: lấy morningEnding của ca sáng cùng ngày
        targetDate = dateObj;
        targetShift = SHIFT_ENUM.SANG;
      } else if (shift === SHIFT_ENUM.TOI) {
        // Ca tối: lấy afternoonEnding của ca chiều cùng ngày
        targetDate = dateObj;
        targetShift = SHIFT_ENUM.CHIEU;
      }

      const formattedTargetDate = targetDate.toISOString().split("T")[0];

      const previousReportResult = await db.$queryRaw<{ id: string }[]>`
        SELECT id FROM HandoverReport 
        WHERE DATE(date) = ${formattedTargetDate}
        AND reportType = ${reportType}
        AND branch = ${branch}
        LIMIT 1
      `;

      console.log("previousReportResult", previousReportResult);

      if (previousReportResult.length > 0) {
        const handoverReportId = previousReportResult[0].id;

        console.log("Debug - handoverReportId:", handoverReportId);

        // Lấy materials với ending của ca trước
        const handoverMaterialsResult = await db.$queryRaw<
          {
            materialName: string;
            morningEnding: number;
            afternoonEnding: number;
            eveningEnding: number;
          }[]
        >`
          SELECT 
            m.name as materialName,
            hm.morningEnding,
            hm.afternoonEnding,
            hm.eveningEnding
          FROM HandoverMaterial hm
          LEFT JOIN Material m ON hm.materialId = m.id
          WHERE hm.handoverReportId = ${handoverReportId}
        `;

        console.log("Debug - handoverMaterialsResult:", handoverMaterialsResult);

        // Map ending của ca trước dựa vào targetShift
        previousShiftData = handoverMaterialsResult.map((material) => {
          let ending = 0;

          if (targetShift === SHIFT_ENUM.SANG) {
            ending = material.morningEnding;
          } else if (targetShift === SHIFT_ENUM.CHIEU) {
            ending = material.afternoonEnding;
          } else if (targetShift === SHIFT_ENUM.TOI) {
            ending = material.eveningEnding;
          }

          return {
            materialName: material.materialName,
            ending: ending,
          };
        });
      }

      // Get materials for the report type using raw query
      const materialsResult = await db.$queryRaw<
        {
          id: string;
          name: string;
        }[]
      >`
        SELECT id, name 
        FROM Material 
        WHERE reportType = ${reportType}
        AND isActive = true
        ORDER BY name ASC
      `;

      // Combine materials with previous shift data
      reportData = materialsResult.map((material) => {
        const previousData = previousShiftData.find(
          (p: PreviousShiftData) => p.materialName === material.name,
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
    }

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
