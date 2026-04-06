import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { apiClient } from '@gateway-workspace/shared/utils/client';

/* ── types ── */
export interface StaffShift {
  id: number;
  staffId: number;
  staffName: string;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
}

export interface WorkShiftSchedule {
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
  isOvernight: boolean;
}

interface ShiftState {
  shift: StaffShift | null;
  isOwner: boolean;
  canStartShift: boolean;
  workShiftSchedule: WorkShiftSchedule | null;
}

/* ── singleton store ── */
const STORAGE_KEY = 'loot_current_shift';

let listeners: Array<() => void> = [];
let cached: ShiftState = loadFromStorage();

function loadFromStorage(): ShiftState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { shift: null, isOwner: false, canStartShift: true, workShiftSchedule: null };
  } catch {
    return { shift: null, isOwner: false, canStartShift: true, workShiftSchedule: null };
  }
}

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): ShiftState {
  return cached;
}

function setState(state: ShiftState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  cached = state;
  emitChange();
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
  cached = { shift: null, isOwner: false, canStartShift: cached.canStartShift, workShiftSchedule: null };
  emitChange();
}

/* ── hook ── */
export function useShift() {
  const state = useSyncExternalStore(subscribe, getSnapshot);

  const fetchShift = useCallback(async () => {
    try {
      const res = await apiClient.get('/admin/orders/shift/current');
      const shift = res.data?.data ?? null;
      const isOwner = res.data?.isOwner ?? false;
      const canStartShift = res.data?.canStartShift ?? true;
      const workShiftSchedule = res.data?.workShiftSchedule ?? null;
      setState({ shift, isOwner, canStartShift, workShiftSchedule });
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchShift();
    const id = setInterval(fetchShift, 30_000);
    return () => clearInterval(id);
  }, [fetchShift]);

  const startShift = useCallback(async () => {
    const res = await apiClient.post('/admin/orders/shift/start');
    const shift = res.data?.data ?? null;
    setState({ shift, isOwner: true, canStartShift: cached.canStartShift, workShiftSchedule: cached.workShiftSchedule });
    // Fetch lại ngay để lấy workShiftSchedule mới nhất
    fetchShift();
    return shift;
  }, [fetchShift]);

  const endShift = useCallback(async () => {
    await apiClient.post('/admin/orders/shift/end');
    clearState();
  }, []);

  return {
    currentShift: state.shift,
    /** Có ca đang hoạt động (bất kỳ ai) */
    hasShift: !!state.shift,
    /** User hiện tại là người nhận ca */
    isShiftOwner: state.isOwner,
    /** User có nằm trong bảng WorkShift không (được phép nhận ca) */
    canStartShift: state.canStartShift,
    /** Lịch ca làm việc (giờ bắt đầu/kết thúc) */
    workShiftSchedule: state.workShiftSchedule,
    startShift,
    endShift,
    refreshShift: fetchShift,
  };
}
