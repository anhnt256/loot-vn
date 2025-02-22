import { NextResponse } from "next/server";
import { getCookie } from "cookies-next";
import { cookies, headers } from "next/headers";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import isEmpty from "lodash/isEmpty";
import { BRANCH } from "@/constants/enum.constant";
import { currentTimeVN } from "@/lib/dayjs";
import dayjs from "dayjs";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

export async function POST(req: Request, res: Response): Promise<any> {
  try {
    const macAddress = getCookie("macAddress", { req, res });
    // const macAddress = "EC-D6-8A-DE-89-49";
    const body = await req.text();

    const { userName } = JSON.parse(body);

    if (macAddress) {
      const result = await db.computer.findFirst({
        where: {
          localIp: macAddress.replaceAll(":", "-").toUpperCase(),
        },
        select: {
          name: true,
          branch: true,
        },
      });

      const cookieStore = cookies();
      // @ts-ignore
      cookieStore.set("branch", result?.branch, {
        expires: new Date(expirationDate),
      });

      const fnetDB = getFnetDB();
      const fnetPrisma = getFnetPrisma();

      if (result?.name) {
        const query = fnetPrisma.sql`SELECT userId
                                 FROM fnet.systemlogtb AS t1
                                 WHERE t1.MachineName = ${result?.name}
                                 ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC
                                   LIMIT 1`;
        const user: any = await fnetDB.$queryRaw<any>(query);

        const userId = user[0]?.userId ?? null;

        // const userId = 1076;

        const currentUser = await db.user.findFirst({
          where: {
            userId,
          },
        });

        // console.log("currentUser", currentUser);

        const { id, userName: currentUserName } = currentUser || {};

        let updateUser = null;
        if (currentUser) {
          updateUser = currentUser;
        } else {
          const data = {
            userId: userId,
            branch: getCookie("branch", { req, res }) || BRANCH.GOVAP,
            stars: 0,
            createdAt: currentTimeVN,
            rankId: 1,
          };
          updateUser = await db.user.create({
            data,
          });
        }

        // console.log("updateUser", updateUser);

        if (updateUser) {
          if (isEmpty(currentUserName) && !isEmpty(userName)) {
            const updatedUser = await db.user.update({
              where: {
                id,
              },
              data: {
                userName: userName.trim().toLowerCase(),
              },
            });

            if (updatedUser) {
              updateUser = updatedUser;
            }
          }
        }

        if (updateUser) {
          const token = await signJWT({ userId: updateUser?.userId });
          const response = NextResponse.json(updateUser);

          // @ts-ignore
          response.cookies.set({
            name: "token",
            value: token,
            maxAge: 86400, // 1 day
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
          });

          return response;
        }
      }
    }
    return NextResponse.json("Login Fail", { status: 401 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Error";
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
