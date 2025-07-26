import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { SHIFT_ENUM } from "@/constants/handover-reports.constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const shift = searchParams.get("shift");
    const reportType = searchParams.get("reportType");
    const branch = await getBranchFromCookie();

    if (!date || !shift || !reportType) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: date, shift, reportType" },
        { status: 400 }
      );
    }

    // Parse date
    const reportDate = new Date(date);
    const startDate = new Date(reportDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(reportDate);
    endDate.setDate(endDate.getDate() + 1);

    // Get previous shift data for beginning inventory
    let previousShiftData: any[] = [];
    
    if (shift === SHIFT_ENUM.SANG) {
      // Ca sáng: lấy tồn cuối ca tối ngày hôm trước
      const previousDay = new Date(reportDate);
      previousDay.setDate(previousDay.getDate() - 1);
      const previousDayStart = new Date(previousDay);
      previousDayStart.setHours(0, 0, 0, 0);
      const previousDayEnd = new Date(previousDay);
      previousDayEnd.setDate(previousDayEnd.getDate() + 1);

      const previousReport = await db.handoverReport.findFirst({
        where: {
          date: {
            gte: previousDayStart,
            lt: previousDayEnd
          },
          reportType: reportType,
          branch: branch
        },
        include: {
          materials: {
            include: {
              material: true
            }
          }
        }
      });

      if (previousReport) {
        previousShiftData = previousReport.materials.map(material => ({
          materialName: material.material?.name || material.materialName,
          ending: material.eveningEnding
        }));
      }
    } else if (shift === SHIFT_ENUM.CHIEU) {
      // Ca chiều: lấy tồn cuối ca sáng cùng ngày
      const currentReport = await db.handoverReport.findFirst({
        where: {
          date: {
            gte: startDate,
            lt: endDate
          },
          reportType: reportType,
          branch: branch
        },
        include: {
          materials: {
            include: {
              material: true
            }
          }
        }
      });

      if (currentReport) {
        previousShiftData = currentReport.materials.map(material => ({
          materialName: material.material?.name || material.materialName,
          ending: material.morningEnding
        }));
      }
    } else if (shift === SHIFT_ENUM.TOI) {
      // Ca tối: lấy tồn cuối ca chiều cùng ngày
      const currentReport = await db.handoverReport.findFirst({
        where: {
          date: {
            gte: startDate,
            lt: endDate
          },
          reportType: reportType,
          branch: branch
        },
        include: {
          materials: {
            include: {
              material: true
            }
          }
        }
      });

      if (currentReport) {
        previousShiftData = currentReport.materials.map(material => ({
          materialName: material.material?.name || material.materialName,
          ending: material.afternoonEnding
        }));
      }
    }

    // Get materials for the report type
    const materials = await db.material.findMany({
      where: {
        reportType: reportType,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Combine materials with previous shift data
    const reportData = materials.map(material => {
      const previousData = previousShiftData.find(p => p.materialName === material.name);
      return {
        id: material.id,
        materialName: material.name,
        beginning: previousData ? previousData.ending : 0,
        received: 0,
        issued: 0,
        ending: previousData ? previousData.ending : 0
      };
    });

    return NextResponse.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch report data" },
      { status: 500 }
    );
  }
} 