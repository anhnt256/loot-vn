import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Lấy chi tiết season
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const season = await db.battlePassSeason.findUnique({
    where: { id: Number(params.id) },
  });
  return NextResponse.json(season);
}

// PUT: Cập nhật season
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const data = await req.json();
  const season = await db.battlePassSeason.update({
    where: { id: Number(params.id) },
    data,
  });
  return NextResponse.json(season);
}

// DELETE: Xóa season
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  await db.battlePassSeason.delete({
    where: { id: Number(params.id) },
  });
  return NextResponse.json({ success: true });
}
