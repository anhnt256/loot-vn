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

const STAFF_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Helper functions to get branch-specific cache keys
const getStaffStorageKey = (branch: string) => `gateway_staff_data_${branch}`;
const getStaffTimestampKey = (branch: string) => `gateway_staff_fetch_time_${branch}`;

export const useStaff = () => {
  const [staff, setStaff] = useState<StaffData>({
    cashiers: [],
    kitchen: [],
    security: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState<string | null>(null);

  // Get current branch from cookie
  const getCurrentBranch = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const branchCookie = cookies.find(cookie => cookie.trim().startsWith('branch='));
    return branchCookie ? branchCookie.split('=')[1] : null;
  }, []);

  // Check if cached data is still valid for current branch
  const isCacheValid = useCallback((branch: string) => {
    if (typeof window === 'undefined' || !branch) return false;
    
    const fetchTime = localStorage.getItem(getStaffTimestampKey(branch));
    if (!fetchTime) return false;
    
    const now = Date.now();
    const cachedTime = parseInt(fetchTime);
    return (now - cachedTime) < STAFF_CACHE_DURATION;
  }, []);

  // Load staff data from localStorage for specific branch
  const loadFromCache = useCallback((branch: string) => {
    if (typeof window === 'undefined' || !branch) return null;
    
    try {
      const cachedData = localStorage.getItem(getStaffStorageKey(branch));
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Error loading staff from cache:', error);
    }
    return null;
  }, []);

  // Save staff data to localStorage for specific branch
  const saveToCache = useCallback((data: StaffData, branch: string) => {
    if (typeof window === 'undefined' || !branch) return;
    
    try {
      localStorage.setItem(getStaffStorageKey(branch), JSON.stringify(data));
      localStorage.setItem(getStaffTimestampKey(branch), Date.now().toString());
    } catch (error) {
      console.error('Error saving staff to cache:', error);
    }
  }, []);

  // Fetch staff data from API
  const fetchStaffFromAPI = useCallback(async (branch: string): Promise<StaffData | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/staff');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Verify the response is for the correct branch
      if (result.branch && result.branch !== branch) {
        console.warn('useStaff: Branch mismatch! Expected:', branch, 'Got:', result.branch);
        // Don't use data from wrong branch
        return null;
      }
      
      const staffList: Staff[] = result?.data ?? [];
      
      // For now, all staff are treated the same way
      // You can modify this logic based on your actual staff roles
      const staffData: StaffData = {
        cashiers: staffList,
        kitchen: staffList,
        security: staffList,
      };
      
      // Save to cache for this branch
      saveToCache(staffData, branch);
      
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
    const branch = getCurrentBranch();
    if (!branch) {
      setError('No branch found in cookie');
      return;
    }
    
    // Update current branch state
    setCurrentBranch(branch);
    
    // First try to load from cache for this branch
    const cachedData = loadFromCache(branch);
    
    if (cachedData && isCacheValid(branch)) {
      setStaff(cachedData);
      return;
    }
    
    // If cache is invalid or doesn't exist, fetch from API
    const apiData = await fetchStaffFromAPI(branch);
    if (apiData) {
      setStaff(apiData);
    }
  }, [getCurrentBranch, loadFromCache, isCacheValid, fetchStaffFromAPI]);

  // Force refresh staff data (useful for admin operations)
  const refreshStaff = useCallback(async () => {
    const branch = getCurrentBranch();
    if (!branch) {
      return;
    }
    
    const apiData = await fetchStaffFromAPI(branch);
    if (apiData) {
      setStaff(apiData);
    }
  }, [getCurrentBranch, fetchStaffFromAPI]);

  // Clear cache (useful for logout)
  const clearStaffCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Clear cache for all branches
    const branches = ['GO_VAP', 'TAN_PHU'];
    branches.forEach(branch => {
      localStorage.removeItem(getStaffStorageKey(branch));
      localStorage.removeItem(getStaffTimestampKey(branch));
    });
    
    setStaff({
      cashiers: [],
      kitchen: [],
      security: [],
    });
    setCurrentBranch(null);
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
    currentBranch,
    initializeStaff,
    refreshStaff,
    clearStaffCache,
    getStaffById,
    getStaffByName,
    getAllStaff,
  };
};
