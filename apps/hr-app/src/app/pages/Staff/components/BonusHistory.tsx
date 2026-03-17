import React, { useState, useEffect } from "react";
import { Card, List, Tag, Spin, Empty, Image } from "antd";
import { Calendar, Award } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { apiClient } from "@gateway-workspace/shared/utils";

interface BonusHistoryProps {
  staffId: number;
  month: number;
  year: number;
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

export default function BonusHistory({ staffId, month, year }: BonusHistoryProps) {
  const [loading, setLoading] = useState(false);
  const [bonusHistory, setBonusHistory] = useState<BonusRecord[]>([]);

  useEffect(() => {
    if (month && year && staffId) {
      fetchHistory();
    }
  }, [staffId, month, year]);

  const fetchHistory = async () => {
    if (!month || !year || !staffId) return;

    try {
      setLoading(true);
      const result = await apiClient.post(`/hr-app/salary/history`, { staffId, month, year });
      
      if (result.data.success) {
        setBonusHistory(result.data.data.bonusHistory || []);
      } else {
        throw new Error(result.data.error || "Lỗi lấy dữ liệu thưởng");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải lịch sử thưởng");
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
                    <span className="font-medium text-base">{item.reason}</span>
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
                    <div className="font-medium text-green-600 text-base">
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
                        />
                      </div>
                    )}
                    {item.note && (
                      <div className="text-xs text-gray-500 italic mt-1 bg-gray-50 p-2 rounded">
                        Ghi chú: {item.note}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      <Calendar size={12} className="inline mr-1" />
                      {item.rewardDate
                        ? dayjs(item.rewardDate).utcOffset(7).format("DD/MM/YYYY HH:mm")
                        : dayjs(item.createdAt).utcOffset(7).format("DD/MM/YYYY HH:mm")}
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
