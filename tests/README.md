# Timezone Tests cho Gateway App

Bộ testcase này đảm bảo timezone luôn đúng với giờ VN (GMT+7) cho các hàm quan trọng trong hệ thống.

## 📋 Các Testcase Đã Tạo

### 1. `timezone-tests.js` - Testcase Tổng Quan
- **Game Roll Timezone Tests**: Kiểm tra lượt quay hàng tuần reset đúng thứ 2 00:00 VN
- **Check-in Timezone Tests**: Kiểm tra điểm danh hàng ngày và anti-spam
- **Daily Usage Time Tests**: Kiểm tra tính thời gian chơi hàng ngày
- **Integration Tests**: Kiểm tra DST, năm nhuận, chuyển đổi timezone
- **Error Handling Tests**: Xử lý lỗi timezone và date không hợp lệ
- **Performance Tests**: Kiểm tra hiệu suất chuyển đổi timezone

### 2. `api-timezone-tests.js` - Testcase API Endpoints
- **Game API Tests**: Kiểm tra API tính lượt quay, tạo game result
- **Check-in API Tests**: Kiểm tra API điểm danh, rate limiting
- **Daily Usage API Tests**: Kiểm tra API tính thời gian sử dụng
- **Rate Limiting Tests**: Kiểm tra giới hạn request
- **Edge Cases Tests**: Xử lý dữ liệu không hợp lệ
- **Performance Tests**: Kiểm tra hiệu suất với dữ liệu lớn

## 🚀 Cách Chạy Tests

### Cài đặt dependencies
```bash
npm install --save-dev jest dayjs
```

### Chạy tất cả tests
```bash
npm test
```

### Chạy riêng từng file
```bash
# Chạy testcase tổng quan
npx jest tests/timezone-tests.js

# Chạy testcase API
npx jest tests/api-timezone-tests.js
```

### Chạy với coverage
```bash
npx jest --coverage
```

## 📝 Các Testcase Quan Trọng

### 1. Game Roll (Lượt Quay)
```javascript
// Kiểm tra reset lượt quay vào thứ 2 00:00 VN
test('should reset game rounds at Monday 00:00 VN time', () => {
  const mondayMidnight = dayjs('2024-01-15 00:00:00').tz("Asia/Ho_Chi_Minh");
  const sundayNight = dayjs('2024-01-14 23:59:59').tz("Asia/Ho_Chi_Minh");
  // Logic kiểm tra reset
});
```

### 2. Check-in (Điểm Danh)
```javascript
// Kiểm tra anti-spam 10 phút
test('should prevent spam check-in with VN timezone', () => {
  const firstCheckIn = dayjs('2024-01-15 10:00:00').tz("Asia/Ho_Chi_Minh");
  const attempts = [
    { time: '2024-01-15 10:05:00', shouldAllow: false }, // 5 phút sau
    { time: '2024-01-15 10:10:00', shouldAllow: true },  // 10 phút
  ];
  // Logic kiểm tra rate limit
});
```

### 3. Daily Usage Time (Thời Gian Chơi)
```javascript
// Kiểm tra tính thời gian chơi qua đêm
test('should handle overnight sessions correctly', () => {
  const overnightSession = {
    EnterDate: '2024-01-15',
    EnterTime: '23:00:00',
    EndDate: '2024-01-16',
    EndTime: '01:00:00'
  };
  // Logic tính thời gian cho từng ngày
});
```

## 🔧 Cấu Hình Jest

Thêm vào `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:timezone": "jest tests/timezone-tests.js",
    "test:api": "jest tests/api-timezone-tests.js"
  },
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"]
  }
}
```

## 📊 Kết Quả Mong Đợi

### Test Results
```
✓ Timezone Vietnam Tests
  ✓ Game Roll Timezone Tests
    ✓ should calculate weekly rounds correctly with VN timezone
    ✓ should reset game rounds at Monday 00:00 VN time
    ✓ should handle timezone edge cases for game rolls
  ✓ Check-in Timezone Tests
    ✓ should calculate daily check-in limits correctly
    ✓ should prevent spam check-in with VN timezone
    ✓ should handle day change during check-in
  ✓ Daily Usage Time Tests
    ✓ should calculate daily play time correctly with VN timezone
    ✓ should handle overnight sessions correctly
    ✓ should handle timezone edge cases for usage time
  ✓ Integration Tests
    ✓ should handle DST (Daylight Saving Time) correctly
    ✓ should handle leap year correctly
    ✓ should handle timezone conversion consistently
  ✓ Error Handling Tests
    ✓ should handle invalid dates gracefully
    ✓ should handle timezone errors
  ✓ Performance Tests
    ✓ should handle large number of timezone conversions efficiently

✓ API Timezone Tests
  ✓ Game API Timezone Tests
    ✓ should calculate rounds correctly with VN timezone
    ✓ should handle weekly reset correctly
    ✓ should create game result with correct VN timestamp
  ✓ Check-in API Timezone Tests
    ✓ should prevent spam check-in with VN timezone
    ✓ should calculate daily check-in limits correctly
    ✓ should handle day change in check-in
  ✓ Daily Usage Time API Tests
    ✓ should calculate daily usage hours correctly
    ✓ should handle overnight sessions correctly
  ✓ Rate Limiting Tests
    ✓ should enforce game roll rate limit with VN timezone
    ✓ should handle rate limit reset correctly
  ✓ Edge Cases and Error Handling
    ✓ should handle invalid session data gracefully
    ✓ should handle timezone conversion errors
  ✓ Performance and Load Tests
    ✓ should handle multiple concurrent requests efficiently
    ✓ should handle large dataset efficiently
```

## 🎯 Các Trường Hợp Đặc Biệt Đã Test

### 1. Timezone Edge Cases
- User ở múi giờ khác nhưng hệ thống vẫn tính theo VN
- Chuyển đổi UTC sang VN timezone
- Xử lý DST (VN không có DST)

### 2. Date Edge Cases
- Năm nhuận (29/02)
- Qua ngày (23:59 → 00:00)
- Qua tuần (Chủ nhật → Thứ 2)

### 3. Performance Edge Cases
- 1000 lần chuyển đổi timezone
- Xử lý 1000 sessions cùng lúc
- Concurrent requests

### 4. Error Edge Cases
- Date không hợp lệ
- Timezone không tồn tại
- Session data bị lỗi

## 🔍 Monitoring và Debug

### Log Timezone Conversions
```javascript
console.log(`UTC: ${utcTime} -> VN: ${vnTime.format('YYYY-MM-DD HH:mm:ss')}`);
```

### Check Current Timezone
```javascript
const currentTime = dayjs().tz("Asia/Ho_Chi_Minh");
console.log(`Current VN time: ${currentTime.format('YYYY-MM-DD HH:mm:ss Z')}`);
```

### Validate Timezone Consistency
```javascript
const utcTime = dayjs.utc('2024-01-15 10:00:00');
const vnTime = utcTime.tz("Asia/Ho_Chi_Minh");
const backToUtc = vnTime.utc();
// backToUtc should equal original utcTime
```

## 📈 Best Practices

1. **Luôn sử dụng `Asia/Ho_Chi_Minh`** thay vì hardcode offset
2. **Validate timezone** trước khi sử dụng
3. **Handle errors gracefully** khi timezone không hợp lệ
4. **Test edge cases** đặc biệt là qua ngày/tuần
5. **Monitor performance** khi xử lý nhiều timezone conversions

## 🚨 Lưu Ý Quan Trọng

- VN timezone luôn là GMT+7, không có DST
- Reset lượt quay vào thứ 2 00:00 VN time
- Reset điểm danh vào 00:00 VN time mỗi ngày
- Anti-spam check-in: 10 phút giữa các lần
- Session qua đêm được tính cho cả 2 ngày

## 📞 Hỗ Trợ

Nếu có vấn đề với timezone, kiểm tra:
1. Dayjs plugins đã được extend chưa
2. Timezone `Asia/Ho_Chi_Minh` có được support không
3. Server timezone có đúng không
4. Database timezone có đúng không 