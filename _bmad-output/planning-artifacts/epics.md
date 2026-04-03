stepsCompleted:
  - step-01-validate-prerequisites.md
  - step-02-design-epics.md
  - step-03-create-stories.md
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
workflowType: 'epics-and-stories'
project_name: 'loot-vn'
user_name: 'ChickFool'
date: '2026-04-03T14:17:00+07:00'
status: 'in-progress'
feature: 'Material & Inventory Management Refactor'
---

# (Existing content continues...)

## Epic 4: Inventory Auditing & Historical Reporting
**Epic Goal**: Cung cấp Nhật ký biến động (Transaction History) chi tiết cho từng đơn vị nguyên liệu bị biến động, giúp chủ quán dễ dàng đối soát thất thoát và xem báo cáo tồn kho lịch sử.

### Story 4.1: Tra cứu Nhật ký Biến động kho (Transaction View)
**As a** Chủ quán/Admin,
**I want** xem danh sách lịch sử biến động kho theo thời gian cho từng nguyên liệu,
**So that** tôi tìm được nguyên nhân khi có chênh lệch tồn kho.

**Acceptance Criteria:**
- **Given** Một nguyên liệu cụ thể,
- **When** Tôi chọn xem lịch sử biến động,
- **Then** Hệ thống liệt kê tất cả các bản ghi `InventoryTransaction` có liên quan (SALE, RECEIPT, ADJUSTMENT, v.v.).

### Story 4.2: Điều chỉnh kho thủ công (Manual Adjustment)
**As a** Quản lý,
**I want** có thể điều chỉnh số lượng tồn kho thực tế (sau khi kiểm kê),
**So that** kho trên hệ thống khớp với kho thực tế.

**Acceptance Criteria:**
- **Given** Kết quả kiểm kê thực tế lệch với hệ thống,
- **When** Tôi nhập số lượng điều chỉnh và lý do (Note),
- **Then** Hệ thống cập nhật `quantityInStock` và tạo một bản ghi Transaction loại `ADJUSTMENT`.

### Story 4.3: Báo cáo Hao hụt & Hủy đồ (Waste Report)
**As a** Chủ quán,
**I want** xem báo cáo tổng hợp các đơn hàng bị Hủy/Trả lại mà không thể hoàn kho,
**So that** tôi đánh giá được tỷ lệ thất thoát.

**Acceptance Criteria:**
- **Given** Các đơn hàng bị trả lại sau khi đã làm đồ (Status 4 -> Refund),
- **When** Tôi xem báo cáo hao hụt,
- **Then** Hệ thống tổng hợp các bản ghi Transaction loại `WASTE` và tính toán giá trị dựa trên `unitPrice` lịch sử.

# (Existing content continues...)

## Epic 3: Real-time Inventory Lifecycle (Stock-in & Sale Deduction)
**Epic Goal**: Tự động trừ tồn kho khi đơn hàng chuyển sang trạng thái **4 (Hoàn Thành)** và hỗ trợ quy trình Nhập kho thực tế để dữ liệu tồn kho luôn khớp với doanh số bán hàng.

### Story 3.1: Ghi nhận Nhập kho (Inventory Receipt)
**As a** Thủ kho/Quản lý,
**I want** ghi lại các đợt nhập nguyên liệu mới với số lượng và giá nhập,
**So that** hệ thống cập nhật tồn kho và giá vốn (COGS) mới nhất.

**Acceptance Criteria:**
- **Given** Một lô hàng mới về,
- **When** Tôi nhập Material + Quantity + UnitPrice,
- **Then** Hệ thống tăng `quantityInStock` và tạo một bản ghi `InventoryReceipt`.

### Story 3.2: Tự động Trừ kho khi Hoàn Thành Đơn hàng (Step 4)
**As a** Hệ thống,
**I want** tự động tra cứu công thức hiện hành và trừ kho ngay khi đơn hàng chuyển sang trạng thái **4 (Hoàn Thành)**,
**So that** tồn kho luôn khớp với thực tế phục vụ.

**Acceptance Criteria:**
- **Given** Đơn hàng đang ở trạng thái 1, 2, hoặc 3,
- **When** Nhân viên bấm nút "Hoàn Thành" (Status -> 4),
- **Then** Hệ thống lấy Recipe Version đang Active và thực hiện trừ `quantityInStock` của các Material tương ứng thông qua Transaction.

### Story 3.3: Nhật ký biến động Kho (Audit Logging)
**As a** Quản lý,
**I want** mọi thay đổi về tồn kho (Dù là Bán hàng, Nhập hàng hay Hủy đơn) đều phải sinh ra một bản ghi log chi tiết,
**So that** tôi có thể đối soát sau này.

**Acceptance Criteria:**
- **Given** Có sự thay đổi về `quantityInStock`,
- **When** Lệnh trừ/cộng kho thực thi thành công,
- **Then** Một bản ghi `InventoryTransaction` được tạo ra với đầy đủ thông tin `type`, `quantityChange`, và `orderId` (nếu có).

# (Existing content continues...)

## Epic 2: Recipe Management (BOM) & Historical Versioning
**Epic Goal**: Thiết lập công thức chế biến (Recipes) cho sản phẩm trên menu, hỗ trợ lưu vết phiên bản (BOM Versioning) để đảm bảo thay đổi hôm nay không làm sai lệch báo cáo giá vốn quá khứ.

### Story 2.1: Khởi tạo Công thức (Recipe) theo Phiên bản
**As a** Quản lý chi nhánh,
**I want** thiết lập định lượng nguyên liệu cho món ăn dưới dạng một phiên bản có hiệu lực từ ngày nhất định,
**So that** hệ thống biết chính xác cần trừ bao nhiêu nguyên liệu khi bán món đó.

**Acceptance Criteria:**
- **Given** Một sản phẩm trên Menu,
- **When** Tôi tạo `RecipeVersion` và add các `RecipeItem` (Nguyên liệu + số lượng),
- **Then** Hệ thống lưu bản ghi với `effectiveFrom` là thời điểm hiện tại.

### Story 2.2: Quản lý Vòng đời Công thức (Activation)
**As a** Quản lý chi nhánh,
**I want** khi kích hoạt công thức mới thì công thức cũ sẽ tự động hết hạn,
**So that** hệ thống không có hai công thức cùng có hiệu lực tại một thời điểm.

**Acceptance Criteria:**
- **Given** Một `RecipeVersion` đang Active (`effectiveTo` is null),
- **When** Tôi kích hoạt Version mới,
- **Then** Hệ thống tự động update `effectiveTo` của Version cũ = thời điểm hiện tại.

### Story 2.3: Theo dõi Lịch sử Giá bán (Price Versioning)
**As a** Quản lý chi nhánh,
**I want** lưu vết lịch sử thay đổi giá bán của sản phẩm,
**So that** tôi có thể thống kê được chi phí và lợi nhuận chính xác của các tháng trước.

**Acceptance Criteria:**
- **Given** Một sản phẩm thay đổi giá,
- **When** Tôi update giá mới,
- **Then** Hệ thống lưu vào bảng `ProductPriceVersion` thay vì ghi đè lên giá cũ.

# (Existing content continues...)

## Epic 1: Material Foundation & Unit Governance
**Epic Goal**: Người quản lý có thể định nghĩa danh mục nguyên liệu, SKU và thiết lập bảng quy đổi đơn vị (Thùng -> lốc -> chai) để quản lý hàng mua và hàng dùng một cách nhất quán.

### Story 1.1: Quản trị danh mục Nguyên vật liệu (CRUD)
**As a** Quản lý chi nhánh,
**I want** tạo mới, chỉnh sửa và xem danh sách nguyên liệu với SKU và Đơn vị gốc (Base Unit),
**So that** tôi có danh sách đối tượng chính xác để theo dõi tồn kho.

**Acceptance Criteria:**
- **Given** Tôi đang ở trang quản lý kho,
- **When** Tôi tạo một nguyên liệu mới với Name, SKU (Unique), và Base Unit (ví dụ: Gam, ML, Chai),
- **Then** Hệ thống lưu vào Database `Material` và tự động gán `tenant_id` từ context.

### Story 1.2: Thiết lập bảng Quy đổi đơn vị (Unit Conversions)
**As a** Quản lý chi nhánh,
**I want** định nghĩa tỷ lệ quy đổi giữa đơn vị nhập và đơn vị dùng (Ví dụ: 1 Thùng = 24 Chai),
**So that** tôi có thể nhập hàng số lượng lớn nhưng trừ kho lẻ một cách tự động.

**Acceptance Criteria:**
- **Given** Một nguyên liệu đã tồn tại,
- **When** Tôi thiết lập `ratio` (tỷ lệ) từ `fromUnit` (Thùng) sang `toUnit` (Chai),
- **Then** Hệ thống lưu vào bảng `MaterialUnitConversion`.

### Story 1.3: Dashboard Tồn kho Admin (Stock Overview)
**As a** Quản lý chi nhánh,
**I want** xem danh sách tồn kho hiện tại của tất cả nguyên liệu kèm cảnh báo dưới mức tối thiểu,
**So rằng** tôi có kế hoạch nhập hàng kịp thời.

**Acceptance Criteria:**
- **Given** Danh sách nguyên liệu trong kho,
- **When** Một nguyên liệu có `quantityInStock` < `minStockLevel`,
- **Then** Hệ thống hiển thị cảnh báo đỏ trên UI dashboard.

# loot-vn - Epic Breakdown (Material & Inventory Management)

## Overview

This document provides the complete epic and story breakdown for the Material & Inventory Management phase of the loot-vn project, decomposing requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR_INV_1: **Integrated Material Management** - Manage raw materials with SKU, Base Unit, Current Stock, and Min Stock thresholds.
FR_INV_2: **Unit Conversion Engine** - Support multi-level unit conversions (e.g., Case -> Pack -> Bottle) for purchase vs. consumption.
FR_INV_3: **Recipe Versioning (BOM)** - Manage product recipes with historical versioning (effectiveFrom/To) to ensure reporting accuracy.
FR_INV_4: **Atomic Real-time Deduction** - Automatically deduct inventory based on recipes when an order is moved to status 4 (Hoàn Thành).
FR_INV_5: **Inventory Transaction Audit** - Log every stock movement (Sale, Receipt, Refund, Waste, Adjustment) with detailed metadata.

### NonFunctional Requirements

NFR_INV_1: **Data Integrity (Atomic Transaction)** - All inventory deductions must be wrapped in database transactions to prevent stock drift.
NFR_INV_2: **Calculation Precision** - Use DECIMAL(10, 2) for all quantity and price calculations across the system.
NFR_INV_3: **Multi-Tenant Isolation** - Automatically filter all inventory data by `tenant_id` at the database level.

### Additional Requirements

- **Database Persistence**: New tables must be added to the `new/schema.prisma` (Gateway DB).
- **Temporal Pattern**: Use the `effectiveFrom/effectiveTo` pattern for Recipes and Product Prices.
- **Migration Strategy**: Maintain the old monolith (`_old_monolith_temp`) as a read-only reference until verification is complete.
- **Trigger Policy**: Infrastructure must support triggering stock deduction strictly on transition to order status 4.

### UX Design Requirements

UX-DR1: **5-Step Order Workflow Integration** - UI must support the sequence: Hủy (0) -> Chấp Nhận (1) -> Thu Tiền (2) -> Phục Vụ (3) -> Hoàn Thành (4).
UX-DR2: **Inventory Management UI** - Dedicated pages for Materials, Recipes (BOM), and Unit Conversions within the Admin Dashboard.
UX-DR3: **Historical Reporting View** - UI for viewing inventory transaction history and stock levels over time.

### FR Coverage Map

FR_INV_1: Epic 1 - Material Management
FR_INV_2: Epic 1 - Unit Conversion Engine
FR_INV_3: Epic 2 - Recipe Management (BOM) & Versioning
FR_INV_4: Epic 3 - Real-time Stock Deduction (Status 4 Trigger)
FR_INV_5: Epic 3 & 4 - Inventory Transaction Audit & Historical Reporting

## Epic List

### Epic 1: Material Foundation & Unit Governance
Người quản lý có thể định nghĩa danh mục nguyên liệu, SKU và thiết lập bảng quy đổi đơn vị (Thùng -> lốc -> chai) để quản lý hàng mua và hàng dùng một cách nhất quán.
**FRs covered:** FR_INV_1, FR_INV_2.

### Epic 2: Recipe Management (BOM) & Historical Versioning
Thiết lập công thức chế biến (Recipes) cho sản phẩm trên menu, hỗ trợ lưu vết phiên bản (BOM Versioning) để đảm bảo thay đổi hôm nay không làm sai lệch báo cáo giá vốn quá khứ.
**FRs covered:** FR_INV_3.

### Epic 3: Real-time Inventory Lifecycle (Stock-in & Sale Deduction)
Tự động trừ tồn kho khi đơn hàng chuyển sang trạng thái **4 (Hoàn Thành)** và hỗ trợ quy trình Nhập kho thực tế để dữ liệu tồn kho luôn khớp với doanh số bán hàng.
**FRs covered:** FR_INV_4, FR_INV_5.

### Epic 4: Inventory Auditing & Historical Reporting
Cung cấp Nhật ký biến động (Transaction History) chi tiết cho từng đơn vị nguyên liệu bị biến động, giúp chủ quán dễ dàng đối soát thất thoát và xem báo cáo tồn kho lịch sử.
**FRs covered:** FR_INV_5.

<!-- End initial requirements extraction -->
