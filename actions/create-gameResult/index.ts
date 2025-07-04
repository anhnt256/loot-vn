"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { checkGameRollRateLimit } from "@/lib/rate-limit";

import { GameItemResults, InputType, ReturnType } from "./type";
import { CreateGameResult } from "@/actions/create-gameResult/schema";
import dayjs from "@/lib/dayjs";  

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

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, branch, rolls } = data;
  let resultFilters: GameItemResults[] = [];

  try {
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

    return await db.$transaction(async (tx) => {
      // Lấy user và item rate ban đầu
      const user = await tx.user.findFirst({ where: { userId, branch } });
      if (!user) return { error: "User not found" };
      if (user.magicStone < rolls) return { error: "Bạn không đủ đá năng lượng." };

      let itemRates = await tx.item.findMany();
      // Lấy thời điểm jackpot gần nhất
      const lastJackPot = await tx.gameResult.findFirst({
        where: { itemId: JACKPOT_ID },
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
      });
      // Tính tổng quỹ kể từ lần jackpot gần nhất
      const totalRound = await tx.gameResult.count({
        where: {
          ...(lastJackPot?.createdAt && {
            createdAt: { gt: lastJackPot.createdAt },
          }),
        },
      });
      let totalFund = totalRound * Number(ROUND_COST) * RATE;
      let jackpotHit = false;
      let totalAddedStars = 0;
      const results = [];

      for (let i = 0; i < rolls; i++) {
        // Roll
        const random = Math.random() * 100;
        let cumulative = 0;
        let selectedItem = null;
        for (const item of itemRates) {
          cumulative += item.rating;
          if (random < cumulative) {
            selectedItem = { ...item };
            break;
          }
        }
        if (!selectedItem) selectedItem = itemRates[itemRates.length - 1];
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
            createdAt: dayjs().tz("Asia/Ho_Chi_Minh").toISOString(),
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
            createdAt: dayjs().tz("Asia/Ho_Chi_Minh").toISOString(),
            branch,
          },
        });
        
        totalAddedStars += addedStar;
        results.push({ ...selectedItem, value: addedStar });
        // Update rate nếu cần
        if (jackpotHit) {
          // Reset rate về mặc định, giữ lại các field khác từ itemRates cũ
          itemRates = itemRates.map((item) => {
            const def = ITEM_RATE_DEFAULT.find((d) => d.id === item.id);
            return def ? { ...item, rating: def.rating } : item;
          });
          for (const item of itemRates) {
            await tx.item.update({
              where: { id: item.id },
              data: { rating: item.rating },
            });
          }
        } else if (totalFund >= Number(UP_RATE_AMOUNT)) {
          // Tăng rate jackpot, giảm các ô khác
          const jackpotItem = itemRates.find((x) => x.id === JACKPOT_ID);
          if (jackpotItem) {
            jackpotItem.rating += UP_RATE;
            const others = itemRates.filter((x) => x.id !== JACKPOT_ID);
            const reduce = UP_RATE / others.length;
            others.forEach((x) => (x.rating -= reduce));
          }
          // Update lại DB
          for (const item of itemRates) {
            await tx.item.update({
              where: { id: item.id },
              data: { rating: item.rating },
            });
          }
        }
      }
      // Update user cuối cùng
      await tx.user.update({
        where: { id: user.id },
        data: {
          stars: user.stars + totalAddedStars,
          magicStone: user.magicStone - rolls,
          updatedAt: dayjs().tz("Asia/Ho_Chi_Minh").toISOString(),
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
};

export const createGameResult = createSafeAction(CreateGameResult, handler);
