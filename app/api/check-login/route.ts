import { NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request, res: Response): Promise<any> {
  const cookieStore = await cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  try {
    const body = await req.text();
    console.log("Check-login request body:", body);

    const { userName, machineName, isAdmin } = JSON.parse(body);

    // Xử lý check admin
    if (isAdmin) {
      console.log("Processing admin check for user:", userName);
      if (userName !== "gateway_admin") {
        console.log("Admin check failed: Invalid username");
        return NextResponse.json(
          {
            statusCode: 401,
            message: "Invalid admin credentials",
            data: null,
          },
          { status: 401 },
        );
      }

      return NextResponse.json({
        statusCode: 200,
        message: "Admin check successful",
        data: {
          userId: "admin",
          id: "admin",
          userName: "gateway_admin",
          role: "admin",
        },
      });
    }

    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    const query = fnetPrisma.sql`SELECT userId
                                 FROM fnet.systemlogtb AS t1
                                 WHERE t1.MachineName = ${machineName}
                                 ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC
                                   LIMIT 1`;

    const user: any = await fnetDB.$queryRaw<any>(query);

    console.log("user", user);

    // const userId = user[0]?.userId ?? null;
    const userId = 529;


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

    const currentUsers = await db.user.findMany({
      where: {
        userId: Number(userId),
        branch: branchFromCookie,
      },
    });

    if (!currentUsers.length) {
      console.error('Không tìm thấy user với userId:', userId, 'branch:', branchFromCookie);
      return NextResponse.json(
        {
          statusCode: 404,
          message: 'Không tìm thấy user với userId và branch hiện tại.',
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

    let allUsers: any[] = [...currentUsers];

    if (validUserNames.length > 0) {
      const usersByUsername = await db.user.findMany({
        where: {
          userName: { in: validUserNames },
        },
      });

      const uniqueBranches = new Set(usersByUsername.map((user) => user.branch));
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
        ...new Map([...currentUsers, ...usersByUsername].map((user) => [user.id, user])).values(),
      ];
    }

    if (!allUsers.length) {
      console.error('allUsers rỗng sau merge, userId:', userId, 'branch:', branchFromCookie);
      return NextResponse.json(
        {
          statusCode: 404,
          message: 'Không tìm thấy user sau khi merge.',
          data: null,
        },
        { status: 404 },
      );
    }

    // Tính lại stars từ UserStarHistory cho userId hiện tại (base cho migration, không update DB)
    let starsCalculated = null;
    if (userId) {
      const histories = await db.userStarHistory.findMany({
        where: {
          userId: Number(userId),
          branch: branchFromCookie,
        },
        select: {
          type: true,
          oldStars: true,
          newStars: true,
        },
      });
      const { checkIn, game, reward } = histories.reduce(
        (acc, h) => {
          if (h.type === "CHECK_IN") acc.checkIn += 1000;
          else if (h.type === "GAME") acc.game += (h.newStars ?? 0) - (h.oldStars ?? 0);
          else if (h.type === "REWARD") acc.reward += (h.oldStars ?? 0) - (h.newStars ?? 0);
          return acc;
        },
        { checkIn: 0, game: 0, reward: 0 }
      );
      let total = checkIn + game - reward;
      if (total < 0) total = 0;
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
        users: allUsers.map(user => ({
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
          branches: [...new Set(allUsers.map(user => user.branch))],
          totalStars: allUsers.reduce((sum, user) => sum + user.stars, 0),
          totalMagicStones: allUsers.reduce((sum, user) => sum + user.magicStone, 0),
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