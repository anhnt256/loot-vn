import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import dayjs from "@/lib/dayjs";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

// GET endpoint để kiểm tra trạng thái Gateway Bonus
export async function GET(request: NextRequest) {
  try {
    // Lấy userId từ query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          error: "Missing userId",
          message: "Vui lòng cung cấp userId",
        },
        { status: 400 },
      );
    }

    // Lấy branch từ cookie
    const branch = request.cookies.get("branch")?.value;
    if (!branch) {
      return NextResponse.json(
        {
          error: "Missing branch",
          message: "Không tìm thấy thông tin chi nhánh",
        },
        { status: 400 },
      );
    }

    // Lấy ngày hết hạn từ env
    const claimDeadline = process.env.GATEWAY_BONUS_DEADLINE || "2025-07-15";
    const accountCreationDeadline = "2025-07-05";

    const now = dayjs().utcOffset(7);
    const deadline = dayjs(claimDeadline).utcOffset(7).endOf("day");
    const accountDeadline = dayjs(accountCreationDeadline).utcOffset(7);

    // Kiểm tra xem đã qua ngày hết hạn chưa
    if (dayjs(now).isAfter(dayjs(deadline))) {
      return NextResponse.json({
        available: false,
        reason: "expired",
        message: "Chương trình Gateway Bonus đã kết thúc",
      });
    }

    // Tìm user theo userId và branch
    const user = await db.$queryRaw<any[]>`
      SELECT * FROM User 
      WHERE userId = ${parseInt(userId)} 
      AND branch = ${branch}
      LIMIT 1
    `;

    console.log(user[0]);

    if (user.length === 0) {
      return NextResponse.json(
        {
          error: "User not found",
          message: "Không tìm thấy người dùng",
        },
        { status: 404 },
      );
    }

    // Kiểm tra ngày tạo tài khoản
    const userCreatedAt = dayjs(user[0].createdAt).utcOffset(7);
    if (userCreatedAt.isAfter(accountDeadline)) {
      return NextResponse.json({
        available: false,
        reason: "new_account",
        message: "Chỉ áp dụng cho tài khoản tạo trước ngày 05/07/2025",
      });
    }

    // Kiểm tra xem user đã claim chưa
    const existingClaim = await db.$queryRaw<any[]>`
      SELECT * FROM GiftRound 
      WHERE userId = ${parseInt(userId)} 
      AND reason = 'Gateway Bonus'
      LIMIT 1
    `;

    if (existingClaim.length > 0) {
      return NextResponse.json({
        available: false,
        reason: "already_claimed",
        message: "Bạn đã nhận Gateway Bonus rồi",
      });
    }

    return NextResponse.json({
      available: true,
      deadline: claimDeadline,
      accountDeadline: accountCreationDeadline,
      message: "Bạn có thể nhận 3 lượt quay miễn phí",
    });
  } catch (error) {
    console.error("Gateway Bonus GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST endpoint để claim Gateway Bonus
export async function POST(request: NextRequest) {
  try {
    // Lấy userId từ request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        {
          error: "Missing userId",
          message: "Vui lòng cung cấp userId",
        },
        { status: 400 },
      );
    }

    // Lấy branch từ cookie
    const branch = request.cookies.get("branch")?.value;
    if (!branch) {
      return NextResponse.json(
        {
          error: "Missing branch",
          message: "Không tìm thấy thông tin chi nhánh",
        },
        { status: 400 },
      );
    }

    // Lấy ngày hết hạn từ env
    const claimDeadline = process.env.GATEWAY_BONUS_DEADLINE || "2025-07-15";
    const accountCreationDeadline = "2025-07-05";

    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const deadline = dayjs(claimDeadline).utcOffset(7).endOf("day");
    const accountDeadline = dayjs(accountCreationDeadline).utcOffset(7);

    // Kiểm tra xem đã qua ngày hết hạn chưa
    if (now.isAfter(dayjs(deadline))) {
      return NextResponse.json(
        {
          error: "Chương trình Gateway Bonus đã kết thúc",
        },
        { status: 400 },
      );
    }

    // Tìm user theo userId và branch
    const user = await db.$queryRaw<any[]>`
      SELECT * FROM User 
      WHERE userId = ${parseInt(userId)} 
      AND branch = ${branch}
      LIMIT 1
    `;

    if (user.length === 0) {
      return NextResponse.json(
        {
          error: "User not found",
          message: "Không tìm thấy người dùng",
        },
        { status: 404 },
      );
    }

    // Kiểm tra ngày tạo tài khoản
    const userCreatedAt = dayjs(user[0].createdAt).utcOffset(7);
    if (userCreatedAt.isAfter(accountDeadline)) {
      return NextResponse.json(
        {
          error: "Chỉ áp dụng cho tài khoản tạo trước ngày 05/07/2025",
        },
        { status: 400 },
      );
    }

    // Kiểm tra xem user đã claim chưa
    const existingClaim = await db.$queryRaw<any[]>`
      SELECT * FROM GiftRound 
      WHERE userId = ${parseInt(userId)} 
      AND reason = 'Gateway Bonus'
      LIMIT 1
    `;

    if (existingClaim.length > 0) {
      return NextResponse.json(
        {
          error: "Bạn đã nhận Gateway Bonus rồi",
        },
        { status: 400 },
      );
    }

    // Tính ngày hết hạn là 1 tuần từ ngày hiện tại
    const expirationDate = now.add(1, "week").toDate();

    // Tạo gift round mới
    await db.$executeRaw`
      INSERT INTO GiftRound (userId, amount, reason, staffId, branch, createdAt, expiredAt, isUsed, updatedAt)
      VALUES (
        ${parseInt(userId)},
        ${3},
        ${"Gateway Bonus"},
        ${0},
        ${branch},
        NOW(),
        ${expirationDate},
        ${false},
        NOW()
      )
    `;

    // Get the created gift round
    const giftRound = await db.$queryRaw<any[]>`
      SELECT * FROM GiftRound 
      WHERE userId = ${parseInt(userId)} 
      AND reason = 'Gateway Bonus'
      ORDER BY id DESC
      LIMIT 1
    `;

    // Cập nhật magicStone của user
    await db.$executeRaw`
      UPDATE User 
      SET magicStone = magicStone + 3, updatedAt = NOW()
      WHERE id = ${user[0].id}
    `;

    return NextResponse.json({
      success: true,
      message: "Nhận Gateway Bonus thành công!",
      giftRound: giftRound[0],
    });
  } catch (error) {
    console.error("Gateway Bonus POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
