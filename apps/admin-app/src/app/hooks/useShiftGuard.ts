import { useCallback, useRef } from 'react';
import { Modal } from 'antd';
import { apiClient, getToken } from '@gateway-workspace/shared/utils/client';

function parseJwtPayload(token: string) {
  try {
    const base64 = token.split('.')[1];
    const bytes = atob(base64);
    const text = decodeURIComponent(
      bytes.split('').map(c => `%${  c.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')
    );
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/\u0110/g, 'D');
}

interface WorkShiftJwt {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean | number;
}

/**
 * Find the WorkShift matching the current time from JWT workShifts
 */
function findCurrentWorkShift(workShifts: WorkShiftJwt[]): WorkShiftJwt | null {
  if (!workShifts?.length) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const ws of workShifts) {
    const [sH, sM] = String(ws.startTime).split(':').map(Number);
    const [eH, eM] = String(ws.endTime).split(':').map(Number);
    const start = sH * 60 + sM;
    const end = eH * 60 + eM;
    const overnight = !!ws.isOvernight;

    const inShift = overnight
      ? (currentMinutes >= start || currentMinutes <= end)
      : (currentMinutes >= start && currentMinutes <= end);

    if (inShift) return ws;
  }
  return workShifts[0] || null;
}

/**
 * Detect which WorkShift the account name refers to
 */
function detectAccountShiftName(accountName: string, workShifts: WorkShiftJwt[]): WorkShiftJwt | null {
  const norm = removeDiacritics(accountName).toLowerCase();
  for (const ws of workShifts) {
    const wsNorm = removeDiacritics(ws.name).toLowerCase().replace(/\s/g, '');
    if (norm.includes(wsNorm)) return ws;
  }
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
 * 2. Cảnh báo nếu tài khoản không khớp ca làm việc hiện tại (dựa trên WorkShift data từ JWT)
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
    if (!userInfo) return true;

    const accountName = userInfo.fullName || userInfo.userName || '';

    // Chặn hoàn toàn: Admin / Manager / staffType không được nhận ca
    if (userInfo.isAdmin || (userInfo.staffType && NON_SHIFT_TYPES.includes(userInfo.staffType))) {
      Modal.error({
        title: 'Không được phép nhận ca',
        content: `Tài khoản "${accountName}" (${userInfo.staffType || 'Admin'}) không phải tài khoản nhân viên ca.\n\nChỉ các tài khoản nhân viên đã được thiết lập ca làm việc mới được phép nhận ca. Vui lòng đăng nhập bằng tài khoản nhân viên ca.`,
        okText: 'Đã hiểu',
      });
      return false;
    }

    // Lấy WorkShift data từ JWT để xác định ca hiện tại
    const token = getToken() || '';
    const jwt = parseJwtPayload(token);
    const workShifts: WorkShiftJwt[] = jwt?.workShifts || [];

    if (!workShifts.length) return true;

    const currentWs = findCurrentWorkShift(workShifts);
    const accountWs = detectAccountShiftName(accountName, workShifts);

    if (!accountWs || !currentWs) return true;
    if (accountWs.id === currentWs.id) return true;

    // Không khớp → hỏi xác nhận
    return new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: 'Kiểm tra tài khoản nhận ca',
        content: `Hiện tại đang là khung giờ ${currentWs.name}, nhưng bạn đang sử dụng tài khoản "${accountName}" (${accountWs.name}).\n\nBạn vẫn muốn tiếp tục nhận ca chứ?`,
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
