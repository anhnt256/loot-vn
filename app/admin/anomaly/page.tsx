"use client";

import React from "react";
import RevenueCalendar from "@/components/admin/RevenueCalendar";

export default function AnomalyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Cảnh báo giao dịch bất thường
        </h1>
        <p className="text-sm text-gray-400">
          Theo dõi và phát hiện các giao dịch bất thường theo từng tháng. So sánh tiền bàn giao (WorkShiftRevenueReport) với sổ quản lý (ManagerIncomeExpense). Các ngày lệch được tô đỏ.
        </p>
      </div>
      <RevenueCalendar />
    </div>
  );
}
