# Debug Utils - Hướng dẫn sử dụng

## Tổng quan
Debug Utils cung cấp các function để tự động map MacAddress và userId mặc định khi debug mode được kích hoạt thông qua environment variables.

## Environment Variables

### IS_DEBUG_GO_VAP
- **Mô tả**: Kích hoạt debug mode cho chi nhánh Go Vap
- **Giá trị**: `true` hoặc `false`
- **MacAddress mặc định**: `00-CF-E0-46-C8-37`
- **UserId mặc định**: `8503`
- **MachineName mặc định**: `GO_VAP_01`

### IS_DEBUG_TAN_PHU
- **Mô tả**: Kích hoạt debug mode cho chi nhánh Tan Phu
- **Giá trị**: `true` hoặc `false`
- **MacAddress mặc định**: `00-CF-E0-46-C8-38`
- **UserId mặc định**: `8504`
- **MachineName mặc định**: `TAN_PHU_01`

## Cách sử dụng

### 1. Thiết lập Environment Variables
Thêm vào file `.env.local`:
```bash
# Debug mode cho Go Vap
IS_DEBUG_GO_VAP=true

# Hoặc debug mode cho Tan Phu
IS_DEBUG_TAN_PHU=true
```

### 2. Sử dụng trong API Routes

#### API check-branch
```typescript
import { getDebugMacAddress, logDebugInfo } from "@/lib/debug-utils";

export async function GET(req: Request, res: Response): Promise<any> {
  const originalMacAddress = "00-CF-E0-46-C8-37";
  const macAddress = getDebugMacAddress(originalMacAddress);
  
  logDebugInfo("check-branch", { originalMacAddress, macAddress });
  // ... rest of the code
}
```

#### API user/check-existing
```typescript
import { getDebugUserId, logDebugInfo } from "@/lib/debug-utils";

export async function GET(req: Request): Promise<any> {
  // ... existing code
  const originalUserId = 8503;
  const userId = getDebugUserId(originalUserId);
  
  logDebugInfo("user/check-existing", { 
    machineName, 
    branchFromCookie, 
    originalUserId, 
    userId 
  });
  // ... rest of the code
}
```

#### API login
```typescript
import { getDebugUserId, logDebugInfo } from "@/lib/debug-utils";

export async function POST(req: Request, res: Response): Promise<any> {
  // ... existing code
  const originalUserId = 8503;
  const userId = getDebugUserId(originalUserId);
  
  logDebugInfo("login", { 
    userName, 
    machineName, 
    branchFromCookie, 
    originalUserId, 
    userId 
  });
  // ... rest of the code
}
```

## Available Functions

### getDebugConfig()
Trả về cấu hình debug hiện tại bao gồm:
- `isDebugGoVap`: boolean
- `isDebugTanPhu`: boolean
- `defaultMacAddress`: string
- `defaultUserId`: number
- `defaultMachineName`: string

### getDebugMacAddress(originalMacAddress?: string)
- **Tham số**: MacAddress gốc (optional)
- **Trả về**: MacAddress debug nếu debug mode active, ngược lại trả về MacAddress gốc

### getDebugUserId(originalUserId?: number)
- **Tham số**: UserId gốc (optional)
- **Trả về**: UserId debug nếu debug mode active, ngược lại trả về UserId gốc

### getDebugMachineName(originalMachineName?: string)
- **Tham số**: MachineName gốc (optional)
- **Trả về**: MachineName debug nếu debug mode active, ngược lại trả về MachineName gốc

### isDebugMode()
- **Trả về**: `true` nếu có debug mode nào được kích hoạt

### getDebugBranch()
- **Trả về**: Tên branch debug (`'GO_VAP'` hoặc `'TAN_PHU'`)

### logDebugInfo(context: string, data?: any)
- **Tham số**: 
  - `context`: Tên context để log
  - `data`: Dữ liệu bổ sung để log (optional)
- **Chức năng**: Log thông tin debug nếu debug mode active

## Lưu ý quan trọng

1. **Chỉ một debug mode được kích hoạt**: Nếu cả `IS_DEBUG_GO_VAP` và `IS_DEBUG_TAN_PHU` đều là `true`, ưu tiên `IS_DEBUG_GO_VAP`

2. **Logging**: Tất cả các function đều có logging để dễ dàng debug

3. **Production**: Đảm bảo không set các environment variables này trong production

4. **Cặp giá trị riêng biệt**: Mỗi branch có cặp MacAddress và userId riêng biệt để tránh xung đột

## Ví dụ Output Log
```
[DEBUG] Using default MacAddress: 00-CF-E0-46-C8-37 for branch: GO_VAP
[DEBUG] Using default userId: 8503 for branch: GO_VAP
[DEBUG check-branch] Debug mode active: {
  isDebugGoVap: true,
  isDebugTanPhu: false,
  branch: 'GO_VAP',
  defaultMacAddress: '00-CF-E0-46-C8-37',
  defaultUserId: 8503,
  defaultMachineName: 'GO_VAP_01',
  data: { originalMacAddress: '00-CF-E0-46-C8-37', macAddress: '00-CF-E0-46-C8-37' }
} 