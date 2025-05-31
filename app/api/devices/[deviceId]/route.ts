import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/devices/[deviceId] - Lấy thông tin chi tiết của một thiết bị
export async function GET(
  req: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const device = await db.device.findUnique({
      where: {
        id: parseInt(params.deviceId)
      },
      include: {
        computer: true,
        histories: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!device) {
      return new NextResponse("Device not found", { status: 404 });
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error("[DEVICE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH /api/devices/[deviceId] - Cập nhật trạng thái thiết bị
export async function PATCH(
  req: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const body = await req.json();
    const {
      monitorStatus,
      keyboardStatus,
      mouseStatus,
      headphoneStatus,
      chairStatus,
      networkStatus,
      computerStatus,
      note
    } = body;

    // Kiểm tra thiết bị tồn tại
    const device = await db.device.findUnique({
      where: {
        id: parseInt(params.deviceId)
      }
    });

    if (!device) {
      return new NextResponse("Device not found", { status: 404 });
    }

    // Cập nhật thiết bị
    const updatedDevice = await db.device.update({
      where: {
        id: parseInt(params.deviceId)
      },
      data: {
        monitorStatus,
        keyboardStatus,
        mouseStatus,
        headphoneStatus,
        chairStatus,
        networkStatus,
        computerStatus,
        note
      }
    });

    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error("[DEVICE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/devices/[deviceId] - Xóa thiết bị
export async function DELETE(
  req: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const device = await db.device.findUnique({
      where: {
        id: parseInt(params.deviceId)
      }
    });

    if (!device) {
      return new NextResponse("Device not found", { status: 404 });
    }

    // Xóa tất cả lịch sử của thiết bị trước
    await db.deviceHistory.deleteMany({
      where: {
        deviceId: parseInt(params.deviceId)
      }
    });

    // Sau đó xóa thiết bị
    await db.device.delete({
      where: {
        id: parseInt(params.deviceId)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DEVICE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 