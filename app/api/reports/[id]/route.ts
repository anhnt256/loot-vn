import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/reports/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const report = await db.report.findUnique({
    where: { id },
    include: {
      details: true,
      counterStaff: true,
      kitchenStaff: true,
      securityStaff: true,
    },
  });
  if (!report)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}

// PUT /api/reports/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const data = await req.json();
  // Cập nhật các trường cơ bản và details (xóa hết details cũ, tạo lại mới)
  const updated = await db.report.update({
    where: { id },
    data: {
      date: new Date(data.date),
      shift: data.shift,
      branch: data.branch,
      fileUrl: data.fileUrl,
      note: data.note,
      counterStaffId: data.counterStaffId,
      kitchenStaffId: data.kitchenStaffId,
      securityStaffId: data.securityStaffId,
      details: {
        deleteMany: {},
        create:
          data.details?.map((d: any) => ({ type: d.type, value: d.value })) ||
          [],
      },
    },
    include: { details: true },
  });
  return NextResponse.json(updated);
}

// DELETE /api/reports/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  await db.report.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
