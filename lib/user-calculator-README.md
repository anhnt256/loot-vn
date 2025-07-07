# User Calculator Utility

Utility function để tính toán thông tin chi tiết cho danh sách active users.

## Tính năng

- Tính toán số lượt check-in có thể claim
- Tính toán số lượt quay thưởng (paid rounds + gift rounds - used rounds)
- Lấy thông tin user (stars, magicStone, userName, etc.)
- Batch queries để tối ưu hiệu suất

## Cách sử dụng

### 1. Import utility function

```typescript
import { calculateActiveUsersInfo, ActiveUser, UserInfo } from '@/lib/user-calculator';
```

### 2. Định nghĩa dữ liệu đầu vào

```typescript
const activeUsers: ActiveUser[] = [
  { UserId: "123", UserType: "VIP" },
  { UserId: "456", UserType: "NORMAL" },
  { UserId: "789", UserType: "VIP" },
];
```

### 3. Gọi function

```typescript
const results: UserInfo[] = await calculateActiveUsersInfo(activeUsers, "GO_VAP");
```

### 4. Kết quả trả về

```typescript
interface UserInfo {
  userId: number;
  userName?: string;
  userType?: string;
  totalCheckIn: number;      // Tổng số sao check-in có thể nhận
  claimedCheckIn: number;    // Số sao đã nhận
  availableCheckIn: number;  // Số sao có thể nhận
  round: number;         // Tổng số lượt quay thưởng
  stars: number;         // Số sao hiện tại
  magicStone: number;    // Số đá năng lượng
  isUseApp: boolean;     // Có sử dụng app không
  note: string;          // Ghi chú
}
```

## API Endpoint

### POST /api/user-calculator

**Request:**
```json
{
  "activeUsers": [
    { "UserId": "123", "UserType": "VIP" },
    { "UserId": "456", "UserType": "NORMAL" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": 123,
      "userName": "John Doe",
      "userType": "VIP",
      "totalCheckIn": 3000,
      "claimedCheckIn": 1000,
      "availableCheckIn": 2000,
      "round": 5,
      "stars": 15000,
      "magicStone": 3,
      "isUseApp": true,
      "note": ""
    }
  ],
  "count": 1
}
```

## Test

Chạy script test:

```bash
node scripts/test-user-calculator.js
```

## Logic tính toán

### Check-in (totalCheckIn, claimedCheckIn, availableCheckIn)
1. **totalCheckIn**: Tính tổng thời gian sử dụng máy trong ngày nhân với stars per hour
2. **claimedCheckIn**: Số sao đã claim trong ngày
3. **availableCheckIn**: totalCheckIn - claimedCheckIn (số sao còn có thể nhận)

### Rounds
1. **Paid Rounds**: Tổng tiền nạp / SPEND_PER_ROUND
2. **Gift Rounds**: Tổng gift rounds chưa hết hạn
3. **Used Rounds**: Số lượt đã quay trong tuần
4. **Total**: Paid + Gift - Used

### User Data
- Lấy từ database theo userId và branch
- Bao gồm: stars, magicStone, userName, isUseApp, note

## Lưu ý

- Function này sử dụng batch queries để tối ưu hiệu suất
- Tất cả queries chạy song song với Promise.all
- Cần có branch cookie để xác định chi nhánh
- Timezone được xử lý theo VN timezone 