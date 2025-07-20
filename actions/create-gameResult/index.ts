"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { createSafeAction } from "@/lib/create-safe-action";
import { checkGameRollRateLimit } from "@/lib/rate-limit";

import { GameItemResults, InputType, ReturnType } from "./type";
import { CreateGameResult } from "@/actions/create-gameResult/schema";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

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
  return await txOrDb.$queryRaw`SELECT * FROM Item`;
}

// Hàm lấy thông tin jackpot gần nhất và tổng quỹ
async function getJackpotInfo(
  txOrDb: any,
): Promise<{ lastJackPot: any; totalFund: number }> {
  const lastJackPots = await txOrDb.$queryRaw`
    SELECT createdAt FROM GameResult 
    WHERE itemId = ${JACKPOT_ID}
    ORDER BY createdAt DESC
    LIMIT 1
  `;
  const lastJackPot = (lastJackPots as any[])[0];
  
  const totalRounds = await txOrDb.$queryRaw`
    SELECT COUNT(*) as count FROM GameResult
    WHERE ${lastJackPot?.createdAt ? `createdAt > ${lastJackPot.createdAt}` : '1=1'}
  `;
  const totalRound = (totalRounds as any[])[0]?.count || 0;
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
      await txOrDb.$executeRaw`
        UPDATE Item 
        SET rating = ${item.rating}
        WHERE id = ${item.id}
      `;
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
      await txOrDb.$executeRaw`
        UPDATE Item 
        SET rating = ${item.rating}
        WHERE id = ${item.id}
      `;
    }
  }
  return itemRates;
}

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, rolls, type } = data;
  let resultFilters: GameItemResults[] = [];

  console.log(`[DEBUG] Starting game result creation - userId: ${userId}, rolls: ${rolls}, type: ${type}`);

  // Lấy branch từ cookie
  const cookieStore = cookies();
  const branch = cookieStore.get("branch")?.value;

  console.log(`[DEBUG] Branch from cookie: ${branch}`);

  if (!branch) {
    return { error: "Không tìm thấy thông tin chi nhánh (branch) trong cookie." };
  }

  // Rate limiting check
  const rateLimitResult = await checkGameRollRateLimit(String(userId), branch);
  console.log(`[DEBUG] Rate limit check result:`, rateLimitResult);
  if (!rateLimitResult.allowed) {
    return {
      error: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} giây.`,
    };
  }

  if (rolls !== 1 && rolls !== 10) {
    return { error: "Chỉ cho phép quay 1 hoặc 10 lần." };
  }

  if (type === "Gift") {
    console.log(`[DEBUG] Processing Gift type game`);
    
    // Tìm GiftRound còn lượt
    console.log(`[DEBUG] Searching for GiftRound - userId: ${userId}, branch: ${branch}`);
    const giftRounds = await db.$queryRaw`
      SELECT * FROM GiftRound 
      WHERE userId = ${userId} AND branch = ${branch} AND isUsed = false
      ORDER BY createdAt ASC
      LIMIT 1
    `;
    console.log(`[DEBUG] GiftRound query result:`, giftRounds);
    
    const giftRound = (giftRounds as any[])[0];
    if (!giftRound) return { error: "Bạn không còn lượt Tinh Cầu Thưởng." };
    const available = giftRound.amount - giftRound.usedAmount;
    if (available <= 0) return { error: "Bạn không còn lượt Tinh Cầu Thưởng." };
    const use = Math.min(rolls, available);
    console.log(`[DEBUG] GiftRound found - available: ${available}, use: ${use}`);

    // Lấy user
    console.log(`[DEBUG] Fetching user - userId: ${userId}, branch: ${branch}`);
    const users = await db.$queryRaw`
      SELECT * FROM User 
      WHERE userId = ${userId} AND branch = ${branch}
      LIMIT 1
    `;
    console.log(`[DEBUG] User query result:`, users);
    
    const user = (users as any[])[0];
    if (!user) return { error: "User not found" };

    // Lấy itemRates và các logic random như Wish
    console.log(`[DEBUG] Getting item rates and jackpot info`);
    let itemRates = await getItemRates(db);
    console.log(`[DEBUG] Item rates:`, itemRates);
    
    const { totalFund } = await getJackpotInfo(db);
    console.log(`[DEBUG] Total fund: ${totalFund}`);
    
    let jackpotHit = false;
    let totalAddedStars = 0;
    const results = [];
    for (let i = 0; i < use; i++) {
      console.log(`[DEBUG] Processing roll ${i + 1}/${use}`);
      
      // Roll random item
      let selectedItem = randomItem(itemRates);
      let addedStar = selectedItem.value;
      if (selectedItem.id === JACKPOT_ID) {
        addedStar = totalFund;
        jackpotHit = true;
      }
      console.log(`[DEBUG] Selected item:`, selectedItem, `addedStar: ${addedStar}`);
      
      // Lưu gameResult
      console.log(`[DEBUG] Inserting GameResult - userId: ${userId}, itemId: ${selectedItem.id}`);
      try {
        await db.$executeRaw`
          INSERT INTO GameResult (userId, itemId, createdAt, updatedAt)
          VALUES (${userId}, ${selectedItem.id}, ${getCurrentTimeVNISO()}, ${getCurrentTimeVNISO()})
        `;
        console.log(`[DEBUG] GameResult inserted successfully`);
      } catch (error) {
        console.error(`[ERROR] Failed to insert GameResult:`, error);
        throw error;
      }
      
      const gameResultResults = await db.$queryRaw`SELECT LAST_INSERT_ID() as id`;
      const gameResult = (gameResultResults as any[])[0];
      console.log(`[DEBUG] GameResult ID:`, gameResult);
      
      // Lưu UserStarHistory
      const currentStars = user.stars + totalAddedStars;
      console.log(`[DEBUG] Inserting UserStarHistory - currentStars: ${currentStars}, newStars: ${currentStars + addedStar}, gameResultId: ${gameResult.id}`);
      try {
        await db.$executeRaw`
          INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt, branch)
          VALUES (${userId}, 'GIFT_ROUND', ${currentStars}, ${currentStars + addedStar}, ${gameResult.id}, ${getCurrentTimeVNISO()}, ${branch})
        `;
        console.log(`[DEBUG] UserStarHistory inserted successfully`);
      } catch (error) {
        console.error(`[ERROR] Failed to insert UserStarHistory:`, error);
        throw error;
      }
      
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
    console.log(`[DEBUG] Updating User - new stars: ${user.stars + totalAddedStars}`);
    try {
      await db.$executeRaw`
        UPDATE User 
        SET stars = ${user.stars + totalAddedStars}, updatedAt = ${getCurrentTimeVNISO()}
        WHERE id = ${user.id}
      `;
      console.log(`[DEBUG] User updated successfully`);
    } catch (error) {
      console.error(`[ERROR] Failed to update User:`, error);
      throw error;
    }
    
    // Update GiftRound
    console.log(`[DEBUG] Updating GiftRound - new usedAmount: ${giftRound.usedAmount + use}`);
    try {
      await db.$executeRaw`
        UPDATE GiftRound 
        SET usedAmount = ${giftRound.usedAmount + use}, 
            isUsed = ${giftRound.usedAmount + use >= giftRound.amount}, 
            updatedAt = ${getCurrentTimeVNISO()}
        WHERE id = ${giftRound.id}
      `;
      console.log(`[DEBUG] GiftRound updated successfully`);
    } catch (error) {
      console.error(`[ERROR] Failed to update GiftRound:`, error);
      throw error;
    }
    
    console.log(`[DEBUG] Gift game completed successfully`);
    return { data: results };
  } else {
    console.log(`[DEBUG] Processing normal game type`);
    try {
      return await db.$transaction(async (tx) => {
        console.log(`[DEBUG] Starting transaction`);
        
        // Lấy user và item rate ban đầu
        console.log(`[DEBUG] Fetching user in transaction - userId: ${userId}, branch: ${branch}`);
        const users = await tx.$queryRaw`
          SELECT * FROM User 
          WHERE userId = ${userId} AND branch = ${branch}
          LIMIT 1
        `;
        console.log(`[DEBUG] User query result in transaction:`, users);
        
        const user = (users as any[])[0];
        if (!user) return { error: "User not found" };
        if (user.magicStone < rolls) {
          console.log(`[DEBUG] Insufficient magic stone - user has: ${user.magicStone}, needs: ${rolls}`);
          return { error: "Bạn không đủ đá năng lượng." };
        }
        console.log(`[DEBUG] User found - magicStone: ${user.magicStone}, stars: ${user.stars}`);

        console.log(`[DEBUG] Getting item rates and jackpot info in transaction`);
        let itemRates = await getItemRates(tx);
        console.log(`[DEBUG] Item rates in transaction:`, itemRates);
        
        const { totalFund } = await getJackpotInfo(tx);
        console.log(`[DEBUG] Total fund in transaction: ${totalFund}`);
        
        let jackpotHit = false;
        let totalAddedStars = 0;
        const results = [];
        for (let i = 0; i < rolls; i++) {
          console.log(`[DEBUG] Processing roll ${i + 1}/${rolls} in transaction`);
          
          // Roll
          let selectedItem = randomItem(itemRates);
          let addedStar = selectedItem.value;
          if (selectedItem.id === JACKPOT_ID) {
            addedStar = totalFund;
            jackpotHit = true;
          }
          console.log(`[DEBUG] Selected item in transaction:`, selectedItem, `addedStar: ${addedStar}`);
          
          // Lưu gameResult trước
          console.log(`[DEBUG] Inserting GameResult in transaction - userId: ${userId}, itemId: ${selectedItem.id}`);
          try {
            await tx.$executeRaw`
              INSERT INTO GameResult (userId, itemId, createdAt, updatedAt)
              VALUES (${userId}, ${selectedItem.id}, ${getCurrentTimeVNISO()}, ${getCurrentTimeVNISO()})
            `;
            console.log(`[DEBUG] GameResult inserted successfully in transaction`);
          } catch (error) {
            console.error(`[ERROR] Failed to insert GameResult in transaction:`, error);
            throw error;
          }
          
          const gameResultResults = await tx.$queryRaw`SELECT LAST_INSERT_ID() as id`;
          const gameResult = (gameResultResults as any[])[0];
          console.log(`[DEBUG] GameResult ID in transaction:`, gameResult);
          
          // Lưu UserStarHistory với stars hiện tại
          const currentStars = user.stars + totalAddedStars;
          console.log(`[DEBUG] Inserting UserStarHistory in transaction - currentStars: ${currentStars}, newStars: ${currentStars + addedStar}, gameResultId: ${gameResult.id}`);
          try {
            await tx.$executeRaw`
              INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt, branch)
              VALUES (${userId}, 'GAME', ${currentStars}, ${currentStars + addedStar}, ${gameResult.id}, ${getCurrentTimeVNISO()}, ${branch})
            `;
            console.log(`[DEBUG] UserStarHistory inserted successfully in transaction`);
          } catch (error) {
            console.error(`[ERROR] Failed to insert UserStarHistory in transaction:`, error);
            throw error;
          }
          
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
        console.log(`[DEBUG] Updating User in transaction - new stars: ${user.stars + totalAddedStars}, new magicStone: ${user.magicStone - rolls}`);
        try {
          await tx.$executeRaw`
            UPDATE User 
            SET stars = ${user.stars + totalAddedStars}, 
                magicStone = ${user.magicStone - rolls}, 
                updatedAt = ${getCurrentTimeVNISO()}
            WHERE id = ${user.id}
          `;
          console.log(`[DEBUG] User updated successfully in transaction`);
        } catch (error) {
          console.error(`[ERROR] Failed to update User in transaction:`, error);
          throw error;
        }
        
        // Trả về kết quả roll
        resultFilters = results.map((item) => ({
          id: item.id,
          image_url: item.image_url,
          title: item.title,
          value: item.value,
        }));
        console.log(`[DEBUG] Transaction completed successfully`);
        return { data: resultFilters };
      });
    } catch (error: any) {
      console.error(`[ERROR] Transaction failed:`, error);
      console.error(`[ERROR] Error details:`, {
        message: error?.message,
        code: error?.code,
        sqlState: error?.sqlState,
        sqlMessage: error?.sqlMessage
      });
      return {
        error: "Failed to create.",
      };
    }
  }
};

export const createGameResult = createSafeAction(CreateGameResult, handler);
