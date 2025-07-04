# Gateway Bonus Feature

## Mô tả
Tính năng Gateway Bonus cho phép user nhận 3 lượt quay miễn phí với các điều kiện cụ thể.

## Điều kiện tham gia
- Tài khoản được tạo trước ngày 05/07/2025
- Chưa từng nhận Gateway Bonus
- Chương trình kéo dài đến hết ngày 15/07/2025

## Cấu hình

### Biến môi trường
Thêm vào file `.env`:

```env
# Ngày hết hạn nhận Gateway Bonus (format: YYYY-MM-DD)
GATEWAY_BONUS_DEADLINE=2025-07-15

# Biến môi trường cho client-side (để ẩn/hiện link trong menu)
NEXT_PUBLIC_GATEWAY_BONUS_DEADLINE=2025-07-15
```

### Cấu trúc database
Tính năng sử dụng bảng `GiftRound` có sẵn với các trường:
- `userId`: ID của user
- `amount`: Số lượt quay (3)
- `reason`: Lý do ("Gateway Bonus")
- `staffId`: ID staff (0 cho system)
- `expiredAt`: Ngày hết hạn
- `isUsed`: Trạng thái sử dụng

## API Endpoints

### GET /api/gateway-bonus
Kiểm tra trạng thái Gateway Bonus của user

**Response:**
```json
{
  "available": true,
  "message": "Bạn có thể nhận 3 lượt quay miễn phí",
  "deadline": "2025-07-15",
  "accountDeadline": "2025-07-05"
}
```

### POST /api/gateway-bonus
Claim Gateway Bonus

**Response:**
```json
{
  "success": true,
  "message": "Nhận Gateway Bonus thành công!",
  "giftRound": {
    "id": 1,
    "userId": 123,
    "amount": 3,
    "reason": "Gateway Bonus",
    "staffId": 0,
    "expiredAt": "2025-07-15T00:00:00.000Z",
    "isUsed": false
  }
}
```

## Cách sử dụng

1. User sẽ thấy banner thông báo Gateway Bonus trên trang dashboard (nếu đủ điều kiện)
2. User có thể click "Nhận ngay" trên banner hoặc truy cập trực tiếp vào trang `/gateway-bonus`
3. Hệ thống kiểm tra điều kiện tham gia
4. Nếu đủ điều kiện, user có thể click "Nhận ngay 3 lượt quay"
5. Hệ thống tạo record trong bảng `GiftRound` và cập nhật `magicStone` của user
6. User có thể sử dụng 3 lượt quay trong trò chơi

## Logic kiểm tra

### Kiểm tra ngày hết hạn
```javascript
const now = dayjs();
const deadline = dayjs(process.env.GATEWAY_BONUS_DEADLINE);
if (now.isAfter(deadline)) {
  // Chương trình đã kết thúc
}
```

### Kiểm tra ngày tạo tài khoản
```javascript
const userCreatedAt = dayjs(user.createdAt);
const accountDeadline = dayjs("2025-07-05");
if (userCreatedAt.isAfter(accountDeadline)) {
  // Tài khoản mới, không đủ điều kiện
}
```

### Kiểm tra đã claim chưa
```javascript
const existingClaim = await db.giftRound.findFirst({
  where: {
    userId: user.id,
    reason: "Gateway Bonus",
  },
});
if (existingClaim) {
  // Đã nhận rồi
}
```

## Giao diện

Page Gateway Bonus có giao diện đẹp với:
- Gradient background
- Card layout responsive
- Loading states
- Error handling
- Toast notifications
- Animated elements

## Tính năng bảo mật

- Kiểm tra authentication qua middleware
- Rate limiting (có thể thêm nếu cần)
- Validation dữ liệu đầu vào
- Error handling đầy đủ

## Monitoring

Để theo dõi việc sử dụng tính năng, có thể query:

```sql
-- Số lượng user đã nhận Gateway Bonus
SELECT COUNT(*) FROM GiftRound WHERE reason = 'Gateway Bonus';

-- Danh sách user đã nhận
SELECT u.userName, gr.createdAt 
FROM GiftRound gr 
JOIN User u ON gr.userId = u.id 
WHERE gr.reason = 'Gateway Bonus';
```

## Troubleshooting

### Lỗi thường gặp

1. **"Unauthorized"**: User chưa đăng nhập
2. **"User not found"**: User không tồn tại trong database
3. **"Chương trình đã kết thúc"**: Đã qua ngày deadline
4. **"Chỉ áp dụng cho tài khoản tạo trước ngày 05/07/2025"**: Tài khoản mới
5. **"Bạn đã nhận Gateway Bonus rồi"**: Đã claim trước đó

### Debug

Kiểm tra logs để debug:
```javascript
console.error("Gateway Bonus check error:", error);
console.error("Gateway Bonus claim error:", error);
```

#### Debug Component
Trong môi trường development, component `GatewayBonusDebug` sẽ hiển thị thông tin debug trên trang dashboard để kiểm tra:
- Current User ID
- Current Time vs Deadline
- API Response Status
- Error messages

#### Common Issues
1. **Banner không hiển thị**: Kiểm tra console logs và debug component
2. **401 Unauthorized**: User chưa đăng nhập hoặc token hết hạn
3. **API không hoạt động**: Kiểm tra middleware và authentication 