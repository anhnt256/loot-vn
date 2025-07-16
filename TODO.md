# TODO - Mission Claim API Implementation

## Overview
Implement API để claim nhiệm vụ với logic check toàn bộ giờ chơi, order, nạp tiền từ database fnet.

## Tasks

### 1. Database Schema
- [x] Thêm model `UserMissionCompletion` vào `prisma/schema.prisma`
- [x] Verify schema changes

### 2. API Endpoints

#### 2.1 Mission Claim API
- [x] Tạo `app/api/missions/[id]/claim/route.ts`
- [x] Implement logic check thời gian active của nhiệm vụ
- [x] Implement logic check completion status (tránh claim 2 lần/ngày)
- [x] Implement logic check tiến độ thực tế từ fnet database:
  - **HOURS**: Tính tổng thời gian chơi từ `systemlogtb`
  - **ORDER**: Tính tổng tiền đặt hàng từ `paymenttb`
  - **TOPUP**: Tính tổng tiền nạp từ `paymenttb`
- [x] Tạo record completion khi đủ điều kiện
- [x] Cộng XP vào battle pass progress
- [x] Return response với thông tin completion

#### 2.2 Mission Progress API
- [ ] Tạo `app/api/missions/progress/route.ts`
- [ ] Implement logic tính tiến độ thực tế cho tất cả nhiệm vụ
- [ ] Return progress data cho frontend hiển thị

#### 2.3 Update Mission List API
- [x] Cập nhật `app/api/missions/route.ts`
- [x] Thêm logic lấy completion status cho mỗi nhiệm vụ
- [x] Return missions với thông tin completion

### 3. Frontend Updates

#### 3.1 DailyMissions Component
- [x] Cập nhật interface `Mission` để bao gồm `actualValue`
- [x] Thêm query để fetch mission progress
- [x] Hiển thị progress bar cho nhiệm vụ đang active
- [x] Cập nhật logic claim để sử dụng API mới
- [x] Invalidate queries sau khi claim thành công

#### 3.2 UI Improvements
- [x] Hiển thị tiến độ thực tế (actual/required)
- [x] Progress bar với animation
- [x] Disable button khi chưa đủ điều kiện
- [x] Loading states cho claim action

### 4. Logic Implementation Details

#### 4.1 Time-based Mission Logic
```typescript
const isMissionActive = (mission) => {
  // All day missions (0-23h)
  if (startHours === 0 && endHours === 23) return true;
  
  // Overnight missions (e.g., 22-6h)
  if (startHours > endHours) {
    return currentHour >= startHours || currentHour <= endHours;
  }
  
  // Normal time range
  return currentHour >= startHours && currentHour <= endHours;
};
```

#### 4.2 Progress Calculation
```typescript
// HOURS: Calculate from systemlogtb
const playSessions = await fnetDB.$queryRaw`
  SELECT * FROM fnet.systemlogtb 
  WHERE UserId = ${userId} 
    AND status = 3 
    AND (EnterDate = ${curDate} OR EndDate = ${curDate})
`;

// ORDER: Calculate from paymenttb
const orderPayments = await fnetDB.$queryRaw`
  SELECT SUM(AutoAmount) FROM fnet.paymenttb 
  WHERE UserId = ${userId} 
    AND Note LIKE '%đơn hàng%' 
    AND ServeDate = ${curDate}
`;

// TOPUP: Calculate from paymenttb  
const topupPayments = await fnetDB.$queryRaw`
  SELECT SUM(AutoAmount) FROM fnet.paymenttb 
  WHERE UserId = ${userId} 
    AND Note LIKE '%nạp tiền%' 
    AND ServeDate = ${curDate}
`;
```

### 5. Error Handling
- [ ] Handle database connection errors
- [ ] Handle invalid mission ID
- [ ] Handle mission not active
- [ ] Handle already completed missions
- [ ] Handle insufficient progress
- [ ] Handle fnet database errors

### 7. Performance Considerations
- [ ] Optimize database queries
- [ ] Add caching cho progress data
- [ ] Implement rate limiting nếu cần
- [ ] Monitor API response times

### 8. Security
- [ ] Validate user permissions
- [ ] Prevent manipulation of progress data
- [ ] Sanitize input parameters
- [ ] Log suspicious activities

## Notes
- Sử dụng `userId` và `branch` từ cookie để join với database
- Tất cả tính toán phải dựa trên dữ liệu thực từ fnet database
- Frontend sẽ tự map tab dựa trên `mission.type`
- Progress data refresh bằng nút "Cập nhật"
- Mission data refresh bằng nút "Cập nhật" 