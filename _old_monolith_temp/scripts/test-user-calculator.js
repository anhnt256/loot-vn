const { calculateActiveUsersInfo } = require('../lib/user-calculator.ts');

async function testUserCalculator() {
  console.log('=== Testing User Calculator ===\n');
  
  try {
    // Test với một số user IDs thực tế
    const testUserIds = [5198]; // Thay bằng user ID thực tế
    const testBranch = 'branch1'; // Thay bằng branch thực tế
    
    console.log('Test Parameters:', {
      userIds: testUserIds,
      branch: testBranch
    });
    
    const results = await calculateActiveUsersInfo(testUserIds, testBranch);
    
    console.log('\n=== Final Results ===');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('Error testing user calculator:', error);
  }
}

// Chạy test
testUserCalculator(); 