import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/reports?date=yyyy-mm-dd&shift=SANG&branch=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const shift = searchParams.get("shift");
  const branch = searchParams.get("branch");

  const where: any = {};
  if (date) where.date = new Date(date);
  if (shift) where.shift = shift;
  if (branch) where.branch = branch;

  const reports = await prisma.report.findMany({
    where,
    include: {
      details: true,
      counterStaff: true,
      kitchenStaff: true,
      securityStaff: true,
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(reports);
}

// POST /api/reports
export async function POST(req: NextRequest) {
  const data = await req.json();
  // data: { date, shift, branch, fileUrl, note, counterStaffId, kitchenStaffId, securityStaffId, details }
  // details: [{ type, value }]
  const report = await prisma.report.create({
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
        create:
          data.details?.map((d: any) => ({ type: d.type, value: d.value })) ||
          [],
      },
    },
    include: { details: true },
  });
  return NextResponse.json(report);
}
