# Drift: DB đã có sẵn bảng/cột chưa nằm trong migration history

Khi chạy `prisma migrate dev`, Prisma so sánh:
- **Expected**: schema sau khi áp dụng toàn bộ file trong `migrations/`
- **Actual**: schema thực tế trong DB

Nếu DB có thêm bảng/cột (vd: RewardPunishRule, StaffViolation, WorkShift.gcp_id, Staff.workShiftId) mà không có trong bất kỳ migration nào → **drift**. Prisma mặc định đề xuất **reset** (drop DB, chạy lại toàn bộ migration) để đồng bộ, nên sẽ **mất hết dữ liệu**.

## Cách thêm Request + StaffRequest mà KHÔNG reset DB

1. **Áp dụng migration bằng tay** (chỉ chạy SQL tạo 2 bảng mới):

   ```bash
   # Chạy file SQL trực tiếp lên MySQL (đổi connection nếu cần)
   mysql -h 51.79.145.188 -P 3306 -u gateway -p gateway_govap < libs/database/prisma/new/migrations/20260317120000_add_request_staff_request/migration.sql
   ```

   Hoặc mở file `migrations/20260317120000_add_request_staff_request/migration.sql`, copy nội dung và chạy trong MySQL client/GUI.

2. **Đánh dấu migration đã apply** (để Prisma không chạy lại, không đụng drift):

   ```bash
   npx prisma migrate resolve --schema=libs/database/prisma/new/schema.prisma --applied 20260317120000_add_request_staff_request
   ```

3. **Generate lại client** (nếu chưa):

   ```bash
   npx prisma generate --schema=libs/database/prisma/new/schema.prisma
   ```

Sau đó API dùng bảng `Request` và `StaffRequest` bình thường, **không cần** chạy `migrate dev` cho bước này.

## Fix drift lâu dài (tùy chọn)

Để sau này `migrate dev` không còn báo drift:

- **Cách 1**: Tạo thêm các migration tương ứng với từng thay đổi đã có trên DB (RewardPunishRule, StaffViolation, workShiftId, gcp_id), rồi đánh dấu đã apply bằng `migrate resolve --applied` (không chạy lại SQL).
- **Cách 2**: Dùng [baseline](https://www.prisma.io/docs/guides/database/production-troubleshooting#baseline-your-production-database): coi DB hiện tại là “đã migrate” và chỉ thêm migration mới từ giờ.

**Tuyệt đối không chạy `prisma migrate reset`** nếu không chấp nhận mất toàn bộ dữ liệu trong DB đó.
