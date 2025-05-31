import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { computerId, historyData, deviceUpdates } = await request.json();

    // 1. Lưu DeviceHistory (dạng phẳng)
    const history = await prisma.deviceHistory.create({
      data: {
        computerId: Number(computerId),
        type: historyData.type,
        issue: historyData.issue,
        status: historyData.status,
        technician: historyData.technician,
        monitorStatus: deviceUpdates.monitorStatus,
        keyboardStatus: deviceUpdates.keyboardStatus,
        mouseStatus: deviceUpdates.mouseStatus,
        headphoneStatus: deviceUpdates.headphoneStatus,
        chairStatus: deviceUpdates.chairStatus,
        networkStatus: deviceUpdates.networkStatus,
      }
    });

    // 2. Cập nhật Device
    await prisma.device.updateMany({
      where: { computerId: Number(computerId) },
      data: {
        monitorStatus: deviceUpdates.monitorStatus,
        keyboardStatus: deviceUpdates.keyboardStatus,
        mouseStatus: deviceUpdates.mouseStatus,
        headphoneStatus: deviceUpdates.headphoneStatus,
        chairStatus: deviceUpdates.chairStatus,
        networkStatus: deviceUpdates.networkStatus,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật thành công',
      data: history
    });

  } catch (error) {
    console.error('Error in device-report API:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi cập nhật dữ liệu',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 