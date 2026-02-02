"use client";

import { useState, useEffect } from "react";
import { Card, Statistic, Spin } from "antd";
import { Clock, DollarSign, Award, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface SalarySummaryProps {
  staffId: number;
  month: number;
  year: number;
}

export default function SalarySummary({
  staffId,
  month,
  year,
}: SalarySummaryProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalHours: 0,
    salary: 0,
    bonus: 0,
    penalty: 0,
    netSalary: 0, // Thực lĩnh = Lương + Thưởng - Phạt
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
      const response = await fetch(
        `/api/staff/salary?staffId=${staffId}&month=${month}&year=${year}`,
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch salary summary");
      }
      const result = await response.json();
      if (result.success) {
        setSummary(result.data.summary || summary);
      }
    } catch (error: any) {
      console.error("Error fetching summary:", error);
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
      {/* 4 cards nhỏ (2x2) */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="text-center">
          <Statistic
            title={
              <span className="flex items-center justify-center gap-1">
                <Clock size={14} />
                Số giờ làm
              </span>
            }
            value={summary.totalHours.toFixed(1)}
            suffix="giờ"
            valueStyle={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1890ff",
            }}
          />
        </Card>
        <Card className="text-center">
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
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1890ff",
            }}
          />
        </Card>
        <Card className="text-center">
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
              fontSize: "16px",
              fontWeight: "bold",
              color: "#52c41a",
            }}
          />
        </Card>
        <Card className="text-center">
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
              fontSize: "16px",
              fontWeight: "bold",
              color: "#ff4d4f",
            }}
          />
        </Card>
      </div>

      {/* Card Thực lĩnh (full width) */}
      <Card
        className={`text-center ${
          summary.netSalary < 0
            ? "bg-gradient-to-r from-red-50 to-red-100 border-red-300"
            : "bg-gradient-to-r from-green-50 to-green-100 border-green-300"
        }`}
      >
        <Statistic
          title={
            <span className="text-lg font-semibold text-gray-700">
              Thực lĩnh
            </span>
          }
          value={Math.round(summary.netSalary).toLocaleString("vi-VN")}
          prefix="₫"
          valueStyle={{
            fontSize: "24px",
            fontWeight: "bold",
            color: summary.netSalary < 0 ? "#ff4d4f" : "#52c41a",
          }}
        />
      </Card>
    </div>
  );
}
