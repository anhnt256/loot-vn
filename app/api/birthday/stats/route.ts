import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get('branch')?.value || 'GO_VAP';

    // Get total users who participated
    const totalUsersResult = await db.$queryRaw<any[]>`
      SELECT COUNT(DISTINCT userId) as totalUsers
      FROM BirthdayTransaction 
      WHERE branch = ${branch}
    `;

    // Get total claimed rewards
    const totalClaimedResult = await db.$queryRaw<any[]>`
      SELECT COUNT(*) as totalClaimed
      FROM UserBirthdayProgress 
      WHERE branch = ${branch} AND isClaimed = 1
    `;

    // Get total bonus given
    const totalBonusResult = await db.$queryRaw<any[]>`
      SELECT COALESCE(SUM(amount), 0) as totalBonusGiven
      FROM BirthdayTransaction 
      WHERE branch = ${branch} AND transactionType = 'BONUS'
    `;

    // Get total free spins given
    const totalFreeSpinsResult = await db.$queryRaw<any[]>`
      SELECT COALESCE(SUM(amount), 0) as totalFreeSpinsGiven
      FROM BirthdayTransaction 
      WHERE branch = ${branch} AND transactionType = 'FREE_SPIN'
    `;

    const stats = {
      totalUsers: totalUsersResult[0]?.totalUsers || 0,
      totalClaimed: totalClaimedResult[0]?.totalClaimed || 0,
      totalBonusGiven: totalBonusResult[0]?.totalBonusGiven || 0,
      totalFreeSpinsGiven: totalFreeSpinsResult[0]?.totalFreeSpinsGiven || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching birthday stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch birthday stats' },
      { status: 500 }
    );
  }
} 