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
updatedAt: '2026-04-03T13:30:00+07:00'
lastStep: 'step-04'
feature: 'Material & Inventory Management Refactor'
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
