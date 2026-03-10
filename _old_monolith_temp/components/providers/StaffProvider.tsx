"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useStaff } from "@/hooks/useStaff";

interface StaffContextType {
  staff: {
    cashiers: any[];
    kitchen: any[];
    security: any[];
  };
  loading: boolean;
  error: string | null;
  currentBranch: string | null;
  initializeStaff: () => Promise<void>;
  refreshStaff: () => Promise<void>;
  clearStaffCache: () => void;
  getStaffById: (id: number) => any;
  getStaffByName: (name: string) => any;
  getAllStaff: () => any[];
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const staffHook = useStaff();

  // Initialize staff data when provider mounts or branch changes
  useEffect(() => {
    const hasStaff =
      staffHook.staff.cashiers.length > 0 ||
      staffHook.staff.kitchen.length > 0 ||
      staffHook.staff.security.length > 0;

    if (!hasStaff && !staffHook.loading) {
      staffHook.initializeStaff();
    }
  }, [
    staffHook.staff.cashiers.length,
    staffHook.staff.kitchen.length,
    staffHook.staff.security.length,
    staffHook.loading,
    staffHook.initializeStaff,
  ]);

  // Monitor branch changes and reinitialize if needed
  useEffect(() => {
    const checkBranchChange = () => {
      const cookies = document.cookie.split(";");
      const branchCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("branch="),
      );
      const currentBranch = branchCookie ? branchCookie.split("=")[1] : null;

      if (currentBranch && currentBranch !== staffHook.currentBranch) {
        // Clear current staff data and reinitialize
        staffHook.clearStaffCache();
        staffHook.initializeStaff();
      }
    };

    // Check for branch changes every 1 second
    const interval = setInterval(checkBranchChange, 1000);

    return () => clearInterval(interval);
  }, [
    staffHook.currentBranch,
    staffHook.clearStaffCache,
    staffHook.initializeStaff,
  ]);

  return (
    <StaffContext.Provider value={staffHook}>{children}</StaffContext.Provider>
  );
};

export const useStaffContext = () => {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error("useStaffContext must be used within a StaffProvider");
  }
  return context;
};
