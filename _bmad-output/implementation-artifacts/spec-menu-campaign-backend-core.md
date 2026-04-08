---
title: 'Menu Campaign Backend Core — Migration + CRUD + API'
type: 'feature'
created: '2026-04-08'
status: 'done'
baseline_commit: 'a4472fe'
context:
  - _bmad-output/planning-artifacts/architecture.md # Phase 4 section
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Hệ thống chưa có cơ chế khuyến mãi giảm giá trực tiếp trên menu. Cần tạo nền tảng data + CRUD API cho Menu Campaign System (Phase 4) — hoàn toàn riêng biệt với Event Promotion và Promotion Reward Store.

**Approach:** Thêm 7 Prisma models mới + 5 enums vào `new/schema.prisma`, thêm 2 fields vào `FoodOrder`. Tạo NestJS module `menu-campaign` với CRUD service + controller theo pattern `promotion-reward` hiện tại (ensureSchema + getClients). Dùng raw SQL `CREATE TABLE IF NOT EXISTS` cho runtime safety.

## Boundaries & Constraints

**Always:**
- Tất cả models nằm trong `new/schema.prisma` (Gateway DB), dùng `ensureSchema` raw SQL cho runtime table creation
- Tuân thủ naming convention: PascalCase model, snake_case DB column (`@map`), camelCase code
- `tenantId` trên `MenuCampaign` — auto-inject từ `x-tenant-id` header
- `autoincrement()` Int IDs (đúng pattern tenant DB)
- `onDelete: Cascade` cho tất cả child relations

**Ask First:**
- Nếu cần thay đổi `FoodOrder` model fields (đã có data production)
- Nếu phát hiện enum name conflict với enums hiện có

**Never:**
- KHÔNG modify bất kỳ model nào của Phase 3 (EventPromotion, CouponBatch, etc.)
- KHÔNG implement campaign evaluation engine (Spec 2)
- KHÔNG implement Redis budget tracking (Spec 2)
- KHÔNG implement UI (Spec 3-4)

</frozen-after-approval>

## Code Map

- `libs/database/prisma/new/schema.prisma` -- Thêm 7 models + 5 enums + 2 fields FoodOrder
- `apps/api/src/app/admin-app/menu-campaign/menu-campaign.module.ts` -- NestJS module (new)
- `apps/api/src/app/admin-app/menu-campaign/menu-campaign.service.ts` -- CRUD service (new)
- `apps/api/src/app/admin-app/menu-campaign/menu-campaign.controller.ts` -- API controller (new)
- `apps/api/src/app/app.module.ts` -- Register MenuCampaignModule

## Tasks & Acceptance

**Execution:**
- [x] `libs/database/prisma/new/schema.prisma` -- Thêm models: MenuCampaign, MenuCampaignMenuScope, MenuCampaignCustomerScope, MenuCampaignTimeSlot, MenuCampaignComboRule, MenuCampaignUsage, MenuCampaignAnalytics. Thêm enums: MenuCampaignStatus, MenuCampaignDiscountType, MenuScopeType, CustomerScopeType. Thêm `campaignId Int?` và `discountAmount Decimal?` vào FoodOrder.
- [x] `apps/api/src/app/admin-app/menu-campaign/menu-campaign.service.ts` -- Tạo service với `getClients()` + `ensureSchema()` (CREATE TABLE IF NOT EXISTS cho 7 bảng). CRUD methods: `getAll`, `getById`, `create`, `update`, `updateStatus`, `delete`.
- [x] `apps/api/src/app/admin-app/menu-campaign/menu-campaign.controller.ts` -- Endpoints: GET `/menu-campaign` (list), GET `/menu-campaign/:id` (detail), POST `/menu-campaign` (create), PUT `/menu-campaign/:id` (update), PATCH `/menu-campaign/:id/status` (status change), DELETE `/menu-campaign/:id` (delete DRAFT only). AuthGuard + x-tenant-id pattern.
- [x] `apps/api/src/app/admin-app/menu-campaign/menu-campaign.module.ts` -- Module with DatabaseModule import, controller, service.
- [x] `apps/api/src/app/app.module.ts` -- Import và register MenuCampaignModule.
- [x] Generate Prisma client: `npx prisma generate --schema=libs/database/prisma/new/schema.prisma`

**Acceptance Criteria:**
- Given valid x-tenant-id header, when POST /menu-campaign with campaign data (name, discountType, discountValue, startDate, endDate, menuScopes, customerScopes), then campaign created with status DRAFT and all child records (scopes, timeSlots, comboRules)
- Given existing campaign with DRAFT status, when DELETE /menu-campaign/:id, then campaign and all children cascade deleted
- Given existing campaign, when PATCH /menu-campaign/:id/status with {status: "ACTIVE"}, then status updated
- Given no x-tenant-id header, when any endpoint called, then 400 BadRequest returned

## Verification

**Commands:**
- `npx prisma generate --schema=libs/database/prisma/new/schema.prisma` -- expected: Prisma client generated successfully
- `npx nx build api` -- expected: build succeeds with no TypeScript errors
