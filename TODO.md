# TODO - Voucher System Implementation

## Overview
Implement hệ thống Voucher với CRUD operations cho Admin và user interface để quản lý/sử dụng voucher.

## Tasks

### 1. Database Schema
- [ ] Thêm model `Voucher` vào `prisma/schema.prisma`:
  - `id` (String, @id, @default(cuid))
  - `name` (String)
  - `description` (String?)
  - `createdAt` (DateTime, @default(now))
  - `value` (Float)
  - `type` (VoucherType enum: FIXED, PERCENT)
  - `maxValue` (Float?)
  - `note` (String?)
  - `isUsed` (Boolean, @default(false))
  - `category` (VoucherCategory enum: DRINK, FOOD, COMBO, GAMETIME, GENERAL) - phân loại voucher

- [ ] Thêm model `UserVoucherMap` vào `prisma/schema.prisma`:
  - `id` (String, @id, @default(cuid))
  - `voucherId` (String)
  - `uuid` (String, @unique) - để user copy sử dụng
  - `userId` (String)
  - `branch` (String)
  - `expiredAt` (DateTime)
  - `isUsed` (Boolean, @default(false))
  - `usedAt` (DateTime?)
  - `createdAt` (DateTime, @default(now))
  - `source` (VoucherSource enum: MANUAL, BATTLE_PASS, MISSION, PROMOTION)
  - `sourceId` (String?) - ID của nguồn tạo (BattlePassReward ID, Mission ID, etc.)

- [ ] Cập nhật model `BattlePassReward` trong `prisma/schema.prisma`:
  - Thêm `voucherId` (String?) - Link với Voucher template khi rewardType = "voucher"
  - Thêm relation với Voucher model

- [ ] Thêm model `VoucherHistory` vào `prisma/schema.prisma`:
  - `id` (String, @id, @default(cuid))
  - `userVoucherMapId` (String)
  - `userId` (String)
  - `branch` (String)
  - `voucherId` (String)
  - `usedAt` (DateTime, @default(now))
  - `discountAmount` (Float)
  - `orderAmount` (Float)
  - `note` (String?)

- [ ] Thêm enum `VoucherType` vào `prisma/schema.prisma`:
  - `FIXED`
  - `PERCENT`

- [ ] Thêm enum `VoucherCategory` vào `prisma/schema.prisma`:
  - `DRINK` - Voucher đồ uống
  - `FOOD` - Voucher đồ ăn
  - `COMBO` - Voucher combo
  - `GAMETIME` - Voucher giờ chơi
  - `GENERAL` - Voucher chung

- [ ] Thêm enum `VoucherSource` vào `prisma/schema.prisma`:
  - `MANUAL` - Tạo thủ công bởi admin
  - `BATTLE_PASS` - Từ BattlePass reward
  - `MISSION` - Từ Mission completion
  - `PROMOTION` - Từ Promotion/Event

### 2. API Endpoints

#### 2.1 Admin Voucher CRUD APIs
- [ ] Tạo `app/api/admin/vouchers/route.ts` (GET, POST)
  - GET: Lấy danh sách voucher với pagination
  - POST: Tạo voucher mới

- [ ] Tạo `app/api/admin/vouchers/[id]/route.ts` (GET, PUT, DELETE)
  - GET: Lấy chi tiết voucher
  - PUT: Cập nhật voucher
  - DELETE: Xóa voucher

- [ ] Tạo `app/api/admin/vouchers/[id]/generate/route.ts` (POST)
  - Generate UserVoucherMap cho voucher

- [ ] Tạo `app/api/admin/vouchers/[id]/history/route.ts` (GET)
  - Lấy lịch sử sử dụng voucher

#### 2.2 User Voucher APIs
- [ ] Tạo `app/api/vouchers/route.ts` (GET)
  - Lấy danh sách voucher của user

- [ ] Tạo `app/api/vouchers/[uuid]/validate/route.ts` (POST)
  - Validate và sử dụng voucher

- [ ] Tạo `app/api/vouchers/history/route.ts` (GET)
  - Lấy lịch sử sử dụng voucher của user

#### 2.3 BattlePass Integration APIs
- [ ] Cập nhật `app/api/battle-pass/claim-reward/[rewardId]/route.ts`
  - Thêm logic tạo voucher khi reward type là "voucher"
  - Lấy voucher template từ reward.voucherId
  - Tạo UserVoucherMap với source = BATTLE_PASS
  - Link với BattlePassReward ID
  - Return thông tin voucher đã tạo

- [ ] Tạo `app/api/battle-pass/vouchers/route.ts` (GET)
  - Lấy danh sách voucher từ BattlePass của user
  - Filter theo source = BATTLE_PASS
  - Group theo voucher category (DRINK, FOOD, COMBO)

- [ ] Tạo `app/api/battle-pass/voucher-configs/route.ts` (GET)
  - Lấy danh sách voucher templates cho admin
  - Hiển thị mapping giữa BattlePassReward và Voucher template

#### 2.4 Admin Voucher Template Management
- [ ] Tạo `app/api/admin/voucher-templates/route.ts` (GET, POST)
  - GET: Lấy danh sách voucher templates
  - POST: Tạo voucher template mới

- [ ] Tạo `app/api/admin/voucher-templates/[id]/route.ts` (GET, PUT, DELETE)
  - GET: Lấy chi tiết voucher template
  - PUT: Cập nhật voucher template
  - DELETE: Xóa voucher template

- [ ] Tạo `app/api/admin/battle-pass-rewards/[id]/assign-voucher/route.ts` (POST)
  - Assign voucher template cho BattlePassReward
  - Update reward.voucherId

#### 2.5 Mission Integration APIs
- [ ] Cập nhật `app/api/missions/[id]/claim/route.ts`
  - Thêm logic tạo voucher khi mission reward type là "voucher"
  - Lấy voucher template từ mission.voucherId (cần thêm field này)
  - Tạo UserVoucherMap với source = MISSION
  - Link với Mission ID

- [ ] Cập nhật model `Mission` trong `prisma/schema.prisma`:
  - Thêm `voucherId` (String?) - Link với Voucher template khi reward type = "voucher"

### 3. Admin Frontend

#### 3.1 Voucher Template Management Layout
- [ ] Tạo `app/admin/voucher-templates/page.tsx`
  - Danh sách voucher templates với search, filter
  - Button tạo voucher template mới
  - Actions: Edit, Delete, Assign to rewards

- [ ] Tạo `app/admin/voucher-templates/_components/VoucherTemplateForm.tsx`
  - Form tạo/chỉnh sửa voucher template
  - Validation cho các field
  - Preview discount calculation

- [ ] Tạo `app/admin/voucher-templates/_components/VoucherTemplateList.tsx`
  - Table hiển thị danh sách voucher templates
  - Pagination
  - Search và filter theo category

- [ ] Tạo `app/admin/voucher-templates/_components/AssignVoucherModal.tsx`
  - Modal để assign voucher template cho BattlePassReward/Mission
  - Hiển thị danh sách rewards chưa có voucherId

#### 3.2 User Voucher Management Layout
- [ ] Tạo `app/admin/user-vouchers/page.tsx`
  - Danh sách UserVoucherMap với search, filter
  - Filter theo source (BattlePass, Mission, Manual)
  - Actions: View details, Generate codes

- [ ] Tạo `app/admin/user-vouchers/_components/UserVoucherList.tsx`
  - Table hiển thị danh sách UserVoucherMap
  - Pagination
  - Search và filter theo user, source, status

- [ ] Tạo `app/admin/user-vouchers/_components/VoucherHistory.tsx`
  - Hiển thị lịch sử sử dụng voucher
  - Export data

#### 3.2 Admin Components
- [ ] Tạo `app/admin/vouchers/_components/GenerateCodesModal.tsx`
  - Modal để generate nhiều voucher codes
  - Bulk operations

- [ ] Tạo `app/admin/vouchers/_components/VoucherStats.tsx`
  - Thống kê voucher usage
  - Charts và metrics

### 4. User Frontend

#### 4.1 Voucher Management Layout
- [ ] Cập nhật `app/(dashboard)/voucher/page.tsx`
  - Hiển thị danh sách voucher của user
  - Copy voucher code functionality
  - Voucher usage history
  - Tab filter theo source (All, BattlePass, Mission, Manual)

- [ ] Tạo `app/(dashboard)/voucher/_components/VoucherCard.tsx`
  - Card hiển thị thông tin voucher
  - Copy button cho voucher code
  - Status indicator (available, used, expired)
  - Source badge (BattlePass, Mission, etc.)

- [ ] Tạo `app/(dashboard)/voucher/_components/VoucherList.tsx`
  - List view cho user vouchers
  - Filter by status và source
  - Group by source type

- [ ] Tạo `app/(dashboard)/voucher/_components/VoucherHistory.tsx`
  - Lịch sử sử dụng voucher
  - Order details
  - Source tracking

#### 4.2 BattlePass Integration UI
- [ ] Cập nhật `app/components/battle-pass/BattlePassProgress.tsx`
  - Hiển thị voucher reward với icon khác biệt
  - Link đến voucher page khi claim voucher reward

- [ ] Cập nhật `app/components/battle-pass/RewardCard.tsx`
  - Hiển thị voucher reward với preview
  - Show voucher value và type

#### 4.3 User Components
- [ ] Tạo `app/(dashboard)/voucher/_components/CopyVoucherModal.tsx`
  - Modal hiển thị voucher code để copy
  - QR code generation (optional)

- [ ] Tạo `app/(dashboard)/voucher/_components/VoucherUsageModal.tsx`
  - Modal để nhập voucher code
  - Validation và preview discount

- [ ] Tạo `app/(dashboard)/voucher/_components/SourceFilter.tsx`
  - Component filter theo source (All, BattlePass, Mission, Manual)
  - Badge hiển thị số lượng voucher mỗi source

### 5. Logic Implementation Details

#### 5.1 Voucher Generation Logic
```typescript
const generateVoucherCode = () => {
  return `VOUCHER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

const calculateDiscount = (voucher: Voucher, orderAmount: number) => {
  if (voucher.type === 'FIXED') {
    return Math.min(voucher.value, orderAmount);
  } else {
    const discount = (orderAmount * voucher.value) / 100;
    return voucher.maxValue ? Math.min(discount, voucher.maxValue) : discount;
  }
};

const createVoucherFromReward = async (reward: BattlePassReward, userId: string, branch: string) => {
  // Kiểm tra reward có voucherId không
  if (!reward.voucherId) {
    throw new Error('BattlePassReward không có voucherId');
  }

  // Lấy voucher template từ voucherId
  const voucher = await prisma.voucher.findUnique({
    where: { id: reward.voucherId }
  });

  if (!voucher) {
    throw new Error(`Voucher template với id ${reward.voucherId} không tồn tại`);
  }

  // Tạo UserVoucherMap cho user cụ thể
  const userVoucherMap = await prisma.userVoucherMap.create({
    data: {
      voucherId: voucher.id,
      uuid: generateVoucherCode(),
      userId,
      branch,
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      source: 'BATTLE_PASS',
      sourceId: reward.id.toString(),
    }
  });

  return { voucher, userVoucherMap };
};

// Function parse voucher info từ reward name
const parseVoucherFromRewardName = (rewardName: string) => {
  // Ví dụ: "1 voucher Free nước" -> { name: "Voucher Free nước", value: 10000, type: "FIXED", maxValue: 10000, category: "DRINK" }
  // Ví dụ: "1 voucher đồ ăn" -> { name: "Voucher đồ ăn", value: 20000, type: "FIXED", maxValue: 20000, category: "FOOD" }
  // Ví dụ: "1 combo nước + đồ ăn" -> { name: "Combo nước + đồ ăn", value: 30000, type: "FIXED", maxValue: 30000, category: "COMBO" }
  
  const voucherConfigs = {
    'voucher Free nước': {
      name: 'Voucher Free nước',
      description: 'Giảm giá đồ uống',
      value: 10000,
      type: 'FIXED' as const,
      maxValue: 10000,
      category: 'DRINK' as const
    },
    'voucher đồ ăn': {
      name: 'Voucher đồ ăn', 
      description: 'Giảm giá đồ ăn',
      value: 20000,
      type: 'FIXED' as const,
      maxValue: 20000,
      category: 'FOOD' as const
    },
    'combo nước + đồ ăn': {
      name: 'Combo nước + đồ ăn',
      description: 'Giảm giá combo đồ uống + đồ ăn',
      value: 30000,
      type: 'FIXED' as const,
      maxValue: 30000,
      category: 'COMBO' as const
    },
    'combo nâng cao (F&B + giờ chơi)': {
      name: 'Combo nâng cao (F&B + giờ chơi)',
      description: 'Giảm giá combo F&B + giờ chơi',
      value: 35000,
      type: 'FIXED' as const,
      maxValue: 35000,
      category: 'COMBO' as const
    }
  };

  // Tìm config phù hợp
  for (const [key, config] of Object.entries(voucherConfigs)) {
    if (rewardName.includes(key)) {
      return config;
    }
  }

  // Fallback: sử dụng reward name và value
  return {
    name: rewardName,
    description: `Voucher từ BattlePass: ${rewardName}`,
    value: 10000, // Default value
    type: 'FIXED' as const,
    maxValue: 10000,
    category: 'GENERAL' as const
  };
};
```

#### 5.2 Voucher Validation Logic
```typescript
const validateVoucher = async (uuid: string, userId: string, branch: string) => {
  const userVoucher = await prisma.userVoucherMap.findFirst({
    where: {
      uuid,
      userId,
      branch,
      isUsed: false,
      expiredAt: { gt: new Date() }
    },
    include: { voucher: true }
  });
  
  return userVoucher;
};
```

### 6. Database Queries

#### 6.1 User Voucher Queries
```typescript
// Get user vouchers
const userVouchers = await prisma.userVoucherMap.findMany({
  where: {
    userId,
    branch,
    expiredAt: { gt: new Date() }
  },
  include: { voucher: true },
  orderBy: { createdAt: 'desc' }
});

// Get voucher history
const voucherHistory = await prisma.voucherHistory.findMany({
  where: { userId, branch },
  include: { userVoucherMap: { include: { voucher: true } } },
  orderBy: { usedAt: 'desc' }
});

// Get BattlePass vouchers
const battlePassVouchers = await prisma.userVoucherMap.findMany({
  where: {
    userId,
    branch,
    source: 'BATTLE_PASS',
    expiredAt: { gt: new Date() }
  },
  include: { voucher: true },
  orderBy: { createdAt: 'desc' }
});

// Get Mission vouchers
const missionVouchers = await prisma.userVoucherMap.findMany({
  where: {
    userId,
    branch,
    source: 'MISSION',
    expiredAt: { gt: new Date() }
  },
  include: { voucher: true },
  orderBy: { createdAt: 'desc' }
});

// Get vouchers by category
const vouchersByCategory = await prisma.userVoucherMap.findMany({
  where: {
    userId,
    branch,
    expiredAt: { gt: new Date() }
  },
  include: { voucher: true },
  orderBy: { createdAt: 'desc' }
});

// Group by voucher category
const groupedVouchers = vouchersByCategory.reduce((acc, userVoucher) => {
  const category = userVoucher.voucher.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(userVoucher);
  return acc;
}, {} as Record<string, any[]>);

// Get voucher templates (for admin)
const voucherTemplates = await prisma.voucher.findMany({
  orderBy: { category: 'asc' }
});
```

### 7. Error Handling
- [ ] Handle invalid voucher code
- [ ] Handle expired voucher
- [ ] Handle already used voucher
- [ ] Handle insufficient order amount
- [ ] Handle database connection errors
- [ ] Handle validation errors

### 8. Security & Validation
- [ ] Validate voucher ownership (userId, branch)
- [ ] Prevent duplicate voucher usage
- [ ] Sanitize input parameters
- [ ] Rate limiting cho voucher validation
- [ ] Log voucher usage activities

### 9. Performance Considerations
- [ ] Optimize database queries với indexes
- [ ] Add caching cho voucher validation
- [ ] Implement pagination cho large datasets
- [ ] Monitor API response times

### 10. UI/UX Features
- [ ] Copy to clipboard functionality
- [ ] QR code generation cho voucher codes
- [ ] Real-time validation feedback
- [ ] Loading states và error handling
- [ ] Responsive design cho mobile
- [ ] Toast notifications cho actions

### 11. Testing
- [ ] Unit tests cho voucher logic
- [ ] Integration tests cho API endpoints
- [ ] E2E tests cho user flows
- [ ] Performance tests cho bulk operations

## Notes
- Sử dụng `userId` và `branch` từ cookie để join với database
- Voucher codes phải unique và khó đoán
- Implement proper validation cho tất cả voucher operations
- Add proper logging cho audit trail
- Consider implementing voucher templates cho bulk generation
- BattlePass voucher rewards sẽ tự động tạo UserVoucherMap khi user claim
- Mission voucher rewards sẽ tự động tạo UserVoucherMap khi user claim mission
- Voucher từ BattlePass/Mission sẽ có source tracking để admin quản lý
- ExpiredAt cho voucher từ BattlePass/Mission: 30 days từ ngày claim
- Voucher manual từ admin có thể set expiredAt tùy ý

## Voucher Mapping Examples

### BattlePass Reward → Voucher Template → UserVoucherMap Flow
1. **"1 voucher Free nước"** (Level 4)
   - **BattlePassReward**: voucherId="voucher_template_1", rewardType="voucher"
   - **Voucher Template**: id="voucher_template_1", name="Voucher Free nước", value=10000, type="FIXED", maxValue=10000, category="DRINK"
   - **UserVoucherMap**: uuid="VOUCHER-1234567890-ABC123DEF", source="BATTLE_PASS", sourceId="rewardId", expiredAt=30 days

2. **"1 voucher đồ ăn"** (Level 8)  
   - **BattlePassReward**: voucherId="voucher_template_2", rewardType="voucher"
   - **Voucher Template**: id="voucher_template_2", name="Voucher đồ ăn", value=20000, type="FIXED", maxValue=20000, category="FOOD"
   - **UserVoucherMap**: uuid="VOUCHER-1234567891-XYZ456GHI", source="BATTLE_PASS", sourceId="rewardId", expiredAt=30 days

3. **"1 combo nước + đồ ăn"** (Level 12)
   - **BattlePassReward**: voucherId="voucher_template_3", rewardType="voucher"
   - **Voucher Template**: id="voucher_template_3", name="Combo nước + đồ ăn", value=30000, type="FIXED", maxValue=30000, category="COMBO"
   - **UserVoucherMap**: uuid="VOUCHER-1234567892-MNO789JKL", source="BATTLE_PASS", sourceId="rewardId", expiredAt=30 days

### Flow khi User Claim BattlePass Reward
1. User click "Claim" trên reward type="voucher"
2. API lấy voucher template từ reward.voucherId
3. **Tạo UserVoucherMap** với unique uuid, link với Voucher template
4. User có thể copy uuid để sử dụng voucher
5. Voucher có thể dùng trong 30 days

### Database Relationship
```
BattlePassReward (voucherId → Voucher template)
    ↓
Voucher Template (reusable across users)
    ↓
UserVoucherMap (specific to user, with source tracking)
    ↓
VoucherHistory (usage tracking)
```

### Admin Setup Flow
1. **Tạo Voucher Templates** (Admin)
   - Tạo template "Voucher Free nước" với value=10000, category=DRINK
   - Tạo template "Voucher đồ ăn" với value=20000, category=FOOD
   - Tạo template "Combo nước + đồ ăn" với value=30000, category=COMBO

2. **Assign Templates to Rewards** (Admin)
   - Assign voucher_template_1 cho BattlePassReward Level 4
   - Assign voucher_template_2 cho BattlePassReward Level 8
   - Assign voucher_template_3 cho BattlePassReward Level 12

3. **User Claims** (Automatic)
   - User claim reward → API lấy template từ voucherId → Tạo UserVoucherMap 