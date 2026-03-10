# 📅 Work Schedule Feature - Setup Guide

## Tính năng
Tính năng Lịch làm việc cho phép nhúng Google Calendar trực tiếp vào Admin Panel để theo dõi lịch làm việc của nhân viên theo từng chi nhánh.

## Features
- ✅ Hiển thị Google Calendar theo chi nhánh (Gò Vấp / Tân Phú)
- ✅ Tự động switch calendar khi đổi chi nhánh
- ✅ 3 chế độ xem: Tuần, Tháng, Danh sách
- ✅ Giao diện tiếng Việt
- ✅ Timezone Vietnam (Asia/Ho_Chi_Minh)
- ✅ Cả Admin và Staff đều có thể truy cập

## Cấu hình

### Bước 1: Tạo Google Calendar

1. Truy cập [Google Calendar](https://calendar.google.com)
2. Tạo 2 calendar mới:
   - "Lịch làm việc - Gò Vấp"
   - "Lịch làm việc - Tân Phú"
3. Với mỗi calendar:
   - Click vào **Settings and sharing**
   - Trong phần **Access permissions**, chọn:
     - **"Make available to public"** (để public)
     - HOẶC share với specific domain/email của bạn
   - Scroll xuống **Integrate calendar**
   - Copy **Calendar ID** (dạng: `abc123@group.calendar.google.com`)

### Bước 2: Cấu hình Environment Variables

Tạo hoặc cập nhật file `.env.local` ở root project:

```env
# Google Calendar IDs
NEXT_PUBLIC_CALENDAR_GV=your-govap-calendar-id@group.calendar.google.com
NEXT_PUBLIC_CALENDAR_TP=your-tanphu-calendar-id@group.calendar.google.com
```

**Lưu ý:** 
- Thay `your-govap-calendar-id` và `your-tanphu-calendar-id` bằng Calendar IDs thực tế
- Biến môi trường phải bắt đầu bằng `NEXT_PUBLIC_` để accessible ở client-side
- Sau khi thêm biến môi trường, cần **restart dev server**

### Bước 3: Restart Development Server

```bash
npm run dev
```

## Sử dụng

1. Đăng nhập Admin Panel
2. Click vào menu **"Lịch làm việc"** (icon 📅)
3. Chọn chế độ xem:
   - **Tuần**: Xem lịch theo tuần
   - **Tháng**: Xem lịch theo tháng
   - **Danh sách**: Xem danh sách events
4. Khi đổi chi nhánh, calendar sẽ tự động switch

## Quản lý Events

Để tạo, sửa, xóa events trong calendar:

1. Click vào link **"Google Calendar"** trong info box
2. Hoặc truy cập trực tiếp: https://calendar.google.com
3. Chọn calendar tương ứng (Gò Vấp hoặc Tân Phú)
4. Tạo/sửa/xóa events như bình thường
5. Changes sẽ tự động hiển thị trong Admin Panel (có thể cần refresh trang)

## Permissions

- ✅ **Admin** (loginType: username): Có quyền truy cập
- ✅ **Staff** (loginType: mac): Có quyền truy cập (view only)

## Troubleshooting

### Calendar không hiển thị

1. Kiểm tra Calendar ID có đúng không
2. Kiểm tra calendar đã được public hoặc share chưa
3. Kiểm tra biến môi trường trong `.env.local`
4. Restart dev server sau khi thay đổi `.env.local`

### Calendar hiển thị "This calendar is not public"

1. Vào Google Calendar Settings
2. Chọn calendar cần share
3. Trong **Access permissions**, check **"Make available to public"**
4. Save và refresh trang admin

### Lỗi "Chưa cấu hình Calendar"

1. Đảm bảo đã tạo file `.env.local` ở root project
2. Thêm đúng format:
   ```env
   NEXT_PUBLIC_CALENDAR_GV=calendar-id@group.calendar.google.com
   NEXT_PUBLIC_CALENDAR_TP=calendar-id@group.calendar.google.com
   ```
3. Restart dev server

## Files Created/Modified

### Created:
- `app/admin/work-schedule/page.tsx` - Main Work Schedule page

### Modified:
- `components/admin/AdminSidebar.tsx` - Added menu item and permissions

## Technical Details

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Cookies (js-cookie)
- **Integration Method**: Google Calendar iframe embed
- **No backend API required** - Pure client-side integration

## Future Enhancements (Optional)

Nếu cần thêm features sau này:

1. **Tích hợp Calendar API**: Để có full control (create/edit/delete events)
2. **Notifications**: Gửi thông báo khi có event sắp tới
3. **Staff Management**: Link events với staff trong database
4. **Shift Management**: Quản lý ca làm việc tự động
5. **Reports**: Báo cáo giờ làm việc theo staff/tháng

## Support

Nếu có vấn đề, kiểm tra:
1. Console logs trong browser DevTools
2. Network tab để xem iframe có load không
3. Google Calendar public settings

