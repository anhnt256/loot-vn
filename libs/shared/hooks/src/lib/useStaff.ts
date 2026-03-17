import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@gateway-workspace/shared/utils';

interface Staff {
  id: number;
  fullName: string;
  userName: string;
  role?: string;
}

interface StaffData {
  cashiers: Staff[];
  kitchen: Staff[];
  security: Staff[];
}

const STAFF_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getStaffStorageKey = (tenantId: string) => `gateway_staff_data_${tenantId}`;
const getStaffTimestampKey = (tenantId: string) => `gateway_staff_fetch_time_${tenantId}`;

const getCurrentTenantId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const c = cookies.find((cookie) => cookie.trim().startsWith('tenantId='));
  return c ? c.split('=')[1]?.trim() ?? null : null;
};

export const useStaff = () => {
  const [staff, setStaff] = useState<StaffData>({
    cashiers: [],
    kitchen: [],
    security: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);

  const isCacheValid = useCallback((tenantId: string) => {
    if (typeof window === 'undefined' || !tenantId) return false;
    const fetchTime = localStorage.getItem(getStaffTimestampKey(tenantId));
    if (!fetchTime) return false;
    return Date.now() - parseInt(fetchTime, 10) < STAFF_CACHE_DURATION;
  }, []);

  const loadFromCache = useCallback((tenantId: string) => {
    if (typeof window === 'undefined' || !tenantId) return null;
    try {
      const cached = localStorage.getItem(getStaffStorageKey(tenantId));
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, []);

  const saveToCache = useCallback((data: StaffData, tenantId: string) => {
    if (typeof window === 'undefined' || !tenantId) return;
    try {
      localStorage.setItem(getStaffStorageKey(tenantId), JSON.stringify(data));
      localStorage.setItem(getStaffTimestampKey(tenantId), Date.now().toString());
    } catch (e) {
      console.error('useStaff: save cache error', e);
    }
  }, []);

  const fetchStaffFromAPI = useCallback(async (tenantId: string): Promise<StaffData | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/staff', {
        headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
      });
      const result = response.data;
      const staffList: Staff[] = result?.data ?? [];
      const staffData: StaffData = {
        cashiers: staffList,
        kitchen: staffList,
        security: staffList,
      };
      saveToCache(staffData, tenantId);
      return staffData;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [saveToCache]);

  const initializeStaff = useCallback(async () => {
    const tenantId = getCurrentTenantId();
    const contextKey = tenantId || 'default';
    setCurrentTenantId(tenantId);
    const cached = loadFromCache(contextKey);
    if (cached && isCacheValid(contextKey)) {
      setStaff(cached);
      return;
    }
    const apiData = await fetchStaffFromAPI(contextKey);
    if (apiData) setStaff(apiData);
    else if (!tenantId) setError('No tenant context');
  }, [loadFromCache, isCacheValid, fetchStaffFromAPI]);

  const refreshStaff = useCallback(async () => {
    const tenantId = getCurrentTenantId();
    const contextKey = tenantId || 'default';
    const apiData = await fetchStaffFromAPI(contextKey);
    if (apiData) setStaff(apiData);
  }, [fetchStaffFromAPI]);

  const clearStaffCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('gateway_staff_data_') || k.startsWith('gateway_staff_fetch_time_')))
          keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
    setStaff({ cashiers: [], kitchen: [], security: [] });
    setCurrentTenantId(null);
  }, []);

  const getStaffById = useCallback((id: number): Staff | undefined => {
    const all = [...staff.cashiers, ...staff.kitchen, ...staff.security];
    return all.find((s) => s.id === id);
  }, [staff]);

  const getStaffByName = useCallback((name: string): Staff | undefined => {
    const all = [...staff.cashiers, ...staff.kitchen, ...staff.security];
    return all.find((s) => s.fullName === name);
  }, [staff]);

  const getAllStaff = useCallback((): Staff[] => {
    const all = [...staff.cashiers, ...staff.kitchen, ...staff.security];
    return all.filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);
  }, [staff]);

  return {
    staff,
    loading,
    error,
    currentTenantId,
    initializeStaff,
    refreshStaff,
    clearStaffCache,
    getStaffById,
    getStaffByName,
    getAllStaff,
  };
};
