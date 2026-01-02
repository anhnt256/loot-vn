"use client";

import ManagerHeader from "../_components/ManagerHeader";
import LeaveManagement from "../_components/LeaveManagement";

export default function LeavePage() {
  return (
    <div className="min-h-screen pb-20">
      <ManagerHeader title="Quản lý nghỉ" color="orange" />
      <div className="px-4 pt-4">
        <LeaveManagement />
      </div>
    </div>
  );
}

