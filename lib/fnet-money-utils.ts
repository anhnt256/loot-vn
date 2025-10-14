"use server";

import { db, getFnetDB } from "@/lib/db";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";

export type WalletType = "MAIN" | "SUB";

export interface UpdateFnetMoneyParams {
  userId: number;
  branch: string;
  walletType: WalletType;
  amount: number; // Amount to ADD (can be negative to subtract)
  targetId?: number;
  transactionType?: string; // e.g., 'REWARD', 'BIRTHDAY', etc.
  saveHistory?: boolean; // Default true, set false to skip saving history
}

/**
 * Update Fnet money with transaction safety
 * This function handles:
 * 1. Get current balance from wallettb based on walletType
 * 2. Calculate new balance
 * 3. Save to FnetHistory (if saveHistory = true)
 * 4. Update wallettb (main or sub based on walletType)
 * 5. Update usertb.RemainMoney = main + sub
 */
export async function updateFnetMoney(params: UpdateFnetMoneyParams) {
  const {
    userId,
    branch,
    walletType,
    amount,
    targetId,
    transactionType,
    saveHistory = true,
  } = params;

  console.log(
    `[updateFnetMoney] Starting for userId: ${userId}, walletType: ${walletType}, amount: ${amount}, saveHistory: ${saveHistory}`,
  );

  try {
    const fnetDB = await getFnetDB();

    // 1. Get current wallet balance from fnetDB
    const walletResult = await fnetDB.$queryRaw<any[]>`
      SELECT id, main, sub, userid 
      FROM wallettb 
      WHERE userid = ${userId}
      LIMIT 1
    `;

    if (walletResult.length === 0) {
      throw new Error(`Wallet not found for userId: ${userId}`);
    }

    const wallet = walletResult[0];
    const currentMain = Number(wallet.main) || 0;
    const currentSub = Number(wallet.sub) || 0;

    // 2. Calculate new balance based on walletType
    let oldMoney = 0;
    let newMoney = 0;
    let newMain = currentMain;
    let newSub = currentSub;

    if (walletType === "MAIN") {
      oldMoney = currentMain;
      newMoney = currentMain + amount;
      newMain = newMoney;
    } else {
      // SUB
      oldMoney = currentSub;
      newMoney = currentSub + amount;
      newSub = newMoney;
    }

    // 3. Calculate new RemainMoney (always = main + sub)
    const newRemainMoney = newMain + newSub;

    console.log(
      `[updateFnetMoney] Old ${walletType}: ${oldMoney}, New ${walletType}: ${newMoney}, New RemainMoney: ${newRemainMoney}`,
    );

    // 4. Save to FnetHistory in gateway DB (if saveHistory = true)
    // Lưu snapshot đầy đủ của cả main và sub tại thời điểm transaction
    if (saveHistory) {
      if (walletType === "MAIN") {
        // Update MAIN: oldMainMoney -> newMainMoney, sub giữ nguyên
        await db.$executeRaw`
          INSERT INTO FnetHistory (userId, branch, oldMainMoney, newMainMoney, oldSubMoney, newSubMoney, moneyType, targetId, type, createdAt, updatedAt)
          VALUES (${userId}, ${branch}, ${currentMain}, ${newMain}, ${currentSub}, ${currentSub}, 'MAIN', ${targetId || null}, ${transactionType || null}, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
        `;
      } else {
        // Update SUB: oldSubMoney -> newSubMoney, main giữ nguyên
        await db.$executeRaw`
          INSERT INTO FnetHistory (userId, branch, oldSubMoney, newSubMoney, oldMainMoney, newMainMoney, moneyType, targetId, type, createdAt, updatedAt)
          VALUES (${userId}, ${branch}, ${currentSub}, ${newSub}, ${currentMain}, ${currentMain}, 'SUB', ${targetId || null}, ${transactionType || null}, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
        `;
      }
      console.log(
        `[updateFnetMoney] Saved to FnetHistory - oldMain: ${currentMain}, newMain: ${newMain}, oldSub: ${currentSub}, newSub: ${newSub}`,
      );
    } else {
      console.log(`[updateFnetMoney] Skipped saving to FnetHistory`);
    }

    // 5. Update fnet database (update wallettb và usertb)
    // Update wallettb (main or sub based on walletType)
    if (walletType === "MAIN") {
      await fnetDB.$executeRaw`
        UPDATE wallettb 
        SET main = ${newMain}
        WHERE userid = ${userId}
      `;
    } else {
      await fnetDB.$executeRaw`
        UPDATE wallettb 
        SET sub = ${newSub}
        WHERE userid = ${userId}
      `;
    }

    console.log(
      `[updateFnetMoney] Updated wallettb.${walletType.toLowerCase()}`,
    );

    // 6. Update usertb.RemainMoney = main + sub
    // Also update Birthdate and ExpiryDate for compatibility
    const today = new Date();
    today.setFullYear(today.getFullYear() - 20);
    const todayFormatted = today.toISOString().split("T")[0] + "T00:00:00.000Z";

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 10);
    const expiryDateFormatted =
      expiryDate.toISOString().split("T")[0] + "T00:00:00.000Z";

    await fnetDB.$executeRaw`
      UPDATE usertb 
      SET RemainMoney = ${newRemainMoney},
          Birthdate = ${todayFormatted},
          ExpiryDate = ${expiryDateFormatted}
      WHERE UserId = ${userId}
    `;

    console.log(
      `[updateFnetMoney] Updated usertb.RemainMoney: ${newRemainMoney}`,
    );

    console.log(`[updateFnetMoney] Transaction completed successfully`);

    return {
      success: true,
      message: "Fnet money updated successfully",
    };
  } catch (error) {
    console.error(`[updateFnetMoney] Error:`, error);
    throw new Error(
      `Failed to update fnet money: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get current wallet balance
 */
export async function getWalletBalance(userId: number) {
  try {
    const fnetDB = await getFnetDB();

    const walletResult = await fnetDB.$queryRaw<any[]>`
      SELECT main, sub, userid 
      FROM wallettb 
      WHERE userid = ${userId}
      LIMIT 1
    `;

    if (walletResult.length === 0) {
      return null;
    }

    const wallet = walletResult[0];
    return {
      main: Number(wallet.main) || 0,
      sub: Number(wallet.sub) || 0,
      total: (Number(wallet.main) || 0) + (Number(wallet.sub) || 0),
    };
  } catch (error) {
    console.error(`[getWalletBalance] Error:`, error);
    throw error;
  }
}
