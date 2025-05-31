import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type DeviceStatus = "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";

// GET /api/devices/[deviceId] - Lấy thông tin chi tiết của một thiết bị
export async function GET(
  req: Request,
  { params }: { params: { deviceId: string } },
) {
  try {
    const device = await db.device.findUnique({
      where: {
        id: parseInt(params.deviceId),
      },
      include: {
        computer: true,
        histories: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
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

// PATCH /api/devices/[computerId] - Cập nhật trạng thái thiết bị
export async function PATCH(
  req: Request,
  { params }: { params: { computerId: string } },
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
      note,
    } = body;

    // Kiểm tra thiết bị tồn tại
    const device = await db.device.findFirst({
      where: {
        computerId: parseInt(params.computerId),
      },
    });

    if (!device) {
      return new NextResponse("Device not found", { status: 404 });
    }

    // Cập nhật thiết bị
    const updatedDevice = await db.device.update({
      where: {
        id: device.id,
      },
      data: {
        monitorStatus,
        keyboardStatus,
        mouseStatus,
        headphoneStatus,
        chairStatus,
        networkStatus,
        computerStatus,
        note,
      },
    });

    // Tạo lịch sử sửa chữa
    const deviceHistory = await db.deviceHistory.create({
      data: {
        computerId: parseInt(params.computerId),
        deviceId: device.id,
        type: "REPAIR",
        status: "RESOLVED",
        monitorStatus,
        keyboardStatus,
        mouseStatus,
        headphoneStatus,
        chairStatus,
        networkStatus,
      },
    });

    return NextResponse.json({ device: updatedDevice, history: deviceHistory });
  } catch (error) {
    console.error("[DEVICE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/devices/[deviceId] - Xóa thiết bị
export async function DELETE(
  req: Request,
  { params }: { params: { deviceId: string } },
) {
  try {
    const device = await db.device.findUnique({
      where: {
        id: parseInt(params.deviceId),
      },
    });

    if (!device) {
      return new NextResponse("Device not found", { status: 404 });
    }

    // Xóa tất cả lịch sử của thiết bị trước
    await db.deviceHistory.deleteMany({
      where: {
        deviceId: parseInt(params.deviceId),
      },
    });

    // Sau đó xóa thiết bị
    await db.device.delete({
      where: {
        id: parseInt(params.deviceId),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DEVICE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/devices/[computerId] - Tạo hoặc cập nhật thiết bị và tạo lịch sử thiết bị
export async function POST(
  req: Request,
  { params }: { params: { computerId: string } },
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
      note,
      type = "REPORT",
      issue,
      status = "PENDING",
    } = body;

    // Validate enum values
    const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED"];
    if (!validStatuses.includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const validTypes = ["REPORT", "REPAIR"];
    if (!validTypes.includes(type)) {
      return new NextResponse("Invalid type", { status: 400 });
    }

    const validateDeviceStatus = (status: string | undefined): DeviceStatus => {
      const validDeviceStatuses: DeviceStatus[] = [
        "GOOD",
        "DAMAGED_BUT_USABLE",
        "COMPLETELY_DAMAGED",
      ];
      if (status && !validDeviceStatuses.includes(status as DeviceStatus)) {
        throw new Error(`Invalid device status: ${status}`);
      }
      return (status as DeviceStatus) || "GOOD";
    };

    // Kiểm tra computer tồn tại
    const computer = await db.computer.findUnique({
      where: {
        id: parseInt(params.computerId),
      },
    });

    if (!computer) {
      return new NextResponse("Computer not found", { status: 404 });
    }

    // Tìm thiết bị hiện tại hoặc tạo mới nếu chưa tồn tại
    let device = await db.device.findFirst({
      where: {
        computerId: parseInt(params.computerId),
      },
    });

    if (!device) {
      // Tạo thiết bị mới nếu chưa tồn tại
      device = await db.device.create({
        data: {
          computerId: parseInt(params.computerId),
          monitorStatus: validateDeviceStatus(monitorStatus),
          keyboardStatus: validateDeviceStatus(keyboardStatus),
          mouseStatus: validateDeviceStatus(mouseStatus),
          headphoneStatus: validateDeviceStatus(headphoneStatus),
          chairStatus: validateDeviceStatus(chairStatus),
          networkStatus: validateDeviceStatus(networkStatus),
          computerStatus: validateDeviceStatus(computerStatus),
          note,
        },
      });
    } else {
      // Cập nhật thiết bị hiện tại
      device = await db.device.update({
        where: {
          id: device.id,
        },
        data: {
          monitorStatus: validateDeviceStatus(monitorStatus),
          keyboardStatus: validateDeviceStatus(keyboardStatus),
          mouseStatus: validateDeviceStatus(mouseStatus),
          headphoneStatus: validateDeviceStatus(headphoneStatus),
          chairStatus: validateDeviceStatus(chairStatus),
          networkStatus: validateDeviceStatus(networkStatus),
          computerStatus: validateDeviceStatus(computerStatus),
          note,
        },
      });
    }

    // Tạo lịch sử thiết bị mới
    const deviceHistory = await db.deviceHistory.create({
      data: {
        computerId: parseInt(params.computerId),
        deviceId: device.id,
        type,
        issue,
        status,
        monitorStatus: validateDeviceStatus(monitorStatus),
        keyboardStatus: validateDeviceStatus(keyboardStatus),
        mouseStatus: validateDeviceStatus(mouseStatus),
        headphoneStatus: validateDeviceStatus(headphoneStatus),
        chairStatus: validateDeviceStatus(chairStatus),
        networkStatus: validateDeviceStatus(networkStatus),
      },
    });

    return NextResponse.json({ device, deviceHistory });
  } catch (error) {
    console.error("[DEVICE_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 },
    );
  }
}
