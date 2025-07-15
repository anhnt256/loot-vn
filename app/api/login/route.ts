import { NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import dayjs from "@/lib/dayjs";
import {
  checkUserCreationRateLimit,
  checkLoginRateLimit,
  checkDatabaseRateLimit,
} from "@/lib/rate-limit";
import { getDebugUserId, logDebugInfo } from "@/lib/debug-utils";
import { calculateActiveUsersInfo } from "@/lib/user-calculator";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

export async function POST(req: Request, res: Response): Promise<any> {
  const cookieStore = await cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  try {
    const body = await req.text();

    const { userName, machineName, isAdmin } = JSON.parse(body);

    // Xử lý đăng nhập admin
    if (isAdmin) {
      if (userName !== "gateway_admin") {
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

      return response;
    }

    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    // Rate limiting cho đăng nhập
    const loginRateLimit = await checkLoginRateLimit(machineName);
    if (!loginRateLimit.allowed) {
      const resetTime = new Date(loginRateLimit.resetTime).toLocaleString(
        "vi-VN",
      );
      return NextResponse.json(
        {
          statusCode: 429,
          message: `Quá nhiều lần đăng nhập. Vui lòng thử lại sau ${resetTime}`,
          data: null,
        },
        { status: 429 },
      );
    }

    const query = fnetPrisma.sql`SELECT userId
                                 FROM fnet.systemlogtb AS t1
                                 WHERE t1.MachineName = ${machineName}
                                 ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC
                                   LIMIT 1`;

    const user: any = await fnetDB.$queryRaw<any>(query);

    const originalUserId = user[0]?.userId ?? null;
    const userId = getDebugUserId(originalUserId);

    logDebugInfo("login", {
      userName,
      machineName,
      branchFromCookie,
      originalUserId,
      userId,
    });

    // Kiểm tra user đã tồn tại trong hệ thống
    const existingUser = await db.user.findFirst({
      where: {
        userId: Number(userId),
        branch: branchFromCookie,
      },
    });

    let userUpdated;

    if (!existingUser) {
      // Nếu có username, tạo user mới
      if (userName && userName.trim()) {
        // Validation username
        const trimmedUsername = userName.trim();

        // Kiểm tra độ dài username (3-20 ký tự)
        if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
          return NextResponse.json(
            {
              statusCode: 400,
              message: "Username phải có độ dài từ 3-20 ký tự",
              data: null,
            },
            { status: 400 },
          );
        }

        // Kiểm tra ký tự đặc biệt (chỉ cho phép chữ cái, số, dấu gạch dưới)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(trimmedUsername)) {
          return NextResponse.json(
            {
              statusCode: 400,
              message: "Username chỉ được chứa chữ cái, số và dấu gạch dưới",
              data: null,
            },
            { status: 400 },
          );
        }

        // Kiểm tra từ khóa bị cấm
        const bannedKeywords = [
          "admin",
          "administrator",
          "root",
          "system",
          "test",
          "demo",
          "guest",
          "user",
          "player",
          "game",
          "gateway",
          "fnet",
          "computer",
          "machine",
          "server",
          "bot",
          "spam",
          "hack",
          "crack",
          "null",
          "undefined",
        ];

        const lowerUsername = trimmedUsername.toLowerCase();
        if (bannedKeywords.some((keyword) => lowerUsername.includes(keyword))) {
          return NextResponse.json(
            {
              statusCode: 400,
              message:
                "Username chứa từ khóa không được phép. Vui lòng liên hệ admin để được hỗ trợ",
              data: null,
            },
            { status: 400 },
          );
        }

        // Rate limiting cho việc tạo user mới
        const userCreationRateLimit = await checkUserCreationRateLimit(
          machineName,
          branchFromCookie || "",
        );
        if (!userCreationRateLimit.allowed) {
          const resetTime = new Date(
            userCreationRateLimit.resetTime,
          ).toLocaleString("vi-VN");
          return NextResponse.json(
            {
              statusCode: 429,
              message: `Quá nhiều tài khoản được tạo từ máy này. Vui lòng thử lại sau ${resetTime}`,
              data: null,
            },
            { status: 429 },
          );
        }

        // Kiểm tra rate limit từ database (persistent)
        const dbRateLimit = await checkDatabaseRateLimit(
          branchFromCookie || "",
        );
        if (!dbRateLimit.allowed) {
          return NextResponse.json(
            {
              statusCode: 429,
              message: `Quá nhiều tài khoản được tạo trong chi nhánh này. Vui lòng thử lại sau 1 giờ. (${dbRateLimit.count}/10)`,
              data: null,
            },
            { status: 429 },
          );
        }

        // Kiểm tra username đã tồn tại chưa
        const existingUsername = await db.user.findFirst({
          where: {
            userName: trimmedUsername,
            branch: branchFromCookie,
          },
        });

        if (existingUsername) {
          return NextResponse.json(
            {
              statusCode: 409,
              message: "Username đã tồn tại trong hệ thống",
              data: null,
            },
            { status: 409 },
          );
        }

        // Tạo user mới
        try {
          userUpdated = await db.user.create({
            data: {
              userName: trimmedUsername,
              userId: Number(userId),
              branch: branchFromCookie || "",
              rankId: 1,
              stars: 0,
              magicStone: 0,
              createdAt: dayjs().tz("Asia/Ho_Chi_Minh").toISOString(),
            },
          });

          // Gọi user-calculator để lấy thông tin chi tiết
          let userCalculatorData = null;
          try {
            const calculatorResults = await calculateActiveUsersInfo(
              [Number(userId)],
              branchFromCookie || "",
            );
            if (calculatorResults.length > 0) {
              userCalculatorData = calculatorResults[0];
            }
          } catch (calculatorError) {
            console.error("Error calling user-calculator:", calculatorError);
            // Không fail login nếu user-calculator lỗi
          }

          console.log('userCalculatorData', userCalculatorData)

          // Nếu không có userCalculatorData, trả về lỗi
          if (!userCalculatorData) {
            return NextResponse.json(
              {
                statusCode: 500,
                message:
                  "Không lấy được thông tin user, vui lòng đăng nhập lại.",
              },
              { status: 500 },
            );
          }

          // Trả về thông tin user mới tạo
          const token = await signJWT({
            userId: String(userUpdated.userId ?? ""),
          });
          const responseData = {
            statusCode: 200,
            message: "Login Success",
            ...userCalculatorData, // Trả về trực tiếp userCalculatorData
          };
          const response = NextResponse.json(responseData);

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
          console.error("Error creating user:", error);
          return NextResponse.json(
            {
              statusCode: 500,
              message: "Lỗi khi tạo tài khoản",
              data: null,
            },
            { status: 500 },
          );
        }
      } else {
        return NextResponse.json(
          {
            statusCode: 404,
            message: "User not found",
            data: null,
          },
          { status: 404 },
        );
      }
    } else {
      // Cập nhật thông tin user nếu cần
      userUpdated = await db.user.update({
        where: { id: existingUser.id },
        data: {
          userId: userId,
        },
      });
    }

    // Gọi user-calculator để lấy thông tin chi tiết cho user đã tồn tại
    let userCalculatorData = null;
    try {
      const calculatorResults = await calculateActiveUsersInfo(
        [Number(userId)],
        branchFromCookie || "",
      );

      if (calculatorResults.length > 0) {
        userCalculatorData = calculatorResults[0];
      }
    } catch (calculatorError) {
      console.error("Error calling user-calculator:", calculatorError);
      // Không fail login nếu user-calculator lỗi
    }

    // Nếu không có userCalculatorData, trả về lỗi
    if (!userCalculatorData) {
      return NextResponse.json(
        {
          statusCode: 500,
          message: "Không lấy được thông tin user, vui lòng đăng nhập lại.",
        },
        { status: 500 },
      );
    }

    const token = await signJWT({ userId: String(userUpdated?.userId ?? "") });
    const responseData = {
      statusCode: 200,
      message: "Login Success",
      ...userCalculatorData, // Trả về trực tiếp userCalculatorData
    };
    const response = NextResponse.json(responseData);

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
