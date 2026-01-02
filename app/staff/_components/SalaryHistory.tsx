"use client";

import { useState, useEffect } from "react";
import { Card, List, Tag, Spin, Empty, Divider, Image, Select } from "antd";
import { Calendar, Award, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";

interface SalaryHistoryProps {
  staffId: number;
}

interface SalaryRecord {
  id: number;
  month: number;
  year: number;
  totalHours: number;
  hourlySalary: number;
  salaryFromHours: number;
  advance: number;
  bonus: number;
  penalty: number;
  total: number;
  status: "PENDING" | "PAID";
  paidAt: string | null;
  note: string | null;
}

interface BonusRecord {
  id: number;
  amount: number;
  reason: string;
  description: string | null;
  imageUrl: string | null;
  note: string | null;
  rewardDate: string;
  status: "PENDING" | "APPROVED" | "PAID";
  createdAt: string;
}

interface PenaltyRecord {
  id: number;
  amount: number;
  reason: string;
  description: string | null;
  imageUrl: string | null;
  note: string | null;
  penaltyDate: string;
  status: "PENDING" | "APPROVED" | "PAID";
  createdAt: string;
}

export default function SalaryHistory({ staffId }: SalaryHistoryProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null);
  const [imagePreview, setImagePreview] = useState<{ url: string; visible: boolean }>({
    url: "",
    visible: false,
  });
  const [salaryHistory, setSalaryHistory] = useState<SalaryRecord[]>([]);
  const [bonusHistory, setBonusHistory] = useState<BonusRecord[]>([]);
  const [penaltiesHistory, setPenaltiesHistory] = useState<PenaltyRecord[]>([]);

  useEffect(() => {
    // Set default to current month or previous month
    const now = dayjs();
    const currentMonth = now.month() + 1; // 1-12
    const currentYear = now.year();
    
    // If current month is January, show December of previous year
    // Otherwise show previous month
    if (currentMonth === 1) {
      setSelectedMonth({ month: 12, year: currentYear - 1 });
    } else {
      setSelectedMonth({ month: currentMonth - 1, year: currentYear });
    }
  }, []);

  useEffect(() => {
    if (selectedMonth && staffId) {
      fetchHistory();
    }
  }, [staffId, selectedMonth]);

  const fetchHistory = async () => {
    if (!selectedMonth || !staffId) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `/api/staff/salary/history?staffId=${staffId}&month=${selectedMonth.month}&year=${selectedMonth.year}`
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch history");
      }
      const result = await response.json();
      if (result.success) {
        setSalaryHistory(result.data.salaryHistory || []);
        setBonusHistory(result.data.bonusHistory || []);
        setPenaltiesHistory(result.data.penaltiesHistory || []);
      }
    } catch (error: any) {
      console.error("Error fetching history:", error);
      toast.error(error.message || "Không thể tải lịch sử");
    } finally {
      setLoading(false);
    }
  };

  // Generate month options (only current month and previous month)
  const getMonthOptions = () => {
    const now = dayjs();
    const currentMonth = now.month() + 1;
    const currentYear = now.year();
    
    const options = [];
    
    // Previous month
    if (currentMonth === 1) {
      options.push({
        value: `${12}-${currentYear - 1}`,
        label: `Tháng 12/${currentYear - 1}`,
        month: 12,
        year: currentYear - 1,
      });
    } else {
      options.push({
        value: `${currentMonth - 1}-${currentYear}`,
        label: `Tháng ${currentMonth - 1}/${currentYear}`,
        month: currentMonth - 1,
        year: currentYear,
      });
    }
    
    // Current month
    options.push({
      value: `${currentMonth}-${currentYear}`,
      label: `Tháng ${currentMonth}/${currentYear}`,
      month: currentMonth,
      year: currentYear,
    });
    
    return options;
  };

  const handleMonthChange = (value: string) => {
    const [month, year] = value.split("-").map(Number);
    setSelectedMonth({ month, year });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  const monthOptions = getMonthOptions();
  const currentValue = selectedMonth
    ? `${selectedMonth.month}-${selectedMonth.year}`
    : monthOptions[0]?.value;

  return (
    <div className="space-y-4 pb-4">
      {/* Month Selector */}
      <Card className="shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Xem lịch sử tháng:</span>
          <Select
            value={currentValue}
            onChange={handleMonthChange}
            options={monthOptions}
            style={{ minWidth: 150 }}
          />
        </div>
      </Card>

      {/* Salary History */}
      <Card title="Lịch sử lương" className="shadow-sm">
        {salaryHistory.length === 0 ? (
          <Empty description="Chưa có lịch sử lương" />
        ) : (
          <List
            dataSource={salaryHistory}
            renderItem={(item) => (
              <List.Item>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-lg">
                      Tháng {item.month}/{item.year}
                    </span>
                    <Tag color={item.status === "PAID" ? "green" : "orange"} className="text-sm">
                      {item.status === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
                    </Tag>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2 mb-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">(A) Lương từ giờ làm:</span>
                      <span className="font-medium">
                        {item.salaryFromHours.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 pl-2">
                      {item.totalHours.toFixed(2)} giờ × {item.hourlySalary.toLocaleString("vi-VN")} ₫/giờ
                    </div>

                    {item.bonus > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">(C) Thưởng:</span>
                        <span className="font-medium text-green-600">
                          + {item.bonus.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    )}

                    {item.advance > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">(B) Tạm ứng:</span>
                        <span className="font-medium text-orange-600">
                          - {item.advance.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    )}

                    {item.penalty > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">(D) Phạt:</span>
                        <span className="font-medium text-red-600">
                          - {item.penalty.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    )}

                    <Divider className="my-2" />

                    <div className="flex justify-between text-base font-bold">
                      <span>Tổng thu nhập (A + C - B - D):</span>
                      <span className="text-orange-600">
                        {item.total.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>

                  {item.note && (
                    <div className="text-xs text-gray-500 italic mb-2">
                      Ghi chú: {item.note}
                    </div>
                  )}

                  {item.paidAt && (
                    <div className="text-xs text-gray-500">
                      Thanh toán: {dayjs(item.paidAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Bonus History */}
      <Card 
        title={
          <span className="flex items-center gap-2">
            <Award size={18} className="text-green-600" />
            Lịch sử thưởng
          </span>
        } 
        className="shadow-sm"
      >
        {bonusHistory.length === 0 ? (
          <Empty description="Chưa có lịch sử thưởng" />
        ) : (
          <List
            dataSource={bonusHistory}
            renderItem={(item) => (
              <List.Item>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{item.reason}</span>
                    <Tag
                      color={
                        item.status === "PAID"
                          ? "green"
                          : item.status === "APPROVED"
                          ? "blue"
                          : "orange"
                      }
                    >
                      {item.status === "PAID" && "Đã thanh toán"}
                      {item.status === "APPROVED" && "Đã duyệt"}
                      {item.status === "PENDING" && "Chờ duyệt"}
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="font-medium text-green-600">
                      Số tiền: {item.amount.toLocaleString("vi-VN")} ₫
                    </div>
                    {item.description && (
                      <div className="text-gray-700">{item.description}</div>
                    )}
                    {item.imageUrl && (
                      <div className="mt-2">
                        <Image
                          src={item.imageUrl}
                          alt={item.reason}
                          width={120}
                          height={120}
                          className="rounded cursor-pointer object-cover"
                          preview={{
                            visible: imagePreview.visible && imagePreview.url === item.imageUrl,
                            onVisibleChange: (visible) => {
                              setImagePreview({ url: item.imageUrl || "", visible });
                            },
                          }}
                          onClick={() => setImagePreview({ url: item.imageUrl || "", visible: true })}
                        />
                      </div>
                    )}
                    {item.note && (
                      <div className="text-xs text-gray-500 italic">
                        Ghi chú: {item.note}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      <Calendar size={12} className="inline mr-1" />
                      {item.rewardDate ? dayjs(item.rewardDate).format("DD/MM/YYYY HH:mm") : dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Penalties History */}
      <Card 
        title={
          <span className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            Lịch sử phạt
          </span>
        } 
        className="shadow-sm"
      >
        {penaltiesHistory.length === 0 ? (
          <Empty description="Chưa có lịch sử phạt" />
        ) : (
          <List
            dataSource={penaltiesHistory}
            renderItem={(item) => (
              <List.Item>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{item.reason}</span>
                    <Tag
                      color={
                        item.status === "PAID"
                          ? "red"
                          : item.status === "APPROVED"
                          ? "orange"
                          : "default"
                      }
                    >
                      {item.status === "PAID" && "Đã trừ"}
                      {item.status === "APPROVED" && "Đã duyệt"}
                      {item.status === "PENDING" && "Chờ duyệt"}
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="font-medium text-red-600">
                      Số tiền: {item.amount.toLocaleString("vi-VN")} ₫
                    </div>
                    {item.description && (
                      <div className="text-gray-700">{item.description}</div>
                    )}
                    {item.imageUrl && (
                      <div className="mt-2">
                        <Image
                          src={item.imageUrl}
                          alt={item.reason}
                          width={120}
                          height={120}
                          className="rounded cursor-pointer object-cover"
                          preview={{
                            visible: imagePreview.visible && imagePreview.url === item.imageUrl,
                            onVisibleChange: (visible) => {
                              setImagePreview({ url: item.imageUrl || "", visible });
                            },
                          }}
                          onClick={() => setImagePreview({ url: item.imageUrl || "", visible: true })}
                        />
                      </div>
                    )}
                    {item.note && (
                      <div className="text-xs text-gray-500 italic mt-1">
                        Ghi chú: {item.note}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      <Calendar size={12} className="inline mr-1" />
                      {dayjs(item.penaltyDate).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

