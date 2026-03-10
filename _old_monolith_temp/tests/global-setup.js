// Global setup for Jest tests
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set environment variables for tests
process.env.NODE_ENV = 'test';
process.env.TZ = 'Asia/Ho_Chi_Minh';

// Global test configuration
global.testConfig = {
  timezone: 'Asia/Ho_Chi_Minh',
  defaultDate: '2024-01-15',
  testTimeout: 10000
};

// Setup test utilities
global.createTestDate = (dateString) => {
  return dayjs(dateString).tz("Asia/Ho_Chi_Minh");
};

global.createTestSession = (enterDate, enterTime, endDate, endTime) => {
  return {
    EnterDate: enterDate,
    EnterTime: enterTime,
    EndDate: endDate,
    EndTime: endTime
  };
};

global.validateTimezone = (dateTime) => {
  const vnTime = dayjs(dateTime).tz("Asia/Ho_Chi_Minh");
  return {
    isValid: vnTime.isValid(),
    timezone: vnTime.format('Z'),
    formatted: vnTime.format('YYYY-MM-DD HH:mm:ss Z')
  };
};

// Setup test data
global.testData = {
  userId: 123,
  branch: 'branch1',
  spendPerRound: 30000,
  starsPerHour: 1000,
  rateLimitWindow: 10 * 1000, // 10 seconds
  spamLimit: 10 * 60 * 1000 // 10 minutes
};

console.log('🧪 Global test setup completed');
console.log(`⏰ Test timezone: ${process.env.TZ}`);
console.log(`📅 Test date: ${global.testConfig.defaultDate}`);

module.exports = async () => {
  console.log('✅ Global setup finished');
}; 