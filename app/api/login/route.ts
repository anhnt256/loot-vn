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

        // const userId = 9200;

        let userUpdated;

        const currentUsers = await db.user.findMany({
          where: {
            userId: Number(userId),
            branch: result?.branch,
          },
        });

        // Lấy danh sách userName hợp lệ (loại bỏ userName rỗng)
        const validUserNames = currentUsers
          .map((user) => user.userName)
          .filter((userName) => userName && userName.trim() !== "");

        if (validUserNames.length > 0) {
          // Truy vấn thêm theo username để đảm bảo lấy hết user trùng
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

          // Gộp cả hai danh sách lại
          const allUsers = [...new Set([...currentUsers, ...usersByUsername])];

          // Nhóm theo `userName`
          const groupedUsers = allUsers.reduce(
            (acc, user) => {
              if (!acc[user.userName]) acc[user.userName] = [];
              acc[user.userName].push(user);
              return acc;
            },
            {} as Record<string, typeof allUsers>,
          );

          console.log("groupedUsers", groupedUsers);

          for (const userName in groupedUsers) {
            const users = groupedUsers[userName];

            if (users.length > 1) {
              users.sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime(),
              );
              const latestUser = users[0];
              const totalStars = users.reduce((sum, u) => sum + u.stars, 0);
              const totalMagicStones = users.reduce(
                (sum, u) => sum + u.magicStone,
                0,
              );

              console.log("latestUser.id", latestUser.id);

              userUpdated = await db.user.update({
                where: { id: latestUser.id },
                data: {
                  stars: totalStars,
                  magicStone: totalMagicStones,
                  userId: userId, // Cập nhật userId hợp lệ
                },
              });

              console.log("userUpdated", userUpdated);

              const deleteIds = users
                .slice(1)
                .map((u) => u.id)
                .filter((id) => id !== latestUser.id);

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
                  userId: userId, // Cập nhật userId hợp lệ
                },
              });
            }
          }
        }

        console.log("userUpdated", userUpdated);

        if (userUpdated) {
          const token = await signJWT({ userId: userUpdated?.userId });
          const response = NextResponse.json(userUpdated);

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
