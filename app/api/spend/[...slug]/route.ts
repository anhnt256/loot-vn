import { NextResponse } from "next/server";

import { db, getFnetDB } from "@/lib/db";
import { Prisma, systemlogtb } from "@/prisma/generated/fnet-gv-client";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  try {
    const fnetDB = getFnetDB();
    const [userId, branch] = params.slug;
    const query = Prisma.sql`
                            SELECT *
                            FROM fnet.systemlogtb AS t1
                            WHERE t1.UserId = ${userId.toString()}
                              AND t1.status = 3
                              AND DATE(STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s')) = CURDATE()

                            UNION ALL

                            SELECT *
                            FROM (
                              SELECT *
                              FROM fnet.systemlogtb AS t1
                              WHERE t1.UserId = ${userId.toString()}
                                AND t1.status = 3
                                AND DATE(STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s')) < CURDATE()
                              ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC
                              LIMIT 1
                            ) AS t2`;
    const result = await fnetDB.$queryRaw<any[]>(query);

    const totalTimeUsed = result.reduce((sum, item) => sum + item.TimeUsed, 0);
    const totalHours = Math.floor(totalTimeUsed / 60);

    return NextResponse.json(totalHours);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
