import { useCallback, useRef } from 'react';
import { Modal } from 'antd';
import { apiClient } from '@gateway-workspace/shared/utils/client';

/**
 * Xác định khung ca dựa vào giờ hiện tại.
 *   Sáng:  06:00 – 13:59
 *   Chiều: 14:00 – 21:59
 *   Tối:   22:00 – 05:59
 */
function getCurrentShiftPeriod(): { label: string; keywords: string[] } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return { label: 'Ca Sáng', keywords: ['sáng', 'sang'] };
  if (hour >= 14 && hour < 22) return { label: 'Ca Chiều', keywords: ['chiều', 'chieu'] };
  return { label: 'Ca Tối', keywords: ['tối', 'toi', 'đêm', 'dem'] };
}

/**
 * Kiểm tra tên tài khoản có chứa từ khoá ca nào không.
 */
function detectAccountShift(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes('sáng') || lower.includes('sang')) return 'Ca Sáng';
  if (lower.includes('chiều') || lower.includes('chieu')) return 'Ca Chiều';
  if (lower.includes('tối') || lower.includes('toi') || lower.includes('đêm') || lower.includes('dem')) return 'Ca Tối';
  return null;
}

/** Các staffType không được phép nhận ca */
const NON_SHIFT_TYPES = ['MANAGER', 'SUPER_ADMIN', 'BRANCH_ADMIN'];

interface UserInfo {
  fullName?: string;
  userName?: string;
  staffType?: string;
  isAdmin?: boolean;
}

/**
 * Hook kiểm tra quyền + cảnh báo trước khi nhận ca.
 *
 * 1. Chặn hoàn toàn nếu tài khoản là Admin/Manager/không có ca
 * 2. Cảnh báo nếu tài khoản không khớp khung giờ hiện tại
 */
export function useShiftGuard() {
  const userInfoCache = useRef<UserInfo | null>(null);

  const fetchUserInfo = useCallback(async (): Promise<UserInfo | null> => {
    if (userInfoCache.current) return userInfoCache.current;
    try {
      const res = await apiClient.get('/auth/me');
      const info: UserInfo = {
        fullName: res.data?.fullName,
        userName: res.data?.userName,
        staffType: res.data?.staffType,
        isAdmin: res.data?.isAdmin,
      };
      userInfoCache.current = info;
      return info;
    } catch {
      return null;
    }
  }, []);

  /**
   * Kiểm tra và xác nhận trước khi nhận ca.
   * Trả về Promise<boolean> — true nếu được phép, false nếu bị chặn/huỷ.
   */
  const confirmShiftStart = useCallback(async (): Promise<boolean> => {
    const userInfo = await fetchUserInfo();
    if (!userInfo) return true; // Không lấy được info → để backend chặn

    const accountName = userInfo.fullName || userInfo.userName || '';

    // ── Chặn hoàn toàn: Admin / Manager / staffType không được nhận ca ──
    if (userInfo.isAdmin || (userInfo.staffType && NON_SHIFT_TYPES.includes(userInfo.staffType))) {
      Modal.error({
        title: 'Không được phép nhận ca',
        content: `Tài khoản "${accountName}" (${userInfo.staffType || 'Admin'}) không phải tài khoản nhân viên ca.\n\nChỉ các tài khoản nhân viên đã được thiết lập ca làm việc mới được phép nhận ca. Vui lòng đăng nhập bằng tài khoản nhân viên ca.`,
        okText: 'Đã hiểu',
      });
      return false;
    }

    // ── Cảnh báo: tài khoản có tên ca nhưng không khớp khung giờ ──
    const accountShift = detectAccountShift(accountName);
    if (!accountShift) return true; // Không detect được ca → cho qua

    const currentPeriod = getCurrentShiftPeriod();
    const isMatch = currentPeriod.keywords.some((kw) => accountName.toLowerCase().includes(kw));
    if (isMatch) return true; // Khớp → cho qua

    // Không khớp → hỏi xác nhận
    return new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: 'Kiểm tra tài khoản nhận ca',
        content: `Hiện tại đang là khung giờ ${currentPeriod.label}, nhưng bạn đang sử dụng tài khoản "${accountName}" (${accountShift}).\n\nBạn vẫn muốn tiếp tục nhận ca chứ?`,
        okText: 'Vẫn nhận ca',
        cancelText: 'Huỷ',
        okButtonProps: { danger: true },
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }, [fetchUserInfo]);

  return { confirmShiftStart };
}
