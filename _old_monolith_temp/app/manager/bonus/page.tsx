"use client";

import ManagerHeader from "../_components/ManagerHeader";
import BonusManagement from "../_components/BonusManagement";

export default function BonusPage() {
  return (
    <div className="min-h-screen pb-20">
      <ManagerHeader title="Quản lý thưởng" color="green" />
      <div className="px-4 pt-4">
        <BonusManagement />
      </div>
    </div>
  );
}
