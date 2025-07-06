const fs = require('fs');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const weekOfYear = require('dayjs/plugin/weekOfYear');
const weekday = require('dayjs/plugin/weekday');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);

dayjs.Ls.en.weekStart = 1;

const today = dayjs().tz("Asia/Ho_Chi_Minh");

let output = '';
output += 'Today: ' + today.format('YYYY-MM-DD dddd HH:mm:ss') + '\n';
output += 'Start of day: ' + today.startOf('day').format('YYYY-MM-DD dddd HH:mm:ss') + '\n';
output += 'End of day: ' + today.endOf('day').format('YYYY-MM-DD dddd HH:mm:ss') + '\n';
output += 'Start of week: ' + today.startOf('week').format('YYYY-MM-DD dddd HH:mm:ss') + '\n';
output += 'End of week: ' + today.endOf('week').format('YYYY-MM-DD dddd HH:mm:ss') + '\n';
output += 'Start of month: ' + today.startOf('month').format('YYYY-MM-DD dddd HH:mm:ss') + '\n';
output += 'End of month: ' + today.endOf('month').format('YYYY-MM-DD dddd HH:mm:ss') + '\n';

output += '\nDate object:\n';
output += 'getCurrentDateVN: ' + today.toDate() + '\n';
output += 'getStartOfDayDateVN: ' + today.startOf('day').toDate() + '\n';
output += 'getEndOfDayDateVN: ' + today.endOf('day').toDate() + '\n';
output += 'getStartOfWeekDateVN: ' + today.startOf('week').toDate() + '\n';
output += 'getEndOfWeekDateVN: ' + today.endOf('week').toDate() + '\n';
output += 'getStartOfMonthDateVN: ' + today.startOf('month').toDate() + '\n';
output += 'getEndOfMonthDateVN: ' + today.endOf('month').toDate() + '\n';

output += '\nISO string:\n';
output += 'getCurrentTimeVNISO: ' + today.toISOString() + '\n';
output += 'getStartOfDayVNISO: ' + today.startOf('day').toISOString() + '\n';
output += 'getEndOfDayVNISO: ' + today.endOf('day').toISOString() + '\n';
output += 'getStartOfMonthVNISO: ' + today.startOf('month').toISOString() + '\n';
output += 'getEndOfMonthVNISO: ' + today.endOf('month').toISOString() + '\n';

fs.writeFileSync('test-today.log', output);
console.log('Đã ghi kết quả ra file test-today.log'); 