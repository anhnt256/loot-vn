import React, { useState, useEffect } from "react";
import { Card, Statistic, Spin } from "antd";
import { Clock, DollarSign, Award, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@gateway-workspace/shared/utils";

interface SalarySummaryProps {
  staffId: number;
  month: number;
  year: number;
}

export default function SalarySummary({ staffId, month, year }: SalarySummaryProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalHours: 0,
    salary: 0,
    bonus: 0,
    penalty: 0,
    netSalary: 0,
  });

  useEffect(() => {
    if (staffId && month && year) {
      fetchSummary();
    }
  }, [staffId, month, year]);

  const fetchSummary = async () => {
    if (!staffId || !month || !year) return;

    try {
      setLoading(true);
      const result = await apiClient.post(`/api/hr-app/salary`, { staffId, month, year });

      if (result.data.success) {
        const summaryData = result.data.data.summary;
        if (summaryData) {
          setSummary({
            totalHours: summaryData.totalHours || 0,
            salary: summaryData.salary || 0,
            bonus: summaryData.bonus || 0,
            penalty: summaryData.penalty || 0,
            netSalary: summaryData.netSalary || 0,
          });
        }
      } else {
        throw new Error(result.data.error || "Lỗi lấy dữ liệu lương");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải thông tin lương thưởng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spin size="small" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* 4 small cards (2x2) */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="text-center shadow-sm">
          <Statistic
            title={
              <span className="flex items-center justify-center gap-1">
                <Clock size={14} />
                Số giờ làm
              </span>
            }
            value={summary.totalHours.toFixed(1)}
            suffix="h"
            valueStyle={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#1890ff",
            }}
          />
        </Card>
        <Card className="text-center shadow-sm">
          <Statistic
            title={
              <span className="flex items-center justify-center gap-1">
                <DollarSign size={14} />
                Lương
              </span>
            }
            value={Math.round(summary.salary).toLocaleString("vi-VN")}
            prefix="₫"
            valueStyle={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#1890ff",
            }}
          />
        </Card>
        <Card className="text-center shadow-sm">
          <Statistic
            title={
              <span className="flex items-center justify-center gap-1">
                <Award size={14} />
                Thưởng
              </span>
            }
            value={Math.round(summary.bonus).toLocaleString("vi-VN")}
            prefix="₫"
            valueStyle={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#52c41a",
            }}
          />
        </Card>
        <Card className="text-center shadow-sm">
          <Statistic
            title={
              <span className="flex items-center justify-center gap-1">
                <AlertTriangle size={14} />
                Phạt
              </span>
            }
            value={Math.round(summary.penalty).toLocaleString("vi-VN")}
            prefix="₫"
            valueStyle={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#ff4d4f",
            }}
          />
        </Card>
      </div>

      {/* Net Salary Card (full width) */}
      <Card
        className={`text-center shadow-sm ${
          summary.netSalary < 0
            ? "bg-gradient-to-r from-red-50 to-red-100 border-red-300"
            : "bg-gradient-to-r from-green-50 to-green-100 border-green-300"
        }`}
      >
        <Statistic
          title={<span className="text-lg font-semibold text-gray-700">Thực lĩnh</span>}
          value={Math.round(summary.netSalary).toLocaleString("vi-VN")}
          prefix="₫"
          valueStyle={{
            fontSize: "28px",
            fontWeight: "bold",
            color: summary.netSalary < 0 ? "#ff4d4f" : "#52c41a",
          }}
        />
      </Card>
    </div>
  );
}
