import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

type HandoverReportType = "BAO_CAO_BEP" | "BAO_CAO_NUOC";

async function getBranchFromCookie() {
  const cookieStore = await cookies();
  const branch = cookieStore.get("branch")?.value;
  return branch;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const reportType = searchParams.get("reportType");
    const branch = await getBranchFromCookie();

    if (!date || !reportType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: date, reportType",
        },
        { status: 400 },
      );
    }

    console.log(
      "Fetching data for date:",
      date,
      "reportType:",
      reportType,
      "branch:",
      branch,
    );

    // Lấy dữ liệu của ngày hiện tại
    const currentDate = new Date(date);
    const formattedCurrentDate = currentDate.toISOString().split("T")[0];

    const currentReportResult = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM HandoverReport 
      WHERE DATE(date) = ${formattedCurrentDate}
      AND reportType = ${reportType}
      AND branch = ${branch}
      LIMIT 1
    `;

    let currentDayData: any[] = [];
    let staffInfo: {
      morningStaffId: number | null;
      afternoonStaffId: number | null;
      eveningStaffId: number | null;
    } | null = null;
    let submissionTracking: any = null;
    let availableMaterials: any[] = [];

    if (currentReportResult.length > 0) {
      const handoverReportId = currentReportResult[0].id;

      // Lấy thông tin nhân viên và submission tracking
      const reportStaffInfo = await db.$queryRaw<
        {
          morningStaffId: number | null;
          afternoonStaffId: number | null;
          eveningStaffId: number | null;
          morningSubmissionCount: number;
          afternoonSubmissionCount: number;
          eveningSubmissionCount: number;
          isMorningComplete: boolean;
          isAfternoonComplete: boolean;
          isEveningComplete: boolean;
        }[]
      >`
        SELECT 
          morningStaffId, afternoonStaffId, eveningStaffId,
          morningSubmissionCount, afternoonSubmissionCount, eveningSubmissionCount,
          isMorningComplete, isAfternoonComplete, isEveningComplete
        FROM HandoverReport
        WHERE id = ${handoverReportId}
      `;

      staffInfo = reportStaffInfo[0] || {
        morningStaffId: null,
        afternoonStaffId: null,
        eveningStaffId: null,
      };

      submissionTracking = reportStaffInfo[0]
        ? {
            morningSubmissionCount: reportStaffInfo[0].morningSubmissionCount,
            afternoonSubmissionCount:
              reportStaffInfo[0].afternoonSubmissionCount,
            eveningSubmissionCount: reportStaffInfo[0].eveningSubmissionCount,
            isMorningComplete: reportStaffInfo[0].isMorningComplete,
            isAfternoonComplete: reportStaffInfo[0].isAfternoonComplete,
            isEveningComplete: reportStaffInfo[0].isEveningComplete,
          }
        : null;

      // Lấy dữ liệu materials của ngày hiện tại
      const currentMaterialsResult = await db.$queryRaw<
        {
          materialId: string;
          materialName: string;
          morningBeginning: number;
          morningReceived: number;
          morningIssued: number;
          morningEnding: number;
          afternoonBeginning: number;
          afternoonReceived: number;
          afternoonIssued: number;
          afternoonEnding: number;
          eveningBeginning: number;
          eveningReceived: number;
          eveningIssued: number;
          eveningEnding: number;
        }[]
      >`
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
      `;

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

    // Luôn lấy danh sách materials có sẵn (cần thiết cho cả isInitialData = true và false)
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
      ORDER BY name
    `;

    availableMaterials = materialsResult.map((material) => ({
      id: material.id,
      materialName: material.name,
      morning: {
        beginning: 0,
        received: 0,
        issued: 0,
        ending: 0,
      },
      afternoon: {
        beginning: 0,
        received: 0,
        issued: 0,
        ending: 0,
      },
      evening: {
        beginning: 0,
        received: 0,
        issued: 0,
        ending: 0,
      },
    }));

    // Lấy dữ liệu ca tối của ngày hôm trước (cho ca sáng)
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    const formattedPreviousDate = previousDate.toISOString().split("T")[0];

    const previousReportResult = await db.$queryRaw<{ id: string }[]>` 
      SELECT id FROM HandoverReport 
      WHERE DATE(date) = ${formattedPreviousDate}
      AND reportType = ${reportType}
      AND branch = ${branch}
      LIMIT 1
    `;

    let previousEveningData: any[] = [];

    if (previousReportResult.length > 0) {
      const previousHandoverReportId = previousReportResult[0].id;
      console.log("Found previous report with ID:", previousHandoverReportId);

      const previousMaterialsResult = await db.$queryRaw<
        {
          materialId: string;
          materialName: string;
          eveningEnding: number;
        }[]
      >`
        SELECT 
          m.id as materialId,
          m.name as materialName,
          hm.eveningEnding
        FROM HandoverMaterial hm
        LEFT JOIN Material m ON hm.materialId = m.id
        WHERE hm.handoverReportId = ${previousHandoverReportId}
      `;

      console.log("Previous materials result:", previousMaterialsResult);

      previousEveningData = previousMaterialsResult.map((material) => ({
        id: material.materialId,
        materialName: material.materialName,
        ending: material.eveningEnding || 0,
      }));

      console.log("Mapped previous evening data:", previousEveningData);
    } else {
      console.log("No previous report found for date:", formattedPreviousDate);
    }

    // Lấy dữ liệu ca sáng và chiều của ngày hiện tại (cho ca chiều và tối)
    let currentMorningData: any[] = [];
    let currentAfternoonData: any[] = [];

    if (currentReportResult.length > 0) {
      const handoverReportId = currentReportResult[0].id;

      const currentShiftMaterialsResult = await db.$queryRaw<
        {
          materialId: string;
          materialName: string;
          morningEnding: number;
          afternoonEnding: number;
        }[]
      >`
        SELECT 
          m.id as materialId,
          m.name as materialName,
          hm.morningEnding,
          hm.afternoonEnding
        FROM HandoverMaterial hm
        LEFT JOIN Material m ON hm.materialId = m.id
        WHERE hm.handoverReportId = ${handoverReportId}
      `;

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

    // isInitialData = true chỉ khi cả ngày hiện tại và ngày trước đó không có dữ liệu
    const isInitialData =
      currentReportResult.length === 0 && previousReportResult.length === 0;

    const responseData = {
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

    console.log("API Response data:", JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch report data" },
      { status: 500 },
    );
  }
}
