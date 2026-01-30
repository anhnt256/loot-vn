import { useState, useEffect, useCallback } from "react";
import { useLocalStorageValue } from "./useLocalStorageValue";
import { CURRENT_USER } from "@/constants/token.constant";
import {
  WorkShift,
  getCurrentShift,
  getShiftByName,
  getShiftByEnum,
  mapWorkShiftNameToShiftEnum,
  mapShiftEnumToWorkShiftName,
} from "@/lib/work-shift-utils";

export const useWorkShift = () => {
  const currentUser = useLocalStorageValue(CURRENT_USER, null) as any;
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [currentShift, setCurrentShift] = useState<WorkShift | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch work shifts from API
  const fetchWorkShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/work-shifts");
      if (!response.ok) {
        throw new Error("Failed to fetch work shifts");
      }
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        setWorkShifts(result.data);
        const shift = getCurrentShift(result.data);
        setCurrentShift(shift);
        
        // Update localStorage if currentUser exists
        if (typeof window !== "undefined") {
          const currentUserStr = localStorage.getItem(CURRENT_USER);
          if (currentUserStr) {
            try {
              const currentUserData = JSON.parse(currentUserStr);
              const updatedUser = {
                ...currentUserData,
                workShifts: result.data,
              };
              localStorage.setItem(CURRENT_USER, JSON.stringify(updatedUser));
            } catch (parseError) {
              console.error("Error parsing currentUser from localStorage:", parseError);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching work shifts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch work shifts");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load work shifts from localStorage (from currentUser)
  useEffect(() => {
    if (currentUser && currentUser.workShifts && currentUser.workShifts.length > 0) {
      setWorkShifts(currentUser.workShifts);
      // Calculate current shift
      const shift = getCurrentShift(currentUser.workShifts);
      setCurrentShift(shift);
    } else if (currentUser) {
      // If currentUser exists but no workShifts, fetch from API
      fetchWorkShifts();
    }
  }, [currentUser, fetchWorkShifts]);

  // Get shift by name
  const getShift = useCallback(
    (name: string): WorkShift | null => {
      return getShiftByName(workShifts, name);
    },
    [workShifts],
  );

  // Get shift by enum (SANG, CHIEU, TOI)
  const getShiftByShiftEnum = useCallback(
    (shiftEnum: string): WorkShift | null => {
      return getShiftByEnum(workShifts, shiftEnum);
    },
    [workShifts],
  );

  // Map work shift name to shift enum
  const mapNameToEnum = useCallback((name: string): string => {
    return mapWorkShiftNameToShiftEnum(name);
  }, []);

  // Map shift enum to work shift name
  const mapEnumToName = useCallback((shiftEnum: string): string => {
    return mapShiftEnumToWorkShiftName(shiftEnum);
  }, []);

  // Refresh current shift (useful when time changes)
  const refreshCurrentShift = useCallback(() => {
    if (workShifts.length > 0) {
      const shift = getCurrentShift(workShifts);
      setCurrentShift(shift);
    }
  }, [workShifts]);

  return {
    workShifts,
    currentShift,
    loading,
    error,
    fetchWorkShifts,
    getShift,
    getShiftByShiftEnum,
    mapNameToEnum,
    mapEnumToName,
    refreshCurrentShift,
  };
};
