---
stepsCompleted:
  - step-01-init.md
  - step-02-context.md
  - step-03-starter.md
  - step-04-decisions.md
  - step-05-patterns.md
  - step-06-structure.md
  - step-07-validation.md
  - step-08-complete.md
  - step-01b-continue.md
  - step-02-context-v2.md
  - step-04-decisions-v2.md
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
workflowType: 'architecture'
project_name: 'loot-vn'
user_name: 'ChickFool'
date: '2026-03-26T03:09:00+07:00'
status: 'in-progress'
updatedAt: '2026-04-08T23:30:00+07:00'
lastStep: 'step-08-complete'
feature: 'Menu Campaign System (Phase 4)'
status_phase4: 'complete'
completedAt_phase4: '2026-04-08'
---

# (Existing content continues...)

## Core Architectural Decisions (Phase 2: Inventory)

### 1. Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Temporal Modeling (Chốt hạ Versioning):** Tất cả 'Công thức' (Recipe) và 'Giá bán' (Product Price) đều phải sử dụng version dựa trên thời gian (`effectiveFrom`) để bảo vệ tính chính xác của báo cáo lịch sử.
- **Atomic Stock Deduction:** Luồng trừ tồn kho được tích hợp real-time vào `Order Completion Workflow`, bọc trong Database Transaction (`$transaction`) để tránh Race Condition.
- **Database Location:** Toàn bộ bảng mới nằm trong Schema `new/schema.prisma` (Gateway DB).

### 2. Data Architecture Details

Theo yêu cầu của ChickFool, đây là bản vẽ kỹ thuật cho các Model Prisma nghiệp vụ:

#### Draft Schema Prisma (Phase 2)
```prisma
// Material: Nguyên vật liệu thô (Unit: gam, ml, chai, ...)
model Material {
  id                String   @id @default(uuid())
  tenantId          String   @map("tenant_id")
  sku               String   @unique
  name              String
  baseUnit          String   @map("base_unit") 
  quantityInStock   Decimal  @default(0) @map("quantity_in_stock") @db.Decimal(10, 2)
  minStockLevel     Decimal  @default(0) @map("min_stock_level") @db.Decimal(10, 2)
  isActive          Boolean  @default(true) @map("is_active")
  
  conversions       MaterialUnitConversion[]
  recipeItems       RecipeItem[]
  receipts          InventoryReceipt[]
}

// RecipeVersion: Công thức món ăn thay đổi theo thời gian
model RecipeVersion {
  id            String   @id @default(uuid())
  productId     String   @map("product_id")
  effectiveFrom DateTime @default(now()) @map("effective_from")
  effectiveTo   DateTime? @map("effective_to")
  isActive      Boolean  @default(true) @map("is_active")
  
  items         RecipeItem[]
}

// ProductPriceVersion: Lịch sử giá bán (Versioning cho Giá bán)
model ProductPriceVersion {
  id            String   @id @default(uuid())
  productId     String   @map("product_id")
  price         Decimal  @db.Decimal(10, 2)
  effectiveFrom DateTime @default(now()) @map("effective_from")
  effectiveTo   DateTime? @map("effective_to")
}

// InventoryReceipt: Nhật ký nhập hàng (Tracking giá vốn COGS)
model InventoryReceipt {
  id          String   @id @default(uuid())
  materialId  String   @map("material_id")
  quantity    Decimal  @db.Decimal(10, 2)
  unitPrice   Decimal  @map("unit_price") @db.Decimal(10, 2) 
  receivedAt  DateTime @default(now()) @map("received_at")
  
  material    Material @relation(fields: [materialId], references: [id])
}
```

### 3. API & Communication Patterns (Phase 2)

- **Inventory Trigger Interceptor:** Xây dựng một Global Interceptor hoặc Service Hook lắng nghe event `ORDER_PAID` để kích hoạt trừ kho ngầm định trong cùng thread transaction.
- **Error Standard:** Cấu hình mã lỗi riêng cho Kho (VD: `INV_ERR_OUT_OF_STOCK` - ném ra khi số lượng Materials trong Recipe không đủ).

### Decision Impact Analysis

**Implementation Sequence:**
1.  **Migrate Schema:** Cập nhật `new/schema.prisma` và thực hiện migration cho chi nhánh.
2.  **Inventory-Logic Lib:** Xây dựng `libs/shared/business-logic/inventory-engine` để xử lý định lượng.
3.  **Order Integration:** Hook engine vào luồng thanh toán hiện có.

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Tôi tìm thấy 18 Functional Requirements cốt lõi. Từ góc độ kiến trúc, hệ thống này chia thành 3 trụ cột kỹ thuật:
1. **Quản trị API-Key & Tenant (FR1-FR4):** Đòi hỏi một dịch vụ Identity/Auth độc lập để cấp phát, băm (hashing) và xác thực khóa phân quyền ngầm.
2. **Data Isolation Middleware (FR5-FR8):** Yêu cầu xây dựng một lớp kiến trúc "chóp chặn" (Global Interceptor) có khả năng giải mã và Inject `tenant_id` cắm thẳng vào mọi truy vấn DB để miễn nhiễm rò rỉ dữ liệu.
3. **Nghiệp vụ Gamification & Operations (FR9-FR18):** Phân mảnh qua nhiều ứng dụng Frontend (Admin, HR, Client) nhưng dùng chung nhóm thuật toán. Cần mô hình Shared Libraries `libs/` tối ưu.

**Non-Functional Requirements:**
- **Tốc độ (<1500ms) & Graceful Timeout (<=5000ms):** Đòi hỏi quản lý Thread/Connection Pool xuất sắc để tránh thắt cổ chai khi mạng cáp quang lỗi.
- **Rate Limit & Bảo mật chặn Spam:** Bắt buộc đưa Redis/In-memory Cache vào đếm Request và ném lỗi 429 trước khi chạm Database.
- **Tính toàn vẹn (Atomic Transactions):** Thiết kế lớp Repository hỗ trợ Transaction bọc liền mạch cho mọi tương tác Raw SQL.
- **Mở rộng linh hoạt (Stateless Scaling):** API Backend không lưu Session ở RAM (Dùng JWT token) để Docker/Kubernetes có thể scale out mượt mà.

**Scale & Complexity:**
- Lĩnh vực mũi nhọn: Full-Stack (Web Apps frontend + API Backend Multi-Tenant)
- Hạng cân phức tạp: Cao (High)
- Ước tính số lượng Component chính: ~6 khối độc lập (4 Frontend Apps, 1 Backend API, 1 hệ thống Shared Libs)

### Technical Constraints & Dependencies

**Sự Kế sinh vào FNet SQL (Parasitic Database Integration):** Hệ thống kiến trúc phải chứa đường hầm an toàn kết nối SQL trực tiếp vào MySQL cấu trúc hiện hành tại chi nhánh, tuân thủ nguyên tắc "chỉ read/write, tuyệt đối không chỉnh sửa table" của Fnet.

### Cross-Cutting Concerns Identified

- **Cơ chế Xác thực Phân cực (AuthZ/AuthN Dual Mode):** Hệ thống cần xử lý hai luồng chứng thực song song: JWT Session và X-API-Key.
- **Luân chuyển Thông tin Định danh (Context Propogation):** Cần Framework hoặc Async Context `AsyncLocalStorage` để luân chuyển thông tin `tenant_id` ngầm xuyên suốt các hàm xuống Database.
- **Ranh giới Cấu trúc Monorepo (Dependency Boundaries):** Thiết lập quy tắc linting ngăn chặn hiện tượng "Spaghetti Import" chéo giữa các ứng dụng và thư viện độc lập.

## Starter Template Evaluation (Đánh giá & Khởi tạo)

### Primary Technology Domain

**Full-Stack Monorepo:** Dựa trên hiện trạng dự án, hệ thống đã được dựng khung bằng **Nx Workspace (Integrated Monorepo)** với Node.js/NestJS Backend và Next.js Frontend.

### Starter Options & Refactor Strategy

Vì mã nguồn đã có sẵn (Brownfield), chúng ta không khởi tạo mới mà sẽ áp dụng chiến lược **Refactor & Consolidation** dựa trên bộ công cụ Nx hiện có:

- **Công cụ Core:** `@nx/workspace`, `@nx/nest`, `@nx/next` (Bản 22.5.4).
- **ORM:** Prisma (Đã có 3 schemas: fnet, new/gateway, tenant).
- **Caching & Rate Limit:** Chuyển đổi từ In-memory Map sang `ioredis` (Đã có trong package.json).

### Architectural Foundations Verified (Rà soát Logic Gốc)

Qua rà soát chuyên sâu (Advanced Elicitation - First Principles & Red Team), chúng ta xác lập các nền tảng kỹ thuật bắt buộc phải tái cấu trúc:

**1. Language & Runtime:**
TypeScript thống nhất. Dọn dẹp các `Math.random()` IDs và chuẩn hóa bằng UUID v4.

**2. Transaction Integrity (Atomic Transactions):** Standard bắt buộc cho mọi logic tài chính (Redeem, Topup):
- Bọc toàn bộ query trong `db.$transaction`.
- Sử dụng `SELECT ... FOR UPDATE` (Pessimistic Locking) để triệt tiêu Race Condition khi gamer đổi thưởng đồng thời.

**3. Multi-Tenant Data Isolation (The Shield):**
- Triển khai **Global Prisma Middleware/Interceptor** tự động inject `tenant_id` lấy từ API-Key vào mệnh đề `WHERE` của SQL.
- Sử dụng `AsyncLocalStorage` để luân chuyển tenant context mà không cần truyền biến thủ công.

**4. Code Organization (The Clean Monorepo):**
- Di chuyển toàn bộ logic nghiệp vụ (Events, Battle Pass, Shift Verify) từ `apps/api/src/app/lib/` ra thư viện dùng chung `libs/shared/business-logic`.
- Cô lập database logic vào các `libs/database` chuyên biệt cho từng schema (Fnet, Gateway, Tenant).

**Ghi chú:** Việc di chuyển logic nghiệp vụ ra Shared Libs và bọc Transaction cho hàm Redeem sẽ được ưu tiên trong các Epics đầu tiên.

## Core Architectural Decisions (Quyết định Kiến trúc)

### 1. Data Architecture

- **Database Model:** Duy trì bộ 3 Schema Prisma: `tenant` (quản trị SaaS), `gateway/new` (dữ liệu event/battlepass), và `fnet` (kết nối máy trạm).
- **Migration Policy:** 
    - Cho phép `migrate` trên `tenant` và `gateway`.
    - **Nghiêm cấm** migrate trên `fnet` schema (Chỉ dùng `generate` từ cấu trúc hiện hữu của phòng net).
- **Atomic Integrity:** Sử dụng **Pessimistic Locking** (`SELECT ... FOR UPDATE`) bên trong `$transaction` cho mọi hàm đổi thưởng (Redeem) để triệt tiêu Race Condition.

### 2. Authentication & Data Security

- **Multi-Factor Auth:** 
    - `JWT` (NextAuth/Jose) dành cho Dashboard web.
    - `X-API-Key` (gms_key.secret) dành cho các dịch vụ máy trạm gọi vào API.
- **Tenant Isolation (The Shield):**
    - Sử dụng `AsyncLocalStorage` để lưu và luân chuyển `tenant_id` từ Request xuống tầng DB ngầm định.
    - Triển khai **Prisma Middleware** tự động chặn bắt và Inject `WHERE tenant_id = ...` vào mọi câu query.

### 3. API & Communication

- **Design Pattern:** NestJS RESTful API.
- **Rate Limiting:** Sử hợp thư viện `ioredis` để quản lý bộ đếm request tập trung (Centralized Counting). Giới hạn tần suất gọi lệnh Redeem tính theo `userId`.
- **Error Standard:** Sử dụng mã lỗi định danh (Ví dụ: `RED_001_INSUFFICIENT_FUNDS`) để đồng bộ thông báo giữa Backend và Frontend.

### 4. Code Organization (Monorepo Excellence)

- **Business Extraction:** Di chuyển toàn bộ hàm tính toán/phân bổ phần thưởng từ `apps/api/src/app/lib` ra `libs/shared/business-logic`.
- **Structural Enforcement:** Sử dụng Nx Tags (`lib:domain-logic`, `lib:database-access`) để ép thợ code/AI Dev không được import sai ranh giới quy định.
- **Dependency Map:** 
  - `apps/api` -> `libs/shared/business-logic` -> `libs/database`.
  - Cấm tuyệt đối: `libs/database` import ngược từ `apps/api`.

### Decision Impact Analysis

**Thứ tự Triển khai (Implementation Sequence):**
1. Setup `libs/shared/business-logic` và di chuyển hàm đổi thưởng.
2. Cấu hình `ioredis` và bọc Rate-limit thực tế.
3. Triển khai Transaction-first Pattern cho logic tiền thưởng.
4. Xây dựng Middleware tự động cách ly Tenant.

## Implementation Patterns & Consistency Rules

### 1. Naming Patterns (Quy tắc Đặt tên)

- **Database Naming:** 
    - **Table:** Kiểu `PascalCase` (VD: `Organization`, `Tenant`).
    - **Column:** Code sử dụng `camelCase` (VD: `tenantId`), ánh xạ (`@map`) sang `snake_case` trong MySQL (VD: `tenant_id`).
- **API Naming:** 
    - **Endpoint:** Luôn sử dụng danh từ số nhiều, kiểu `kebab-case` (VD: `/api/v1/tenant-admin/reward-records`).
    - **Method:** `POST` cho tác vụ tạo/biến đổi trạng thái (Redeem), `GET` cho tra cứu, `PATCH` cho cập nhật từng phần.
- **Code Naming:** 
    - **Files:** `kebab-case.ts` cho service/controller (VD: `reward-distribution.service.ts`).
    - **Functions/Variables:** Luôn sử dụng `camelCase` (VD: `calculateFinalReward`).

### 2. Structure Patterns (Quy hoạch & Luồng dữ liệu)

- **Logic Separation:** Không để Business logic trong Controller hay Prisma Middleware.
    - *Luồng:* `Request` -> `Guard (X-API-Key)` -> `Controller` -> `Service` -> `Business-Lib` (libs/shared/business-logic) -> `Prisma (tx context)`.
- **Test Location:** File test `*.spec.ts` phải nằm ngay cạnh file logic (`co-located`).
- **Error Handling Architecture:**
    - AI Agents **PHẢI** ném các Exception chuẩn của NestJS (`BadRequestException`, `ForbiddenException`).
    - Response Wrapper định dạng: `{ success: boolean, data?: any, error?: { code: string, message: string } }`.

### 3. Data Integrity Patterns

- **Transaction Template:** Mọi hàm liên quan đến "ví tiền/điểm" buộc phải sử dụng bọc `$transaction` kết hợp `SELECT ... FOR UPDATE` (Pessimistic Locking) để triệt tiêu Race Condition.
- **Context Injection:** Sử dụng `AsyncLocalStorage` để luân chuyển định danh `tenant_id` từ Request xuyên suốt các hàm nghiệp vụ mà không cần truyền biến thủ công qua nhiều tầng.
- **Rate Limit Enforcement:** Sử dụng decorator hoặc Interceptor gọi `checkRateLimit` từ `libs/shared/utils`. Bộ đếm lưu tại Redis trung tâm.

### 4. Enforcement Guidelines (Quy tắc ép buộc cho AI Agents)

**Tất cả AI Agents làm việc trên dự án này BẮT BUỘC PHẢI:**
- Luôn kiểm tra sự tồn tại của `tenant_id` trước bất kỳ lệnh Query Database nào.
- Sử dụng UUID v4 cho mọi ID mới được sinh ra.
- Log tất cả các giao dịch thay đổi số dư ví vào bảng Audit Trail không cho phép xóa.
- Viết integration test cho mọi endpoint liên quan đến logic đổi thưởng (Redeem).

### Pattern Examples

**✅ Nên làm (Good Example):**
```typescript
await db.$transaction(async (tx) => {
  const account = await tx.$queryRaw`SELECT * FROM User WHERE userId = ${id} FOR UPDATE`;
  // Calculation logic...
});
```

**❌ Không nên làm (Anti-Pattern):**
```typescript
const account = await db.user.findUnique({ where: { id } });
// No transaction, vulnerable to double-spending
await db.user.update({ where: { id }, data: { points: account.points - cost } });
```

## Project Structure & Boundaries (Bám sát mã nguồn hiện hữu)

### 1. Complete Project Directory Structure (Dựa trên `apps/` thực tế)

Hệ thống được phát triển dựa trên 7 ứng dụng vệ tinh và 1 API trung tâm đã được khởi tạo:

```
loot-vn/
├── apps/
│   ├── api/                 # 🔥 NestJS Backend - Bộ não xử lý Transaction, Rewards & Fnet Integration
│   ├── master-app/          # 👑 Vite/React - Dashboard cho Admin hệ thống (Loot.vn)
│   ├── tenant-manage-app/   # 🏢 Vite/React - Dashboard quản lý các Tenant (Chi nhánh)
│   ├── admin-app/           # 💼 Vite/React - Dashboard cho Chủ quán (Tenant Admin)
│   ├── client-app/          # 🎮 Vite/React - App dành cho Gamer (Giao diện chính để Gamer dùng dịch vụ)
│   ├── hr-app/              # ⏰ Vite/React - App quản lý nhân sự (Nhân viên quán net)
│   ├── hr-manager-app/      # 📊 Vite/React - App dành cho quản lý nhân sự cấp cao
├── libs/
│   ├── shared/              # Shared Utilities (Redis, Constants, Hooks dùng chung 7 apps)
│   │   ├── business-logic/  # [MỚI] Quy tắc tính điểm, BattlePass bóc tách từ Monolith
│   │   └── utils/           # Redis-client, Rate-limit, Date-utils
│   ├── database/            # Centralized Prisma (schemas: fnet, gateway, tenant)
│   └── architecture/        # AsyncLocalStorage context, Global Interceptors
├── prisma/                  # Nơi lưu trữ 3 file .prisma gốc (Tenant, Gateway/New, Fnet)
└── tools/                   # Scripts migrate, seed dữ liệu cho Monorepo
```

### 2. Architectural Boundaries (Quy định Ranh giới)

- **The Big Brain (API):** Mọi ứng dụng Frontend (`master-app`, `admin-app`, ...) **PHẢI** gọi qua `apps/api`. Không app nào được phép tự ý kết nối Database hoặc Fnet trực tiếp từ Client.
- **Shared Wisdom (Libs):** Toàn bộ logic nghiệp vụ nhạy cảm (Tính điểm, Phần thưởng, Rate limit) phải được tập trung tại `libs/shared/business-logic`.
- **Isolated Views (Tailwind/Vite):** Mỗi App trong `apps/` duy trì các cấu hình UI riêng biệt nhưng chia sẻ chung bộ lọc PII và Audit Log từ Shared Libs.

### 3. Requirements to Structure Mapping (Ánh xạ thực bế)

- **FR1 (Tenant Management):** Phát triển logic tại `api/tenant-admin` và UI tại `tenant-manage-app`.
- **FR10-FR15 (Gamification):** Logic tại `libs/shared/business-logic`, UI tại `client-app`.
- **HR Functions (Punctuality, Salary):** Logic xử lý tại `api/hr-app` và UI hiển thị tại `hr-app` / `hr-manager-app`.
- **Fnet Sync (Integration):** Thực hiện ngầm định tại các Services bên trong `apps/api`.

### 4. Integration Points

- **Authentication:** `apps/api` cấp phát JWT cho Web Apps và xác thực API-Key cho Gamer App/Máy trạm.
- **Data Flow:** Mọi thay đổi số dư ví (Balance) phải đi qua `Business-Lib` bọc trong `Transaction`.
- **Communication:** Tránh gọi API HTTP giữa các App nội bộ. Ưu tiên dùng Shared Libs để gọi trực tiếp logic nghiệp vụ.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** Tất cả các lựa chọn công nghệ (NestJS, Vite, Prisma, Redis) đều tương thích cao trong hệ sinh thái Node.js/TypeScript. Việc chia tách App theo kiểu "máy trạm" và "quản trị" phù hợp với triết lý Monorepo.

**Pattern Consistency:** Các quy tắc đặt tên và cấu trúc bọc Transaction đồng nhất giúp giảm thiểu lỗi Race Condition tiềm ẩn từ mã nguồn Monolith cũ.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:** Toàn bộ 18 yêu cầu chức năng đều đã có "nhà" (Home) cụ thể trong cấu trúc thư mục `apps/` và `libs/`.

**Non-Functional Requirements Coverage:** Các yếu tố về hiệu năng (<1500ms), bảo mật (PII/Masking) và độ tin cậy (Atomic Transaction) đã được quy định thành các Patterns ép buộc.

### Implementation Readiness Validation ✅

**Overall Status:** **READY FOR IMPLEMENTATION**

**Key Strengths:**
- Khả năng cách ly dữ liệu Multi-tenant cực mạnh nhờ lớp Interceptor tự động.
- Tính ổn định cao khi tương tác với Fnet nhờ cơ chế Transaction chặt chẽ.
- Cấu trúc Monorepo rõ ràng giúp tái sử dụng Code nghiệp vụ giữa 7 Apps Frontend.

### Implementation Handoff

**AI Agent Guidelines:**
- Tuyệt đối tuân thủ việc bọc Transaction và `FOR UPDATE` cho các hàm đổi thưởng.
- Mọi logic tính toán mới phải được đặt trong `libs/shared/business-logic`.
- Luôn sử dụng API trung tâm, không cho phép Frontend gọi trực tiếp Database.

---

## Phase 2: Material & Inventory Management

### Project Context Analysis (Module Kho & Định lượng)

#### Requirements Overview

**Functional Requirements:**
- **FR_INV_1 (Integrated Materials):** Quản lý nguyên vật liệu thô (Materials) với thuộc tính SKU, Đơn vị cơ sở, Tồn kho hiện tại và Định mức cảnh báo tối thiểu.
- **FR_INV_2 (Unit Scaling):** Cho phép thiết lập bảng quy đổi đơn vị (Unit Conversions) để quản lý nhập hành theo đơn vị lớn (Thùng/Lốc) và tiêu thụ theo đơn vị nhỏ (Chai/Gam).
- **FR_INV_3 (Recipe Management):** Xây dựng định lượng (Recipes/BOM) cho từng sản phẩm (Products) trên menu, xác định lượng tiêu tốn nguyên vật liệu cho mỗi đơn vị sản phẩm.
- **FR_INV_4 (Inventory History):** Lưu vết mọi lần nhập kho (Inventory Receipts) với thông tin Nhà cung cấp, số lượng nhập và đơn giá đầu vào để tính toán COGS (Giá vốn).

**Non-Functional Requirements:**
- **Atomic Stock Management (Data Integrity):** Việc cập nhật `quantity_in_stock` phải được bọc trong các Database Transaction chặt chẽ nhằm tránh sai lệch tồn kho khi nhiều máy trạm hoặc web dashboard thực hiện thao tác cùng lúc.
- **Unit Calculation Accuracy:** Hệ thống phải đảm bảo độ chính xác của các phép tính quy đổi đơn vị qua các lớp decimals (thông qua DECIMAL(10, 2)).
- **Automatic Multi-Tenant Isolation:** Tất cả dữ liệu kho phải được tự động cô lập theo `tenant_id` lấy từ request context (The Shield).

**Scale & Complexity:**
- Độ phức tạp kỹ thuật: **Trung bình - Cao** (Do có sự kết hợp giữa Business logic định lượng và quản lý trạng thái tồn kho real-time).
- Ước tính số lượng Component chính: 3 (Inventory Service, Recipe Engine, Stock Adjustment Interceptor).

### Technical Constraints & Dependencies
- **Phụ thuộc vào hệ thống Order hiện có:** Logic trừ kho (Stock deduction) phụ thuộc vào luồng hoàn tất đơn hàng (Order Completion) để kích hoạt.
- **Ranh giới Monorepo:** Tuân thủ việc bóc tách logic tính toán ra `libs/shared/business-logic` để tăng tính tái sử dụng và kiểm thử.

### Cross-Cutting Concerns Identified
- **Global Transaction Tracking:** Cần một cơ chế ghi log (Audit Trail) cho mọi lần biến động kho (`quantity_on_hand` change).
- **Tenant Context Consistency:** Đảm bảo `AsyncLocalStorage` cung cấp context nhất quán ngay cả trong các hàm xử lý nền (Background jobs) trừ kho.

---

## Implementation Progress Summary (Updated: 2026-04-08)

**Lưu ý:** `libs/shared/business-logic` chưa được tạo. Business logic vẫn nằm tại `apps/api/src/app/lib/` (38 utility files). Quyết định bóc tách ở Phase 1 chưa thực hiện — cần reassess khi có bandwidth.

### Modules đã triển khai (chưa có trong doc gốc)

| Domain | Models/Tables | API Module | Ghi chú |
|--------|--------------|------------|---------|
| Food Order | FoodOrder, FoodOrderDetail, FoodOrderStatusHistory, MenuCategory, Recipe | admin-app/order, admin-app/menu | WebSocket Gateway |
| Inventory (Phase 2) | Material, MaterialUnitConversion, RecipeVersion, RecipeItem, InventoryTransaction | admin-app/material | inventory-engine.service |
| Chat | ChatMessage, ChatLastSeen | admin-app/chat | WebSocket Gateway |
| Birthday | BirthdayTier, UserBirthdayProgress, BirthdayTransaction | (trong lib/) | |
| Game Appointment | GameAppointmentTier, GameAppointment, GameAppointmentMember, GameAppointmentReward | (trong lib/) | |
| Zone/Layout | Zone, ComputerLayout | admin-app/layout | |
| Promotion Reward Store | PromotionReward, PromotionRewardRecipe, PromotionRewardCategory, PromotionRewardRedemption | admin-app/promotion-reward | WebSocket Gateway, đổi sao lấy quà |
| Shift Handover v2 | ShiftHandoverReport, HandoverReport, HandoverMaterial | admin-app/shift-handover-report, admin-app/handover-report | |
| Staff Violations | RewardPunishRule, RuleSeverity, StaffViolation | hr-manager-app/reward-punish-rules | |
| Feedback | Feedback, FeedbackStatusHistory | admin-app/feedback | |

### Communication Patterns bổ sung
- **WebSocket Gateways** được sử dụng cho 3 modules: `chat`, `order`, `promotion-reward` — pattern chưa được document trong Phase 1.

### Tổng quan Schema
- **82 models**, **28 enums** trong `new/schema.prisma`
- **16 API sub-modules** trong admin-app, **7 sub-modules** trong hr-manager-app

---

## Phase 3: Event Promotion System

### Project Context Analysis

#### Requirements Overview

**Functional Requirements:**

- **FR_EP_1 (Event Management):** Khởi tạo các Event (sự kiện/chiến dịch tổng) trong phòng máy, với thời gian bắt đầu/kết thúc, mô tả, trạng thái lifecycle (Draft → Active → Paused → Completed).
- **FR_EP_2 (Flexible Targeting):** Cho phép target theo nhiều tiêu chí structured: Loại user (Rank/VIP), GroupMachine (khu vực máy), hoặc user cụ thể. Ví dụ: "chỉ VIP trên 5,000,000 tổng nạp". Phải query-able từ DB, không phải JSON blob.
- **FR_EP_3 (Multi-Promotion per Event):** Mỗi Event map với 1 hoặc nhiều chương trình Khuyến mãi (Promotion). Ví dụ: Event 30/4 có Promotion "Nạp 1tr tặng 50%" + Promotion "Tặng nước miễn phí".
- **FR_EP_4 (Promotion Conditions):** Mỗi Promotion có điều kiện kích hoạt cấu trúc: loại hành động (nạp tiền, chơi game, order đồ uống), ngưỡng giá trị (>= 1,000,000đ), thời gian áp dụng.
- **FR_EP_5 (Composite Rewards):** Mỗi Promotion tặng combo phần thưởng: bonus % vào tài khoản phụ + lượt quay thưởng + phần nước tự chọn. Không phải 1 reward mà là bundle nhiều reward items.
- **FR_EP_6 (Coupon/Code Generation):** Tạo hàng loạt mã khuyến mãi (VD: 1000 mã). Mỗi mã có: discount type (%, fixed), maxValue cap (tối đa 5k), thời hạn (7 ngày từ lúc phát).
- **FR_EP_7 (Usage Frequency Control):** Giới hạn sử dụng per user: 1 lần/tuần, 1 lần/tháng, hoặc không giới hạn suốt sự kiện. Query-able, structured data.
- **FR_EP_8 (Event Analytics):** Theo dõi hiệu quả toàn bộ chiến dịch Event: tổng người tham gia/đủ điều kiện, doanh thu phát sinh trong thời gian Event (nạp tiền, order F&B, giờ chơi), chi phí chiến dịch (tổng giá trị rewards đã phát, chi phí thực tế), conversion rate (đủ điều kiện → tham gia → claim reward), so sánh trước/trong/sau Event để đánh giá ROI, breakdown theo từng Promotion.

**Non-Functional Requirements:**
- **Atomic Reward Distribution:** Phát thưởng combo (bonus + spins + voucher) phải trong 1 transaction — hoặc tất cả hoặc không gì cả.
- **Scalable Code Generation:** Tạo 1000+ mã trong 1 batch mà không block main thread.
- **Query-able Targeting & Conditions:** Conditions phải là structured data để có thể filter/query từ DB.

**Scale & Complexity:**
- Độ phức tạp: **Cao** — nhiều entity liên kết, business rules phức tạp, cần backward compatible với Promotion/Reward cũ.
- Primary domain: Event orchestration + Coupon engine
- Estimated components: 5-7 models mới/refactor, 2-3 API modules

#### Technical Constraints & Dependencies

- **Backward compatible:** Hệ thống `PromotionReward` (đổi sao lấy quà) đang hoạt động tốt, KHÔNG merge vào Event Promotion. Giữ riêng hoàn toàn.
- **BattlePass giữ riêng:** BattlePass là tính năng độc lập, không unify vào Event system.
- **Schema hiện có cần refactor:** `Event`, `EventReward`, `PromotionSetting`, `PromotionCode` đã tồn tại nhưng thiếu linh hoạt (targeting = LongText, conditions = JSON blob, không có Promotion layer trung gian).
- **`eventId` hiện là String?** trong PromotionSetting/PromotionCode — loose coupling, không phải FK relation. Cần fix.

#### Cross-Cutting Concerns

- **Ranh giới rõ ràng với PromotionReward Store:** "Đổi sao lấy quà" (PromotionReward) vs "Event tặng quà khi nạp tiền" (EventPromotion) — hai hệ thống riêng biệt.
- **Transaction integrity:** Reward distribution liên quan đến ví user — phải tuân thủ Pessimistic Locking pattern (`$transaction` + `FOR UPDATE`) đã quyết định ở Phase 1.
- **Tenant isolation:** Tất cả Event/Promotion data phải tự động cô lập theo tenant context.

### Core Architectural Decisions (Phase 3: Event Promotion)

#### 1. Data Architecture — Clean Slate (Option B)

**Quyết định:** Tạo models mới hoàn toàn cho Promotion layer, deprecate `PromotionSetting`, `PromotionCode`, `EventReward` cũ.

**Entity Hierarchy:**
```
Event (refactor tại chỗ)
├── EventTargetRule[]         ← Structured targeting (ai được tham gia?)
├── EventPromotion[]          ← Chương trình KM (thay PromotionSetting)
│   ├── PromotionCondition[]  ← Điều kiện kích hoạt (nạp >= 1tr, etc)
│   ├── PromotionRewardBundle[] ← Combo phần thưởng
│   │   └── PromotionRewardItem[] ← Từng reward cụ thể trong combo
│   └── CouponBatch[]         ← Đợt phát mã
│       └── CouponCode[]      ← Mã code cụ thể (thay PromotionCode)
├── EventParticipant[] (refactor tại chỗ)
└── EventAnalytics[]          ← Snapshot analytics chiến dịch
```

#### Draft Prisma Schema

```prisma
// ===== REFACTOR: Event (giữ model, bỏ LongText fields, thêm relations mới) =====
model Event {
  id                   String             @id @default(cuid())
  name                 String
  description          String?            @db.Text
  type                 EventType
  status               EventStatus
  startDate            DateTime
  endDate              DateTime
  budget               Int?
  isActive             Boolean            @default(true)
  createdBy            Int?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  targetRules          EventTargetRule[]
  promotions           EventPromotion[]
  participants         EventParticipant[]
  analytics            EventAnalytics[]

  @@index([status])
  @@index([startDate])
  @@index([endDate])
  @@map("Event")
}

// ===== NEW: Targeting có cấu trúc =====
model EventTargetRule {
  id          Int             @id @default(autoincrement())
  eventId     String
  type        TargetRuleType  // RANK, MIN_TOTAL_PAYMENT, ZONE, SPECIFIC_USER
  operator    String          @db.VarChar(10)  // ">=", "=", "IN"
  value       String          @db.VarChar(500) // "5000000" hoặc "1,2,3" (userIds)
  event       Event           @relation(fields: [eventId], references: [id])

  @@index([eventId])
  @@map("EventTargetRule")
}

enum TargetRuleType {
  RANK              // Filter theo rank: value = rankId
  MIN_TOTAL_PAYMENT // Filter theo tổng nạp: value = "5000000"
  ZONE              // Filter theo khu vực máy: value = zoneId
  SPECIFIC_USER     // User cụ thể: value = "userId1,userId2"
}

// ===== NEW: Promotion (thay thế PromotionSetting) =====
model EventPromotion {
  id          Int                    @id @default(autoincrement())
  eventId     String
  name        String
  description String?                @db.Text
  isActive    Boolean                @default(true)
  priority    Int                    @default(1)
  createdAt   DateTime               @default(now())
  updatedAt   DateTime               @updatedAt

  event         Event                  @relation(fields: [eventId], references: [id])
  conditions    PromotionCondition[]
  rewardBundles PromotionRewardBundle[]
  couponBatches CouponBatch[]

  @@index([eventId])
  @@map("EventPromotion")
}

// ===== NEW: Điều kiện kích hoạt =====
model PromotionCondition {
  id            Int               @id @default(autoincrement())
  promotionId   Int
  triggerAction ConditionTrigger  // TOPUP, ORDER_FOOD, PLAY_TIME
  operator      String            @db.VarChar(10)  // ">="
  value         Float             // 1000000 (đ)
  promotion     EventPromotion    @relation(fields: [promotionId], references: [id])

  @@index([promotionId])
  @@map("PromotionCondition")
}

enum ConditionTrigger {
  TOPUP         // Nạp tiền
  ORDER_FOOD    // Đặt đồ ăn/uống
  PLAY_TIME     // Thời gian chơi (phút)
  TOTAL_SPEND   // Tổng chi tiêu trong Event
}

// ===== NEW: Combo phần thưởng =====
model PromotionRewardBundle {
  id          Int                     @id @default(autoincrement())
  promotionId Int
  name        String
  promotion   EventPromotion          @relation(fields: [promotionId], references: [id])
  items       PromotionRewardItem[]

  @@index([promotionId])
  @@map("PromotionRewardBundle")
}

// ===== NEW: Từng reward trong combo =====
model PromotionRewardItem {
  id          Int                   @id @default(autoincrement())
  bundleId    Int
  rewardType  EventRewardType       // BONUS_PERCENT, SPIN_TURNS, FREE_DRINK, etc.
  value       Float                 // 50 (%), 10 (lượt), 1 (phần)
  walletType  String?               @db.VarChar(10) // "MAIN" | "SUB"
  maxValue    Int?                  // Cap tối đa (VD: 500000đ bonus)
  metadata    String?               @db.Text
  bundle      PromotionRewardBundle @relation(fields: [bundleId], references: [id])

  @@index([bundleId])
  @@map("PromotionRewardItem")
}

enum EventRewardType {
  BONUS_PERCENT         // % bonus vào ví (sub/main)
  TOPUP_FIXED           // Cộng cố định vào ví
  SPIN_TURNS            // Lượt quay thưởng
  FREE_DRINK            // Phần nước tự chọn
  FREE_FOOD             // Phần đồ ăn
  COUPON                // Phát mã giảm giá
}

// ===== NEW: Đợt phát mã (thay thế PromotionCode batch logic) =====
model CouponBatch {
  id              Int             @id @default(autoincrement())
  promotionId     Int
  name            String
  discountType    DiscountType    // PERCENT, FIXED (reuse enum cũ)
  discountValue   Float           // 50 (%)
  maxDiscountValue Int?           // 5000 (đ) — cap
  totalCodes      Int             // 1000
  validDays       Int?            // 7 ngày từ lúc phát
  validFrom       DateTime?
  validTo         DateTime?
  usageFrequency  UsageFrequency  // PER_WEEK, PER_MONTH, PER_EVENT
  maxUsagePerUser Int             @default(1)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  promotion       EventPromotion  @relation(fields: [promotionId], references: [id])
  codes           CouponCode[]

  @@index([promotionId])
  @@map("CouponBatch")
}

enum UsageFrequency {
  PER_WEEK
  PER_MONTH
  PER_EVENT
  ONE_TIME
}

// ===== NEW: Mã code cụ thể (thay thế PromotionCode) =====
model CouponCode {
  id          Int           @id @default(autoincrement())
  batchId     Int
  code        String        @unique @db.VarChar(20)
  isUsed      Boolean       @default(false)
  usedBy      Int?
  usedAt      DateTime?
  expiresAt   DateTime?
  createdAt   DateTime      @default(now())
  batch       CouponBatch   @relation(fields: [batchId], references: [id])

  @@index([batchId])
  @@index([code])
  @@index([usedBy])
  @@map("CouponCode")
}

// ===== NEW: Event Analytics snapshot =====
model EventAnalytics {
  id                    Int      @id @default(autoincrement())
  eventId               String
  snapshotDate          DateTime @default(now())
  totalEligible         Int      @default(0)
  totalParticipants     Int      @default(0)
  totalRewardsClaimed   Int      @default(0)
  totalCouponsIssued    Int      @default(0)
  totalCouponsUsed      Int      @default(0)
  totalRevenue          Decimal  @default(0) @db.Decimal(12, 0)
  totalRewardCost       Decimal  @default(0) @db.Decimal(12, 0)
  conversionRate        Float?
  revenueBeforeEvent    Decimal? @db.Decimal(12, 0)
  event                 Event    @relation(fields: [eventId], references: [id])

  @@index([eventId])
  @@index([snapshotDate])
  @@map("EventAnalytics")
}
```

#### Models deprecate

| Model cũ | Thay bằng | Ghi chú |
|-----------|-----------|---------|
| `PromotionSetting` | `EventPromotion` + `CouponBatch` | Drop sau khi migrate data (nếu có) |
| `PromotionCode` | `CouponCode` | Drop sau khi migrate |
| `EventReward` | `PromotionRewardBundle` + `PromotionRewardItem` | Drop |
| `EventReport` | `EventAnalytics` | Structured thay vì JSON blob |

#### Giữ nguyên (không đụng)

- `PromotionReward` family (đổi sao lấy quà) — hệ thống riêng biệt
- `BattlePassSeason` family — tính năng độc lập
- `Reward`, `UserRewardMap` — legacy, deprecate riêng sau

#### Bỏ fields trên Event

Xoá khỏi model `Event`: `targetAudience`, `conditions`, `rules`, `registrationStart`, `registrationEnd`, `expectedParticipants`, `totalCodesGenerated`, `totalCodesUsed`, `totalRewardsDistributed`, `generateCodesAhead`, `approvedBy`, `approvedAt`.

#### 2. Migration Strategy

- Tạo tất cả models mới trong 1 migration
- Nếu có data production trong `PromotionSetting`/`PromotionCode`, viết seed script migrate trước khi drop
- Bỏ fields thừa trên `Event` trong migration riêng

#### 3. API Module Structure

```
apps/api/src/app/admin-app/event-promotion/
├── event-promotion.module.ts
├── event-promotion.controller.ts    ← CRUD Event + Promotions
├── event-promotion.service.ts       ← Business logic
├── coupon.service.ts                ← Code generation + validation
├── event-analytics.service.ts       ← Analytics aggregation
└── dto/
    ├── create-event.dto.ts
    ├── create-promotion.dto.ts
    └── create-coupon-batch.dto.ts
```

#### 4. Business Logic Patterns

- **Atomic Reward Distribution:** Phát combo rewards (bonus + spins + voucher) bọc trong `$transaction` + `FOR UPDATE` trên User record — tuân thủ Phase 1 pattern.
- **Batch Code Generation:** Tạo 1000+ codes dùng `createMany` trong transaction, generate code bằng nanoid/crypto random — tránh collision qua unique constraint.
- **Usage Frequency Check:** Query `CouponCode` theo `usedBy` + `usedAt` + `batch.usageFrequency` để validate trước khi cho phép sử dụng.
- **Analytics Aggregation:** Chạy scheduled job (cron hoặc on-demand) tính snapshot metrics từ `EventParticipant`, `CouponCode`, và revenue data.

#### Decision Impact Analysis

**Implementation Sequence:**
1. Migration: Tạo models mới + refactor Event
2. Service layer: `event-promotion.service.ts` + `coupon.service.ts`
3. API endpoints: CRUD Event/Promotion/CouponBatch
4. Reward distribution: Hook vào luồng topup/order hiện có
5. Analytics: `event-analytics.service.ts` + scheduled aggregation
6. Admin UI: Trang quản lý Event Promotion trong admin-app

---

## Phase 4: Menu Campaign System (Khuyến mãi Menu)

> **Hệ thống này hoàn toàn RIÊNG BIỆT và chạy SONG SONG với Event Promotion (Phase 3) và Promotion Reward Store.**

### Phân biệt 3 hệ thống Khuyến mãi

| Hệ thống | Mục đích | Trigger | Ví dụ |
|-----------|----------|---------|-------|
| **Promotion Reward Store** | Đổi sao lấy quà | User chủ động đổi stars | "500 sao = 1 phần trà sữa" |
| **Event Promotion** (Phase 3) | Tặng thưởng khi user đạt điều kiện trong Event | Hành động: nạp tiền, chơi game | "Nạp 1tr tặng 50% bonus + 10 lượt quay" |
| **Menu Campaign** (Phase 4) | Giảm giá trực tiếp trên menu khi đặt hàng | Tự động áp dụng tại checkout | "Giảm 50% toàn menu, tối đa 30k/đơn" |

### Project Context Analysis

#### Requirements Overview

**Functional Requirements:**

- **FR_MC_1 (Campaign Management):** Khởi tạo chiến dịch KM menu với: tên, mô tả, thời gian bắt đầu/kết thúc, tổng ngân sách dự chi. Auto-end khi hết thời gian HOẶC hết ngân sách (cái nào đến trước).
- **FR_MC_2 (Flexible Targeting — Menu Scope):** Target giảm giá theo phạm vi menu:
  - `ALL` — toàn bộ menu
  - `CATEGORY` — 1 hoặc nhiều danh mục cụ thể (MenuCategory)
  - `RECIPE` — 1 hoặc nhiều món cụ thể (Recipe)
- **FR_MC_3 (Flexible Targeting — Customer Scope):** Target đối tượng khách hàng:
  - `ALL_CUSTOMERS` — mọi khách
  - `RANK` — theo hạng thành viên (Rank)
  - `MACHINE_GROUP` — theo nhóm máy/khu vực
  - `SPECIFIC_USER` — user cụ thể (userId)
  - `NEW_MEMBER` — khách hàng mới (chưa có order nào hoặc đăng ký trong X ngày)
- **FR_MC_4 (Discount Types):** Hỗ trợ nhiều hình thức giảm giá:
  - `PERCENTAGE` — Giảm theo % (ví dụ: giảm 50%)
  - `FIXED_AMOUNT` — Giảm cố định (ví dụ: giảm 10,000đ)
  - `FLAT_PRICE` — Đồng giá (ví dụ: tất cả 10,000đ)
  - `COMBO_DEAL` — Mua combo giảm giá (ví dụ: 1 nước + 1 đồ ăn giảm 20%)
- **FR_MC_5 (Constraints & Caps):**
  - `maxUsesPerUserPerCampaign` — Giới hạn N lần/user/chiến dịch
  - `maxUsesPerUserPerDay` — Giới hạn M lần/user/ngày
  - `minOrderValue` — Giá trị đơn hàng tối thiểu (Min Spend)
  - `maxDiscountAmount` — Mức giảm tối đa (Cap)
  - `totalBudget` — Tổng ngân sách chiến dịch
- **FR_MC_6 (Happy Hour — Time-Based Auto-Activation):** Hỗ trợ khung giờ kích hoạt tự động (ví dụ: 8h-10h sáng). Campaign có thể có `timeSlots` — chỉ active trong các khung giờ nhất định mỗi ngày.
- **FR_MC_7 (Auto-Apply at Checkout):** Khi khách đặt hàng, hệ thống tự động scan các campaign đang active, match điều kiện (menu scope + customer scope + time + constraints), và áp dụng giảm giá tốt nhất (hoặc theo priority). Khách không cần nhập mã.
- **FR_MC_8 (Budget Progress — Gamification):** Hiển thị cho khách hàng thanh tiến trình ngân sách còn lại (ví dụ: "Chỉ còn 15% ưu đãi cuối cùng!"). Tạo cảm giác khan hiếm.
- **FR_MC_9 (Battle Pass Integration):** Cho phép tạo campaign yêu cầu `unlockCondition` — khách phải đạt level nhất định trong BattlePass hoặc hoàn thành nhiệm vụ để mở khóa quyền hưởng KM.
- **FR_MC_10 (A/B Testing):** Cho phép chạy song song 2+ chiến dịch cùng target, mỗi chiến dịch gán `testGroup` (A/B/C...). User được random assign vào group. So sánh hiệu quả qua analytics.
- **FR_MC_11 (Campaign Analytics Dashboard):** Real-time tracking:
  - Ngân sách đã chi vs dự kiến
  - Số lần áp dụng (total + per user)
  - Doanh thu phát sinh trong campaign
  - Conversion rate
  - So sánh A/B test results

**Non-Functional Requirements:**

- **Real-time Budget Tracking:** Ngân sách đã chi phải được track bằng Redis counter (atomic increment) để tránh race condition khi nhiều order cùng lúc. Sync lại DB theo batch (mỗi 30s hoặc 100 uses).
- **Campaign Evaluation Performance:** Việc scan và match campaigns tại checkout phải < 50ms. Sử dụng Redis cache cho active campaigns.
- **Atomic Discount Application:** Áp dụng giảm giá + deduct budget phải trong cùng 1 transaction.
- **Tenant Isolation:** Tất cả campaign data phải cô lập theo tenant.

**Scale & Complexity:**
- Độ phức tạp: **Cao** — nhiều loại targeting, discount types, budget tracking real-time, A/B testing
- Primary domain: Campaign engine + Discount calculator + Budget tracker
- Estimated components: 6-8 models mới, 1 API module, 1 business logic library

#### Technical Constraints & Dependencies

- **RIÊNG BIỆT với Event Promotion:** Không reuse models Phase 3. Không merge vào Event system.
- **Tích hợp với Order flow:** Hook vào `FoodOrder` creation — áp dụng discount trước khi tính `totalAmount`.
- **Tích hợp với Menu:** Reference `MenuCategory.id` và `Recipe.id` cho menu targeting.
- **Tích hợp với User:** Reference `User.userId`, `User.rankId` cho customer targeting.
- **Tích hợp với BattlePass:** Reference `UserBattlePass.level` cho unlock conditions.
- **Redis dependency:** Budget counter + active campaign cache.

#### Cross-Cutting Concerns

- **Conflict Resolution:** Khi user qualify cho nhiều campaigns cùng lúc, cần chiến lược: (a) Áp dụng campaign có priority cao nhất, (b) Áp dụng campaign có mức giảm tốt nhất cho user, hoặc (c) Chỉ áp dụng 1 campaign/order. **Quyết định: Áp dụng campaign có priority cao nhất. Admin set priority khi tạo campaign.**
- **Budget Race Condition:** Nhiều order cùng lúc có thể vượt budget. **Giải pháp: Redis atomic `INCRBY` cho budget counter + check trước khi apply.**
- **Cache Invalidation:** Khi campaign CRUD → invalidate Redis cache ngay lập tức.

### Core Architectural Decisions (Phase 4: Menu Campaign)

#### 1. Data Architecture

**Entity Hierarchy:**
```
MenuCampaign
├── MenuCampaignMenuScope[]     ← Phạm vi menu (category/recipe/all)
├── MenuCampaignCustomerScope[] ← Đối tượng khách (rank/group/user/all/new)
├── MenuCampaignTimeSlot[]      ← Khung giờ Happy Hour
├── MenuCampaignComboRule[]     ← Quy tắc combo (nếu type = COMBO_DEAL)
├── MenuCampaignUsage[]         ← Lịch sử sử dụng (per user per campaign)
└── MenuCampaignAnalytics[]     ← Snapshot analytics
```

#### Draft Prisma Schema (Phase 4)

```prisma
// ===== NEW: Menu Campaign — Chiến dịch KM Menu =====
model MenuCampaign {
  id                      Int                         @id @default(autoincrement())
  tenantId                Int                         @map("tenant_id")
  name                    String                      @db.VarChar(255)
  description             String?                     @db.Text
  status                  MenuCampaignStatus          @default(DRAFT)

  // --- Discount config ---
  discountType            MenuCampaignDiscountType    // PERCENTAGE, FIXED_AMOUNT, FLAT_PRICE, COMBO_DEAL
  discountValue           Decimal                     @db.Decimal(10, 2) // 50 (%), 10000 (đ), hoặc 10000 (đồng giá)
  maxDiscountAmount       Int?                        @map("max_discount_amount") // Cap giảm tối đa (VD: 30000đ)

  // --- Schedule ---
  startDate               DateTime                    @map("start_date")
  endDate                 DateTime                    @map("end_date")

  // --- Budget ---
  totalBudget             Int?                        @map("total_budget")       // Tổng ngân sách (đ)
  spentBudget             Int                         @default(0) @map("spent_budget") // Đã chi (sync từ Redis)
  totalUsageCount         Int                         @default(0) @map("total_usage_count")

  // --- Constraints ---
  maxUsesPerUserPerCampaign Int?                      @map("max_uses_per_user_campaign")
  maxUsesPerUserPerDay      Int?                      @map("max_uses_per_user_day")
  minOrderValue             Int?                      @map("min_order_value")    // Min Spend

  // --- Priority & Testing ---
  priority                Int                         @default(1)               // Cao hơn = ưu tiên hơn
  testGroup               String?                     @db.VarChar(10)           // "A", "B", null = không test

  // --- Battle Pass Integration ---
  requiredBattlePassLevel Int?                        @map("required_bp_level") // Level tối thiểu để unlock
  requiredBattlePassSeasonId Int?                     @map("required_bp_season_id")

  // --- Metadata ---
  createdBy               Int?                        @map("created_by")
  createdAt               DateTime                    @default(now()) @map("created_at")
  updatedAt               DateTime                    @updatedAt @map("updated_at")

  // --- Relations ---
  menuScopes              MenuCampaignMenuScope[]
  customerScopes          MenuCampaignCustomerScope[]
  timeSlots               MenuCampaignTimeSlot[]
  comboRules              MenuCampaignComboRule[]
  usages                  MenuCampaignUsage[]
  analytics               MenuCampaignAnalytics[]

  @@index([tenantId])
  @@index([status])
  @@index([startDate])
  @@index([endDate])
  @@index([testGroup])
  @@map("MenuCampaign")
}

enum MenuCampaignStatus {
  DRAFT           // Nháp, chưa active
  ACTIVE          // Đang chạy
  PAUSED          // Tạm dừng
  BUDGET_EXCEEDED // Auto-stop: hết ngân sách
  EXPIRED         // Auto-stop: hết thời gian
  CANCELLED       // Admin huỷ thủ công
}

enum MenuCampaignDiscountType {
  PERCENTAGE      // Giảm theo %
  FIXED_AMOUNT    // Giảm số tiền cố định
  FLAT_PRICE      // Đồng giá
  COMBO_DEAL      // Mua combo giảm giá
}

// ===== NEW: Phạm vi menu áp dụng =====
model MenuCampaignMenuScope {
  id              Int                   @id @default(autoincrement())
  campaignId      Int                   @map("campaign_id")
  scopeType       MenuScopeType         // ALL, CATEGORY, RECIPE
  targetId        Int?                  @map("target_id") // categoryId hoặc recipeId (null nếu ALL)

  campaign        MenuCampaign          @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId])
  @@map("MenuCampaignMenuScope")
}

enum MenuScopeType {
  ALL             // Toàn bộ menu
  CATEGORY        // Danh mục cụ thể (targetId = MenuCategory.id)
  RECIPE          // Món cụ thể (targetId = Recipe.id)
}

// ===== NEW: Đối tượng khách hàng áp dụng =====
model MenuCampaignCustomerScope {
  id              Int                       @id @default(autoincrement())
  campaignId      Int                       @map("campaign_id")
  scopeType       CustomerScopeType         // ALL, RANK, MACHINE_GROUP, SPECIFIC_USER, NEW_MEMBER
  targetId        Int?                      @map("target_id") // rankId, machineGroupId, userId (null nếu ALL/NEW_MEMBER)

  campaign        MenuCampaign              @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId])
  @@map("MenuCampaignCustomerScope")
}

enum CustomerScopeType {
  ALL_CUSTOMERS   // Tất cả khách
  RANK            // Theo hạng thành viên (targetId = Rank.id)
  MACHINE_GROUP   // Theo nhóm máy (targetId = machineGroupId from Fnet)
  SPECIFIC_USER   // User cụ thể (targetId = User.userId)
  NEW_MEMBER      // Khách hàng mới (targetId = null, logic check trong service)
}

// ===== NEW: Khung giờ Happy Hour =====
model MenuCampaignTimeSlot {
  id              Int           @id @default(autoincrement())
  campaignId      Int           @map("campaign_id")
  dayOfWeek       Int?          @map("day_of_week")    // 0=CN, 1=T2...6=T7. Null = mọi ngày
  startTime       String        @db.VarChar(5) @map("start_time")  // "08:00"
  endTime         String        @db.VarChar(5) @map("end_time")    // "10:00"

  campaign        MenuCampaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId])
  @@map("MenuCampaignTimeSlot")
}

// ===== NEW: Quy tắc Combo (cho COMBO_DEAL) =====
model MenuCampaignComboRule {
  id              Int           @id @default(autoincrement())
  campaignId      Int           @map("campaign_id")
  categoryId      Int           @map("category_id")    // Phải mua từ category này
  minQuantity     Int           @default(1) @map("min_quantity")  // Số lượng tối thiểu

  campaign        MenuCampaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId])
  @@map("MenuCampaignComboRule")
}

// ===== NEW: Lịch sử sử dụng KM =====
model MenuCampaignUsage {
  id              Int           @id @default(autoincrement())
  campaignId      Int           @map("campaign_id")
  userId          Int           @map("user_id")
  orderId         Int           @map("order_id")        // FK → FoodOrder.id
  discountAmount  Decimal       @db.Decimal(10, 0) @map("discount_amount") // Số tiền đã giảm
  appliedAt       DateTime      @default(now()) @map("applied_at")

  campaign        MenuCampaign  @relation(fields: [campaignId], references: [id])

  @@index([campaignId])
  @@index([userId])
  @@index([orderId])
  @@index([appliedAt])
  @@map("MenuCampaignUsage")
}

// ===== NEW: Campaign Analytics Snapshot =====
model MenuCampaignAnalytics {
  id                    Int       @id @default(autoincrement())
  campaignId            Int       @map("campaign_id")
  snapshotDate          DateTime  @default(now()) @map("snapshot_date")
  totalUsages           Int       @default(0) @map("total_usages")
  uniqueUsers           Int       @default(0) @map("unique_users")
  totalDiscountGiven    Decimal   @default(0) @db.Decimal(12, 0) @map("total_discount_given")
  totalRevenueGenerated Decimal   @default(0) @db.Decimal(12, 0) @map("total_revenue_generated")
  averageOrderValue     Decimal?  @db.Decimal(10, 0) @map("average_order_value")
  conversionRate        Float?    @map("conversion_rate")

  campaign              MenuCampaign @relation(fields: [campaignId], references: [id])

  @@index([campaignId])
  @@index([snapshotDate])
  @@map("MenuCampaignAnalytics")
}
```

#### 2. Redis Architecture — Real-time Budget & Campaign Cache

```
Redis Key Patterns:
───────────────────
# Active campaign cache (per tenant)
mc:{tenantId}:active → JSON[] (list active campaigns with full config)
  TTL: 60s, invalidate on campaign CRUD

# Budget counter (atomic)
mc:{tenantId}:budget:{campaignId} → Int (spent amount, atomic INCRBY)
  No TTL — sync to DB every 30s or 100 increments

# Per-user usage counter (per campaign)
mc:{tenantId}:usage:{campaignId}:{userId} → Int (usage count)
  TTL: campaign endDate

# Per-user daily usage counter
mc:{tenantId}:daily:{campaignId}:{userId}:{YYYY-MM-DD} → Int
  TTL: 86400s (end of day)

# A/B test group assignment
mc:{tenantId}:ab:{userId} → String ("A" | "B" | "C")
  TTL: 30 days
```

**Budget Sync Strategy:**
1. Khi apply discount → `INCRBY mc:{tenantId}:budget:{campaignId} {discountAmount}`
2. Check budget TRƯỚC khi apply: `GET mc:{tenantId}:budget:{campaignId}` vs `campaign.totalBudget`
3. Nếu vượt budget → reject discount + auto-set campaign status = `BUDGET_EXCEEDED`
4. Background job mỗi 30s: sync Redis budget counter → DB `spentBudget`

#### 3. Campaign Evaluation Engine (Core Algorithm)

**Luồng tại Checkout:**
```
Client đặt order
  │
  ▼
OrderService.createOrder()
  │
  ▼
CampaignEngine.evaluateDiscounts(tenantId, userId, orderItems, machineGroupId)
  │
  ├─ 1. Load active campaigns (from Redis cache)
  │
  ├─ 2. Filter by Customer Scope
  │     → Match: ALL / RANK(user.rankId) / MACHINE_GROUP / SPECIFIC_USER / NEW_MEMBER
  │     → A/B Test: check user's testGroup matches campaign.testGroup
  │
  ├─ 3. Filter by Menu Scope
  │     → Match orderItems against campaign menuScopes
  │     → ALL: tất cả items qualify
  │     → CATEGORY: chỉ items thuộc category
  │     → RECIPE: chỉ recipe cụ thể
  │
  ├─ 4. Filter by Time Slot (Happy Hour)
  │     → Check current time vs campaign timeSlots
  │     → No timeSlots = luôn active
  │
  ├─ 5. Filter by Constraints
  │     → Check minOrderValue vs order total (trước giảm)
  │     → Check maxUsesPerUserPerCampaign vs Redis counter
  │     → Check maxUsesPerUserPerDay vs Redis daily counter
  │     → Check budget remaining (Redis)
  │     → Check requiredBattlePassLevel (if set)
  │
  ├─ 6. Calculate Discount cho mỗi campaign match
  │     → PERCENTAGE: salePrice * discountValue / 100, cap maxDiscountAmount
  │     → FIXED_AMOUNT: discountValue per item
  │     → FLAT_PRICE: salePrice - discountValue (new price)
  │     → COMBO_DEAL: check comboRules satisfied, then apply discountValue%
  │
  ├─ 7. Select best campaign (highest priority)
  │     → Nếu cùng priority → chọn discount lớn nhất cho user
  │
  └─ 8. Return: { campaignId, discountPerItem[], totalDiscount, campaignName }
```

**Sau khi order confirmed:**
```
OrderService.confirmOrder()
  │
  ▼
CampaignEngine.applyDiscount(campaignId, userId, orderId, totalDiscount)
  │
  ├─ Redis INCRBY budget counter
  ├─ Redis INCR usage counter (campaign + daily)
  ├─ Create MenuCampaignUsage record
  ├─ Check if budget exceeded → auto-pause campaign
  └─ Emit WebSocket event: budget_updated
```

#### 4. API Module Structure

```
apps/api/src/app/admin-app/menu-campaign/
├── menu-campaign.module.ts
├── menu-campaign.controller.ts       ← CRUD campaigns (Admin)
├── menu-campaign.service.ts          ← Campaign CRUD + status management
├── campaign-engine.service.ts        ← Core evaluation logic (checkout)
├── campaign-budget.service.ts        ← Redis budget tracking + sync
├── campaign-analytics.service.ts     ← Analytics aggregation
├── menu-campaign.gateway.ts          ← WebSocket: budget updates real-time
└── dto/
    ├── create-campaign.dto.ts
    ├── update-campaign.dto.ts
    └── campaign-analytics-query.dto.ts
```

**API Endpoints:**
```
# Admin CRUD
POST   /admin/menu-campaigns                    ← Tạo campaign
GET    /admin/menu-campaigns                    ← List all campaigns (filter by status)
GET    /admin/menu-campaigns/:id                ← Chi tiết campaign
PATCH  /admin/menu-campaigns/:id                ← Cập nhật campaign
PATCH  /admin/menu-campaigns/:id/status         ← Đổi status (activate/pause/cancel)
DELETE /admin/menu-campaigns/:id                ← Xoá campaign (chỉ DRAFT)

# Analytics
GET    /admin/menu-campaigns/:id/analytics      ← Campaign analytics
GET    /admin/menu-campaigns/compare             ← A/B test comparison

# Client (cho gamer app)
GET    /menu-campaigns/active                   ← Active campaigns (hiển thị banner/badge)
GET    /menu-campaigns/budget-progress/:id      ← Budget progress bar data

# Internal (gọi từ Order service)
POST   /menu-campaigns/evaluate                 ← Evaluate discounts for cart
POST   /menu-campaigns/apply                    ← Apply discount after order confirmed
```

#### 5. Integration Points

**Với FoodOrder (Hook vào Order flow):**
```typescript
// Trong order.service.ts — createOrder()
async createOrder(tenantId, userId, items, machineGroupId) {
  // 1. Tính giá gốc
  const originalTotal = calculateOriginalTotal(items);
  
  // 2. Evaluate campaign discounts
  const discount = await this.campaignEngine.evaluateDiscounts(
    tenantId, userId, items, machineGroupId
  );
  
  // 3. Tạo order với giá đã giảm
  const order = await db.$transaction(async (tx) => {
    const newOrder = await tx.foodOrder.create({
      data: {
        userId, tenantId, macAddress,
        totalAmount: originalTotal - discount.totalDiscount,
        // Lưu thông tin KM vào order
        campaignId: discount.campaignId,
        discountAmount: discount.totalDiscount,
        ...
      }
    });
    
    // 4. Apply discount (update budget, usage counters)
    if (discount.campaignId) {
      await this.campaignEngine.applyDiscount(
        discount.campaignId, userId, newOrder.id, discount.totalDiscount
      );
    }
    
    return newOrder;
  });
}
```

**Thêm fields vào FoodOrder (migration):**
```prisma
model FoodOrder {
  // ... existing fields ...
  campaignId      Int?      @map("campaign_id")    // MenuCampaign đã áp dụng
  discountAmount  Decimal?  @default(0) @db.Decimal(10, 0) @map("discount_amount")
}
```

**Với Client App (Budget Progress Bar):**
```typescript
// client-app: Hiển thị progress bar trên menu
const { budgetRemaining, budgetTotal, percentUsed } = useCampaignProgress(campaignId);
// "Chỉ còn 15% ưu đãi cuối cùng!"
```

**Với BattlePass (Unlock Condition):**
```typescript
// campaign-engine.service.ts
if (campaign.requiredBattlePassLevel) {
  const userBP = await db.userBattlePass.findFirst({
    where: { userId, seasonId: campaign.requiredBattlePassSeasonId }
  });
  if (!userBP || userBP.currentLevel < campaign.requiredBattlePassLevel) {
    return false; // Chưa đủ level → không qualify
  }
}
```

#### 6. WebSocket Events (Real-time)

```
Namespace: /menu-campaigns

Events:
  campaign:budget_updated    → { campaignId, spentBudget, totalBudget, percentUsed }
  campaign:status_changed    → { campaignId, oldStatus, newStatus }
  campaign:new_active        → { campaign } // Campaign mới được activate
```

#### 7. A/B Testing Strategy

**User Assignment:**
- Khi user lần đầu encounter campaign có `testGroup`, random assign group → lưu Redis `mc:{tenantId}:ab:{userId}`
- Sticky assignment: user luôn ở cùng group trong suốt campaign

**Comparison Query:**
```sql
SELECT 
  mc.testGroup,
  COUNT(DISTINCT mcu.userId) as uniqueUsers,
  SUM(mcu.discountAmount) as totalDiscountGiven,
  AVG(fo.totalAmount) as avgOrderValue,
  COUNT(mcu.id) as totalUsages
FROM MenuCampaignUsage mcu
JOIN MenuCampaign mc ON mcu.campaignId = mc.id
JOIN FoodOrder fo ON mcu.orderId = fo.id
WHERE mc.testGroup IS NOT NULL
GROUP BY mc.testGroup
```

#### Decision Impact Analysis

**Implementation Sequence:**
1. **Migration:** Tạo tất cả models mới (MenuCampaign + 6 bảng phụ) + thêm `campaignId`, `discountAmount` vào FoodOrder
2. **Redis setup:** Implement budget counter + campaign cache keys
3. **Service layer:** `menu-campaign.service.ts` (CRUD) + `campaign-engine.service.ts` (core logic)
4. **Budget tracking:** `campaign-budget.service.ts` + background sync job
5. **Order integration:** Hook `campaignEngine.evaluateDiscounts()` vào `order.service.ts`
6. **WebSocket:** `menu-campaign.gateway.ts` cho real-time budget updates
7. **Admin UI:** Trang quản lý Menu Campaign trong admin-app (CRUD + analytics dashboard)
8. **Client UI:** Budget progress bar + campaign badges trên menu items
9. **A/B Testing:** Assignment logic + comparison analytics endpoint
10. **Analytics:** Scheduled aggregation job + comparison dashboard

### Architecture Validation Results (Phase 4: Menu Campaign)

#### Coherence Validation ✅

**Decision Compatibility:**
- Models mới (`MenuCampaign` family) nằm trong `new/schema.prisma` (Gateway DB) — nhất quán với Phase 2 & 3
- Redis pattern (`mc:{tenantId}:*`) không conflict với keys hiện có
- NestJS module pattern, WebSocket Gateway pattern đồng bộ với các modules khác
- Int autoincrement IDs — đúng pattern tenant DB

**Pattern Consistency:**
- Naming: PascalCase model, kebab-case endpoint, camelCase code, snake_case DB column → đúng convention Phase 1
- Service separation: CRUD / Engine / Budget / Analytics → đúng SoC principle

**Structure Alignment:**
- Module path `admin-app/menu-campaign/` phù hợp cấu trúc hiện tại
- Redis key patterns có namespace rõ ràng, TTL strategy hợp lý

#### Requirements Coverage Validation ✅

| Requirement | Covered By | Status |
|-------------|-----------|--------|
| FR_MC_1: Campaign CRUD + auto-end | `MenuCampaign` + `campaign-budget.service.ts` | ✅ |
| FR_MC_2: Menu scope targeting | `MenuCampaignMenuScope` (ALL/CATEGORY/RECIPE) | ✅ |
| FR_MC_3: Customer scope targeting | `MenuCampaignCustomerScope` (5 types) | ✅ |
| FR_MC_4: Discount types | `MenuCampaignDiscountType` (4 types) | ✅ |
| FR_MC_5: Constraints & caps | Fields trên `MenuCampaign` + Redis counters | ✅ |
| FR_MC_6: Happy Hour | `MenuCampaignTimeSlot` | ✅ |
| FR_MC_7: Auto-apply at checkout | `CampaignEngine.evaluateDiscounts()` | ✅ |
| FR_MC_8: Budget progress bar | Redis budget counter + client endpoint | ✅ |
| FR_MC_9: BattlePass integration | `requiredBattlePassLevel` + `requiredBattlePassSeasonId` | ✅ |
| FR_MC_10: A/B testing | `testGroup` field + Redis assignment | ✅ |
| FR_MC_11: Analytics dashboard | `MenuCampaignAnalytics` + comparison endpoint | ✅ |

**NFR Coverage:** Real-time budget (Redis INCRBY) ✅ | Performance < 50ms (Redis cache) ✅ | Atomic discount ($transaction) ✅ | Tenant isolation (tenantId + index) ✅

#### Implementation Readiness Validation ✅

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Campaign Engine algorithm chi tiết step-by-step, AI agent có thể implement trực tiếp
- Redis architecture cho budget tracking giải quyết race condition triệt để
- Schema Prisma đầy đủ relations, indexes, enums
- Integration points với FoodOrder, BattlePass, Menu có code examples cụ thể

#### Open Design Decisions (để lại cho implementation)

1. **Stacking Policy:** Mặc định 1 campaign/order (priority cao nhất). Nếu cần multi-campaign cho items không overlap → xử lý ở service layer.
2. **Order Cancel Rollback:** Khi order status = `HUY` → rollback Redis budget + usage counters + update `MenuCampaignUsage`.
3. **New Member Threshold:** Thêm `newMemberDaysThreshold` (Int, default 7) trên `MenuCampaign` cho `NEW_MEMBER` scope.

#### Architecture Completeness Checklist (Phase 4)

**✅ Requirements Analysis**
- [x] 11 Functional Requirements defined
- [x] 4 Non-Functional Requirements addressed
- [x] Technical constraints identified (separate from Event/Promotion)
- [x] Cross-cutting concerns mapped (conflict resolution, budget race condition, cache invalidation)

**✅ Architectural Decisions**
- [x] 7 Prisma models designed with full schema
- [x] Redis architecture defined (5 key patterns)
- [x] Campaign Engine algorithm specified (8-step evaluation)
- [x] API module structure + 12 endpoints defined

**✅ Implementation Patterns**
- [x] Budget sync strategy (Redis → DB every 30s/100 increments)
- [x] Checkout integration hook (FoodOrder creation flow)
- [x] WebSocket events for real-time updates
- [x] A/B test assignment + comparison query

**✅ Integration Points**
- [x] FoodOrder: `campaignId` + `discountAmount` fields
- [x] BattlePass: `requiredBattlePassLevel` check
- [x] Menu: `MenuCampaignMenuScope` → MenuCategory/Recipe
- [x] User: `MenuCampaignCustomerScope` → Rank/MachineGroup/UserId

#### Implementation Handoff

**AI Agent Guidelines:**
- Tạo models mới trong 1 migration, KHÔNG modify models Phase 3 (EventPromotion)
- Budget tracking PHẢI dùng Redis atomic operations, sync batch về DB
- Campaign evaluation tại checkout PHẢI < 50ms — dùng Redis cache
- Apply discount PHẢI bọc trong `$transaction` cùng với order creation
- Khi campaign CRUD → invalidate Redis cache `mc:{tenantId}:active` ngay lập tức

**Implementation Sequence:**
1. Migration: Tạo 7 models mới + thêm fields vào FoodOrder
2. Redis setup: Budget counter + campaign cache
3. Service CRUD: `menu-campaign.service.ts`
4. Campaign Engine: `campaign-engine.service.ts` (core evaluation)
5. Budget tracking: `campaign-budget.service.ts` + background sync
6. Order integration: Hook vào `order.service.ts`
7. WebSocket: Real-time budget updates
8. Admin UI: Campaign management page
9. Client UI: Budget progress bar + campaign badges
10. A/B Testing + Analytics
