const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isToday = require('dayjs/plugin/isToday');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isToday);

/**
 * Parse session date time từ database format
 */
function parseSessionDateTime(enterDate, enterTime) {
  try {
    // Parse ngày từ EnterDate
    const date = dayjs(enterDate).tz('Asia/Ho_Chi_Minh');
    
    // Parse giờ/phút/giây từ EnterTime (thường là 1970-01-01Txx:xx:xx.000Z)
    const time = dayjs(enterTime).tz('Asia/Ho_Chi_Minh');
    
    if (!date.isValid() || !time.isValid()) {
      console.log('❌ Invalid date/time:', { enterDate, enterTime });
      return null;
    }
    
    // Gộp ngày từ EnterDate với giờ/phút/giây từ EnterTime
    return date
      .hour(time.hour())
      .minute(time.minute())
      .second(time.second())
      .millisecond(0);
  } catch (error) {
    console.log('❌ Error parsing session date time:', error.message);
    return null;
  }
}

/**
 * Tính tổng thời gian sử dụng trong ngày hiện tại với timezone Vietnam
 */
const calculateDailyUsageTime = (sessions) => {
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const todayStart = now.startOf("day");
  const yesterdayStart = now.subtract(1, "day").startOf("day");
  let totalMinutes = 0;

  console.log('Current time (VN):', now.format('YYYY-MM-DD HH:mm:ss'));
  console.log('Today start (VN):', todayStart.format('YYYY-MM-DD HH:mm:ss'));
  console.log('Yesterday start (VN):', yesterdayStart.format('YYYY-MM-DD HH:mm:ss'));

  for (const session of sessions) {
    try {
      // Validate session data
      if (!session.EnterDate || !session.EnterTime) {
        console.log('❌ Invalid session data - missing EnterDate/EnterTime:', session);
        continue;
      }

      // Parse session date time với logic mới
      const enterDateTime = parseSessionDateTime(session.EnterDate, session.EnterTime);
      
      if (!enterDateTime || !enterDateTime.isValid()) {
        console.log('❌ Failed to parse session date time:', session);
        continue;
      }

      const enterDateStr = enterDateTime.format("YYYY-MM-DD");
      const todayStr = now.format("YYYY-MM-DD");
      const yesterdayStr = yesterdayStart.format("YYYY-MM-DD");
      
      console.log(`\nSession: ${enterDateTime.format('YYYY-MM-DD HH:mm:ss')} - Date: ${enterDateStr}`);
      console.log(`EndDate: ${session.EndDate}, EndTime: ${session.EndTime}`);
      console.log(`TimeUsed: ${session.TimeUsed}`);
      
      if (enterDateStr === todayStr) {
        // Session bắt đầu hôm nay
        if (session.TimeUsed && session.TimeUsed > 0) {
          // Nếu có TimeUsed và > 0, sử dụng giá trị này
          console.log(`✅ Today session with TimeUsed: ${session.TimeUsed} minutes`);
          totalMinutes += session.TimeUsed;
        } else if (!session.EndDate || !session.EndTime) {
          // Session đang diễn ra (EndDate/EndTime null), tính từ lúc bắt đầu đến hiện tại
          const minutesPlayed = now.diff(enterDateTime, "minute");
          console.log(`🔄 Ongoing session, calculated: ${minutesPlayed} minutes`);
          totalMinutes += Math.max(0, minutesPlayed);
        }
      } else if (
        enterDateStr === yesterdayStr &&
        (!session.EndDate || !session.EndTime) // phiên kéo dài qua đêm, chưa kết thúc
      ) {
        const minutesPlayedToday = now.diff(todayStart, "minute");
        console.log(`🌙 Overnight session, adding from today start: ${minutesPlayedToday} minutes`);
        totalMinutes += minutesPlayedToday;
      } else {
        console.log(`❌ Session not counted: ${enterDateStr} vs ${todayStr}/${yesterdayStr}`);
      }
    } catch (error) {
      console.log('❌ Error processing session:', session, error.message);
      continue;
    }
  }

  console.log(`\n📊 Total minutes calculated: ${totalMinutes}`);
  return Math.floor(totalMinutes / 60);
};

// Test data với dữ liệu thực tế từ database
const testSessions = [
  {
    SystemLogId: 85549,
    UserId: 5198,
    MachineName: 'VIP13',
    IPAddress: '192.168.1.163',
    EnterDate: '2025-06-27T00:00:00.000Z',
    EnterTime: '1970-01-01T22:45:57.000Z',
    EndDate: null,
    EndTime: null,
    Status: 3,
    Note: '',
    TimeUsed: 76,
    MoneyUsed: 0,
    PriceAppRentID: 0,
    AppRentMoneyUsed: 0
  }
];

console.log('=== Testing Daily Usage Time Calculation ===\n');
const totalHours = calculateDailyUsageTime(testSessions);
console.log(`\n📊 Total hours: ${totalHours}h`);

// Test timezone conversion
console.log('\n=== Timezone Tests ===');
const testTime = '2024-01-15 14:30:00';
console.log('Original time:', testTime);
console.log('UTC time:', dayjs(testTime).utc().format('YYYY-MM-DD HH:mm:ss'));
console.log('VN time:', dayjs(testTime).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'));

// Test isToday
console.log('\n=== isToday Tests ===');
const today = dayjs().tz('Asia/Ho_Chi_Minh');
const yesterday = today.subtract(1, 'day');
console.log('Today:', today.format('YYYY-MM-DD'), 'isToday:', today.isToday());
console.log('Yesterday:', yesterday.format('YYYY-MM-DD'), 'isToday:', yesterday.isToday()); 