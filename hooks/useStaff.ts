import { useState, useEffect, useCallback } from 'react';

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

const STAFF_STORAGE_KEY = 'gateway_staff_data';
const STAFF_FETCH_TIMESTAMP_KEY = 'gateway_staff_fetch_time';
const STAFF_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useStaff = () => {
  const [staff, setStaff] = useState<StaffData>({
    cashiers: [],
    kitchen: [],
    security: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if cached data is still valid
  const isCacheValid = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    const fetchTime = localStorage.getItem(STAFF_FETCH_TIMESTAMP_KEY);
    if (!fetchTime) return false;
    
    const now = Date.now();
    const cachedTime = parseInt(fetchTime);
    return (now - cachedTime) < STAFF_CACHE_DURATION;
  }, []);

  // Load staff data from localStorage
  const loadFromCache = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cachedData = localStorage.getItem(STAFF_STORAGE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Error loading staff from cache:', error);
    }
    return null;
  }, []);

  // Save staff data to localStorage
  const saveToCache = useCallback((data: StaffData) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(STAFF_FETCH_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving staff to cache:', error);
    }
  }, []);

  // Fetch staff data from API
  const fetchStaffFromAPI = useCallback(async (): Promise<StaffData | null> => {
    try {
      // console.log('useStaff: Fetching staff from API...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/staff');
      // console.log('useStaff: API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      // console.log('useStaff: API response data:', result);
      
      const staffList: Staff[] = result?.data ?? [];
      // console.log('useStaff: Staff list:', staffList);
      
      // For now, all staff are treated the same way
      // You can modify this logic based on your actual staff roles
      const staffData: StaffData = {
        cashiers: staffList,
        kitchen: staffList,
        security: staffList,
      };
      
      // Save to cache
      saveToCache(staffData);
      // console.log('useStaff: Staff data saved to cache');
      
      return staffData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('useStaff: Error fetching staff:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [saveToCache]);

  // Initialize staff data
  const initializeStaff = useCallback(async () => {
    // console.log('useStaff: Initializing staff data...');
    
    // First try to load from cache
    const cachedData = loadFromCache();
    // console.log('useStaff: Cached data:', cachedData);
    
    if (cachedData && isCacheValid()) {
      // console.log('useStaff: Using cached data');
      setStaff(cachedData);
      return;
    }
    
    // If cache is invalid or doesn't exist, fetch from API
    // console.log('useStaff: Cache invalid or not found, fetching from API...');
    const apiData = await fetchStaffFromAPI();
    if (apiData) {
      // console.log('useStaff: API data received:', apiData);
      setStaff(apiData);
    }
  }, [loadFromCache, isCacheValid, fetchStaffFromAPI]);

  // Force refresh staff data (useful for admin operations)
  const refreshStaff = useCallback(async () => {
    const apiData = await fetchStaffFromAPI();
    if (apiData) {
      setStaff(apiData);
    }
  }, [fetchStaffFromAPI]);

  // Clear cache (useful for logout)
  const clearStaffCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(STAFF_STORAGE_KEY);
    localStorage.removeItem(STAFF_FETCH_TIMESTAMP_KEY);
    setStaff({
      cashiers: [],
      kitchen: [],
      security: [],
    });
  }, []);

  // Get staff by ID
  const getStaffById = useCallback((id: number): Staff | undefined => {
    const allStaff = [...staff.cashiers, ...staff.kitchen, ...staff.security];
    return allStaff.find(s => s.id === id);
  }, [staff]);

  // Get staff by name
  const getStaffByName = useCallback((name: string): Staff | undefined => {
    const allStaff = [...staff.cashiers, ...staff.kitchen, ...staff.security];
    return allStaff.find(s => s.fullName === name);
  }, [staff]);

  // Get all unique staff (remove duplicates)
  const getAllStaff = useCallback((): Staff[] => {
    const allStaff = [...staff.cashiers, ...staff.kitchen, ...staff.security];
    const uniqueStaff = allStaff.filter((staff, index, self) => 
      index === self.findIndex(s => s.id === staff.id)
    );
    return uniqueStaff;
  }, [staff]);

  return {
    staff,
    loading,
    error,
    initializeStaff,
    refreshStaff,
    clearStaffCache,
    getStaffById,
    getStaffByName,
    getAllStaff,
  };
};
