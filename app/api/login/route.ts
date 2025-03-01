import { NextResponse } from "next/server";
import { getCookie } from "cookies-next";
import { cookies, headers } from "next/headers";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import isEmpty from "lodash/isEmpty";
import { BRANCH } from "@/constants/enum.constant";
import dayjs from "dayjs";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

export async function POST(req: Request, res: Response): Promise<any> {
  try {
    const macAddress = getCookie("macAddress", { req, res });
    // const macAddress = "A4-0C-66-0B-E8-7B";
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

        let userUpdated;

        const currentUsers = await db.user.findMany({
          where: {
            userId: Number(userId),
            branch: result?.branch,
          },
        });

        const validUserNames = currentUsers
          .map((user) => user.userName)
          .filter(
            (userName): userName is string =>
              userName !== null && userName.trim() !== "",
          );

        if (validUserNames.length > 0) {
          const usersByUsername = await db.user.findMany({
            where: {
              userName: { in: validUserNames },
            },
          });

          const uniqueBranches = new Set(
            usersByUsername.map((user) => user.branch),
          );

          if (uniqueBranches.size > 1) {
            return NextResponse.json("Duplicate account", { status: 499 });
          }

          const allUsers = [...new Set([...currentUsers, ...usersByUsername])];

          const groupedUsers = allUsers.reduce<Record<string, typeof allUsers>>(
            (acc, user) => {
              if (!acc[user.userName ?? ""]) acc[user.userName ?? ""] = [];
              acc[user.userName ?? ""].push(user);
              return acc;
            },
            {},
          );

          console.log("groupedUsers", groupedUsers);

          for (const userName in groupedUsers) {
            const users = groupedUsers[userName];

            if (users.length > 1) {
              users.sort(
                (a: { updatedAt: Date }, b: { updatedAt: Date }) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime(),
              );
              const latestUser = users[0];
              const totalStars = users.reduce(
                (sum: number, u: { stars: number }) => sum + u.stars,
                0,
              );
              const totalMagicStones = users.reduce(
                (sum: number, u: { magicStone: number }) => sum + u.magicStone,
                0,
              );

              console.log("latestUser.id", latestUser.id);

              userUpdated = await db.user.update({
                where: { id: latestUser.id },
                data: {
                  stars: totalStars,
                  magicStone: totalMagicStones,
                  userId: userId,
                },
              });

              console.log("userUpdated", userUpdated);

              const deleteIds = users
                .slice(1)
                .map((u: { id: number }) => u.id)
                .filter((id: number) => id !== latestUser.id);

              console.log("deleteIds", deleteIds);

              await db.userMissionMap.deleteMany({
                where: { userId: { in: deleteIds } },
              });

              await db.user.deleteMany({
                where: { id: { in: deleteIds } },
              });

              console.log("delete many");
            } else {
              userUpdated = await db.user.update({
                where: { id: users[0].id },
                data: {
                  userId: userId,
                },
              });
            }
          }
        }

        console.log("userUpdated", userUpdated);

        if (userUpdated) {
          const token = await signJWT({ userId: userUpdated?.userId });
          const response = NextResponse.json(userUpdated);

          response.cookies.set({
            name: "token",
            value: token,
            maxAge: 86400,
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
