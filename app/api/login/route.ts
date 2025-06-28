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
        return NextResponse.json({ 
          statusCode: 401,
          message: "Invalid admin credentials",
          data: null
        }, { status: 401 });
      }

      const adminData = {
        userId: "admin",
        id: "admin",
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

    // Kiểm tra user đã tồn tại trong hệ thống
    const existingUser = await db.user.findFirst({
      where: {
        userId: Number(userId),
        branch: branchFromCookie,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ 
        statusCode: 404,
        message: "User not found",
        data: null
      }, { status: 404 });
    }

    // Cập nhật thông tin user nếu cần
    const userUpdated = await db.user.update({
      where: { id: existingUser.id },
      data: {
        userId: userId,
      },
    });

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
