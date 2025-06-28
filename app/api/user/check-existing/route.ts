import { NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";
import dayjs from "@/lib/dayjs";

export async function GET(req: Request): Promise<any> {
  const cookieStore = await cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  const url = new URL(req.url);
  const machineName = url.searchParams.get("machineName");

  if (!machineName || !branchFromCookie) {
    return NextResponse.json(
      { error: "Missing machineName or branch" },
      { status: 400 },
    );
  }

  try {
    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    // Get userId from fnet DB using machineName
    const query = fnetPrisma.sql`SELECT userId
                                 FROM fnet.systemlogtb AS t1
                                 WHERE t1.MachineName = ${machineName}
                                 ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC
                                   LIMIT 1`;

    const user: any = await fnetDB.$queryRaw<any>(query);
    const userId = user[0]?.userId ?? null;

    if (!userId) {
      return NextResponse.json(null);
    }

    // Check if user exists in our DB
    const existingUser = await db.user.findFirst({
      where: {
        userId: Number(userId),
        branch: branchFromCookie,
      },
    });

    return NextResponse.json(existingUser);
  } catch (error) {
    console.error("Check existing user error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
