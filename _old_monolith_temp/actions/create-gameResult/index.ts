"use server";

import { db, getFnetDB } from "@/lib/db";
import { cookies } from "next/headers";
import { createSafeAction } from "@/lib/create-safe-action";
import { checkGameRollRateLimit } from "@/lib/rate-limit";

import { GameItemResults, InputType, ReturnType } from "./type";
import { CreateGameResult } from "@/actions/create-gameResult/schema";
import { getCurrentTimeVNISO, getCurrentTimeVNDB, getStartOfWeekVNISO, getEndOfWeekVNISO } from "@/lib/timezone-utils";

const UP_RATE = 0.5;
const ROUND_COST = process.env.NEXT_PUBLIC_SPEND_PER_ROUND; // 30000 một vòng quay
const RATE = 0.015; // 1.5%
const UP_RATE_AMOUNT = process.env.NEXT_PUBLIC_UP_RATE_AMOUNT;
const JACKPOT_ID = 8;

const ITEM_RATE_DEFAULT = [
  { id: 1, rating: 58.4 },
  { id: 2, rating: 24.4 },
  { id: 3, rating: 9.8 },
  { id: 4, rating: 4.0 },
  { id: 5, rating: 2.0 },
  { id: 6, rating: 1.0 },
  { id: 7, rating: 0.5 },
  { id: 8, rating: 0.1 },
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
  
  let totalRounds;
  if (lastJackPot?.createdAt) {
    totalRounds = await txOrDb.$queryRaw`
      SELECT COUNT(*) as count FROM GameResult gr
      INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
      WHERE gr.createdAt > ${lastJackPot.createdAt}
    `;
  } else {
    totalRounds = await txOrDb.$queryRaw`
      SELECT COUNT(*) as count FROM GameResult gr
      INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
    `;
  }

  const totalRound = Number((totalRounds as any[])[0]?.count || 0);
  console.log('totalRounds', totalRounds)

  const totalFund = totalRound * Number(ROUND_COST) * RATE;

  console.log('totalFund', totalFund)
  
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
    
    try {
      return await db.$transaction(async (tx) => {
        console.log(`[DEBUG] Starting Gift transaction`);
        
        // Tìm tất cả GiftRound còn lượt theo thứ tự FIFO
        console.log(`[DEBUG] Searching for all available GiftRounds - userId: ${userId}, branch: ${branch}`);
        const giftRounds = await tx.$queryRaw`
          SELECT * FROM GiftRound 
          WHERE userId = ${userId} AND branch = ${branch} AND expiredAt >= NOW()
          ORDER BY createdAt ASC
        `;
        console.log(`[DEBUG] GiftRounds query result:`, giftRounds);
        
        const availableGiftRounds = (giftRounds as any[]).filter(gr => {
          const available = gr.amount - gr.usedAmount;
          console.log(`[DEBUG] GiftRound ${gr.id}: amount=${gr.amount}, usedAmount=${gr.usedAmount}, available=${available}`);
          return available > 0;
        });
        
        if (availableGiftRounds.length === 0) {
          return { error: "Bạn không còn lượt Tinh Cầu Thưởng." };
        }
        
        // Tính tổng lượt có thể sử dụng
        const totalAvailable = availableGiftRounds.reduce((sum, gr) => {
          return sum + (gr.amount - gr.usedAmount);
        }, 0);
        
        if (totalAvailable < rolls) {
          return { error: `Bạn chỉ còn ${totalAvailable} lượt Tinh Cầu Thưởng, không đủ ${rolls} lượt.` };
        }
        
        console.log(`[DEBUG] Total available rounds: ${totalAvailable}, requested rolls: ${rolls}`);

        // Lấy user
        console.log(`[DEBUG] Fetching user in Gift transaction - userId: ${userId}, branch: ${branch}`);
        const users = await tx.$queryRaw`
          SELECT * FROM User 
          WHERE userId = ${userId} AND branch = ${branch}
          LIMIT 1
        `;
        console.log(`[DEBUG] User query result in Gift transaction:`, users);
        
        const user = (users as any[])[0];
        if (!user) return { error: "User not found" };

        // Lấy itemRates và các logic random như Wish
        console.log(`[DEBUG] Getting item rates and jackpot info in Gift transaction`);
        let itemRates = await getItemRates(tx);
        console.log(`[DEBUG] Item rates in Gift transaction:`, itemRates);
        
        const { totalFund } = await getJackpotInfo(tx);
        console.log(`[DEBUG] Total fund in Gift transaction: ${totalFund}`);
        
        let jackpotHit = false;
        let totalAddedStars = 0;
        const results = [];
        let remainingRolls = rolls;
        let currentGiftRoundIndex = 0;
        
        while (remainingRolls > 0 && currentGiftRoundIndex < availableGiftRounds.length) {
          const currentGiftRound = availableGiftRounds[currentGiftRoundIndex];
          const availableInCurrentRound = currentGiftRound.amount - currentGiftRound.usedAmount;
          const rollsToUse = Math.min(remainingRolls, availableInCurrentRound);
          
          console.log(`[DEBUG] Using GiftRound ${currentGiftRoundIndex + 1} - available: ${availableInCurrentRound}, using: ${rollsToUse}, remaining: ${remainingRolls}`);
          
          for (let i = 0; i < rollsToUse; i++) {
            console.log(`[DEBUG] Processing roll ${rolls - remainingRolls + i + 1}/${rolls} in Gift transaction`);
            
            // Roll random item
            let selectedItem = randomItem(itemRates);
            let addedStar = selectedItem.value;
            if (selectedItem.id === JACKPOT_ID) {
              addedStar = totalFund;
              jackpotHit = true;
            }
            console.log(`[DEBUG] Selected item in Gift transaction:`, selectedItem, `addedStar: ${addedStar}`);
            
            // Lưu gameResult
            console.log(`[DEBUG] Inserting GameResult in Gift transaction - userId: ${userId}, itemId: ${selectedItem.id}`);
            try {
              await tx.$executeRaw`
                INSERT INTO GameResult (userId, itemId, createdAt, updatedAt)
                VALUES (${userId}, ${selectedItem.id}, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
              `;
              console.log(`[DEBUG] GameResult inserted successfully in Gift transaction`);
            } catch (error) {
              console.error(`[ERROR] Failed to insert GameResult in Gift transaction:`, error);
              throw error;
            }
            
            const gameResultResults = await tx.$queryRaw`SELECT LAST_INSERT_ID() as id`;
            const gameResult = (gameResultResults as any[])[0];
            console.log(`[DEBUG] GameResult ID in Gift transaction:`, gameResult);
            
            // Lưu UserStarHistory
            const currentStars = user.stars + totalAddedStars;
            console.log(`[DEBUG] Inserting UserStarHistory in Gift transaction - currentStars: ${currentStars}, newStars: ${currentStars + addedStar}, gameResultId: ${gameResult.id}`);
            try {
              await tx.$executeRaw`
                INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt, branch)
                VALUES (${userId}, 'GIFT_ROUND', ${currentStars}, ${currentStars + addedStar}, ${gameResult.id}, ${getCurrentTimeVNDB()}, ${branch})
              `;
              console.log(`[DEBUG] UserStarHistory inserted successfully in Gift transaction`);
            } catch (error) {
              console.error(`[ERROR] Failed to insert UserStarHistory in Gift transaction:`, error);
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
          
          // Update GiftRound hiện tại
          const newUsedAmount = currentGiftRound.usedAmount + rollsToUse;
          const isUsed = newUsedAmount >= currentGiftRound.amount;
          console.log(`[DEBUG] Updating GiftRound ${currentGiftRound.id} in Gift transaction:`);
          console.log(`[DEBUG] - Current usedAmount: ${currentGiftRound.usedAmount}`);
          console.log(`[DEBUG] - Rolls to use: ${rollsToUse}`);
          console.log(`[DEBUG] - New usedAmount: ${newUsedAmount}`);
          console.log(`[DEBUG] - Is used: ${isUsed}`);
          console.log(`[DEBUG] - Current amount: ${currentGiftRound.amount}`);
          try {
            await tx.$executeRaw`
              UPDATE GiftRound 
              SET usedAmount = ${newUsedAmount}, 
                  isUsed = ${isUsed}, 
                  updatedAt = ${getCurrentTimeVNDB()}
              WHERE id = ${currentGiftRound.id}
            `;
            console.log(`[DEBUG] GiftRound ${currentGiftRound.id} updated successfully in Gift transaction`);
            
            // Verify the update
            const verifyUpdate = await tx.$queryRaw`
              SELECT id, usedAmount, isUsed FROM GiftRound WHERE id = ${currentGiftRound.id}
            `;
            console.log(`[DEBUG] Verification after update:`, verifyUpdate);
          } catch (error) {
            console.error(`[ERROR] Failed to update GiftRound ${currentGiftRound.id} in Gift transaction:`, error);
            throw error;
          }
          
          remainingRolls -= rollsToUse;
          currentGiftRoundIndex++;
        }
        
        // Update user cuối cùng
        console.log(`[DEBUG] Updating User in Gift transaction - new stars: ${user.stars + totalAddedStars}, userId: ${userId}, branch: ${branch}`);
        try {
          await tx.$executeRaw`
            UPDATE User 
            SET stars = ${user.stars + totalAddedStars}, updatedAt = ${getCurrentTimeVNDB()}
            WHERE userId = ${userId} AND branch = ${branch}
          `;
          console.log(`[DEBUG] User updated successfully in Gift transaction`);
        } catch (error) {
          console.error(`[ERROR] Failed to update User in Gift transaction:`, error);
          throw error;
        }
        
        console.log(`[DEBUG] Gift transaction completed successfully`);
        return { data: results };
      });
    } catch (error: any) {
      console.error(`[ERROR] Gift transaction failed:`, error);
      console.error(`[ERROR] Error details:`, {
        message: error?.message,
        code: error?.code,
        sqlState: error?.sqlState,
        sqlMessage: error?.sqlMessage
      });
      return {
        error: "Failed to create gift game result.",
      };
    }
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
        
        // Tính toán lại magicStone thay vì dựa vào giá trị trong DB
        // 1. Tính tổng topup từ paymenttb trong FnetDB (giống user-calculator)
        const fnetDB = await getFnetDB();
        const startOfWeekVN = getStartOfWeekVNISO();
        const endOfWeekVN = getEndOfWeekVNISO();
        
        const topupResult = await fnetDB.$queryRawUnsafe<any[]>(`
          SELECT COALESCE(CAST(SUM(p.AutoAmount) AS DECIMAL(18,2)), 0) AS totalTopUp
          FROM fnet.paymenttb p
          WHERE p.UserId = ${userId}
            AND p.PaymentType = 4
            AND p.Note = N'Thời gian phí'
            AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) >= '${startOfWeekVN}'
            AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) <= NOW()
        `);
        
        // Convert BigInt to number nếu cần
        const topUpValue = topupResult[0]?.totalTopUp;
        const userTopUp = typeof topUpValue === 'bigint' 
          ? Number(topUpValue) 
          : Number(topUpValue || 0);
        
        // 2. Tính số rounds từ topup
        const spendPerRound = Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND || 30000);
        const round = Math.floor(userTopUp / spendPerRound);
        
        // 3. Đếm số rounds đã dùng (từ UserStarHistory type = 'GAME' trong tuần này)
        // Dùng hàm từ timezone-utils để tính đầu tuần và cuối tuần theo timezone VN
        
        const usedRoundsResult = await tx.$queryRaw<any[]>`
          SELECT COUNT(*) as count
          FROM UserStarHistory
          WHERE userId = ${userId} AND branch = ${branch}
            AND type = 'GAME'
            AND createdAt >= ${startOfWeekVN}
            AND createdAt <= ${endOfWeekVN}
        `;
        const usedRounds = Number(usedRoundsResult[0]?.count || 0);
        
        // 4. Tính magicStone thực tế
        const actualMagicStone = round - usedRounds;
        
        console.log(`[DEBUG] Calculated magicStone - userTopUp: ${userTopUp}, round: ${round}, usedRounds: ${usedRounds}, actualMagicStone: ${actualMagicStone}, DB magicStone: ${user.magicStone}`);
        
        if (actualMagicStone < rolls) {
          console.log(`[DEBUG] Insufficient magic stone - user has: ${actualMagicStone}, needs: ${rolls}`);
          return { error: "Bạn không đủ đá năng lượng." };
        }
        console.log(`[DEBUG] User found - actualMagicStone: ${actualMagicStone}, stars: ${user.stars}`);

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
              VALUES (${userId}, ${selectedItem.id}, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
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
              VALUES (${userId}, 'GAME', ${currentStars}, ${currentStars + addedStar}, ${gameResult.id}, ${getCurrentTimeVNDB()}, ${branch})
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
        // Update user cuối cùng - dùng actualMagicStone đã tính
        const newMagicStone = actualMagicStone - rolls;
        console.log(`[DEBUG] Updating User in transaction - new stars: ${user.stars + totalAddedStars}, new magicStone: ${newMagicStone} (was ${actualMagicStone}), userId: ${userId}, branch: ${branch}`);
        try {
          await tx.$executeRaw`
            UPDATE User 
            SET stars = ${user.stars + totalAddedStars}, 
                magicStone = ${newMagicStone}, 
                updatedAt = ${getCurrentTimeVNDB()}
            WHERE userId = ${userId} AND branch = ${branch}
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
