import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Lấy danh sách season
export async function GET() {
  const seasons = await db.battlePassSeason.findMany({
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(seasons);
}

// POST: Tạo mới season
export async function POST(req: Request) {
  const data = await req.json();
  const season = await db.battlePassSeason.create({ data });
  return NextResponse.json(season);
}
