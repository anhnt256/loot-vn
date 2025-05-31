import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DeviceStatus, DeviceSolution } from "@prisma/client";

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
    if (!devicePart || !oldStatus || !newStatus || !createdBy) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate enums
    if (!Object.values(DeviceStatus).includes(oldStatus) || 
        !Object.values(DeviceStatus).includes(newStatus) ||
        (solution && !Object.values(DeviceSolution).includes(solution))) {
      return new NextResponse("Invalid status or solution", { status: 400 });
    }

    // Check if device exists
    const device = await db.device.findUnique({
      where: {
        id: parseInt(params.deviceId)
      }
    });

    if (!device) {
      return new NextResponse("Device not found", { status: 404 });
    }

    // Create history record
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

    // Update device status
    const updateData: any = {
      [devicePart + 'Status']: newStatus
    };

    const updatedDevice = await db.device.update({
      where: {
        id: parseInt(params.deviceId)
      },
      data: updateData,
      include: {
        histories: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });

    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error("[DEVICE_REPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 