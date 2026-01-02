"use client";

import ManagerHeader from "../_components/ManagerHeader";
import IncomeExpenseManagement from "../_components/IncomeExpenseManagement";

export default function IncomeExpensePage() {
  return (
    <div className="min-h-screen pb-20">
      <ManagerHeader title="Quản lý thu chi" color="purple" />
      <div className="px-4 pt-4">
        <IncomeExpenseManagement />
      </div>
    </div>
  );
}

