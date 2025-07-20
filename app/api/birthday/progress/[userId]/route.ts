import { NextRequest, NextResponse } from 'next/server';
import { db, getFnetDB } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get('branch')?.value || 'GO_VAP';
    const userId = parseInt(params.userId);

    // Get fnetDB instance
    const fnetDB = await getFnetDB();

    // Hard code date range for birthday event: 21/07/2025 to 31/07/2025
    const startDate = '2025-07-21 00:00:00';
    const endDate = '2025-07-31 23:59:59';

    // Get total spent from fnet.paymenttb (real-time data)
    const totalSpentResult = await fnetDB.$queryRawUnsafe<any[]>(`
      SELECT 
        COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS totalSpent
      FROM fnet.paymenttb
      WHERE PaymentType = 4
        AND UserId = ${userId}
        AND Note = N'Thời gian phí'
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= '${startDate}'
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) <= '${endDate}'
    `);

    const totalSpent = totalSpentResult[0]?.totalSpent || 0;

    // Get all available tiers
    const allTiers = await db.$queryRaw<any[]>`
      SELECT 
        id,
        tierName,
        discountPercent,
        milestoneAmount,
        additionalAmount,
        bonusAmount,
        totalAtTier,
        totalReceived,
        freeSpins,
        milestoneAmount as tkChinh,
        totalReceived as tkPhu,
        totalAtTier as tongNhan
      FROM BirthdayTier 
      WHERE isActive = 1 
      ORDER BY milestoneAmount ASC
    `;

    // Get user's existing progress
    const existingProgress = await db.$queryRaw<any[]>`
      SELECT 
        ubp.id,
        ubp.userId,
        ubp.tierId,
        ubp.branch,
        ubp.isClaimed,
        ubp.claimedAt,
        ubp.totalSpent,
        ubp.createdAt,
        bt.tierName,
        bt.discountPercent,
        bt.milestoneAmount,
        bt.additionalAmount,
        bt.bonusAmount,
        bt.totalAtTier,
        bt.totalReceived,
        bt.freeSpins
      FROM UserBirthdayProgress ubp
      LEFT JOIN BirthdayTier bt ON ubp.tierId = bt.id
      WHERE ubp.userId = ${userId} AND ubp.branch = ${branch}
      ORDER BY bt.milestoneAmount ASC
    `;

    // Calculate current tier based on totalSpent
    let currentTier = null;
    for (const tier of allTiers) {
      if (totalSpent >= tier.milestoneAmount) {
        currentTier = tier;
      } else {
        break;
      }
    }

    // Build progress array with real-time data
    const progress = allTiers.map(tier => {
      const existingRecord = existingProgress.find(p => p.tierId === tier.id);
      const isUnlocked = totalSpent >= tier.milestoneAmount;
      const isClaimed = existingRecord?.isClaimed || false;
      
      return {
        id: existingRecord?.id || null,
        userId,
        tierId: tier.id,
        branch,
        isClaimed,
        claimedAt: existingRecord?.claimedAt || null,
        totalSpent: totalSpent, // Use real-time totalSpent
        createdAt: existingRecord?.createdAt || null,
        tierName: tier.tierName,
        discountPercent: tier.discountPercent,
        milestoneAmount: tier.milestoneAmount,
        additionalAmount: tier.additionalAmount,
        bonusAmount: tier.bonusAmount,
        totalAtTier: tier.totalAtTier,
        totalReceived: tier.totalReceived,
        freeSpins: tier.freeSpins,
        isUnlocked,
        canClaim: isUnlocked && !isClaimed
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        progress,
        totalSpent,
        allTiers,
        currentTier
      }
    });
  } catch (error) {
    console.error('Error fetching birthday progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch birthday progress' },
      { status: 500 }
    );
  }
} 