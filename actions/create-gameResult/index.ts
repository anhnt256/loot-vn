"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { createSafeAction } from "@/lib/create-safe-action";
import { checkGameRollRateLimit } from "@/lib/rate-limit";

import { GameItemResults, InputType, ReturnType } from "./type";
import { CreateGameResult } from "@/actions/create-gameResult/schema";
import { getVNTimeForPrisma } from "@/lib/timezone-utils";

const UP_RATE = 0.5;
const ROUND_COST = process.env.NEXT_PUBLIC_SPEND_PER_ROUND; // 30000 một vòng quay
const RATE = 0.015; // 1.5%
const UP_RATE_AMOUNT = process.env.NEXT_PUBLIC_UP_RATE_AMOUNT;
const JACKPOT_ID = 8;

const ITEM_RATE_DEFAULT = [
  { id: 1, rating: 60.0 },
  { id: 2, rating: 25.0 },
  { id: 3, rating: 10.0 },
  { id: 4, rating: 4.0 },
  { id: 5, rating: 1.0 },
  { id: 6, rating: 0.5 },
  { id: 7, rating: 0.1 },
  { id: 8, rating: 0 },
];

// Hàm lấy danh sách item và rate hiện tại
async function getItemRates(txOrDb: any): Promise<any[]> {
  return await txOrDb.item.findMany();
}

// Hàm lấy thông tin jackpot gần nhất và tổng quỹ
async function getJackpotInfo(
  txOrDb: any,
): Promise<{ lastJackPot: any; totalFund: number }> {
  const lastJackPot = await txOrDb.gameResult.findFirst({
    where: { itemId: JACKPOT_ID },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  const totalRound = await txOrDb.gameResult.count({
    where: {
      ...(lastJackPot?.createdAt && {
        createdAt: { gt: lastJackPot.createdAt },
      }),
    },
  });
  const totalFund = totalRound * Number(ROUND_COST) * RATE;
  return { lastJackPot, totalFund };
}

// Hàm random 1 item theo rate
function randomItem(itemRates: any[]): any {
  const random = Math.random() * 100;
  let cumulative = 0;
  for (const item of itemRates) {
    cumulative += item.rating;
    if (random < cumulative) {
      return { ...item };
    }
  }
  return { ...itemRates[itemRates.length - 1] };
}

// Hàm update lại rate khi trúng jackpot hoặc đủ điều kiện tăng rate
async function updateRates(
  txOrDb: any,
  itemRates: any[],
  jackpotHit: boolean,
  totalFund: number,
): Promise<any[]> {
  if (jackpotHit) {
    itemRates = itemRates.map((item: any) => {
      const def = ITEM_RATE_DEFAULT.find((d) => d.id === item.id);
      return def ? { ...item, rating: def.rating } : item;
    });
    for (const item of itemRates) {
      await txOrDb.item.update({
        where: { id: item.id },
        data: { rating: item.rating },
      });
    }
  } else if (totalFund >= Number(UP_RATE_AMOUNT)) {
    const jackpotItem = itemRates.find((x: any) => x.id === JACKPOT_ID);
    if (jackpotItem) {
      jackpotItem.rating += UP_RATE;
      const others = itemRates.filter((x: any) => x.id !== JACKPOT_ID);
      const reduce = UP_RATE / others.length;
      others.forEach((x: any) => (x.rating -= reduce));
    }
    for (const item of itemRates) {
      await txOrDb.item.update({
        where: { id: item.id },
        data: { rating: item.rating },
      });
    }
  }
  return itemRates;
}

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, rolls, type } = data;
  let resultFilters: GameItemResults[] = [];

  // Lấy branch từ cookie
  const cookieStore = cookies();
  const branch = cookieStore.get("branch")?.value;

  if (!branch) {
    return { error: "Không tìm thấy thông tin chi nhánh (branch) trong cookie." };
  }


  // Rate limiting check
  const rateLimitResult = await checkGameRollRateLimit(String(userId), branch);
  if (!rateLimitResult.allowed) {
    return {
      error: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} giây.`,
    };
  }

  if (rolls !== 1 && rolls !== 10) {
    return { error: "Chỉ cho phép quay 1 hoặc 10 lần." };
  }

  if (type === "Gift") {

    // Tìm GiftRound còn lượt
    const giftRound = await db.giftRound.findFirst({
      where: { userId, branch, isUsed: false },
      orderBy: { createdAt: "asc" },
    });
    if (!giftRound) return { error: "Bạn không còn lượt Tinh Cầu Thưởng." };
    const available = giftRound.amount - giftRound.usedAmount;
    if (available <= 0) return { error: "Bạn không còn lượt Tinh Cầu Thưởng." };
    const use = Math.min(rolls, available);

    // Lấy user
    const user = await db.user.findFirst({ where: { userId, branch } });
    if (!user) return { error: "User not found" };

    // Lấy itemRates và các logic random như Wish
    let itemRates = await getItemRates(db);
    const { totalFund } = await getJackpotInfo(db);
    let jackpotHit = false;
    let totalAddedStars = 0;
    const results = [];
    for (let i = 0; i < use; i++) {
      // Roll random item
      let selectedItem = randomItem(itemRates);
      let addedStar = selectedItem.value;
      if (selectedItem.id === JACKPOT_ID) {
        addedStar = totalFund;
        jackpotHit = true;
      }
      // Lưu gameResult
      const gameResult = await db.gameResult.create({
        data: {
          userId,
          itemId: selectedItem.id,
          createdAt: getVNTimeForPrisma(),
        },
      });
      // Lưu UserStarHistory
      const currentStars = user.stars + totalAddedStars;
      await db.userStarHistory.create({
        data: {
          userId,
          type: "GIFT_ROUND",
          oldStars: currentStars,
          newStars: currentStars + addedStar,
          targetId: gameResult.id,
          createdAt: getVNTimeForPrisma(),
          branch,
        },
      });
      totalAddedStars += addedStar;
      results.push({
        id: selectedItem.id,
        image_url: selectedItem.image_url,
        title: selectedItem.title,
        value: addedStar,
      });
      // Update rate nếu cần
      itemRates = await updateRates(db, itemRates, jackpotHit, totalFund);
    }
    // Update user cuối cùng
    await db.user.update({
      where: { id: user.id },
      data: {
        stars: user.stars + totalAddedStars,
        updatedAt: getVNTimeForPrisma(),
      },
    });
    // Update GiftRound
    await db.giftRound.update({
      where: { id: giftRound.id },
      data: {
        usedAmount: giftRound.usedAmount + use,
        isUsed: giftRound.usedAmount + use >= giftRound.amount,
        updatedAt: getVNTimeForPrisma(),
      },
    });
    return { data: results };
  } else {
    try {
      return await db.$transaction(async (tx) => {
        // Lấy user và item rate ban đầu
        const user = await tx.user.findFirst({ where: { userId, branch } });
        if (!user) return { error: "User not found" };
        // if (user.magicStone < rolls)
        //   return { error: "Bạn không đủ đá năng lượng." };

        let itemRates = await getItemRates(tx);
        const { totalFund } = await getJackpotInfo(tx);
        let jackpotHit = false;
        let totalAddedStars = 0;
        const results = [];
        for (let i = 0; i < rolls; i++) {
          // Roll
          let selectedItem = randomItem(itemRates);
          let addedStar = selectedItem.value;
          if (selectedItem.id === JACKPOT_ID) {
            addedStar = totalFund;
            jackpotHit = true;
          }
          // Lưu gameResult trước
          const gameResult = await tx.gameResult.create({
            data: {
              userId,
              itemId: selectedItem.id,
              createdAt: getVNTimeForPrisma(),
            },
          });
          // Lưu UserStarHistory với stars hiện tại
          const currentStars = user.stars + totalAddedStars;
          await tx.userStarHistory.create({
            data: {
              userId,
              type: "GAME",
              oldStars: currentStars,
              newStars: currentStars + addedStar,
              targetId: gameResult.id,
              createdAt: getVNTimeForPrisma(),
              branch,
            },
          });
          totalAddedStars += addedStar;
          results.push({
            id: selectedItem.id,
            image_url: selectedItem.image_url,
            title: selectedItem.title,
            value: addedStar,
          });
          // Update rate nếu cần
          itemRates = await updateRates(tx, itemRates, jackpotHit, totalFund);
        }
        // Update user cuối cùng
        await tx.user.update({
          where: { id: user.id },
          data: {
            stars: user.stars + totalAddedStars,
            magicStone: user.magicStone - rolls,
            updatedAt: getVNTimeForPrisma(),
          },
        });
        // Trả về kết quả roll
        resultFilters = results.map((item) => ({
          id: item.id,
          image_url: item.image_url,
          title: item.title,
          value: item.value,
        }));
        return { data: resultFilters };
      });
    } catch (error) {
      console.error(`[ERROR] Transaction failed:`, error);
      return {
        error: "Failed to create.",
      };
    }
  }
};

export const createGameResult = createSafeAction(CreateGameResult, handler);
