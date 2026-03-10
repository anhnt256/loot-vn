const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMissionCompletion() {
  try {
    console.log('=== Checking Mission Completion ===');
    
    // Get all missions
    const missions = await prisma.mission.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log('All missions:', missions.map(m => ({ id: m.id, name: m.name })));
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Today (start of day):', today.toISOString());
    
    // Get all completion records for today
    const completions = await prisma.userMissionCompletion.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      include: {
        mission: true
      }
    });
    
    console.log('Completions for today:', completions.map(c => ({
      id: c.id,
      userId: c.userId,
      missionId: c.missionId,
      missionName: c.mission.name,
      branch: c.branch,
      createdAt: c.createdAt,
      actualValue: c.actualValue
    })));
    
    // Check specific user (13195 for debug)
    const userCompletions = await prisma.userMissionCompletion.findMany({
      where: {
        userId: 13195,
        createdAt: {
          gte: today
        }
      },
      include: {
        mission: true
      }
    });
    
    console.log('User 13195 completions for today:', userCompletions.map(c => ({
      id: c.id,
      missionId: c.missionId,
      missionName: c.mission.name,
      branch: c.branch,
      createdAt: c.createdAt,
      actualValue: c.actualValue
    })));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissionCompletion(); 