const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

describe('Prisma Timezone Handling Tests', () => {
  describe('1. ISO String vs Date Object', () => {
    test('should show difference between ISO string and Date object', () => {
      const nowVN = dayjs().tz("Asia/Ho_Chi_Minh");
      
      // ISO string with timezone offset
      const isoString = nowVN.format(); // e.g., "2024-01-15T14:30:00+07:00"
      
      // Date object (converts to local timezone)
      const dateObject = new Date(nowVN.format()); // e.g., Date object
      
      console.log('ISO String with timezone:', isoString);
      console.log('Date Object:', dateObject);
      console.log('Date Object toISOString():', dateObject.toISOString());
      
      // ISO string preserves timezone offset
      expect(isoString).toContain('+07:00');
      
      // Date object converts to local timezone
      expect(dateObject.toISOString()).toContain('Z');
    });

    test('should demonstrate Prisma behavior', () => {
      const nowVN = dayjs().tz("Asia/Ho_Chi_Minh");
      
      // What we were using before (ISO string)
      const isoString = nowVN.format();
      
      // What we should use for Prisma (Date object)
      const dateObject = new Date(nowVN.format());
      
      // Simulate what Prisma does
      const prismaStored = dateObject.toISOString();
      
      console.log('Original VN time:', nowVN.format('YYYY-MM-DD HH:mm:ss Z'));
      console.log('ISO String sent to Prisma:', isoString);
      console.log('Date Object sent to Prisma:', dateObject);
      console.log('What Prisma actually stores:', prismaStored);
      
      // Prisma will store UTC time regardless of input format
      expect(prismaStored).toContain('Z');
    });
  });

  describe('2. Start of Day Handling', () => {
    test('should handle start of day correctly', () => {
      const startOfDayVN = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
      
      // ISO string approach (what we were doing)
      const isoString = startOfDayVN.format();
      
      // Date object approach (what we should do)
      const dateObject = new Date(startOfDayVN.format());
      
      console.log('Start of day VN (ISO):', isoString);
      console.log('Start of day VN (Date):', dateObject);
      console.log('Date object toISOString():', dateObject.toISOString());
      
      // Both approaches result in the same UTC time being stored
      // But Date object is the correct way to work with Prisma
      expect(dateObject.toISOString()).toContain('T00:00:00.000Z');
    });
  });

  describe('3. Timezone Conversion Behavior', () => {
    test('should understand timezone conversion', () => {
      const vnTime = dayjs().tz("Asia/Ho_Chi_Minh");
      const utcTime = dayjs().utc();
      
      console.log('VN Time:', vnTime.format('YYYY-MM-DD HH:mm:ss Z'));
      console.log('UTC Time:', utcTime.format('YYYY-MM-DD HH:mm:ss Z'));
      
      // Vietnam is UTC+7
      const timeDiff = vnTime.diff(utcTime, 'hour');
      expect(Math.abs(timeDiff)).toBe(7);
    });

    test('should show how Prisma handles timezone conversion', () => {
      const nowVN = dayjs().tz("Asia/Ho_Chi_Minh");
      const nowUTC = dayjs().utc();
      
      // When we send a Date object to Prisma
      const dateObject = new Date(nowVN.format());
      
      // Prisma converts it to UTC for storage
      const storedInDB = dateObject.toISOString();
      
      console.log('Current VN time:', nowVN.format('YYYY-MM-DD HH:mm:ss Z'));
      console.log('Current UTC time:', nowUTC.format('YYYY-MM-DD HH:mm:ss Z'));
      console.log('Stored in DB (UTC):', storedInDB);
      
      // The stored time should match UTC time
      expect(storedInDB).toBe(nowUTC.toISOString());
    });
  });

  describe('4. Query Timezone Handling', () => {
    test('should handle query timezone correctly', () => {
      const startOfDayVN = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
      
      // For queries, we need to use Date object
      const queryDate = new Date(startOfDayVN.format());
      
      console.log('Start of day VN:', startOfDayVN.format('YYYY-MM-DD HH:mm:ss Z'));
      console.log('Query date (Date object):', queryDate);
      console.log('Query date toISOString():', queryDate.toISOString());
      
      // This Date object will be converted to UTC by Prisma
      // But it represents the correct Vietnam start of day
      expect(queryDate.toISOString()).toContain('T00:00:00.000Z');
    });
  });
});

console.log('🧪 Prisma timezone handling tests completed'); 