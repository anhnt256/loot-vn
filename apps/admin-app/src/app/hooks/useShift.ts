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

interface ShiftState {
  shift: StaffShift | null;
  isOwner: boolean;
}

/* ── singleton store ── */
const STORAGE_KEY = 'loot_current_shift';

let listeners: Array<() => void> = [];
let cached: ShiftState = loadFromStorage();

function loadFromStorage(): ShiftState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { shift: null, isOwner: false };
  } catch {
    return { shift: null, isOwner: false };
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
  cached = { shift: null, isOwner: false };
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
      setState({ shift, isOwner });
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
    setState({ shift, isOwner: true });
    return shift;
  }, []);

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
    startShift,
    endShift,
    refreshShift: fetchShift,
  };
}
