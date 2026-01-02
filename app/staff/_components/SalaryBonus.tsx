"use client";

import { useState, useEffect } from "react";
import {
  Card,
  List,
  Tag,
  Spin,
  Empty,
  Statistic,
  Divider,
  Image,
  Modal,
} from "antd";
import {
  DollarSign,
  Calendar,
  Gift,
  Award,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";

interface SalaryBonusProps {
  staffId: number;
}

interface SalaryRecord {
  id: number;
  month: number;
  year: number;
  totalHours: number;
  hourlySalary: number;
  salaryFromHours: number; // A: Số giờ làm * lương
  advance: number; // B: Tạm ứng
  bonus: number; // C: Thưởng
  penalty: number; // D: Phạt
  total: number; // Tổng thu nhập = A + C - B - D
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

export default function SalaryBonus({ staffId }: SalaryBonusProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<{
    url: string;
    visible: boolean;
  }>({
    url: "",
    visible: false,
  });
  const [salaryHistory, setSalaryHistory] = useState<SalaryRecord[]>([]);
  const [bonusHistory, setBonusHistory] = useState<BonusRecord[]>([]);
  const [penaltiesHistory, setPenaltiesHistory] = useState<PenaltyRecord[]>([]);
  const [summary, setSummary] = useState({
    totalSalary: 0,
    totalBonus: 0,
    totalPenalties: 0,
    pendingSalary: 0,
    pendingBonus: 0,
    pendingPenalties: 0,
  });

  useEffect(() => {
    fetchSalaryData();
  }, [staffId]);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/staff/salary?staffId=${staffId}`);
      if (!response.ok) throw new Error("Failed to fetch salary data");
      const result = await response.json();
      if (result.success) {
        setSalaryHistory(result.data.salaryHistory || []);
        setBonusHistory(result.data.bonusHistory || []);
        setPenaltiesHistory(result.data.penaltiesHistory || []);
        setSummary(result.data.summary || summary);
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải dữ liệu lương thưởng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="text-center">
          <Statistic
            title="Tổng lương"
            value={summary.totalSalary}
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
            title="Tổng thưởng"
            value={summary.totalBonus}
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
            title="Tổng phạt"
            value={summary.totalPenalties}
            prefix="₫"
            valueStyle={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#ff4d4f",
            }}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="Lương chờ"
            value={summary.pendingSalary}
            prefix="₫"
            valueStyle={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#faad14",
            }}
          />
        </Card>
      </div>

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
                    <Tag
                      color={item.status === "PAID" ? "green" : "orange"}
                      className="text-sm"
                    >
                      {item.status === "PAID"
                        ? "Đã thanh toán"
                        : "Chờ thanh toán"}
                    </Tag>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg space-y-2 mb-2">
                    {/* A: Lương từ giờ làm */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        (A) Lương từ giờ làm:
                      </span>
                      <span className="font-medium">
                        {item.salaryFromHours.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 pl-2">
                      {item.totalHours.toFixed(2)} giờ ×{" "}
                      {item.hourlySalary.toLocaleString("vi-VN")} ₫/giờ
                    </div>

                    {/* C: Thưởng */}
                    {item.bonus > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">(C) Thưởng:</span>
                        <span className="font-medium text-green-600">
                          + {item.bonus.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    )}

                    {/* B: Tạm ứng */}
                    {item.advance > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">(B) Tạm ứng:</span>
                        <span className="font-medium text-orange-600">
                          - {item.advance.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    )}

                    {/* D: Phạt */}
                    {item.penalty > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">(D) Phạt:</span>
                        <span className="font-medium text-red-600">
                          - {item.penalty.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    )}

                    <Divider className="my-2" />

                    {/* Tổng thu nhập */}
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
                      Thanh toán:{" "}
                      {dayjs(item.paidAt).format("DD/MM/YYYY HH:mm")}
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
                            visible:
                              imagePreview.visible &&
                              imagePreview.url === item.imageUrl,
                            onVisibleChange: (visible) => {
                              setImagePreview({
                                url: item.imageUrl || "",
                                visible,
                              });
                            },
                          }}
                          onClick={() =>
                            setImagePreview({
                              url: item.imageUrl || "",
                              visible: true,
                            })
                          }
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
                      {item.rewardDate
                        ? dayjs(item.rewardDate).format("DD/MM/YYYY HH:mm")
                        : dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
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
                            visible:
                              imagePreview.visible &&
                              imagePreview.url === item.imageUrl,
                            onVisibleChange: (visible) => {
                              setImagePreview({
                                url: item.imageUrl || "",
                                visible,
                              });
                            },
                          }}
                          onClick={() =>
                            setImagePreview({
                              url: item.imageUrl || "",
                              visible: true,
                            })
                          }
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
