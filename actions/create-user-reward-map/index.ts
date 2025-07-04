"use server";

import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateUserRewardMap } from "./schema";
import { InputType } from "./type";
import dayjs from "@/lib/dayjs";
import { NextResponse } from "next/server";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

const handler = async (data: InputType): Promise<any> => {
  const {
    currentUserId,
    userId,
    rewardId,
    duration = 7,
    isUsed = true,
    value,
    branch,
    oldStars,
    newStars,
  } = data;
  let createUserRewardMap;

  const promotion = await db.promotionCode.findFirst({
    where: { value, branch, isUsed: false },
  });

  const user = await db.user.findFirst({
    where: { userId, branch },
  });

  // Check last claim time
  const lastClaim = await db.userRewardMap.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (lastClaim && lastClaim.createdAt) {
    const lastClaimTime = new Date(lastClaim.createdAt).getTime();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    if (lastClaimTime > fiveMinutesAgo) {
      return {
        error: "Please wait 5 minutes between claims.",
      };
    }
  }

  if (promotion && user) {
    const { stars } = user;
    if (stars - value < 0) {
      return {
        error: "Failed to create.",
      };
    }

    const fnetDB = await getFnetDB();

    try {
      await db.$transaction(async (tx) => {
        const { id } = promotion;

        await tx.promotionCode.update({
          where: {
            id,
          },
          data: {
            isUsed: false,
            updatedAt: dayjs().tz("Asia/Ho_Chi_Minh").toISOString(),
          },
        });

        const fnetUser = await fnetDB.usertb.findFirst({
          where: {
            UserId: userId,
          },
          select: {
            UserId: true,
            RemainMoney: true,
          },
        });

        if (fnetUser) {
          const today = new Date();
          today.setFullYear(today.getFullYear() - 20);
          const todayFormatted =
            today.toISOString().split("T")[0] + "T00:00:00.000Z";

          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 10);
          const expiryDateFormatted =
            expiryDate.toISOString().split("T")[0] + "T00:00:00.000Z";

          await fnetDB.usertb.update({
            where: {
              UserId: userId,
            },
            data: {
              RemainMoney: Number(fnetUser.RemainMoney) + Number(value),
              Birthdate: todayFormatted,
              ExpiryDate: expiryDateFormatted,
            },
          });
        }

        createUserRewardMap = await tx.userRewardMap.create({
          data: {
            userId,
            rewardId,
            promotionCodeId: id,
            duration,
            isUsed,
            branch,
            createdAt: dayjs().tz("Asia/Ho_Chi_Minh").toISOString(),
          },
        });

        if (createUserRewardMap) {
          await tx.user.update({
            where: {
              id: currentUserId,
            },
            data: {
              stars: newStars,
              updatedAt: dayjs().tz("Asia/Ho_Chi_Minh").toISOString(),
            },
          });

          await tx.userStarHistory.create({
            data: {
              userId,
              type: "REWARD",
              oldStars,
              newStars,
              targetId: rewardId,
              createdAt: dayjs().tz("Asia/Ho_Chi_Minh").toISOString(),
              branch,
            },
          });
        }
      });
    } catch (error) {
      console.log("error", error);
      return {
        error: "Failed to create.",
      };
    }
  }

  return { data: createUserRewardMap };
};

// export const createUserRewardMap = createSafeAction(
//   CreateUserRewardMap,
//   handler,
// );

export async function POST(req: Request, res: Response): Promise<any> {
  const cookieStore = await cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  try {
    const body = await req.text();

    const { userName, machineName } = JSON.parse(body);

    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    const query = fnetPrisma.sql`SELECT userId
                                 FROM fnet.systemlogtb AS t1
                                 WHERE t1.MachineName = ${machineName}
                                 ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC
                                   LIMIT 1`;

    const user: any = await fnetDB.$queryRaw<any>(query);

    // const userId = user[0]?.userId ?? null;

    const userId = 2969;

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
            createdAt: dayjs().tz("Asia/Ho_Chi_Minh").toISOString(),
          },
        });
      }
    }

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
