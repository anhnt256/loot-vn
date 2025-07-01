import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Lấy chi tiết package
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const pkg = await db.battlePassPremiumPackage.findUnique({
    where: { id: Number(params.id) },
  });
  return NextResponse.json(pkg);
}

// PUT: Cập nhật package
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const data = await req.json();
  const pkg = await db.battlePassPremiumPackage.update({
    where: { id: Number(params.id) },
    data,
  });
  return NextResponse.json(pkg);
}

// DELETE: Xóa package
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  await db.battlePassPremiumPackage.delete({
    where: { id: Number(params.id) },
  });
  return NextResponse.json({ success: true });
}
