# Main Account Topup Flow - Đổi Voucher Nạp Tài Khoản Chính

## 📋 Overview

Flow xử lý khi user đổi voucher để nạp tiền vào **Tài khoản chính (Main Account)**.

## 🔄 Flow Diagram

```
User clicks "Đổi thưởng" on voucher
         ↓
POST /api/voucher/redeem
         ↓
    Check voucher valid?
         ↓
rewardType === "MAIN_ACCOUNT_TOPUP"?
         ↓
handleMainAccountTopup()
         ↓
    [Step 1-4 in transaction]
         ↓
    Step 5: updateFnetMoney()
         ↓
    Success ✅
```

## 📝 Detailed Steps

### **Step 1: Lấy Wallet Snapshot**
```typescript
const walletResult = await fnetDB.$queryRaw`
  SELECT main, sub FROM wallettb 
  WHERE userid = ${userId}
`;

const oldMain = Number(walletResult[0].main) || 0;
const oldSub = Number(walletResult[0].sub) || 0;
const newMain = oldMain + promoCode.rewardValue;
const newSub = oldSub; // Sub không đổi
```

**Ví dụ:**
```
oldMain: 10,000
oldSub:  242,300
rewardValue: 6,000
→ newMain: 16,000
→ newSub:  242,300 (không đổi)
```

### **Step 2: Create UserRewardMap**
```sql
INSERT INTO UserRewardMap (
  userId, 
  rewardId,           -- NULL cho voucher
  promotionCodeId,    -- ID của voucher
  duration,           -- rewardValue
  branch, 
  isUsed,             -- false
  status,             -- 'INITIAL'
  type,               -- 'EVENT'
  createdAt, 
  updatedAt
)
```

**Purpose:** Tracking lịch sử đổi voucher

### **Step 3: Save FnetHistory**
```sql
INSERT INTO FnetHistory (
  userId, 
  branch, 
  oldSubMoney,    -- 242,300
  newSubMoney,    -- 242,300 (không đổi)
  oldMainMoney,   -- 10,000
  newMainMoney,   -- 16,000
  moneyType,      -- 'MAIN'
  targetId,       -- userRewardMapId
  type,           -- 'VOUCHER'
  createdAt, 
  updatedAt
)
```

**Purpose:** Lưu snapshot đầy đủ của wallet tại thời điểm đổi voucher

### **Step 4: Mark PromotionCode as Used**
```sql
UPDATE PromotionCode 
SET isUsed = true, updatedAt = NOW()
WHERE id = ${promotionCodeId}
```

**Purpose:** Đánh dấu voucher đã được sử dụng

### **Step 5: Update Fnet Money**
```typescript
await updateFnetMoney({
  userId: userId,
  branch: branch,
  walletType: "MAIN",
  amount: Number(promoCode.rewardValue),
  targetId: promotionCodeId,
  transactionType: "VOUCHER",
  saveHistory: false  // Đã lưu ở Step 3
});
```

**updateFnetMoney() sẽ:**
1. ✅ Update `wallettb.main` = newMain (16,000)
2. ✅ Update `usertb.RemainMoney` = main + sub (258,300)
3. ❌ KHÔNG lưu FnetHistory lần 2 (vì `saveHistory: false`)

## 🎯 Database Changes

### **Before:**
```sql
-- wallettb
userid | main   | sub     
13191  | 10000  | 242300  

-- usertb
UserId | RemainMoney
13191  | 252300

-- PromotionCode
id   | isUsed
3602 | false
```

### **After:**
```sql
-- wallettb
userid | main   | sub     
13191  | 16000  | 242300  ← main tăng 6000

-- usertb
UserId | RemainMoney
13191  | 258300        ← tổng tăng 6000

-- PromotionCode
id   | isUsed
3602 | true          ← đã sử dụng

-- UserRewardMap (NEW)
id | userId | promotionCodeId | type  | status
45 | 13191  | 3602            | EVENT | INITIAL

-- FnetHistory (NEW)
id | userId | oldMain | newMain | oldSub  | newSub  | moneyType | type
12 | 13191  | 10000   | 16000   | 242300  | 242300  | MAIN      | VOUCHER
```

## 🔍 Key Points

### 1. **Transaction Safety**
- Steps 1-4 wrapped in `db.$transaction()` để đảm bảo atomic
- Step 5 ở ngoài vì `updateFnetMoney()` có nested transaction riêng

### 2. **History Tracking**
- Chỉ lưu FnetHistory **1 lần** (ở Step 3)
- `saveHistory: false` trong `updateFnetMoney()` để tránh duplicate

### 3. **Type = EVENT**
- UserRewardMap.type = 'EVENT' (giống voucher FREE_HOURS)
- FnetHistory.type = 'VOUCHER' (để phân biệt)

### 4. **Wallet Type**
- `walletType: "MAIN"` → update tài khoản chính
- `moneyType: "MAIN"` trong FnetHistory

## 📊 Frontend Display

Khi admin vào **Đổi thưởng** → **Lịch sử**, sẽ thấy:

```
┌─────────────────────────────────────────────────────┐
│ Cadem GateWay                      14/10/2025 02:39 │
├──────────────┬──────────────┬──────────────┬────────┤
│  Phần thưởng │  Tài khoản   │  Tài khoản   │        │
│              │    chính     │     phụ      │        │
├──────────────┼──────────────┼──────────────┼────────┤
│ BP Lv8       │ Trước: 10000 │ Trước: 242300│        │
│ 6.000đ       │ Sau:   16000 │ Sau:   242300│        │
└──────────────┴──────────────┴──────────────┴────────┘
```

## 🚀 Testing

### Test Case 1: Valid Voucher
```bash
POST /api/voucher/redeem
{
  "promotionCodeId": 3602
}

Expected:
- ✅ UserRewardMap created
- ✅ FnetHistory saved with MAIN changes
- ✅ wallettb.main increased
- ✅ usertb.RemainMoney = main + sub
- ✅ PromotionCode.isUsed = true
```

### Test Case 2: Expired Voucher
```bash
Expected: HTTP 400
Error: "Promotion code has expired"
```

### Test Case 3: Already Used Voucher
```bash
Expected: HTTP 404
Error: "Promotion code not found or already used"
```

### Test Case 4: User Not Found
```bash
Expected: HTTP 404
Error: "User not found in Fnet database"
```

## 🔗 Related Files

- **API Handler:** `app/api/voucher/redeem/route.ts`
- **Utility Function:** `lib/fnet-money-utils.ts`
- **Frontend:** `app/(dashboard)/voucher/page.tsx`
- **Schema:** `prisma/schema.prisma`
  - `UserRewardMap.type = 'EVENT'`
  - `FnetHistory.moneyType = 'MAIN'`
  - `FnetHistory.type = 'VOUCHER'`

## ⚠️ Important Notes

1. **rewardType phải = "MAIN_ACCOUNT_TOPUP"** để trigger flow này
2. **rewardValue** phải > 0
3. User không được có multiple accounts trong Fnet
4. Voucher chưa hết hạn và chưa được sử dụng

