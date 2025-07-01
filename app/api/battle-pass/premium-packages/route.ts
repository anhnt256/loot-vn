import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Lấy danh sách premium packages
export async function GET() {
  const packages = await db.battlePassPremiumPackage.findMany({
    orderBy: { id: "desc" },
  });
  return NextResponse.json(packages);
}

// POST: Tạo mới premium package
export async function POST(req: Request) {
  const data = await req.json();
  const pkg = await db.battlePassPremiumPackage.create({ data });
  return NextResponse.json(pkg);
}
