const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

console.log('=== Testing Invalid Dates ===');
console.log('invalid-date:', dayjs('invalid-date').isValid());
console.log('not-a-date:', dayjs('not-a-date').isValid());
console.log('2024-13-32:', dayjs('2024-13-32').isValid());
console.log('2024-00-00:', dayjs('2024-00-00').isValid());
console.log('2024-13-01:', dayjs('2024-13-01').isValid(), '->', dayjs('2024-13-01').format('YYYY-MM-DD'));
console.log('2024-00-01:', dayjs('2024-00-01').isValid(), '->', dayjs('2024-00-01').format('YYYY-MM-DD'));
console.log('2024-02-30:', dayjs('2024-02-30').isValid(), '->', dayjs('2024-02-30').format('YYYY-MM-DD'));
console.log('2024-04-31:', dayjs('2024-04-31').isValid(), '->', dayjs('2024-04-31').format('YYYY-MM-DD'));
console.log('2023-02-29:', dayjs('2023-02-29').isValid(), '->', dayjs('2023-02-29').format('YYYY-MM-DD')); 