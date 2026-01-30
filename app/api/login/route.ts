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
import { getBranchFromCookie } from "@/lib/server-utils";

const expirationDuration = 1;

// Admin username from env
const ADMIN_USERNAME =
  process.env.ADMIN_USERNAME || process.env.NEXT_PUBLIC_ADMIN_USERNAME;
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

    const {
      userName,
      machineName,
      isAdmin,
      password,
      loginMethod,
      macAddress,
      currentMacAddress,
    } = JSON.parse(body);

    // Xử lý đăng nhập admin/staff
    if (isAdmin) {
      const loginTypeFromCookie = cookieStore.get("loginType")?.value;
      let loginType = loginTypeFromCookie || "username";
      let userId,
        role,
        staffUserName = ADMIN_USERNAME;
      let staffData: any = null;
      let branchFromMac = branchFromCookie; // Branch từ MAC address trong DB

      // Handle account login (username + password)
      if (loginMethod === "account" && password) {
        // Verify staff credentials
        const crypto = await import("crypto");

        const hashPassword = (pwd: string) => {
          return crypto.createHash("sha256").update(pwd).digest("hex");
        };

        // First, find staff by username only (to check if password reset is required)
        const staffByUsername = (await db.$queryRawUnsafe(
          `SELECT id, userName, fullName, branch, isDeleted, isAdmin, password, staffType FROM Staff 
           WHERE userName = ? AND isDeleted = false AND isAdmin = false`,
          userName,
        )) as any[];

        if (staffByUsername.length === 0) {
          return NextResponse.json(
            {
              statusCode: 401,
              message: "Tên đăng nhập hoặc mật khẩu không đúng",
              data: null,
            },
            { status: 401 },
          );
        }

        staffData = staffByUsername[0];

        // Check if password reset is required (password in DB is reset password hash)
        const resetPasswordHash = hashPassword(
          "RESET_PASSWORD_REQUIRED_" + staffData.id,
        );
        if (staffData.password === resetPasswordHash) {
          // Password has been reset, user needs to set new password
          // Don't require old password authentication
          return NextResponse.json(
            {
              statusCode: 403,
              message: "Vui lòng đặt mật khẩu mới",
              data: { requirePasswordReset: true, staffId: staffData.id },
            },
            { status: 403 },
          );
        }

        // If not reset password, verify password normally
        const hashedPassword = hashPassword(password);
        if (staffData.password !== hashedPassword) {
          return NextResponse.json(
            {
              statusCode: 401,
              message: "Tên đăng nhập hoặc mật khẩu không đúng",
              data: null,
            },
            { status: 401 },
          );
        }

        // Set branch from staff data
        if (staffData.branch) {
          loginType = "account";

          // For STAFF or MANAGER type, use real staffId and include staffType
          // For other types (admin, etc.), keep hardcoded values to avoid breaking existing logic
          if (
            staffData.staffType === "STAFF" ||
            staffData.staffType === "MANAGER" ||
            staffData.staffType === "SUPER_ADMIN" ||
            staffData.staffType === "BRANCH_ADMIN" ||
            staffData.staffType === "KITCHEN" ||
            staffData.staffType === "SECURITY" ||
            staffData.staffType === "CASHIER"
          ) {
            userId = staffData.id; // Use real staff ID
            role = "staff";
            staffUserName = staffData.userName;
          } else {
            // Keep hardcoded for other cases (backward compatibility)
            userId = -98; // Staff account login
            role = "staff";
            staffUserName = staffData.userName;
          }
        } else {
          return NextResponse.json(
            {
              statusCode: 401,
              message: "Staff account không có branch",
              data: null,
            },
            { status: 401 },
          );
        }
      } else if (
        loginMethod === "mac" ||
        (!loginMethod && loginTypeFromCookie === "mac")
      ) {
        // Handle MAC login - determine which case
        const hasMac = !!macAddress && macAddress.trim() !== "";
        // Check if username matches admin username (if ADMIN_USERNAME is set)
        // If ADMIN_USERNAME is not set, any username is considered admin username
        const isAdminUsername = ADMIN_USERNAME
          ? userName === ADMIN_USERNAME
          : !!userName && userName.trim() !== "";
        const hasUsername =
          userName && userName.trim() !== "" && isAdminUsername;
        const isAdminDebugLogin = hasMac && hasUsername; // Case 3: Cả MAC + Username
        const isStaffMacLogin = hasMac && !hasUsername; // Case 1: Chỉ MAC
        const isAdminOnlyLogin = !hasMac && hasUsername; // Case 2: Chỉ Username

        if (isStaffMacLogin) {
          // Case 1: Chỉ MAC Address trong admin-login → vẫn là admin
          // Bắt buộc phải có currentMacAddress để verify
          if (!currentMacAddress || currentMacAddress.trim() === "") {
            return NextResponse.json(
              {
                statusCode: 401,
                message: "Không thể lấy MAC address hiện tại của máy",
                data: null,
              },
              { status: 401 },
            );
          }

          // Normalize MAC addresses for comparison
          const normalizeMac = (mac: string) => {
            return mac.replace(/[:-]/g, "").toUpperCase();
          };

          const normalizedInput = normalizeMac(macAddress);
          const normalizedCurrent = normalizeMac(currentMacAddress);

          if (normalizedInput !== normalizedCurrent) {
            return NextResponse.json(
              {
                statusCode: 401,
                message:
                  "MAC address không khớp với MAC address hiện tại của máy",
                data: null,
              },
              { status: 401 },
            );
          }

          // Check MAC address từ DB và lấy branch
          const normalizedMacForDB = macAddress
            .replaceAll(":", "-")
            .toUpperCase();
          const computer = await db.$queryRawUnsafe<
            Array<{
              branch: string;
              name: string;
            }>
          >(
            `SELECT branch, name FROM Computer WHERE localIp = ? LIMIT 1`,
            normalizedMacForDB,
          );

          if (!computer || computer.length === 0) {
            return NextResponse.json(
              {
                statusCode: 401,
                message: "MAC address không được nhận diện trong hệ thống",
                data: null,
              },
              { status: 401 },
            );
          }

          const branchFromDB = computer[0].branch;
          branchFromMac = branchFromDB; // Lưu branch từ DB
          loginType = "mac";
          userId = -99; // Admin user ID
          role = "admin"; // Admin role cho admin-login
        } else if (isAdminDebugLogin) {
          // Case 3: Cả MAC + Username (admin) → admin
          // Bypass MAC check vì đây là admin debug login
          // Chỉ cần check MAC từ DB để lấy branch (nếu có)
          const normalizedMacForDB = macAddress
            .replaceAll(":", "-")
            .toUpperCase();
          const computer = await db.$queryRawUnsafe<
            Array<{
              branch: string;
              name: string;
            }>
          >(
            `SELECT branch, name FROM Computer WHERE localIp = ? LIMIT 1`,
            normalizedMacForDB,
          );

          let branchFromDB = branchFromCookie;
          if (computer && computer.length > 0) {
            branchFromDB = computer[0].branch;
            branchFromMac = branchFromDB; // Lưu branch từ DB
          }

          loginType = "mac";
          userId = -99; // Admin user ID
          role = "admin"; // Admin role cho admin-login
        } else if (isAdminOnlyLogin) {
          // Case 2: Chỉ Username (admin) - không cần MAC, không cần password
          loginType = loginTypeFromCookie || "username";
          userId = -99;
          role = "admin";
        } else {
          return NextResponse.json(
            {
              statusCode: 400,
              message: "Vui lòng nhập MAC address hoặc Username",
              data: null,
            },
            { status: 400 },
          );
        }
      } else if (userName === ADMIN_USERNAME && !macAddress && !loginMethod) {
        // Case 2: Chỉ Username (admin) - fallback khi không có loginMethod
        loginType = loginTypeFromCookie || "username";
        userId = -99;
        role = "admin";
      } else {
        return NextResponse.json(
          {
            statusCode: 401,
            message: "Invalid admin credentials",
            data: null,
          },
          { status: 401 },
        );
      }

      // Determine branch
      let finalBranch = branchFromCookie;
      if (loginMethod === "account" && staffData && staffData.branch) {
        finalBranch = staffData.branch;
      } else if (
        (loginMethod === "mac" || loginType === "mac") &&
        branchFromMac
      ) {
        // Branch đã được set từ DB ở trên
        finalBranch = branchFromMac;
      } else if (!finalBranch) {
        finalBranch = "GO_VAP";
      }

      // Get work shifts for the branch
      let workShifts: any[] = [];
      try {
        const shifts = (await db.$queryRaw`
          SELECT 
            id,
            name,
            startTime,
            endTime,
            isOvernight,
            branch,
            FnetStaffId,
            FfoodStaffId,
            createdAt,
            updatedAt
          FROM WorkShift
          WHERE branch = ${finalBranch}
          ORDER BY 
            CASE name
              WHEN 'CA_SANG' THEN 1
              WHEN 'CA_CHIEU' THEN 2
              WHEN 'CA_TOI' THEN 3
              ELSE 4
            END
        `) as any[];

        // Format time fields to HH:mm:ss format
        workShifts = shifts.map((shift) => {
          const formatTime = (time: Date | string) => {
            if (!time) return null;
            const date = typeof time === "string" ? new Date(time) : time;
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const seconds = date.getSeconds().toString().padStart(2, "0");
            return `${hours}:${minutes}:${seconds}`;
          };

          return {
            ...shift,
            startTime: formatTime(shift.startTime),
            endTime: formatTime(shift.endTime),
          };
        });
      } catch (error) {
        console.error("Error fetching work shifts:", error);
        // Don't fail login if work shifts fetch fails
        workShifts = []; // Ensure workShifts is always an array
      }
      
      console.log(`[Login] Fetched ${workShifts.length} work shifts for branch ${finalBranch}`);

      const adminData: any = {
        userId: userId,
        id: userId,
        userName: staffUserName,
        role: role,
        loginType: loginType,
        branch: finalBranch,
        workShifts: workShifts,
      };

      // Add staffType and staffId for STAFF/MANAGER types (only for account login)
      if (
        loginMethod === "account" &&
        staffData &&
        (staffData.staffType === "STAFF" ||
          staffData.staffType === "MANAGER" ||
          staffData.staffType === "SUPER_ADMIN" ||
          staffData.staffType === "BRANCH_ADMIN" ||
          staffData.staffType === "KITCHEN" ||
          staffData.staffType === "SECURITY" ||
          staffData.staffType === "CASHIER")
      ) {
        adminData.staffType = staffData.staffType;
        adminData.staffId = staffData.id;
      }

      const token = await signJWT(adminData);
      const response = NextResponse.json({
        ...adminData,
        statusCode: 200,
        message: "Login Success",
      });

      // For admin routes, always use "token" cookie
      // Only use "staffToken" for staff login (role === "staff" and loginMethod === "account")
      // Admin login (role === "admin" or userId === -99) should always use "token"
      const isAdmin = role === "admin" || userId === -99;
      const tokenCookieName = isAdmin ? "token" : (loginMethod === "account" ? "staffToken" : "token");

      response.cookies.set({
        name: tokenCookieName,
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

      // Set branch cookie nếu chưa có hoặc đã thay đổi hoặc login bằng MAC
      if (
        !branchFromCookie ||
        (loginMethod === "account" && staffData && staffData.branch) ||
        (loginMethod === "mac" && branchFromMac)
      ) {
        response.cookies.set({
          name: "branch",
          value: finalBranch || "GO_VAP",
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
              message: `Quá nhiều tài khoản được tạo trong chi nhánh này. Vui lòng thử lại sau 1 giờ. (${dbRateLimit.count}/50)`,
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

          // Get work shifts for the branch
          let workShifts: any[] = [];
          try {
            const shifts = (await db.$queryRaw`
              SELECT 
                id,
                name,
                startTime,
                endTime,
                isOvernight,
                branch,
                FnetStaffId,
                FfoodStaffId,
                createdAt,
                updatedAt
              FROM WorkShift
              WHERE branch = ${branchFromCookie || ""}
              ORDER BY 
                CASE name
                  WHEN 'CA_SANG' THEN 1
                  WHEN 'CA_CHIEU' THEN 2
                  WHEN 'CA_TOI' THEN 3
                  ELSE 4
                END
            `) as any[];

            // Format time fields to HH:mm:ss format
            workShifts = shifts.map((shift) => {
              const formatTime = (time: Date | string) => {
                if (!time) return null;
                const date = typeof time === "string" ? new Date(time) : time;
                const hours = date.getHours().toString().padStart(2, "0");
                const minutes = date.getMinutes().toString().padStart(2, "0");
                const seconds = date.getSeconds().toString().padStart(2, "0");
                return `${hours}:${minutes}:${seconds}`;
              };

              return {
                ...shift,
                startTime: formatTime(shift.startTime),
                endTime: formatTime(shift.endTime),
              };
            });
          } catch (error) {
            console.error("Error fetching work shifts:", error);
            // Don't fail login if work shifts fetch fails
          }

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
            workShifts: workShifts,
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

    // Get work shifts for the branch
    let workShifts: any[] = [];
    try {
      const shifts = (await db.$queryRaw`
        SELECT 
          id,
          name,
          startTime,
          endTime,
          isOvernight,
          branch,
          FnetStaffId,
          FfoodStaffId,
          createdAt,
          updatedAt
        FROM WorkShift
        WHERE branch = ${branchFromCookie || ""}
        ORDER BY 
          CASE name
            WHEN 'CA_SANG' THEN 1
            WHEN 'CA_CHIEU' THEN 2
            WHEN 'CA_TOI' THEN 3
            ELSE 4
          END
      `) as any[];

      // Format time fields to HH:mm:ss format
      workShifts = shifts.map((shift) => {
        const formatTime = (time: Date | string) => {
          if (!time) return null;
          const date = typeof time === "string" ? new Date(time) : time;
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          const seconds = date.getSeconds().toString().padStart(2, "0");
          return `${hours}:${minutes}:${seconds}`;
        };

        return {
          ...shift,
          startTime: formatTime(shift.startTime),
          endTime: formatTime(shift.endTime),
        };
      });
    } catch (error) {
      console.error("Error fetching work shifts:", error);
      // Don't fail login if work shifts fetch fails
      workShifts = []; // Ensure workShifts is always an array
    }
    
    console.log(`[Login] Fetched ${workShifts.length} work shifts for branch ${branchFromCookie || ""}`);

    const token = await signJWT({ userId: String(userUpdated?.userId ?? "") });
    const responseData = {
      statusCode: 200,
      message: "Login Success",
      ...userCalculatorData, // Trả về trực tiếp userCalculatorData
      isNewUser: userCreationInfo.isNewUser,
      recordDate: userCreationInfo.recordDate,
      isReturnedUser: userCreationInfo.isReturnedUser,
      lastLoginDate: userCreationInfo.lastLoginDate,
      workShifts: workShifts,
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
