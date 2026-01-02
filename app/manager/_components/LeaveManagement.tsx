"use client";

import { useState } from "react";
import { Card, Empty } from "antd";
import { Calendar } from "lucide-react";

export default function LeaveManagement() {
  const [loading] = useState(false);

  // Placeholder - chưa có model Leave trong database
  const leaveRecords: any[] = [];

  return (
    <div className="space-y-4">
      <Card>
        {leaveRecords.length === 0 ? (
          <Empty
            description={
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-2 text-lg font-medium">Chức năng quản lý nghỉ đang được phát triển</p>
                <p className="text-sm text-gray-400">
                  Tính năng này sẽ cho phép quản lý xem và duyệt đơn nghỉ phép của nhân viên
                </p>
              </div>
            }
          />
        ) : (
          <div>Leave records will be displayed here</div>
        )}
      </Card>
    </div>
  );
}

