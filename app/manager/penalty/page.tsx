"use client";

import ManagerHeader from "../_components/ManagerHeader";
import PenaltyManagement from "../_components/PenaltyManagement";

export default function PenaltyPage() {
  return (
    <div className="min-h-screen pb-20">
      <ManagerHeader title="Quản lý phạt" color="red" />
      <div className="px-4 pt-4">
        <PenaltyManagement />
      </div>
    </div>
  );
}
