---
stepsCompleted:
  - step-01-validate-prerequisites.md
  - step-02-design-epics.md
  - step-03-create-stories.md
  - step-04-final-validation.md
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
workflowType: 'epics-and-stories'
status: 'complete'
completedAt: '2026-03-26T10:40:00+07:00'
---

# loot-vn - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for loot-vn, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Quản lý Tenant (SaaS) - Cấp phát/Quản lý API-Key cho từng chi nhánh.
FR2: Hệ thống phân quyền RBAC 4 cấp (Super Admin, Tenant Admin, Staff, Gamer).
FR3: Dashboard Quản trị (Master App/Tenant App).
FR4: Quản lý người dùng (Member) - Tích hợp Fnet.
FR5: Quản lý Voucher & Redemptions (Mã giảm giá, quy đổi quà).
FR6: Module Battle Pass (Nhiệm vụ, Quà tặng theo Tier).
FR7: Quản lý Event & Giải đấu (Giải tập trung, giải lẻ theo chi nhánh).
FR8: Quản lý Chi nhánh (Cửa hàng máy trạm).
FR9: Module HR & Chấm công (Quản lý ca làm việc của nhân viên).
FR10: Tích hợp Database Fnet (Đọc dữ liệu máy trạm, đồng bộ tiền/giờ chơi).
FR11: Hệ thống Audit Log (Ghi vết mọi giao dịch tài chính/xác thực).
FR12: Cơ chế PII Masking (Ẩn thông tin cá nhân của gamer đối với nhân viên).
FR13: Module Báo cáo doanh thu (Theo chi nhánh, theo chu kỳ).
FR14: Hệ thống Notification (Firebase Cloud Messaging).
FR15: Module Chat (Tích hợp giữa Gamer và Staff).
FR16: Quản lý Menu (Thức ăn, dịch vụ tại quán).
FR17: Hệ thống xếp hạng (Leaderboard) gamer.
FR18: Quản lý kho thưởng (Inventory quà vật lý và quà ảo).

### NonFunctional Requirements

NFR1: Multi-Tenant Data Isolation - Cách ly dữ liệu tuyệt đối giữa các chi nhánh qua API-Key.
NFR2: Atomic Transactions - Sử dụng $transaction + FOR UPDATE cho mọi giao dịch tài chính.
NFR3: Performance - Thời gian phản hồi API < 1500ms.
NFR4: Reliability - Cơ chế Auto-retry cho các lệnh đồng bộ Fnet thất bại.
NFR5: Rate Limiting - Chống spam đổi quà qua Redis (ioredis).
NFR6: Security - Chống SQL Injection tuyệt đối qua Prisma Raw SQL Parameterization.
NFR7: PII Compliance - Tuân thủ bảo mật thông tin cá nhân khách hàng.

### Additional Requirements

- **Refactor Monolith:** Bóc tách logic nghiệp vụ từ apps/api ra libs/shared/business-logic.
- **Async Context:** Sử dụng AsyncLocalStorage để luân chuyển tenant_id ngầm qua Context Interceptor.
- **Database Safety:** Nghiêm cấm chạy migrate trên Fnet DB; chỉ dùng prisma generate từ cấu trúc sẵn có.
- **ID Standardization:** Tất cả ID mới sinh ra phải tuân thủ chuẩn UUID v4.
- **Nx Workspace Integrity:** Thiết lập Nx Tags để ép buộc ranh giới giữa apps và libs.

### UX Design Requirements

UX-DR1: Master Dashboard (loot.vn) - Giao diện quản trị Super Admin tập trung.
UX-DR2: Tenant Dashboard - Giao diện quản lý riêng cho từng chủ quán net.
UX-DR3: Gamer Client App - Giao diện thân thiện cho gamer thực hiện đổi thưởng/nhiệm vụ.
UX-DR4: HR App Mobile - Giao diện tối ưu cho nhân viên quán net chấm công/kiểm tra ca.

### FR Coverage Map

FR1: Epic 1 - SaaS Foundation
FR2: Epic 2 - Identity & Access
FR3: Epic 1 - SaaS Foundation
FR4: Epic 3 - Gamer Core
FR5: Epic 4 - Gamification Engine
FR6: Epic 4 - Gamification Engine
FR7: Epic 6 - BI & Events
FR8: Epic 1 - SaaS Foundation
FR9: Epic 5 - Branch Operations
FR10: Epic 3 - Gamer Core
FR11: Epic 2 - Identity & Access
FR12: Epic 3 - Gamer Core
FR13: Epic 6 - BI & Events
FR14: Epic 5 - Branch Operations
FR15: Epic 5 - Branch Operations
FR16: Epic 5 - Branch Operations
FR17: Epic 4 - Gamification Engine
FR18: Epic 4 - Gamification Engine

## Epic List

### Epic 1: The SaaS Foundation & Tenant Onboarding
Thiết lập "xương sống" cho mô hình SaaS. Super Admin có thể tạo Tenant mới, cấp API-Key và thiết lập cấu hình cơ bản cho từng chi nhánh.
**FRs covered:** FR1, FR3, FR8.

### Epic 2: Identity & Access Control (RBAC)
Đảm bảo tính bảo mật và phân quyền đúng người, đúng việc. Nhân viên và Gamer có thể đăng nhập, hệ thống áp dụng đúng quyền hạn (Super/Tenant Admin/Staff/Gamer).
**FRs covered:** FR2, FR11.

### Epic 3: Gamer Core & Fnet Synchronization
"Loot" bắt đầu kết nối với thế giới quán net thực tế. Dữ liệu từ máy trạm (giờ chơi, tiền) được đồng bộ về Gateway. Gamer có thể xem profile và lịch sử của mình.
**FRs covered:** FR4, FR10, FR12.

### Epic 4: Gamification Engine (Rewards & Battle Pass)
Trái tim của hệ thống. Gamer bắt đầu đổi được điểm thưởng, làm nhiệm vụ Battle Pass và nhận Voucher.
**FRs covered:** FR5, FR6, FR17, FR18.

### Epic 5: Branch Operations & HR Management
Công cụ đắc lực cho Chủ quán. Quản lý nhân viên (chấm công, ca làm), quản lý Menu đồ ăn và tương tác với Gamer qua Chat/Thông báo.
**FRs covered:** FR9, FR14, FR15, FR16.

### Epic 6: Business Intelligence & Event Governance
Tầm nhìn vĩ mô. Báo cáo doanh thu chi tiết và tổ chức các sự kiện/giải đấu quy mô lớn.
**FRs covered:** FR7, FR13.

## Epic 1: The SaaS Foundation & Tenant Onboarding

Thiết lập "xương sống" cho mô hình SaaS. Super Admin có thể tạo Tenant mới, cấp API-Key và thiết lập cấu hình cơ bản cho từng chi nhánh.

### Story 1.1: Tenant Entity & Database Schema Setup

As a Super Admin,
I want to define the core Tenant and Organization models in the database,
So that I can represent different branch locations in the system.

**Acceptance Criteria:**

**Given** a new Prisma schema `tenant.prisma`
**When** I define `Organization` and `Tenant` models with UUID v4 for IDs
**Then** the database tables are created with `snake_case` mapping for columns (e.g., `tenant_id`)
**And** all foreign keys use proper constraints

### Story 1.2: API-Key Generation & Management

As a Super Admin,
I want to generate a secure Stripe-style API key (e.g., `gms_...`) for each Tenant,
So that branch servers can authenticate with the central API.

**Acceptance Criteria:**

**Given** an existing Tenant
**When** I request to create a new API Key for that Tenant
**Then** a unique, hashed secret is stored in the `ApiKey` table
**And** the plain prefix (e.g., `pk_...`) is returned for the tenant to use

### Story 1.3: Multi-Tenant Isolation Middleware (The Shield)

As a Developer,
I want an automated way to inject `tenant_id` into all database queries based on the API Key,
So that data from one branch never leaks to another.

**Acceptance Criteria:**

**Given** an incoming request with `X-API-Key`
**When** the `ApiKeyGuard` validates the key
**Then** the corresponding `tenant_id` is stored in `AsyncLocalStorage`
**And** a Prisma Middleware automatically appends `where: { tenantId }` to all `find`, `update`, and `delete` operations

## Epic 2: Identity & Access Control (RBAC)

Đảm bảo tính bảo mật và phân quyền đúng người, đúng việc. Nhân viên và Gamer có thể đăng nhập, hệ thống áp dụng đúng quyền hạn (Super/Tenant Admin/Staff/Gamer).

### Story 2.1: RBAC Role & Permission Schema

As a Super Admin,
I want to define a flexible Role and Permission model,
So that I can assign specific capabilities to different user types.

**Acceptance Criteria:**

**Given** the `tenant.prisma` schema
**When** I add `Role` and `Permission` models with a many-to-many relationship
**Then** I can seed the system with 4 default roles: `SUPER_ADMIN`, `TENANT_ADMIN`, `STAFF`, `GAMER`
**And** each Role has specific Permissions (Read, Write, Manage) assigned

### Story 2.2: Dual-Auth Provider (JWT for Web Apps)

As a Staff or Manager,
I want to login to the administrative dashboards via email and password,
So that I can access my branch's management tools safely.

**Acceptance Criteria:**

**Given** a valid User record in `apps/api`
**When** I submit correct credentials
**Then** the system returns a signed JWT token containing `userId`, `tenantId`, and `roles`
**And** the token is required for all `/api/v1/tenant-admin/*` endpoints via a `JwtAuthGuard`

### Story 2.3: Authentication Audit Trail

As a Security Officer,
I want every login attempt (success or failure) to be logged in an immutable table,
So that I can detect potential brute-force or unauthorized access.

**Acceptance Criteria:**

**Given** an authentication request
**When** the process completes
**Then** a record is created in `AuditLog` containing `timestamp`, `ipAddress`, `status`, and `targetUserId`
**And** this record cannot be deleted or modified by any user via the standard API

## Epic 3: Gamer Core & Fnet Synchronization

"Loot" bắt đầu kết nối với thế giới quán net thực tế. Dữ liệu từ máy trạm (giờ chơi, tiền) được đồng bộ về Gateway. Gamer có thể xem profile và lịch sử của mình.

### Story 3.1: Read-Only Fnet Mapping (Safe Interface)

As a Developer,
I want to map the existing Fnet database structure into Prisma without migrations,
So that I can read gamer records Safely without breaking the room net's core system.

**Acceptance Criteria:**

**Given** an existing Fnet MySQL database
**When** I run `prisma db pull` into `fnet.prisma`
**Then** a one-to-one mapping of Fnet tables is generated
**And** all `write/update` operations on these models are strictly avoided in this story to ensure safety

### Story 3.2: Automated Balance & Session Sync

As a Gamer,
I want my current balance and playtime from the branch computer to be visible on my mobile app,
So that I can track my spending and rewards accurately.

**Acceptance Criteria:**

**Given** a gamer is logged into the `client-app`
**When** the Client App requests balance details
**Then** `apps/api` fetches real-time data from the Fnet DB for that `tenant_id`
**And** returns a consolidated view of Fnet funds and Gateway loyalty points

### Story 3.3: PII Masking Service

As a Staff Member,
I want to see gamer profiles without seeing their full phone numbers or real names,
So that gamer privacy is protected while still allowing me to serve them.

**Acceptance Criteria:**

**Given** a staff user viewing the `admin-app`
**When** the API returns gamer data
**Then** sensitive fields like `phone` are masked (e.g., `09******123`)
**And** `email` is partially hidden (e.g., `a***@gmail.com`)
**And** only users with `SUPER_ADMIN` or specific PII-Viewer permission can see unmasked data

## Epic 4: Gamification Engine (Rewards & Battle Pass)

Trái tim của hệ thống. Gamer bắt đầu đổi được điểm thưởng, làm nhiệm vụ Battle Pass và nhận Voucher với cơ chế bảo mật nghiêm ngặt.

### Story 4.1: Atomic Redemption Logic

As a Gamer,
I want to redeem my points for a voucher,
So that I don't accidentally get my points deducted multiple times if I click fast.

**Acceptance Criteria:**

**Given** an enough balance of loyalty points
**When** I request a redemption via the API
**Then** the process is wrapped in a `$transaction`
**And** the user's point record is locked using `SELECT ... FOR UPDATE` before calculation
**And** the voucher is issued ONLY if the balance is sufficient after the lock is acquired

### Story 4.2: Rate-Limited Reward Claims (Anti-Spam)

As a System Admin,
I want to limit how often a gamer can claim rewards,
So that bots or scripts cannot drain the prize pool.

**Acceptance Criteria:**

**Given** a gamer attempting to claim a "daily login" reward
**When** they make more than 1 request per 10 seconds (configurable)
**Then** the Redis-backed rate limiter returns a `429 Too Many Requests` status
**And** the request does not reach the database layer

### Story 4.3: Battle Pass Tiers & Progress Tracker

As a Gamer,
I want to earn experience points (XP) for every hour played,
So that I can unlock higher Battle Pass tiers and get better rewards.

**Acceptance Criteria:**

**Given** a new Battle Pass season is active
**When** a Gamer's Fnet session ends
**Then** the system calculates XP based on duration and updates `BattlePassProgress`
**And** automatically unlocks tiers if the XP threshold is reached

## Epic 5: Branch Operations & HR Management

Công cụ đắc lực cho Chủ quán. Quản lý nhân viên (chấm công, ca làm), quản lý Menu đồ ăn và tương tác với Gamer qua Chat/Thông báo.

### Story 5.1: HR Shift Management & Check-in

As a Staff Member,
I want to check-in/out of my shift using my mobile app,
So that my working hours are recorded accurately for salary calculation.

**Acceptance Criteria:**

**Given** the `hr-app` is active
**When** I click "Check-in" at the branch location (GPS/Radius verification)
**Then** my shift start time is recorded in the `StaffShift` table
**And** it is associated with the correct `tenant_id`

### Story 5.2: In-App Menu & Order Management

As a Gamer,
I want to browse the food and drink menu of the net center from my seat,
So that I can order without leaving my computer.

**Acceptance Criteria:**

**Given** I am logged in at a machine
**When** I browse the `client-app` Menu section
**Then** I see real-time availability of items for that specific `tenant_id`
**And** I can place an order which is sent immediately to the `admin-app` dashboard

### Story 5.3: Push Notification System (FCM)

As a Staff Member,
I want to send a notification to all gamers in the room,
So that I can announce a flash event or room closing.

**Acceptance Criteria:**

**Given** the `admin-app` broadcast tool
**When** I send a message
**Then** a push notification is delivered via Firebase Cloud Messaging to all devices registered under that `tenant_id`

## Epic 6: Business Intelligence & Event Governance

Tầm nhìn vĩ mô. Báo cáo doanh thu chi tiết và tổ chức các sự kiện/giải đấu quy mô lớn.

### Story 6.1: Multi-Tenant Revenue Dashboard

As a Super Admin,
I want to see a consolidated revenue report across all branches,
So that I can evaluate the global performance of the Loot ecosystem.

**Acceptance Criteria:**

**Given** the `master-app` dashboard
**When** I select a date range
**Then** the system aggregates revenue data from all `tenant_id`s in real-time
**And** displays it via charts (Revenue by Branch, Revenue by Service)

### Story 6.2: Global Tournament Orchestration

As a Tournament Organizer,
I want to create a cross-branch event,
So that gamers from multiple net centers can compete in the same leaderboard.

**Acceptance Criteria:**

**Given** a "Global Event" configuration
**When** I define the participating `tenant_id`s
**Then** gamers from those branches can join the same event pool
**And** we can have a unified Leaderboard across the entire SaaS platform
