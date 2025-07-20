import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get('branch')?.value || 'GO_VAP';
    const { userId, amount, description } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or amount' },
        { status: 400 }
      );
    }

    // Record topup transaction
    await db.$executeRaw`
      INSERT INTO BirthdayTransaction (userId, branch, amount, transactionType, description)
      VALUES (${userId}, ${branch}, ${amount}, 'TOPUP', ${description || 'Birthday topup'})
    `;

    // Get updated total spent
    const totalSpentResult = await db.$queryRaw<any[]>`
      SELECT COALESCE(SUM(amount), 0) as totalSpent
      FROM BirthdayTransaction 
      WHERE userId = ${userId} AND branch = ${branch} AND transactionType = 'TOPUP'
    `;

    const totalSpent = totalSpentResult[0]?.totalSpent || 0;

    // Get available tiers that user can claim
    const availableTiers = await db.$queryRaw<any[]>`
      SELECT 
        bt.id,
        bt.tierName,
        bt.discountPercent,
        bt.milestoneAmount,
        bt.additionalAmount,
        bt.bonusAmount,
        bt.totalAtTier,
        bt.totalReceived,
        bt.freeSpins
      FROM BirthdayTier bt
      WHERE bt.isActive = 1 
        AND bt.milestoneAmount <= ${totalSpent}
        AND bt.id NOT IN (
          SELECT tierId 
          FROM UserBirthdayProgress 
          WHERE userId = ${userId} AND branch = ${branch} AND isClaimed = 1
        )
      ORDER BY bt.milestoneAmount ASC
    `;

    return NextResponse.json({
      success: true,
      data: {
        message: 'Topup recorded successfully',
        totalSpent,
        availableTiers
      }
    });

  } catch (error) {
    console.error('Error recording birthday topup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record topup' },
      { status: 500 }
    );
  }
} 