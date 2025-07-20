import { NextRequest, NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branchFromCookie = cookieStore.get("branch")?.value;

    if (!branchFromCookie) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Branch cookie is required",
          data: null,
        },
        { status: 400 },
      );
    }

    const { userName, machineName } = await req.json();

    if (!userName && !machineName) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "userName hoặc machineName là bắt buộc",
          data: null,
        },
        { status: 400 },
      );
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

    const targetUserId = userId;

    let allUsers: any[] = [];

    if (userName && machineName) {
      const usersWithSameUsername = await db.$queryRaw<any[]>`
        SELECT * FROM User 
        WHERE userName = ${userName}
      `;

      console.log("Users with same username:", usersWithSameUsername.length);

      allUsers = [...usersWithSameUsername];
    } else {
      if (!userId) {
        return NextResponse.json(
          {
            statusCode: 404,
            message: "Không tìm thấy userId từ machineName",
            data: null,
          },
          { status: 404 },
        );
      }

      const currentUsers = await db.$queryRaw<any[]>`
        SELECT * FROM User 
        WHERE userId = ${Number(userId)} 
        AND branch = ${branchFromCookie}
      `;

      if (!currentUsers.length) {
        console.error(
          "Không tìm thấy user với userId:",
          userId,
          "branch:",
          branchFromCookie,
        );
        return NextResponse.json(
          {
            statusCode: 404,
            message: "Không tìm thấy user với userId và branch hiện tại.",
            data: null,
          },
          { status: 404 },
        );
      }

      const validUserNames = currentUsers
        .map((user) => user.userName)
        .filter(
          (userName): userName is string =>
            userName !== null && userName.trim() !== "",
        );

      allUsers = [...currentUsers];

      if (validUserNames.length > 0) {
        const usernamesString = validUserNames
          .map((name) => `'${name}'`)
          .join(",");
        const usersByUsername = await db.$queryRawUnsafe<any[]>(`
          SELECT * FROM User 
          WHERE userName IN (${usernamesString})
        `);

        const uniqueBranches = new Set(
          usersByUsername.map((user) => user.branch),
        );
        if (uniqueBranches.size > 1) {
          return NextResponse.json(
            {
              statusCode: 499,
              message: "Duplicate account detected",
              data: {
                users: usersByUsername,
                branches: Array.from(uniqueBranches),
              },
            },
            { status: 499 },
          );
        }

        allUsers = [
          ...new Map(
            [...currentUsers, ...usersByUsername].map((user) => [
              user.id,
              user,
            ]),
          ).values(),
        ];
      }

      if (!allUsers.length) {
        return NextResponse.json(
          {
            statusCode: 404,
            message: "Không tìm thấy user sau khi merge.",
            data: null,
          },
          { status: 404 },
        );
      }
    }
    // const userId = 2811;

    // Tính lại stars từ UserStarHistory cho userId hiện tại (base cho migration, không update DB)
    let starsCalculated = null;
    if (userId) {
      const histories = await db.$queryRaw<any[]>`
        SELECT type, oldStars, newStars FROM UserStarHistory 
        WHERE userId = ${Number(userId)} 
        AND branch = ${branchFromCookie}
        AND createdAt >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
      `;
      const { checkIn, game, reward } = histories.reduce(
        (acc, h) => {
          if (h.type === "CHECK_IN")
            acc.checkIn += (h.newStars ?? 0) - (h.oldStars ?? 0);
          else if (h.type === "GAME")
            acc.game += (h.newStars ?? 0) - (h.oldStars ?? 0);
          else if (h.type === "REWARD")
            acc.reward += (h.oldStars ?? 0) - (h.newStars ?? 0);
          return acc;
        },
        { checkIn: 0, game: 0, reward: 0 },
      );
      const total = checkIn + game - reward;
      starsCalculated = total;
    }

    // Trả về danh sách tất cả user có username trùng với tài khoản hiện tại
    return NextResponse.json({
      statusCode: 200,
      message: "Check login successful",
      data: {
        userId: userId,
        currentBranch: branchFromCookie,
        totalUsers: allUsers.length,
        users: allUsers.map((user) => ({
          id: user.id,
          userId: user.userId,
          userName: user.userName,
          branch: user.branch,
          stars: user.stars,
          magicStone: user.magicStone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        starsCalculated, // Thông tin stars tính lại cho userId hiện tại
        // Thông tin để migrate thủ công
        migrationInfo: {
          hasMultipleUsers: allUsers.length > 1,
          branches: [...new Set(allUsers.map((user) => user.branch))],
          totalStars: allUsers.reduce((sum, user) => sum + user.stars, 0),
          totalMagicStones: allUsers.reduce(
            (sum, user) => sum + user.magicStone,
            0,
          ),
        },
      },
    });
  } catch (error) {
    console.error("Check-login error:", error);
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
