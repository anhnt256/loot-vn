import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/devices - Lấy danh sách thiết bị
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const computerId = searchParams.get("computerId");

    const devices = await db.device.findMany({
      where: computerId
        ? {
            computerId: parseInt(computerId),
          }
        : undefined,
      include: {
        computer: true,
        histories: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Chỉ lấy 5 lịch sử gần nhất
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(devices);
  } catch (error) {
    console.error("[DEVICES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/devices - Tạo thiết bị mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { computerId } = body;

    if (!computerId) {
      return new NextResponse("Computer ID is required", { status: 400 });
    }

    // Kiểm tra computer có tồn tại không
    const computer = await db.computer.findUnique({
      where: { id: computerId },
    });

    if (!computer) {
      return new NextResponse("Computer not found", { status: 404 });
    }

    // Kiểm tra xem computer này đã có device record chưa
    const existingDevice = await db.device.findFirst({
      where: { computerId },
    });

    if (existingDevice) {
      return new NextResponse(
        "Device record already exists for this computer",
        { status: 400 },
      );
    }

    const device = await db.device.create({
      data: {
        computerId,
        // Các trạng thái mặc định là GOOD
      },
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error("[DEVICES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
