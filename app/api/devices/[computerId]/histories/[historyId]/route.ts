import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DeviceSolution } from "@prisma/client";

type DeviceStatus = "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";

// GET /api/devices/[deviceId]/histories/[historyId] - Lấy chi tiết một lịch sử
export async function GET(
  req: Request,
  { params }: { params: { deviceId: string; historyId: string } }
) {
  try {
    const history = await db.deviceHistory.findUnique({
      where: {
        id: parseInt(params.historyId)
      },
    });

    if (!history || history.deviceId !== parseInt(params.deviceId)) {
      return new NextResponse("History not found", { status: 404 });
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error("[DEVICE_HISTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH /api/devices/[deviceId]/histories/[historyId] - Cập nhật một lịch sử
export async function PATCH(
  req: Request,
  { params }: { params: { deviceId: string; historyId: string } }
) {
  try {
    const body = await req.json();
    const {
      solution,
      note,
      completedAt,
      completedBy
    } = body;

    // Kiểm tra lịch sử tồn tại
    const history = await db.deviceHistory.findUnique({
      where: {
        id: parseInt(params.historyId)
      }
    });

    if (!history || history.deviceId !== parseInt(params.deviceId)) {
      return new NextResponse("History not found", { status: 404 });
    }

    // Validate enum nếu cập nhật solution
    if (solution && !Object.values(DeviceSolution).includes(solution)) {
      return new NextResponse("Invalid solution", { status: 400 });
    }

    // Cập nhật lịch sử
    const updatedHistory = await db.deviceHistory.update({
      where: {
        id: parseInt(params.historyId)
      },
      data: {
        solution,
        note,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        completedBy
      }
    });

    return NextResponse.json(updatedHistory);
  } catch (error) {
    console.error("[DEVICE_HISTORY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/devices/[deviceId]/histories/[historyId] - Xóa một lịch sử
export async function DELETE(
  req: Request,
  { params }: { params: { deviceId: string; historyId: string } }
) {
  try {
    const history = await db.deviceHistory.findUnique({
      where: {
        id: parseInt(params.historyId)
      }
    });

    if (!history || history.deviceId !== parseInt(params.deviceId)) {
      return new NextResponse("History not found", { status: 404 });
    }

    await db.deviceHistory.delete({
      where: {
        id: parseInt(params.historyId)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DEVICE_HISTORY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 