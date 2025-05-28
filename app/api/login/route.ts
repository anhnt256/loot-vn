import { NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import dayjs from "@/lib/dayjs";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

export async function POST(req: Request, res: Response): Promise<any> {
  const cookieStore = await cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  try {
    const body = await req.text();
    console.log("Login request body:", body);

    const { userName, machineName, isAdmin } = JSON.parse(body);

    // Xử lý đăng nhập admin
    if (isAdmin && userName === "gateway_admin") {
      console.log("Processing admin login");
      const adminData = {
        userId: "admin",
        userName: "gateway_admin",
        role: "admin"
      };

      const token = await signJWT(adminData);
      const response = NextResponse.json({
        ...adminData,
        statusCode: 200,
        message: "Login Success"
      });

      response.cookies.set({
        name: "token",
        value: token,
        maxAge: 86400,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      console.log("Admin login successful");
      return response;
    }

    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    const query = fnetPrisma.sql`SELECT userId
                                 FROM fnet.systemlogtb AS t1
                                 WHERE t1.MachineName = ${machineName}
                                 ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC
                                   LIMIT 1`;

    const user: any = await fnetDB.$queryRaw<any>(query);

    const userId = user[0]?.userId ?? null;

    // const userId = 8503;

    let userUpdated;

    const currentUsers = await db.user.findMany({
      where: {
        userId: Number(userId),
        branch: branchFromCookie,
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

      const thisUsers = [...currentUsers, ...usersByUsername];
      const allUsers = [
        ...new Map(thisUsers.map((user) => [user.id, user])).values(),
      ];

      if (allUsers.length > 1) {
        allUsers.sort(
          (a: { updatedAt: Date }, b: { updatedAt: Date }) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

        const latestUser = allUsers[0];
        const totalStars = allUsers.reduce(
          (sum: number, u: { stars: number }) => sum + u.stars,
          0,
        );
        const totalMagicStones = allUsers.reduce(
          (sum: number, u: { magicStone: number }) => sum + u.magicStone,
          0,
        );

        userUpdated = await db.user.update({
          where: { id: latestUser.id },
          data: {
            stars: totalStars,
            magicStone: totalMagicStones,
            userId: userId,
          },
        });

        const deleteIds = allUsers
          .slice(1)
          .map((u: { id: number }) => u.id)
          .filter((id: number) => id !== latestUser.id);

        if (deleteIds.length > 0) {
          await db.userMissionMap.deleteMany({
            where: { userId: { in: deleteIds } },
          });
        }

        await db.user.deleteMany({
          where: { id: { in: deleteIds } },
        });
      } else {
        userUpdated = await db.user.update({
          where: { id: allUsers[0].id },
          data: {
            userId: userId,
          },
        });
      }
    } else {
      if (branchFromCookie) {
        userUpdated = await db.user.create({
          data: {
            userName: userName.trim(),
            userId,
            branch: branchFromCookie,
            rankId: 1,
            stars: 0,
            magicStone: 0,
            createdAt: dayjs()
              .tz("Asia/Ho_Chi_Minh")
              .toISOString(),
          },
        });
      }
    }

    if (userUpdated) {
      const token = await signJWT({ userId: userUpdated?.userId });
      const response = NextResponse.json({
        ...userUpdated,
        statusCode: 200,
        message: "Login Success"
      });

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
    return NextResponse.json({ 
      statusCode: 401,
      message: "Login Failed",
      data: null
    }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ 
      statusCode: 500,
      message: errorMessage,
      data: null
    }, { status: 500 });
  }
}
