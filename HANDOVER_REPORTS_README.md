# Hệ thống Báo cáo Bàn giao

## Tổng quan

Hệ thống báo cáo bàn giao cho phép quản lý và theo dõi các báo cáo bàn giao ca làm việc trong nhà hàng, bao gồm:

- **Báo cáo bếp**: Theo dõi nguyên vật liệu trong bếp
- **Báo cáo nước**: Theo dõi đồ uống và nước giải khát

## Cấu trúc Database

### Bảng HandoverReport
Lưu trữ thông tin chính của báo cáo bàn giao:

```sql
- id: ID tự động tăng
- date: Ngày báo cáo
- shift: Ca làm việc (SANG, CHIEU, TOI)
- reportType: Loại báo cáo (BAO_CAO_BEP, BAO_CAO_NUOC)
- branch: Chi nhánh (mặc định: GO_VAP)
- staffId: ID nhân viên tạo báo cáo
- note: Ghi chú
- createdAt, updatedAt: Timestamp
```

### Bảng HandoverMaterial
Lưu trữ chi tiết nguyên vật liệu trong từng báo cáo:

```sql
- id: ID tự động tăng
- handoverReportId: ID báo cáo bàn giao
- materialName: Tên nguyên vật liệu
- materialType: Loại vật liệu (NGUYEN_VAT_LIEU, NUOC_UONG)
- morningBeginning: Tồn đầu ca sáng
- morningReceived: Nhập ca sáng
- morningIssued: Xuất ca sáng
- morningEnding: Tồn cuối ca sáng
- afternoonBeginning: Tồn đầu ca chiều
- afternoonReceived: Nhập ca chiều
- afternoonIssued: Xuất ca chiều
- afternoonEnding: Tồn cuối ca chiều
- eveningBeginning: Tồn đầu ca tối
- eveningReceived: Nhập ca tối
- eveningIssued: Xuất ca tối
- eveningEnding: Tồn cuối ca tối
- morningAfterConfirmation: Số lượng ca sáng sau xác nhận
```

## API Endpoints

### GET /api/handover-reports
Lấy danh sách báo cáo bàn giao với các filter:

**Query Parameters:**
- `date`: Ngày báo cáo (YYYY-MM-DD)
- `shift`: Ca làm việc (Sáng, Chiều, Tối)
- `employee`: Tên nhân viên
- `reportType`: Loại báo cáo (Báo cáo bếp, Báo cáo nước)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2024-01-15T00:00:00.000Z",
      "shift": "SANG",
      "reportType": "BAO_CAO_BEP",
      "note": "Ghi chú",
      "staffName": "Nguyễn Văn A",
      "materials": [
        {
          "id": 1,
          "materialName": "Mì",
          "materialType": "NGUYEN_VAT_LIEU",
          "morning": {
            "beginning": 50,
            "received": 20,
            "issued": 15,
            "ending": 55
          },
          "afternoon": { ... },
          "evening": { ... },
          "morningAfterConfirmation": 33
        }
      ]
    }
  ]
}
```

### POST /api/handover-reports
Tạo báo cáo bàn giao mới:

**Request Body:**
```json
{
  "date": "2024-01-15",
  "shift": "SANG",
  "reportType": "BAO_CAO_BEP",
  "staffId": 1,
  "note": "Ghi chú",
  "materials": [
    {
      "materialName": "Mì",
      "materialType": "NGUYEN_VAT_LIEU",
      "morning": {
        "beginning": 50,
        "received": 20,
        "issued": 15,
        "ending": 55
      },
      "afternoon": { ... },
      "evening": { ... },
      "morningAfterConfirmation": 33
    }
  ]
}
```

### GET /api/staff
Lấy danh sách nhân viên:

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userName": "Nguyễn Văn A",
      "isAdmin": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Cách sử dụng

### 1. Chạy Migration
```bash
# Chạy file migration để tạo bảng mới
mysql -u username -p database_name < migration-handover-reports.sql
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Sử dụng trong Frontend
- Truy cập `/admin/handover-reports` để xem danh sách báo cáo
- Sử dụng các filter để tìm kiếm báo cáo theo ngày, ca, nhân viên, loại báo cáo
- Xuất báo cáo dưới dạng PDF hoặc Excel

## Lưu ý

1. **Timezone**: Sử dụng các function ISO trong `timezone-utils.ts` để xử lý timezone
2. **Raw Query**: Sử dụng raw query thay vì Prisma để kiểm soát timezone
3. **Branch**: Luôn sử dụng branch từ cookie để filter dữ liệu
4. **Staff**: Sử dụng `userId` và `branch` để join với bảng User, không sử dụng `id`

## Tính năng tương lai

- [ ] Form tạo báo cáo mới
- [ ] Chỉnh sửa báo cáo
- [ ] Xóa báo cáo
- [ ] Export PDF/Excel
- [ ] Thống kê và biểu đồ
- [ ] Notification khi có báo cáo mới 