---
story_id: '1.1'
story_key: '1-1-quan-tri-danh-muc-nguyen-vat-lieu-crud'
title: 'Quản trị danh mục Nguyên vật liệu (CRUD)'
status: 'ready-for-dev'
priority: 'High'
epic_id: '1'
epic_name: 'Material Foundation & Unit Governance'
date: '2026-04-03T14:55:00+07:00'
---

# User Story: Quản trị danh mục Nguyên vật liệu (CRUD)

**As a** Quản lý chi nhánh,
**I want** tạo mới, chỉnh sửa và xem danh sách nguyên liệu với SKU và Đơn vị gốc (Base Unit),
**So that** tôi có danh sách đối tượng chính xác để theo dõi tồn kho.

## Acceptance Criteria

- [ ] **Database Schema Update**: Cập nhật model `Material` trong `libs/database/prisma/new/schema.prisma` để thêm các trường: `sku`, `baseUnit`, `quantityInStock`, `minStockLevel`, `tenantId`.
- [ ] **Data Isolation**: Đảm bảo mọi truy vấn `Material` đều phải lọc theo `tenantId`.
- [ ] **Admin API**: Tạo/Cập nhật REST API endpoints (GET, POST, PATCH, DELETE) cho Material trong `apps/api`.
- [ ] **Admin UI**: Tạo trang quản lý Material trong `apps/admin-app` với danh sách (Table) và Form (Modal) để thêm/sửa.
- [ ] **Validation**: SKU phải là duy nhất (Unique) trong cùng một Tenant.

## Technical Details & Architect Guardrails

### 1. Database Schema (Prisma)
Cập nhật model `Material` hiện tại:
```prisma
model Material {
  id                Int                @id @default(autoincrement())
  sku               String             @unique
  name              String
  baseUnit          String             // Ví dụ: Gam, ML, Chai
  quantityInStock   Decimal            @default(0) @db.Decimal(10, 2)
  minStockLevel     Decimal            @default(0) @db.Decimal(10, 2)
  isActive          Boolean            @default(true)
  tenantId          Int
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  
  // Relations (TBD in future stories)
  // conversions   MaterialUnitConversion[]
  // recipeItems    RecipeItem[]
  
  @@unique([sku, tenantId])
  @@index([tenantId])
}
```
*Ghi chú: Xóa trường `reportType` cũ nếu không còn dùng cho logic mới, hoặc giữ lại nếu cần tương thích ngược.*

### 2. Folder Structure
- **API**: `apps/api/src/app/admin-app/material/`
- **UI Component**: `apps/admin-app/src/app/pages/Material/`

### 3. Tenant Isolation
Sử dụng `tenantId` từ context (được inject bởi middleware `X-API-Key`). Không cho phép user truyền `tenantId` thủ công từ body/query.

### 4. Code Patterns
- Sử dụng **Prisma Service** chung.
- UI dùng **Ant Design** (như các trang cũ).
- **Dynamic Theming**: UI PHẢI bám sát bộ màu (Primary/Secondary) được cấu hình theo từng Branch (Tenant). Sử dụng `ConfigProvider` hoặc các biến CSS theme hiện có của hệ thống để đảm bảo tính đồng bộ nhận diện thương hiệu.
- Naming convention: CamelCase cho fields, PascalCase cho Models.

## Developer Notes (From Bob/Winston)

> [!IMPORTANT]
> - Do không xóa `_old_monolith_temp` nên cần kiểm tra xem có dữ liệu Material cũ nào cần migrate không.
> - Story này chỉ tập trung vào "Vật liệu thô". Tỷ lệ quy đổi sẽ làm ở Story 1.2.

## Testing Requirements
- Unit test cho `MaterialService` đảm bảo `tenantId` luôn được validate.
- Integration test: Tạo material A ở Tenant 1, đảm bảo Tenant 2 không thấy material A.

## Status History
- 2026-04-03: Created by Bob (SM) - Ready for Amelia.
