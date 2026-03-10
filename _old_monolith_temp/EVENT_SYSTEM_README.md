# Event/Campaign Promotion System

Hệ thống quản lý Event/Campaign Promotion System cho phép tạo và quản lý các chương trình khuyến mãi linh hoạt với khả năng tạo mã promotion tự động.

## 🎯 Tính năng chính

- **Quản lý Event**: Tạo và quản lý các sự kiện khuyến mãi
- **Reward linh hoạt**: Hỗ trợ nhiều loại phần thưởng (giảm %, giảm cố định, tặng miễn phí, BOGO)
- **Tạo mã tự động**: Generate hàng loạt promotion codes từ event
- **Tính toán thông minh**: Logic tính toán phần thưởng phức tạp
- **Tracking chi tiết**: Theo dõi sử dụng và hiệu quả

## 📋 Cấu trúc Database

### Core Tables
- `Event`: Thông tin chính của event/campaign
- `EventReward`: Cấu hình phần thưởng linh hoạt (JSON config)
- `EventParticipant`: Người tham gia event
- `EventRewardUsage`: Tracking sử dụng phần thưởng
- `PromotionCode`: Mã khuyến mãi được tạo từ event

### Updated Tables
- `PromotionSetting`: Thêm liên kết với Event
- `PromotionCode`: Thêm fields cho event-specific data

## 🚀 API Endpoints

### Event Management
```typescript
// Tạo event mới
POST /api/events
{
  "name": "Event mừng user mới 2024",
  "description": "Chương trình chào mừng user mới",
  "type": "NEW_USER_WELCOME",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "targetAudience": {
    "userTypes": ["NEW_USER"],
    "registrationPeriod": "within_7_days"
  },
  "budget": 50000000,
  "expectedParticipants": 1000
}

// Lấy danh sách events
GET /api/events?status=ACTIVE&type=NEW_USER_WELCOME&limit=20&offset=0
```

### Event Rewards
```typescript
// Thêm reward vào event
POST /api/events/rewards
{
  "eventId": "evt_xxx",
  "name": "Giảm 50% tối đa 20k",
  "rewardType": "PERCENTAGE_DISCOUNT",
  "rewardConfig": {
    "type": "PERCENTAGE_DISCOUNT",
    "discountPercent": 50,
    "maxDiscountAmount": 20000,
    "minOrderAmount": 10000,
    "applicableItems": ["ALL"]
  },
  "maxQuantity": 1000,
  "maxPerUser": 1
}

// Lấy rewards của event
GET /api/events/rewards?eventId=evt_xxx&rewardType=PERCENTAGE_DISCOUNT
```

### Code Generation
```typescript
// Generate promotion codes từ event
POST /api/events/generate-codes
{
  "eventId": "evt_xxx",
  "codePrefix": "WELCOME",
  "expirationDays": 7
}

// Lấy danh sách codes đã tạo
GET /api/events/generate-codes?eventId=evt_xxx&isUsed=false&limit=50
```

## 🎁 Các loại Reward được hỗ trợ

### 1. Percentage Discount (Giảm theo %)
```json
{
  "type": "PERCENTAGE_DISCOUNT",
  "discountPercent": 50,
  "maxDiscountAmount": 20000,
  "minOrderAmount": 10000,
  "applicableItems": ["ALL"]
}
```
**Ví dụ**: Giảm 50% tối đa 20k cho đơn từ 10k

### 2. Fixed Discount (Giảm cố định)
```json
{
  "type": "FIXED_DISCOUNT",
  "discountAmount": 30000,
  "minOrderAmount": 100000,
  "applicableItems": ["ALL"]
}
```
**Ví dụ**: Giảm 30k cho đơn từ 100k

### 3. Free Item (Tặng miễn phí)
```json
{
  "type": "FREE_ITEM",
  "itemType": "HOURS",
  "discountPercent": 100,
  "maxFreeAmount": 50000,
  "minOrderAmount": 30000,
  "requirePurchase": true
}
```
**Ví dụ**: Tặng 100% giờ chơi tối đa 50k

### 4. Bonus Item (BOGO - Buy One Get One)
```json
{
  "type": "BONUS_ITEM",
  "itemType": "DRINK",
  "buyQuantity": 2,
  "freeQuantity": 1,
  "maxFreeItems": 5
}
```
**Ví dụ**: Mua 2 nước tặng 1

### 5. Multiplier (Nhân đôi)
```json
{
  "type": "MULTIPLIER",
  "multiplier": 2,
  "targetType": "STARS",
  "conditions": {
    "minPlayTime": 120,
    "minSpending": 50000
  }
}
```
**Ví dụ**: Nhân đôi sao thưởng khi chơi 2h và chi 50k

## 🔧 Sử dụng Reward Calculator

```typescript
import { calculateReward, applyReward } from '@/lib/event-reward-calculator';

// Tính toán phần thưởng
const orderData = {
  amount: 50000,
  items: [
    { type: "HOURS", quantity: 2, value: 30000 },
    { type: "DRINK", quantity: 3, value: 20000 }
  ],
  userId: 12345,
  branch: "GO_VAP"
};

const result = await calculateReward(rewardId, orderData);

if (result.applicable) {
  console.log(`Discount: ${result.discountAmount} VND`);
  console.log(`Free items:`, result.freeItems);
  console.log(`Bonus items:`, result.bonusItems);
  
  // Áp dụng phần thưởng
  const applyResult = await applyReward(rewardId, userId, branch, orderData, result);
}
```

## 📊 Ví dụ Workflow hoàn chỉnh

### 1. Tạo Event "Mừng User Mới"
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Event mừng user mới 2024",
    "type": "NEW_USER_WELCOME",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z",
    "budget": 50000000,
    "expectedParticipants": 1000
  }'
```

### 2. Thêm các Reward
```bash
# Giảm 50% tối đa 20k
curl -X POST http://localhost:3000/api/events/rewards \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt_xxx",
    "name": "Giảm 50% tối đa 20k",
    "rewardType": "PERCENTAGE_DISCOUNT",
    "rewardConfig": {
      "type": "PERCENTAGE_DISCOUNT",
      "discountPercent": 50,
      "maxDiscountAmount": 20000,
      "minOrderAmount": 10000
    },
    "maxQuantity": 1000
  }'

# Tặng 100% giờ chơi tối đa 50k
curl -X POST http://localhost:3000/api/events/rewards \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt_xxx",
    "name": "Tặng 100% giờ chơi tối đa 50k",
    "rewardType": "FREE_ITEM",
    "rewardConfig": {
      "type": "FREE_ITEM",
      "itemType": "HOURS",
      "maxFreeAmount": 50000,
      "minOrderAmount": 30000
    },
    "maxQuantity": 500
  }'

# Mua 2 nước tặng 1
curl -X POST http://localhost:3000/api/events/rewards \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt_xxx",
    "name": "Mua 2 nước tặng 1",
    "rewardType": "BONUS_ITEM",
    "rewardConfig": {
      "type": "BONUS_ITEM",
      "itemType": "DRINK",
      "buyQuantity": 2,
      "freeQuantity": 1,
      "maxFreeItems": 5
    },
    "maxQuantity": 2000
  }'
```

### 3. Generate Promotion Codes
```bash
curl -X POST http://localhost:3000/api/events/generate-codes \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt_xxx",
    "codePrefix": "WELCOME",
    "expirationDays": 7
  }'
```

**Kết quả**: Tạo ra 3500 mã khuyến mãi:
- 1000 mã giảm 50% tối đa 20k
- 500 mã tặng 100% giờ chơi tối đa 50k  
- 2000 mã mua 2 nước tặng 1

## 🧪 Testing

Chạy script test để kiểm tra hệ thống:
```bash
node scripts/test-event-system.js
```

## 📝 Lưu ý quan trọng

1. **Raw SQL**: Sử dụng raw SQL queries theo yêu cầu, không dùng Prisma ORM
2. **Timezone**: Sử dụng `timezone-utils` cho xử lý thời gian
3. **Branch & UserId**: Luôn sử dụng userId và branch từ cookie
4. **No Auto Migrate**: Không tự động migrate database

## 🔄 Roadmap

- [ ] Frontend Admin Dashboard
- [ ] User Interface cho Event Discovery
- [ ] Analytics & Reporting
- [ ] Automated Event Management
- [ ] Integration với Payment System
- [ ] Mobile App Integration
