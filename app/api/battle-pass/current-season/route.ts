import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const currentSeason = await prisma.battlePassSeason.findFirst({
      where: {
        isActive: true,
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        rewards: {
          orderBy: {
            level: 'asc',
          },
        },
      },
    });

    if (!currentSeason) {
      return NextResponse.json(
        { error: 'No active season found' },
        { status: 404 }
      );
    }

    return NextResponse.json(currentSeason);
  } catch (error) {
    console.error('Error fetching current season:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 