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
    if (isAdmin) {
      console.log("Processing admin login for user:", userName);
      if (userName !== "gateway_admin") {
        console.log("Admin login failed: Invalid username");
        return NextResponse.json(
          {
            statusCode: 401,
            message: "Invalid admin credentials",
            data: null,
          },
          { status: 401 },
        );
      }

      const adminData = {
        userId: "admin",
        id: "admin",
        userName: "gateway_admin",
        role: "admin",
      };

      const token = await signJWT(adminData);
      const response = NextResponse.json({
        ...adminData,
        statusCode: 200,
        message: "Login Success",
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

    // Tìm user theo userId (và branch nếu cần)
    const existedUsers = await db.user.findMany({
      where: {
        userId: Number(userId),
        branch: branchFromCookie || "",
      },
      orderBy: { id: "asc" },
    });

    let userUpdated;
    let finalUserName;

    if (existedUsers.length === 1) {
      // Lấy userName từ DB
      finalUserName = existedUsers[0].userName;
      userUpdated = await db.user.update({
        where: { id: existedUsers[0].id },
        data: { updatedAt: new Date() },
      });
    } else if (existedUsers.length > 1) {
      // Có nhiều user trùng, return lỗi 499
      return NextResponse.json(
        {
          statusCode: 499,
          message: "Có nhiều hơn 1 tài khoản. Vui lòng liên hệ admin",
          data: null,
        },
        { status: 499 },
      );
    } else {
      // Lần đầu login, dùng userName client truyền vào
      finalUserName = userName;
      try {
        userUpdated = await db.user.create({
          data: {
            ...(finalUserName ? { userName: finalUserName } : {}),
            userId: Number(userId),
            branch: branchFromCookie || "",
            stars: 0,
            magicStone: 0,
            rankId: 1,
            updatedAt: new Date(),
          },
        });
      } catch (error: any) {
        // Nếu lỗi duplicate (có thể do race condition), thử tìm lại user
        if (
          error.code === "P2002" ||
          error.message?.includes("Duplicate entry")
        ) {
          const retryUser = await db.user.findFirst({
            where: {
              userId: Number(userId),
              branch: branchFromCookie || "",
            },
          });
          if (retryUser) {
            finalUserName = retryUser.userName;
            userUpdated = await db.user.update({
              where: { id: retryUser.id },
              data: { updatedAt: new Date() },
            });
          }
        } else {
          throw error;
        }
      }
    }

    if (userUpdated) {
      const token = await signJWT({ userId: userUpdated?.userId });
      const response = NextResponse.json({
        ...userUpdated,
        statusCode: 200,
        message: "Login Success",
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
    return NextResponse.json(
      {
        statusCode: 401,
        message: "Login Failed",
        data: null,
      },
      { status: 401 },
    );
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json(
      {
        statusCode: 500,
        message: errorMessage,
        data: null,
      },
      { status: 500 },
    );
  }
}
