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
import { isNewUser } from "@/lib/timezone-utils";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

/**
 * Check xem user có phải user cũ quay trở lại không
 * Logic: Lấy 2 NGÀY khác nhau gần nhất từ systemlogtb
 * - Nếu 2 ngày cách nhau >= 30 ngày -> user cũ quay trở lại
 * - Nếu < 30 ngày -> user thường xuyên
 */
async function checkIsReturnedUser(
  userId: number,
  fnetDB: any,
): Promise<{ isReturned: boolean; daysSinceLastSession: number | null }> {
  try {
    // Lấy 2 NGÀY DISTINCT gần nhất (status = 3 là đã logout/hoàn thành)
    const recentDates = (await fnetDB.$queryRawUnsafe(`
      SELECT 
        EnterDate,
        COUNT(*) as sessionsOnThisDay
      FROM systemlogtb
      WHERE UserId = ${userId}
        AND status = 3
      GROUP BY EnterDate
      ORDER BY EnterDate DESC
      LIMIT 2
    `)) as any[];

    if (recentDates.length < 2) {
      // Chưa đủ 2 ngày khác nhau để so sánh
      return { isReturned: false, daysSinceLastSession: null };
    }

    const latestDate = new Date(recentDates[0].EnterDate);
    const previousDate = new Date(recentDates[1].EnterDate);
    const daysDiff = Math.floor(
      (latestDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    console.log(
      `User ${userId} - Latest login date: ${recentDates[0].EnterDate}, Previous login date: ${recentDates[1].EnterDate}, Days diff: ${daysDiff}`,
    );

    return {
      isReturned: daysDiff >= 30,
      daysSinceLastSession: daysDiff,
    };
  } catch (error) {
    console.error("Error checking returned user:", error);
    return { isReturned: false, daysSinceLastSession: null };
  }
}

// Helper function để lấy thông tin RecordDate và LastLoginDate từ fnet DB
async function getUserCreationInfo(
  userId: number,
  branch: string,
): Promise<{
  isNewUser: boolean;
  recordDate: string | null;
  isReturnedUser: boolean;
  lastLoginDate: string | null;
}> {
  try {
    const fnetDB = await getFnetDB();

    // Query để lấy RecordDate và LastLoginDate từ usertb table trong fnet DB
    const userRecord = await fnetDB.$queryRaw<any[]>`
      SELECT RecordDate, LastLoginDate 
      FROM fnet.usertb 
      WHERE UserId = ${userId}
      LIMIT 1
    `;

    if (!userRecord || userRecord.length === 0) {
      console.log(`User ${userId} not found in fnet.usertb`);
      return {
        isNewUser: false,
        recordDate: null,
        isReturnedUser: false,
        lastLoginDate: null,
      };
    }

    const recordDate = userRecord[0].RecordDate;
    const lastLoginDate = userRecord[0].LastLoginDate;
    const isNew = isNewUser(recordDate);

    // Check if user is a returned user - dùng logic 2 ngày distinct từ systemlogtb
    const returnedUserInfo = await checkIsReturnedUser(userId, fnetDB);

    const daysSinceCreation = dayjs().diff(dayjs(recordDate), "day");
    console.log(
      `User ${userId} - RecordDate: ${recordDate}, Days since creation: ${daysSinceCreation}, isNewUser: ${isNew}, isReturnedUser: ${returnedUserInfo.isReturned}`,
    );

    return {
      isNewUser: isNew, // Sử dụng giá trị thực từ isNewUser function
      recordDate: recordDate ? dayjs(recordDate).format("YYYY-MM-DD") : null,
      isReturnedUser: returnedUserInfo.isReturned,
      lastLoginDate: lastLoginDate
        ? dayjs(lastLoginDate).format("YYYY-MM-DD")
        : null,
    };
  } catch (error) {
    console.error("Error getting user creation info:", error);
    return {
      isNewUser: false,
      recordDate: null,
      isReturnedUser: false,
      lastLoginDate: null,
    };
  }
}

export async function POST(req: Request, res: Response): Promise<any> {
  const cookieStore = await cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  try {
    const body = await req.text();

    const { userName, machineName, isAdmin } = JSON.parse(body);

    // Xử lý đăng nhập admin/staff
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

      // Check loginType to determine if this is admin or staff
      const loginTypeFromCookie = cookieStore.get("loginType")?.value;
      const loginType = loginTypeFromCookie || "username";

      console.log("Admin login - loginType from cookie:", loginTypeFromCookie);
      console.log("Admin login - branch from cookie:", branchFromCookie);
      console.log("Admin login - final loginType:", loginType);
      let userId, role;

      if (loginType === "username") {
        // Admin login
        userId = -99;
        role = "admin";
      } else if (loginType === "mac") {
        // Staff login - determine userId based on branch
        if (branchFromCookie === "GO_VAP") {
          userId = -98; // Staff GO_VAP
        } else if (branchFromCookie === "TAN_PHU") {
          userId = -97; // Staff TAN_PHU
        } else {
          userId = -99; // Default to admin if branch not recognized
        }
        role = "staff";
      } else {
        userId = -99; // Default to admin
        role = "admin";
      }

      const adminData = {
        userId: userId,
        id: userId,
        userName: "gateway_admin",
        role: role,
        loginType: loginType,
        branch: branchFromCookie,
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

      // Set loginType cookie
      response.cookies.set({
        name: "loginType",
        value: loginType,
        maxAge: 86400,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      // Set branch cookie nếu chưa có (cho admin đăng nhập bằng username)
      if (!branchFromCookie) {
        response.cookies.set({
          name: "branch",
          value: "GO_VAP",
          maxAge: 86400,
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });
      }

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

    const userId = user[0]?.userId ?? null;

    logDebugInfo("login", {
      userName,
      machineName,
      branchFromCookie,
      userId,
    });

    // Kiểm tra user đã tồn tại trong hệ thống
    const existingUser = await db.$queryRaw<any[]>`
      SELECT * FROM User 
      WHERE userId = ${Number(userId)} 
      AND branch = ${branchFromCookie}
      LIMIT 1
    `;

    let userUpdated;

    if (existingUser.length === 0) {
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
        const existingUsername = await db.$queryRaw<any[]>`
          SELECT * FROM User 
          WHERE userName = ${trimmedUsername} 
          AND branch = ${branchFromCookie}
          LIMIT 1
        `;

        if (existingUsername.length > 0) {
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
          await db.$executeRaw`
            INSERT INTO User (userName, userId, branch, rankId, stars, magicStone, createdAt, updatedAt)
            VALUES (
              ${trimmedUsername},
              ${Number(userId)},
              ${branchFromCookie || ""},
              ${1},
              ${0},
              ${0},
              NOW(),
              NOW()
            )
          `;

          // Get the created user
          const newUser = await db.$queryRaw<any[]>`
            SELECT * FROM User 
            WHERE userName = ${trimmedUsername} 
            AND branch = ${branchFromCookie || ""}
            ORDER BY id DESC
            LIMIT 1
          `;
          userUpdated = newUser[0];

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

          console.log("userCalculatorData", userCalculatorData);

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

          // Lấy thông tin user mới từ fnet DB
          const userCreationInfo = await getUserCreationInfo(
            Number(userId),
            branchFromCookie || "",
          );

          // Trả về thông tin user mới tạo
          const token = await signJWT({
            userId: String(userUpdated.userId ?? ""),
          });
          const responseData = {
            statusCode: 200,
            message: "Login Success",
            ...userCalculatorData, // Trả về trực tiếp userCalculatorData
            isNewUser: userCreationInfo.isNewUser,
            recordDate: userCreationInfo.recordDate,
            isReturnedUser: userCreationInfo.isReturnedUser,
            lastLoginDate: userCreationInfo.lastLoginDate,
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
      const currentUser = existingUser[0];

      // Cập nhật thông tin user nếu cần
      const updateFields = [];
      const updateValues = [];

      // Always update userId and updatedAt
      updateFields.push("userId = ?");
      updateValues.push(userId);
      updateFields.push("updatedAt = NOW()");

      // If userName is provided and current userName is empty, update userName
      if (
        userName &&
        userName.trim() &&
        (!currentUser.userName || currentUser.userName.trim() === "")
      ) {
        updateFields.push("userName = ?");
        updateValues.push(userName.trim());
      }

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE User SET ${updateFields.join(", ")} WHERE id = ?`;
        await db.$executeRawUnsafe(
          updateQuery,
          ...updateValues,
          currentUser.id,
        );
      }

      // Get the updated user
      const updatedUser = await db.$queryRaw<any[]>`
        SELECT * FROM User 
        WHERE id = ${existingUser[0].id}
        LIMIT 1
      `;
      userUpdated = updatedUser[0];
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

    // Lấy thông tin user mới từ fnet DB
    const userCreationInfo = await getUserCreationInfo(
      Number(userId),
      branchFromCookie || "",
    );

    const token = await signJWT({ userId: String(userUpdated?.userId ?? "") });
    const responseData = {
      statusCode: 200,
      message: "Login Success",
      ...userCalculatorData, // Trả về trực tiếp userCalculatorData
      isNewUser: userCreationInfo.isNewUser,
      recordDate: userCreationInfo.recordDate,
      isReturnedUser: userCreationInfo.isReturnedUser,
      lastLoginDate: userCreationInfo.lastLoginDate,
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
