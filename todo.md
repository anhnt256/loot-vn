# TODO: Quản lý báo cáo Gateway

- [x] Thiết kế và tạo bảng `reports` trong database (Prisma/schema.sql hoặc migration.sql)
- [ ] Tạo API backend:
  - [ ] GET /api/reports (lấy danh sách, filter theo ngày, ca)
  - [ ] POST /api/reports (tạo báo cáo mới, kiểm tra macAddress/ngày)
  - [ ] POST /api/reports/upload (upload file PDF lên Google Drive, trả về URL)
  - [ ] GET /api/reports/:id (xem chi tiết báo cáo)
- [ ] Tạo UI quản lý báo cáo:
  - [ ] Trang danh sách báo cáo, filter theo ngày, ca
  - [ ] Form tạo báo cáo mới (chỉ cho phép ngày hiện tại, đúng macAddress)
  - [ ] Upload file PDF, nhập ghi chú
- [ ] Tích hợp Google Drive API để upload file, lấy link chia sẻ
- [ ] Chỉ cho phép macAddress báo cáo ngày hiện tại (kiểm tra logic ở API)