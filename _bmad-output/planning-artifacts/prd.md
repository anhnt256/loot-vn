---
stepsCompleted:
  - step-01-init.md
  - step-02-discovery.md
  - step-02b-vision.md
  - step-02c-executive-summary.md
  - step-03-success.md
  - step-04-journeys.md
  - step-05-domain.md
  - step-06-innovation.md
  - step-07-project-type.md
  - step-08-scoping.md
  - step-09-functional.md
  - step-10-nonfunctional.md
  - step-11-polish.md
classification:
  projectType: 'Web App & API'
  domain: 'Cyber Cafe Operations / Gamification'
  complexity: 'High'
  projectContext: 'brownfield'
inputDocuments:
  - _old_monolith_temp/README.md
  - _old_monolith_temp/todo.md
  - _old_monolith_temp/API_DOCUMENTATION.md
  - _old_monolith_temp/EVENT_SYSTEM_README.md
  - _old_monolith_temp/BIRTHDAY_FEATURE_README.md
  - _old_monolith_temp/MAIN_ACCOUNT_TOPUP_FLOW.md
  - _old_monolith_temp/WORK_SCHEDULE_SETUP.md
workflowType: 'prd'
---

# Product Requirements Document - loot-vn

**Author:** ChickFool
**Date:** 2026-03-26T00:14:45+07:00

## Executive Summary

Dự án nhằm mục tiêu nâng cấp toàn diện hệ thống quản lý chuỗi phòng máy (Cyber Cafe Operations) và hệ thống Gamification từ mô hình phục vụ nội bộ (Multi-Branch/Single-Tenant) thành một Nền tảng SaaS Đa Khách hàng (True Multi-Tenant SaaS). Việc tái cấu trúc này giải quyết triệt để nút thắt của mã nguồn Monolith hiện tại. Hệ thống mới được xây dựng trên kiến trúc Monorepo `nx`, cho phép module hóa các ứng dụng (Admin, HR, User, API) để dễ dàng đóng gói, phân phối và thương mại hóa toàn bộ luồng nghiệp vụ.

**Differentiator:** Cơ chế Quản trị Vòng đời Cấp phép thông qua API-Key. Hệ thống loại bỏ sự phụ thuộc cứng nhắc vào mô hình Database cũ, đảm bảo tính cách ly dữ liệu tuyệt đối (Data Isolation) giữa các bên thuê dịch vụ (Tenants), trong khi vẫn chia sẻ chung một lõi kiến trúc tập trung. Điều này giúp tối ưu hóa cực hạn chi phí bảo trì và chuyển hóa hệ thống thành một tài sản thương mại linh hoạt.

## Project Classification

- **Project Type:** Web App & API (SaaS / ERP quy mô doanh nghiệp)
- **Domain:** Quản lý chuỗi Phòng máy (Cyber Cafe Operations) & Gamification
- **Complexity:** High – Đòi hỏi kiến trúc Multi-tenancy, thiết lập API-Key, và kết nối đồng bộ Raw SQL phức tạp với Fnet.
- **Project Context:** Brownfield.

## Success Criteria

### User Success
- **Zero Disruption:** Khách hàng, Game thủ và Nhân viên (Staff) không cảm nhận thấy sự sụt giảm hiệu năng hay thay đổi giao diện nào. Mọi thao tác giữ nguyên vẹn 100% như hệ thống cũ.

### Business Success
- Đưa hệ thống mới lên chạy thực tế (Go-Live) cho các chi nhánh hiện hữu trơn tru, không gây mất mát hay sai lệch dữ liệu tài chính.
- Thiết lập xong nền móng để quản trị viên có thể "nhân bản" hệ thống cho một đối tác mới chỉ bằng việc cấp phát API-Key.

### Technical Success
- **Kiến trúc Nx:** Di chuyển thành công 100% mã nguồn Monolith thành các khối ứng dụng độc lập trên Monorepo `nx`.
- **Multi-Tenant Routing:** Cơ chế API-Key hoạt động hoàn hảo để định tuyến và cách ly dữ liệu Database.
- Xóa bỏ triệt để các mã nguồn rối rắm (spaghetti code) từ bản Monolith cũ.

### Measurable Outcomes
- 100% Unit/Integration tests hiện có phải pass trên môi trường Nx.
- Thời gian trễ (Latency) của API không được chậm hơn bản Monolith cũ.

## Product Scope & Phased Development

### MVP (Phase 1) - Technical Architecture Migration
- **Mục tiêu:** Nhấc toàn bộ logic nghiệp vụ đang sống chuyển an toàn sang cấu trúc Monorepo Multi-Tenant mới mà không chặn đứng trải nghiệm người dùng hiện tại (Không vẽ thêm tính năng kinh doanh mới).
- **Core Capabilities:**
  - Thiết lập hoàn chỉnh cấu trúc `apps/`, `libs/` tĩnh trong Workspace Nx.
  - Phân tách thành công 100% mã UI cũ thành `libs/shared/ui`.
  - Phân tách 100% logic kinh doanh cũ (Fnet, Vòng quay, Event) thành `libs/shared/business`.
  - Hoàn thiện Node.js Middleware nhận diện chính xác `tenant_id` qua `X-API-Key` 100%.

### Growth (Phase 2) - Advanced Operations & Inventory
- **Material Management Refactor:** Triển khai hệ thống quản lý kho & định lượng nguyên liệu (Inventory & Recipes) với cơ chế Versioning bảo toàn lịch sử.
- **Deduction Engine:** Tự động trừ tồn kho dựa trên quy trình vận hành 5 bước (Trừ tại Step 4).
- Cổng Self-Service Management phân quyền tạo tài khoản Tenant & tự động sinh API-Key an toàn.
- Tích hợp công cụ Health-check theo dõi kết nối tới máy chủ Fnet DB cục bộ.

### Expansion (Phase 3)
- Báo cáo tài chính chéo hệ thống (Cross-Branch Analytics).
- Mở SDK cho đối tác lớn tự tùy chỉnh Client front-end (White-labeling).

## User Journeys

### 1. Super Admin - Onboarding a New Tenant
Super Admin truy cập `master-app`, khởi tạo một Tenant mới. Hệ thống sinh ra một `API-Key` mã hóa bảo mật. Toàn bộ quy trình onboarding thực hiện qua UI thay vì can thiệp server.

### 2. Tenant Admin - Thiết lập Môi trường Biệt lập
Đối tác dán API-Key vào trong giao diện config Client. Nx Middleware xác thực và chặn bắt mọi truy vấn Prisma/Raw SQL, ép chúng chỉ tương tác với vùng dữ liệu thuộc quyền sở hữu của Tenant đó.

### 3. Staff - Trải nghiệm Handover Vô hình
Thu ngân kết thúc ca, đăng nhập vào `admin-app` của môi trường mới, thực hiện thao tác kiểm kê và ấn Báo cáo giống hệt như trên nền tảng Monolith cũ nhờ việc tái sử dụng UI component từ `libs/shared/ui`.

### 4. Game thủ - Đổi thưởng Xuyên hệ thống
Game thủ nhập mã voucher vào `client-app`. API tiếp nhận request cùng API-Key của chi nhánh, xử lý phần thưởng, ghi log vào FnetHistory và cập nhật trực tiếp ví Fnet của tài khoản hội viên qua kết nối nội bộ.

## Domain & Project-Type Requirements

### Compliance & Data Security
- **Strict Data Isolation:** Bắt buộc có cơ chế cách ly Tenant ở tầng truy cập dữ liệu. Xử lý thiếu `tenant_id` ném thẳng Exception 500 thay vì fallback cục bộ.
- **Bảo mật PII & Audit Logs:** Bảo mật tuyệt đối thông tin hội viên (SĐT, CCCD). Mọi giao dịch tài chính (Voucher, Nạp tiền) phải có Audit Trail minh bạch không thể bị xóa.

### Architectural Constraints
- **Kiến trúc Monorepo:** Chia thành các Apps (`master-app`, `admin-app`, `hr-app`, `client-app`) và thư viện dùng chung (`libs`).
- **Parasitic Integration với FNet:** Giao tiếp trực tiếp read/write bằng Raw SQL vào MySQL cục bộ chi nhánh. Tuyệt đối không tự ý sửa đổi core tables của phòng máy hiện tại.

### RBAC Matrix
1. **Super Admin:** Toàn quyền sinh/khóa/xóa API-Key của Tenant.
2. **Tenant Admin:** Thao tác độc quyền trên vùng dữ liệu riêng (Gacha, Voucher, Doanh thu) của chi nhánh.
3. **Staff:** Thao tác hạn chế đếm tiền, báo cáo bàn giao ca, tra cứu thẻ hội viên.
4. **End-User (Gamer):** Tương tác với Dashboard kho đồ cá nhân, ví điện tử.

## Functional Requirements

### 1. Tenant & API-Key Management
- **FR1:** Super Admin có thể tạo mới hồ sơ của một Đối tác (Tenant) mới trên hệ thống.
- **FR2:** Hệ thống tự động sinh ra một mã API-Key duy nhất tương ứng với mỗi Tenant mới được tạo.
- **FR3:** Super Admin có thể khóa (Revoke) hoặc tái tạo (Regenerate) API-Key của bất kỳ Tenant nào.
- **FR4:** Tenant Admin có thể xem mã cấu hình API-Key đã được cấp cho nhánh của mình.

### 2. Data Isolation & Middleware
- **FR5:** Hệ thống có thể xác thực tính hợp lệ của mọi API request đầu vào dựa trên `X-API-Key`.
- **FR6:** Hệ thống tự động định danh request thuộc về Tenant nào từ `X-API-Key` thành công.
- **FR7:** Hệ thống từ chối đa tầng mọi tác vụ Database (ORM/Raw SQL) nếu request thiếu hoặc mang API-Key không hợp lệ.
- **FR8:** Hệ thống có khả năng giới hạn toàn bộ phạm vi đọc/ghi Database bắt buộc phải nằm trong vùng dữ liệu sở hữu của đúng `tenant_id` tương ứng.

### 3. Branch Administration
- **FR9:** Tenant Admin có thể xem Bảng điều khiển phân tích hiệu quả chiến dịch của riêng chi nhánh.
- **FR10:** Tenant Admin có thể thiết lập độ khó và thể lệ của các chiến dịch Gamification (Vòng quay, Sự kiện, Battle Pass).
- **FR11:** Tenant Admin có thể trích xuất báo cáo doanh thu độc lập từ dữ liệu máy chủ Fnet của chi nhánh.

### 4. Shift Operations
- **FR12:** Staff có thể điền và nộp Báo cáo bàn giao ca (Shift Handover) chứa cấu trúc số liệu kiểm kê thực tế.
- **FR13:** Hệ thống có khả năng lưu trữ báo cáo bàn giao ca này kết hợp với biến động doanh thu đầu/cuối ca vào kho lưu trữ của Tenant đó.

### 5. Gamification (End-User App)
- **FR14:** Game thủ có thể tra cứu số lượng Điểm thưởng và tiến độ cày cuốc Battle Pass của mình.
- **FR15:** Game thủ có thể theo dõi danh sách thành tích và nhận các mã sự kiện/voucher phần thưởng.
- **FR16:** Game thủ có thể thực hiện thao tác đổi/sử dụng Voucher/Điểm thưởng.
- **FR17:** Hệ thống có năng lực đối chiếu tính hợp lệ của mã Voucher hoặc quy tắc Battle Pass với cấu hình sự kiện do Tenant thiết lập.
- **FR18:** Hệ thống tự động đẩy lệnh nạp tiền/trừ điểm ở ví Fnet tài khoản hội viên Game thủ trên hệ thống máy trạm Local khi có kết quả trả thưởng.

### 6. Material & Inventory Management (Phase 2 expansion)
- **FR19:** Quản lý có thể định nghĩa danh mục Nguyên vật liệu (Material Core) với SKU, Đơn vị gốc (Base Unit) và Định mức tồn kho tối thiểu.
- **FR20:** Hệ thống hỗ trợ Bảng quy đổi đơn vị (Unit Conversion) đa cấp để tự động tính toán giữa đơn vị nhập hàng và đơn vị tiêu thụ thực tế.
- **FR21:** Quản lý có thể thiết lập Công thức (Recipe/BOM) cho từng sản phẩm trên menu, hỗ trợ cơ chế lưu vết phiên bản (Versioning) theo thời gian (`effectiveFrom/To`).
- **FR22:** Hệ thống tự động thực hiện lệnh trừ tồn kho (Deduction) theo thời gian thực ngay khi Đơn hàng đạt trạng thái **4 (Hoàn Thành)** trong quy trình vận hành.
- **FR23:** Mọi biến động kho (Bán hàng, Nhập kho, Hủy, Refund, Waste, Adjustment) đều phải được ghi lại vào Nhật ký biến động (Inventory Transaction) để đối soát.

## Non-Functional Requirements

### 1. Performance
- **Tốc độ API:** Các luồng thao tác tương tác trực tiếp của Game thủ (đổi code, xem ví) bắt buộc phản hồi trong thời gian `< 1500ms`.
- **Graceful Timeout:** Yêu cầu giới hạn luồng chờ (Timeout) `<= 5000ms` khi truy vấn Local DB (Fnet), trả về lỗi gracefully thay vì gây Crash Process máy chủ nếu mất mạng chi nhánh.

### 2. Security & Anti-Spam
- **Mã hóa Định danh & Chống Injection:** Kho lưu trữ API-Key phải được băm bảo mật. Mọi biến đầu vào tiếp nhận từ Request nạp vào câu lệnh Raw SQL phải được kiểm duyệt, phòng chống 100% tấn công SQL Injection.
- **Rate Limiting:** Áp dụng chặt chẽ kiến trúc Rate limit (Redis/In-memory) cấp hệ thống đối với các Transaction nạp/rút điểm. Ném lỗi Error `429 Too Many Requests` khi số lượng truy vấn Redeem từ 1 user vượt trần cho phép nhằm chống công cụ tự động (Auto-click).

### 3. Scalability
- **Horizontal Scaling:** API Backend xây dựng nghiêm ngặt theo mô hình Stateless, dễ dàng nhân bản Docker/Kubernetes linh hoạt khi số lượng chi nhánh tăng.
- **DB Pool Limit:** Áp đặt giới hạn lượng Connection Pool đồng thời cho từng Database nhánh nhằm tối ưu tài nguyên và không xâm chiếm tải CPU mạng nội bộ cửa hàng vật lý.

### 4. Reliability & Integrity
- **Giao dịch Nguyên tử (Atomic Transactions):** Toàn bộ hàm cộng/trừ tiền hoặc tiêu quỹ điểm trên Fnet Database đều phải bọc gọn trong Transaction Block. Nếu thao tác gặp bất thường giữa chừng, hệ thống tự động Roll-back phục hồi 100% trạng thái ban đầu của ví tiền tài khoản.
