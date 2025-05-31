import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DeviceStatus, DeviceSolution } from "@prisma/client";

// GET /api/devices/[deviceId]/histories - Lấy lịch sử của một thiết bị
export async function GET(
  req: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const histories = await db.deviceHistory.findMany({
      where: {
        deviceId: parseInt(params.deviceId)
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const total = await db.deviceHistory.count({
      where: {
        deviceId: parseInt(params.deviceId)
      }
    });

    return NextResponse.json({
      items: histories,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("[DEVICE_HISTORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/devices/[deviceId]/histories - Tạo lịch sử mới
export async function POST(
  req: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const body = await req.json();
    const {
      devicePart,
      oldStatus,
      newStatus,
      solution,
      note,
      createdBy,
      completedAt,
      completedBy
    } = body;

    // Validate required fields
    if (!devicePart || !oldStatus || !newStatus || !solution || !createdBy) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate enums
    if (!Object.values(DeviceStatus).includes(oldStatus) || 
        !Object.values(DeviceStatus).includes(newStatus) ||
        !Object.values(DeviceSolution).includes(solution)) {
      return new NextResponse("Invalid status or solution", { status: 400 });
    }

    // Kiểm tra thiết bị tồn tại
    const device = await db.device.findUnique({
      where: {
        id: parseInt(params.deviceId)
      }
    });

    if (!device) {
      return new NextResponse("Device not found", { status: 404 });
    }

    // Tạo lịch sử mới
    const history = await db.deviceHistory.create({
      data: {
        deviceId: parseInt(params.deviceId),
        devicePart,
        oldStatus,
        newStatus,
        solution,
        note,
        createdBy,
        completedAt: completedAt ? new Date(completedAt) : null,
        completedBy
      }
    });

    // Cập nhật trạng thái thiết bị tương ứng
    const updateData: any = {
      [devicePart + 'Status']: newStatus
    };

    await db.device.update({
      where: {
        id: parseInt(params.deviceId)
      },
      data: updateData
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("[DEVICE_HISTORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 