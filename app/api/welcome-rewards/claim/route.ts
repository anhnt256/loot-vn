import { NextRequest, NextResponse } from "next/server";
import { db, getFnetDB } from "@/lib/db";
import { cookies } from "next/headers";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { verifyJWT } from "@/lib/jwt";

// Function to generate random 8-character code
function generateRandomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate user có ID hoặc Phone hợp lệ và unique
 * - ID hoặc Phone phải có dữ liệu (không rỗng)
 * - Không được trùng với user khác
 */
async function validateUserIdentity(
  userId: number,
  fnetDB: any,
): Promise<{
  isValid: boolean;
  errorMessage?: string;
  id?: string;
  phone?: string;
}> {
  try {
    // Lấy thông tin ID và Phone của user
    const userInfo = (await fnetDB.$queryRawUnsafe(`
      SELECT UserId, ID, Phone
      FROM usertb
      WHERE UserId = ${userId}
      LIMIT 1
    `)) as any[];

    if (userInfo.length === 0) {
      return { isValid: false, errorMessage: "Không tìm thấy thông tin user" };
    }

    const user = userInfo[0];
    const id = user.ID?.trim() || "";
    const phone = user.Phone?.trim() || "";

    console.log(`User ${userId} - ID: "${id}", Phone: "${phone}"`);

    // Check: Phải có ít nhất ID hoặc Phone
    if (!id && !phone) {
      return {
        isValid: false,
        errorMessage:
          "Vui lòng cập nhật CMND/CCCD hoặc Số điện thoại để nhận phần thưởng",
      };
    }

    // Check ID trùng với user khác (nếu có ID)
    if (id) {
      const duplicateIdUsers = (await fnetDB.$queryRawUnsafe(`
        SELECT UserId, ID
        FROM usertb
        WHERE ID = '${id}'
          AND ID != ''
          AND UserId != ${userId}
        LIMIT 1
      `)) as any[];

      if (duplicateIdUsers.length > 0) {
        console.log(
          `User ${userId} - Duplicate ID found: ${duplicateIdUsers[0].UserId}`,
        );
        return {
          isValid: false,
          errorMessage: "CMND/CCCD đã được sử dụng bởi tài khoản khác",
        };
      }
    }

    // Check Phone trùng với user khác (nếu có Phone)
    if (phone) {
      const duplicatePhoneUsers = (await fnetDB.$queryRawUnsafe(`
        SELECT UserId, Phone
        FROM usertb
        WHERE Phone = '${phone}'
          AND Phone != ''
          AND UserId != ${userId}
        LIMIT 1
      `)) as any[];

      if (duplicatePhoneUsers.length > 0) {
        console.log(
          `User ${userId} - Duplicate Phone found: ${duplicatePhoneUsers[0].UserId}`,
        );
        return {
          isValid: false,
          errorMessage: "Số điện thoại đã được sử dụng bởi tài khoản khác",
        };
      }
    }

    return { isValid: true, id, phone };
  } catch (error) {
    console.error("Error validating user identity:", error);
    return { isValid: false, errorMessage: "Lỗi khi kiểm tra thông tin user" };
  }
}

// Function to map itemType to rewardType
function mapItemTypeToRewardType(itemType: string): string {
  switch (itemType) {
    case "HOURS":
      return "FREE_HOURS";
    case "FOOD":
      return "FREE_FOOD";
    case "DRINK":
      return "FREE_DRINK";
    case "SNACK":
      return "FREE_SNACK";
    default:
      return "FREE_ITEM";
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;
    const token = cookieStore.get("token")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = parseInt(decoded.userId.toString());
    const currentTime = getCurrentTimeVNDB();

    // Get fnetDB instance để validate identity
    const fnetDB = await getFnetDB();

    // Validate user identity (ID hoặc Phone phải có và unique)
    const identityValidation = await validateUserIdentity(userId, fnetDB);
    if (!identityValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: identityValidation.errorMessage,
          requiresIdentityUpdate: true,
        },
        { status: 400 },
      );
    }

    console.log(
      `User ${userId} - Identity validated for claim: ID="${identityValidation.id}", Phone="${identityValidation.phone}"`,
    );

    // Kiểm tra user đã claim welcome rewards chưa
    const existingClaim = await db.$queryRaw<any[]>`
      SELECT * FROM EventParticipant ep
      INNER JOIN Event e ON ep.eventId = e.id
      WHERE ep.userId = ${userId}
        AND ep.branch = ${branch}
        AND e.type = 'NEW_USER_WELCOME'
        AND e.branch = ${branch}
      LIMIT 1
    `;

    if (existingClaim.length > 0) {
      return NextResponse.json(
        { error: "Bạn đã nhận phần thưởng chào mừng rồi" },
        { status: 400 },
      );
    }

    // Lấy event NEW_USER_WELCOME đang active
    const activeEvent = await db.$queryRaw<any[]>`
      SELECT 
        e.id as eventId,
        e.name as eventName,
        e.startDate,
        e.endDate
      FROM Event e
      WHERE e.type = 'NEW_USER_WELCOME'
        AND e.status IN ('ACTIVE', 'DRAFT')
        AND e.branch = ${branch}
        AND e.isActive = true
        AND e.startDate <= ${currentTime}
        AND e.endDate >= ${currentTime}
      ORDER BY e.createdAt DESC
      LIMIT 1
    `;

    if (activeEvent.length === 0) {
      return NextResponse.json(
        { error: "Không có sự kiện chào mừng user mới đang diễn ra" },
        { status: 404 },
      );
    }

    const event = activeEvent[0];

    // Lấy các rewards của event
    const eventRewards = await db.$queryRaw<any[]>`
      SELECT 
        er.id,
        er.name,
        er.rewardType,
        er.rewardConfig,
        er.maxQuantity,
        er.used,
        er.maxPerUser
      FROM EventReward er
      WHERE er.eventId = ${event.eventId}
        AND er.isActive = true
      ORDER BY er.priority ASC
    `;

    if (eventRewards.length === 0) {
      return NextResponse.json(
        { error: "Không có phần thưởng nào trong sự kiện này" },
        { status: 404 },
      );
    }

    // Tạo EventParticipant record
    await db.$executeRaw`
      INSERT INTO EventParticipant (eventId, userId, branch, status, registeredAt, participatedAt, completedAt, participationData, rewardsReceived, totalSpent)
      VALUES (
        ${event.eventId},
        ${userId},
        ${branch},
        'COMPLETED',
        ${currentTime},
        ${currentTime},
        ${currentTime},
        '{"source": "welcome_tour"}',
        '[]',
        0
      )
    `;

    // Tạo UserRewardMap records và PromotionCode cho từng reward
    const claimedRewards = [];

    console.log(
      `Processing ${eventRewards.length} rewards for event ${event.eventId}`,
    );

    for (const reward of eventRewards) {
      console.log(`\n=== PROCESSING REWARD ${reward.id} ===`);
      try {
        const rewardConfig = JSON.parse(reward.rewardConfig);
        console.log(`Processing reward ${reward.id}: ${reward.name}`);
        console.log(`Reward config:`, rewardConfig);

        // Kiểm tra giới hạn số lượng
        if (reward.maxQuantity && reward.used >= reward.maxQuantity) {
          console.log(
            `Reward ${reward.id} đã hết số lượng: used=${reward.used}, max=${reward.maxQuantity}`,
          );
          continue;
        }

        console.log(
          `Reward ${reward.id} passed quantity check: used=${reward.used}, max=${reward.maxQuantity}`,
        );

        // Tạo PromotionCode dựa trên rewardConfig
        let promotionCodeId = null;

        console.log(
          `Checking reward config: type=${rewardConfig.type}, itemType=${rewardConfig.itemType}`,
        );

        // Special debug for DRINK
        if (rewardConfig.itemType === "DRINK") {
          console.log(`🔍 DEBUGGING DRINK REWARD ${reward.id}:`);
          console.log(`  - name: ${reward.name}`);
          console.log(`  - type: ${rewardConfig.type}`);
          console.log(`  - itemType: ${rewardConfig.itemType}`);
          console.log(`  - freeValue: ${rewardConfig.freeValue}`);
          console.log(`  - freeQuantity: ${rewardConfig.freeQuantity}`);
          console.log(`  - maxQuantity: ${reward.maxQuantity}`);
          console.log(`  - used: ${reward.used}`);
        }

        if (rewardConfig.type === "FREE_ITEM" && rewardConfig.itemType) {
          const rewardType = mapItemTypeToRewardType(rewardConfig.itemType);
          const randomCode = generateRandomCode();
          const promotionCode = `FREE_ITEM_${rewardConfig.itemType}_${randomCode}`;

          console.log(
            `Creating PromotionCode: ${promotionCode} with rewardType: ${rewardType}`,
          );

          // Tạo PromotionCode
          try {
            // Sử dụng Prisma client thay vì raw query để tránh lỗi template string
            const createdPromotionCode = await db.promotionCode.create({
              data: {
                name: reward.name,
                code: promotionCode,
                value:
                  rewardConfig.freeValue || rewardConfig.freeQuantity || null,
                branch: branch,
                isUsed: false,
                eventId: event.eventId,
                rewardType: rewardType,
                rewardValue:
                  rewardConfig.freeValue || rewardConfig.freeQuantity || null,
                expirationDate: reward.validTo || event.endDate,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            promotionCodeId = createdPromotionCode.id;

            console.log(
              `✅ Created PromotionCode: ${promotionCode} with ID: ${promotionCodeId}`,
            );
          } catch (insertError) {
            console.error(
              `❌ Error creating PromotionCode for ${rewardConfig.itemType}:`,
              insertError,
            );
            console.error(`   PromotionCode: ${promotionCode}`);
            console.error(`   RewardType: ${rewardType}`);
            console.error(`   EventId: ${event.eventId}`);
            console.error(`   Branch: ${branch}`);
          }
        } else {
          console.log(
            `Skipping PromotionCode creation for reward ${reward.id}: type=${rewardConfig.type}, itemType=${rewardConfig.itemType}`,
          );
          console.log(
            `Condition check: type === 'FREE_ITEM' = ${rewardConfig.type === "FREE_ITEM"}, itemType exists = ${!!rewardConfig.itemType}`,
          );
        }

        // Update usage count của EventReward sử dụng Prisma client
        await db.eventReward.update({
          where: { id: reward.id },
          data: {
            used: { increment: 1 },
            updatedAt: new Date(),
          },
        });

        console.log(`✅ Updated usage count for reward ${reward.id}`);

        // Thêm vào claimedRewards để lưu vào rewardsReceived
        claimedRewards.push({
          id: reward.id,
          name: reward.name,
          type: reward.rewardType,
          config: rewardConfig,
          promotionCodeId: promotionCodeId,
        });

        console.log(
          `✅ Successfully processed reward ${reward.id}: ${reward.name}`,
        );
      } catch (error) {
        console.error(`❌ Error processing reward ${reward.id}:`, error);
        console.error(
          `   Error details:`,
          (error as any)?.message || "Unknown error",
        );
        console.error(
          `   Stack trace:`,
          (error as any)?.stack || "No stack trace",
        );
      }
    }

    // Cập nhật EventParticipant với rewardsReceived
    await db.$executeRaw`
      UPDATE EventParticipant 
      SET rewardsReceived = ${JSON.stringify(claimedRewards)}
      WHERE eventId = ${event.eventId} AND userId = ${userId} AND branch = ${branch}
    `;

    // Cập nhật Event - tăng totalCodesGenerated
    // Số lượng mã đã tạo = số lượng rewards đã claim thành công
    const codesGenerated = claimedRewards.length;
    if (codesGenerated > 0) {
      await db.$executeRaw`
        UPDATE Event
        SET totalCodesGenerated = totalCodesGenerated + ${codesGenerated}
        WHERE id = ${event.eventId}
      `;
      console.log(
        `✅ Updated Event totalCodesGenerated +${codesGenerated} for eventId: ${event.eventId}`,
      );
    }

    console.log(`\n=== CLAIM SUMMARY ===`);
    console.log(`Total rewards processed: ${eventRewards.length}`);
    console.log(`Successfully claimed rewards: ${claimedRewards.length}`);
    console.log(
      `Claimed rewards:`,
      claimedRewards.map((r) => `${r.name} (ID: ${r.id})`),
    );
    console.log(
      `Updated EventParticipant with rewardsReceived:`,
      JSON.stringify(claimedRewards),
    );

    return NextResponse.json({
      success: true,
      message: "Nhận phần thưởng chào mừng thành công!",
      event: {
        id: event.eventId,
        name: event.eventName,
      },
      claimedRewards: claimedRewards,
    });
  } catch (error) {
    console.error("Error claiming welcome rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
