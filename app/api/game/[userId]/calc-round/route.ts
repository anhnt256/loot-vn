import { NextResponse } from "next/server";

import { getCookie } from "cookies-next";
import { db, getFnetDB } from "@/lib/db";
import {
  paymenttb,
  Prisma as FnetPrisma,
} from "@/prisma/generated/fnet-gv-client";
import { Prisma } from "@/prisma/generated/prisma-client";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = params;

    const fnetDB = getFnetDB();

    const fnetQuery = FnetPrisma.sql`
      SELECT CAST(SUM(AutoAmount) AS DECIMAL(18,2)) as total
      FROM fnet.paymenttb
      WHERE
        PaymentType = 4
        AND UserId = ${parseInt(userId, 10)}
        AND Note = N'Thời gian phí'
        AND ServeDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= DATE_SUB(CURDATE() + INTERVAL CURTIME() HOUR_SECOND, INTERVAL 30 DAY)
    `;

    const result = await fnetDB.$queryRaw<[{ total: number }]>(fnetQuery);

    const userTopUp = parseFloat(result[0].total.toString());

    // const userTopUp = 500000;

    const round = Math.floor(
      userTopUp
        ? userTopUp / Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND)
        : 0,
    );

    // Số lượt đã sử dụng
    const query = Prisma.sql`
                      SELECT COUNT(*) as count
                      FROM GameResult gr
                      WHERE gr.userId = ${parseInt(userId, 10)}
                      AND gr.createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
                    `;

    const userRound = await db.$queryRaw<[{ count: bigint }]>(query);

    const count = Number(userRound[0].count);

    const user = await db.user.findFirst({
      where: { userId: parseInt(userId, 10) },
    });

    const { id } = user || {};

    if (id) {
      if (round - count >= 0) {
        await db.user.update({
          where: { id },
          data: { magicStone: round - count },
        });
      }
      return NextResponse.json("Success", { status: 200 });
    }
    return NextResponse.json("Internal Error", { status: 404 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
