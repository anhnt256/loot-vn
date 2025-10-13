# 🚀 Quick Setup - Work Schedule Feature

## Để chạy tính năng Lịch làm việc, bạn cần:

### 1. Tạo file `.env.local` ở root project

```bash
touch .env.local  # Linux/Mac
# hoặc tạo file mới trên Windows
```

### 2. Thêm nội dung sau vào `.env.local`:

```env
NEXT_PUBLIC_CALENDAR_GV=your-govap-calendar-id@group.calendar.google.com
NEXT_PUBLIC_CALENDAR_TP=your-tanphu-calendar-id@group.calendar.google.com
```

### 3. Lấy Calendar IDs từ Google Calendar:

1. Truy cập https://calendar.google.com
2. Tạo calendar mới (hoặc dùng calendar có sẵn)
3. Click vào calendar > **Settings and sharing**
4. Trong **Access permissions**: Check **"Make available to public"**
5. Scroll xuống **Integrate calendar** > Copy **Calendar ID**
6. Paste vào file `.env.local`

### 4. Restart dev server:

```bash
npm run dev
```

### 5. Truy cập:

```
http://localhost:3000/admin/work-schedule
```

---

## ⚠️ Lưu ý quan trọng:

- File `.env.local` KHÔNG được commit vào Git (đã có trong .gitignore)
- Calendar IDs có dạng: `abc123xyz@group.calendar.google.com`
- Phải **restart server** sau khi thay đổi `.env.local`
- Đảm bảo calendar đã được set **public** hoặc **shared**

---

## 📋 Example `.env.local`:

```env
# Example - KHÔNG dùng trực tiếp, thay bằng IDs thật
NEXT_PUBLIC_CALENDAR_GV=c_1234567890abcdef@group.calendar.google.com
NEXT_PUBLIC_CALENDAR_TP=c_0987654321fedcba@group.calendar.google.com
```

---

Xem chi tiết trong file: `WORK_SCHEDULE_SETUP.md`

