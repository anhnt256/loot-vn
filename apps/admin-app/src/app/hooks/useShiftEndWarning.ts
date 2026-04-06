import { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import dayjs from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import { useShift, WorkShiftSchedule } from './useShift';

const WARNING_MINUTES = 15;
const STORAGE_KEY = 'loot_shift_warning_dismissed';

/**
 * Tính thời điểm kết thúc ca (Date) dựa trên WorkShift schedule.
 * Xử lý ca qua đêm (isOvernight).
 */
function getShiftEndDate(schedule: WorkShiftSchedule): Date {
  const now = new Date();
  const [endH, endM] = schedule.endTime.split(':').map(Number);

  const endDate = new Date(now);
  endDate.setHours(endH, endM, 0, 0);

  if (schedule.isOvernight) {
    // Ca qua đêm: nếu hiện tại sau endTime → endTime là ngày mai
    // Nhưng nếu hiện tại trước endTime (vd: 3:00 sáng, ca tối kết thúc 6:00) → endTime là hôm nay
    const [startH] = schedule.startTime.split(':').map(Number);
    const currentH = now.getHours();
    // Nếu giờ hiện tại >= giờ bắt đầu ca → endTime là ngày mai
    if (currentH >= startH) {
      endDate.setDate(endDate.getDate() + 1);
    }
    // Ngược lại (hiện tại < endTime, vd 3:00 < 6:00) → endTime là hôm nay, giữ nguyên
  }

  return endDate;
}

/**
 * Hook cảnh báo 15 phút trước khi hết giờ ca.
 * Hiển thị Modal hỏi user có muốn Ngưng nhận đơn không.
 */
export function useShiftEndWarning() {
  const { isShiftOwner, workShiftSchedule, currentShift } = useShift();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shownRef = useRef(false);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    shownRef.current = false;

    if (!isShiftOwner || !workShiftSchedule || !currentShift) return;

    // Kiểm tra đã dismiss warning cho ca này chưa
    const dismissedShiftId = localStorage.getItem(STORAGE_KEY);
    if (dismissedShiftId === String(currentShift.id)) {
      shownRef.current = true;
      return;
    }

    const check = () => {
      if (shownRef.current) return;

      const endDate = getShiftEndDate(workShiftSchedule);
      const diffMs = endDate.getTime() - Date.now();
      const diffMin = diffMs / 60000;

      // Chỉ hiện cảnh báo khi còn <= 15 phút VÀ chưa quá giờ
      if (diffMin <= WARNING_MINUTES && diffMin > 0) {
        shownRef.current = true;
        showWarningModal(Math.round(diffMin));
      }
    };

    // Check ngay lập tức và mỗi 30 giây
    check();
    timerRef.current = setInterval(check, 30_000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isShiftOwner, workShiftSchedule, currentShift]);

  const showWarningModal = (minutesLeft: number) => {
    Modal.confirm({
      title: 'Sắp hết giờ ca',
      content: `Còn ${minutesLeft} phút sẽ hết giờ ca. Bạn có muốn Ngưng nhận đơn để tiến hành kết ca không?`,
      okText: 'Ngưng nhận đơn',
      cancelText: 'Để sau',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const resumeAt = dayjs().add(WARNING_MINUTES, 'minute').toISOString();
          await apiClient.post('/admin/orders/pause', {
            resumeAt,
            note: 'Tự động ngưng nhận đơn trước khi kết ca',
          });
          // Lưu đã dismiss cho ca này
          if (currentShift) {
            localStorage.setItem(STORAGE_KEY, String(currentShift.id));
          }
        } catch {
          // silent — PauseOrderButton sẽ hiện trạng thái
        }
      },
      onCancel: () => {
        // Lưu đã dismiss cho ca này để không hỏi lại
        if (currentShift) {
          localStorage.setItem(STORAGE_KEY, String(currentShift.id));
        }
      },
    });
  };
}
