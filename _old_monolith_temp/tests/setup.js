// Jest setup file for timezone tests
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone for tests
process.env.TZ = 'Asia/Ho_Chi_Minh';

// Global test utilities
global.mockCurrentTime = (dateTime) => {
  const mockDate = dayjs(dateTime).tz("Asia/Ho_Chi_Minh");
  jest.spyOn(dayjs, 'tz').mockReturnValue(mockDate);
};

global.restoreCurrentTime = () => {
  jest.restoreAllMocks();
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Test timeout
jest.setTimeout(10000);

// Global test helpers
global.createMockDate = (dateString) => {
  return dayjs(dateString).tz("Asia/Ho_Chi_Minh");
};

global.createMockSession = (enterDate, enterTime, endDate, endTime) => {
  return {
    EnterDate: enterDate,
    EnterTime: enterTime,
    EndDate: endDate,
    EndTime: endTime
  };
};

global.validateVNTimezone = (dateTime) => {
  const vnTime = dayjs(dateTime).tz("Asia/Ho_Chi_Minh");
  return {
    isValid: vnTime.isValid(),
    timezone: vnTime.format('Z'),
    formatted: vnTime.format('YYYY-MM-DD HH:mm:ss Z')
  };
};

// Export for use in tests
module.exports = {
  dayjs,
  mockCurrentTime: global.mockCurrentTime,
  restoreCurrentTime: global.restoreCurrentTime,
  createMockDate: global.createMockDate,
  createMockSession: global.createMockSession,
  validateVNTimezone: global.validateVNTimezone
}; 