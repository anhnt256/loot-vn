# 🎂 Tính Năng Sinh Nhật - Birthday Feature

## Tổng Quan

Tính năng sinh nhật cho phép khách hàng nhận thưởng đặc biệt khi nạp tiền đạt các mốc nhất định. Mỗi mốc sẽ có phần trăm khuyến mãi, tiền thưởng và lượt quay miễn phí tương ứng.

## Cấu Trúc Database

### 1. BirthdayTier
Lưu trữ cấu hình các tier sinh nhật:
- `id`: ID duy nhất
- `tierName`: Tên tier (VD: "Tier 1 - 600%")
- `discountPercent`: Phần trăm khuyến mãi
- `milestoneAmount`: Mốc tiền cần đạt (VNĐ)
- `additionalAmount`: Số tiền cần nạp thêm
- `bonusAmount`: Tiền thưởng nhận được
- `totalAtTier`: Tổng tại từng mốc
- `totalReceived`: Tổng nhận được
- `freeSpins`: Lượt quay tặng
- `isActive`: Trạng thái hoạt động

### 2. UserBirthdayProgress
Theo dõi tiến độ của từng user:
- `userId`: ID user
- `tierId`: ID tier
- `branch`: Chi nhánh
- `isClaimed`: Đã nhận thưởng chưa
- `claimedAt`: Thời gian nhận thưởng
- `totalSpent`: Tổng tiền đã nạp

### 3. BirthdayTransaction
Lưu lịch sử giao dịch:
- `userId`: ID user
- `branch`: Chi nhánh
- `amount`: Số tiền
- `tierId`: ID tier (nếu có)
- `transactionType`: Loại giao dịch (TOPUP/BONUS/FREE_SPIN)
- `description`: Mô tả

## API Endpoints

### 1. Lấy danh sách tier
```
GET /api/birthday/tiers
```

### 2. Lấy tiến độ user
```
GET /api/birthday/progress/[userId]
```

### 3. Nhận thưởng
```
POST /api/birthday/claim
Body: { userId, tierId }
```

### 4. Ghi nhận nạp tiền
```
POST /api/birthday/topup
Body: { userId, amount, description }
```

### 5. Thống kê (Admin)
```
GET /api/birthday/stats
```

### 6. Cập nhật tier (Admin)
```
PATCH /api/birthday/tiers/[id]
Body: { isActive }
```

## Cách Sử Dụng

### 1. Setup Database
```bash
# Chạy migration để tạo bảng
npx prisma db push

# Seed dữ liệu tier mặc định
node scripts/seed-birthday-tiers.js
```

### 2. Trang Người Dùng
- Truy cập: `/birthday`
- Hiển thị các tier và tiến độ
- Cho phép nhận thưởng khi đạt mốc

### 3. Trang Admin
- Truy cập: `/admin/birthday`
- Quản lý tier và xem thống kê
- Bật/tắt tier

## Luồng Hoạt Động

1. **Nạp tiền**: User nạp tiền → gọi API `/api/birthday/topup`
2. **Kiểm tra mốc**: Hệ thống kiểm tra xem user đã đạt mốc nào
3. **Nhận thưởng**: User click "Nhận thưởng" → gọi API `/api/birthday/claim`
4. **Ghi nhận**: Hệ thống ghi nhận bonus và free spins

## Tính Năng Đặc Biệt

- ✅ Mỗi tier chỉ nhận 1 lần
- ✅ Theo dõi theo từng chi nhánh
- ✅ Hiển thị tiến độ real-time
- ✅ Thống kê chi tiết cho admin
- ✅ Giao diện đẹp và responsive

## Bảng Tier Mặc Định

| Tier | Khuyến mãi | Mốc (VNĐ) | Tiền thưởng | Lượt quay |
|------|------------|-----------|-------------|-----------|
| Tier 1 | 600% | 5,000 | 15,000 | 2 |
| Tier 2 | 400% | 10,000 | 10,000 | 4 |
| Tier 3 | 300% | 20,000 | 15,000 | 6 |
| Tier 4 | 200% | 50,000 | 30,000 | 10 |
| Tier 5 | 150% | 100,000 | 60,000 | 15 |
| Tier 6 | 120% | 200,000 | 100,000 | 20 |
| Tier 7 | 140% | 500,000 | 700,000 | 30 |

## Lưu Ý

- Sử dụng raw query để kiểm soát timezone
- Không sử dụng Prisma theo yêu cầu
- Join với User table sử dụng `userId` và `branch` từ cookie
- Mỗi user chỉ nhận thưởng 1 lần cho mỗi tier 